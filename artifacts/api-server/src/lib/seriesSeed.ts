import { randomUUID } from "node:crypto";
import type { Pool, PoolClient } from "pg";

export const SEED_STAGES = [
  "discovery",
  "research",
  "qualification",
  "outreach",
  "meeting",
  "diligence",
  "term_sheet",
  "negotiation",
  "commitment",
  "documentation",
  "closing",
  "ongoing_ir",
] as const;
export type SeedStage = (typeof SEED_STAGES)[number];
export class SeedWorkflowError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
  }
}

export interface SeedCase {
  id: string;
  prospect_name: string;
  investor_user_id: string | null;
  stage: SeedStage;
  revision: number;
  created_by: string;
}

// This service records operator decisions. It does not execute outreach,
// issue securities, accept payments, grant document access, or bind terms.
export class SeriesSeedWorkflow {
  constructor(private readonly pool: Pool) {}

  private async transaction<T>(
    work: (client: PoolClient) => Promise<T>,
  ): Promise<T> {
    const client = await this.pool.connect();
    try {
      await client.query("BEGIN");
      const value = await work(client);
      await client.query("COMMIT");
      return value;
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  async create(
    actorId: string,
    prospectName: string,
    investorUserId: string | null,
  ) {
    return this.transaction(async (client) => {
      const id = randomUUID();
      const result = await client.query<SeedCase>(
        "INSERT INTO series_seed_cases(id, prospect_name, investor_user_id, created_by) VALUES($1,$2,$3,$4) RETURNING *",
        [id, prospectName, investorUserId, actorId],
      );
      await client.query(
        "INSERT INTO series_seed_events(id,case_id,actor_user_id,to_stage,revision,reason,idempotency_key) VALUES($1,$2,$3,'discovery',0,'Case created',$4)",
        [randomUUID(), id, actorId, randomUUID()],
      );
      return result.rows[0];
    });
  }

  async linkInvestor(
    actorId: string,
    id: string,
    investorUserId: string,
    expectedRevision: number,
    reason: string,
  ) {
    return this.transaction(async (client) => {
      const current = (
        await client.query<SeedCase>(
          "SELECT * FROM series_seed_cases WHERE id=$1 FOR UPDATE",
          [id],
        )
      ).rows[0];
      if (!current) throw new SeedWorkflowError(404, "Case not found");
      if (current.investor_user_id === investorUserId) return current;
      if (current.investor_user_id)
        throw new SeedWorkflowError(
          409,
          "An existing investor link cannot be reassigned",
        );
      if (current.revision !== expectedRevision)
        throw new SeedWorkflowError(
          409,
          "Case changed; reload before linking an investor",
        );
      const revision = current.revision + 1;
      const updated = (
        await client.query<SeedCase>(
          "UPDATE series_seed_cases SET investor_user_id=$2,revision=$3,updated_at=now() WHERE id=$1 RETURNING *",
          [id, investorUserId, revision],
        )
      ).rows[0];
      await client.query(
        "INSERT INTO series_seed_events(id,case_id,actor_user_id,from_stage,to_stage,revision,reason,evidence_reference,idempotency_key) VALUES($1,$2,$3,$4,$4,$5,$6,$7,$8)",
        [
          randomUUID(),
          id,
          actorId,
          current.stage,
          revision,
          reason,
          `investor-user:${investorUserId}`,
          randomUUID(),
        ],
      );
      return updated;
    });
  }

  async listInternal(query = "") {
    return (
      await this.pool.query(
        "SELECT * FROM series_seed_cases WHERE ($1='' OR prospect_name ILIKE '%'||$1||'%') ORDER BY updated_at DESC LIMIT 200",
        [query],
      )
    ).rows;
  }

  async history(id: string) {
    return (
      await this.pool.query(
        "SELECT id,actor_user_id,to_stage,reason,evidence_reference,created_at FROM series_seed_events WHERE case_id=$1 ORDER BY revision",
        [id],
      )
    ).rows;
  }

  async readForInvestor(id: string, userId: string) {
    // Filter in SQL before retrieving. No internal event reasons or evidence
    // references enter this external response, even for the linked investor.
    return (
      (
        await this.pool.query(
          "SELECT id,stage,updated_at FROM series_seed_cases WHERE id=$1 AND investor_user_id=$2",
          [id, userId],
        )
      ).rows[0] ?? null
    );
  }

  async advance(
    actorId: string,
    id: string,
    input: {
      stage: SeedStage;
      expectedRevision: number;
      reason: string;
      evidenceReference: string | null;
      idempotencyKey: string;
    },
  ) {
    return this.transaction(async (client) => {
      const current = (
        await client.query<SeedCase>(
          "SELECT * FROM series_seed_cases WHERE id=$1 FOR UPDATE",
          [id],
        )
      ).rows[0];
      if (!current) throw new SeedWorkflowError(404, "Case not found");
      const replay = (
        await client.query(
          "SELECT * FROM series_seed_events WHERE case_id=$1 AND idempotency_key=$2",
          [id, input.idempotencyKey],
        )
      ).rows[0];
      if (replay) {
        if (
          replay.actor_user_id !== actorId ||
          replay.to_stage !== input.stage ||
          replay.reason !== input.reason ||
          replay.evidence_reference !== input.evidenceReference ||
          replay.revision !== input.expectedRevision + 1
        ) {
          throw new SeedWorkflowError(
            409,
            "Idempotency key already used for a different decision",
          );
        }
        return {
          case: current,
          replayed: true,
          decisionRevision: replay.revision,
        };
      }
      if (current.revision !== input.expectedRevision)
        throw new SeedWorkflowError(
          409,
          "Case changed; reload before recording a decision",
        );
      if (
        SEED_STAGES.indexOf(input.stage) !==
        SEED_STAGES.indexOf(current.stage) + 1
      )
        throw new SeedWorkflowError(
          409,
          "Only the next lifecycle stage is allowed",
        );
      if (
        SEED_STAGES.indexOf(input.stage) >= SEED_STAGES.indexOf("term_sheet") &&
        !input.evidenceReference?.trim()
      ) {
        throw new SeedWorkflowError(
          422,
          "A reviewed decision evidence reference is required",
        );
      }
      const revision = current.revision + 1;
      const updated = (
        await client.query<SeedCase>(
          "UPDATE series_seed_cases SET stage=$2, revision=$3, updated_at=now() WHERE id=$1 RETURNING *",
          [id, input.stage, revision],
        )
      ).rows[0];
      // Audit is in the same transaction: a failed event write rolls back state.
      await client.query(
        "INSERT INTO series_seed_events(id,case_id,actor_user_id,from_stage,to_stage,revision,reason,evidence_reference,idempotency_key) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9)",
        [
          randomUUID(),
          id,
          actorId,
          current.stage,
          input.stage,
          revision,
          input.reason,
          input.evidenceReference,
          input.idempotencyKey,
        ],
      );
      return { case: updated, replayed: false, decisionRevision: revision };
    });
  }
}
