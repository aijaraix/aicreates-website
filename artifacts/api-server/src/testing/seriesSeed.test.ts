import { after, before, test } from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { readFile } from "node:fs/promises";
import pg from "pg";
import { SeriesSeedWorkflow, SEED_STAGES } from "../lib/seriesSeed";

let pool: pg.Pool;
let admin: pg.Pool;
let workflow: SeriesSeedWorkflow;
const schema = `seed_test_${randomUUID().replaceAll("-", "")}`;
before(async () => {
  // Explicit synthetic test URL only; never inherit the application's DATABASE_URL.
  const url = process.env.SERIES_SEED_TEST_DATABASE_URL;
  if (
    !url ||
    !["localhost", "127.0.0.1", "[::1]"].includes(new URL(url).hostname)
  )
    throw new Error(
      "SERIES_SEED_TEST_DATABASE_URL must name an isolated loopback test database",
    );
  admin = new pg.Pool({ connectionString: url });
  await admin.query(`CREATE SCHEMA ${schema}`);
  pool = new pg.Pool({
    connectionString: url,
    options: `-c search_path=${schema}`,
  });
  await pool.query(
    "CREATE TABLE app_users(id text PRIMARY KEY); INSERT INTO app_users VALUES ('operator'),('investor-a'),('investor-b'); CREATE TABLE commitments(id text PRIMARY KEY, legacy_data jsonb); INSERT INTO commitments VALUES ('legacy', '{\"tokens\":123,\"vesting\":\"unchanged\"}')",
  );
  await pool.query(
    await readFile(
      new URL(
        "../../../../lib/db/migrations/20260908_series_seed.sql",
        import.meta.url,
      ),
      "utf8",
    ),
  );
  workflow = new SeriesSeedWorkflow(pool);
});
after(async () => {
  await pool?.end();
  if (admin) {
    await admin.query(`DROP SCHEMA IF EXISTS ${schema} CASCADE`);
    await admin.end();
  }
});
const decision = (
  stage: (typeof SEED_STAGES)[number],
  expectedRevision: number,
) => ({
  stage,
  expectedRevision,
  reason: "Operator reviewed the current lifecycle record",
  evidenceReference: null as string | null,
  idempotencyKey: randomUUID(),
});

test("another investor cannot retrieve case metadata, reasons or evidence", async () => {
  const record = await workflow.create(
    "operator",
    "Confidential prospect",
    "investor-a",
  );
  assert.equal(await workflow.readForInvestor(record.id, "investor-b"), null);
  const own = await workflow.readForInvestor(record.id, "investor-a");
  assert.deepEqual(Object.keys(own).sort(), ["id", "stage", "updated_at"]);
  assert.equal(own.stage, "discovery");
});
test("racing decisions produce one transition and one durable event", async () => {
  const record = await workflow.create("operator", "Concurrency", null);
  const results = await Promise.allSettled([
    workflow.advance("operator", record.id, decision("research", 0)),
    workflow.advance("operator", record.id, decision("research", 0)),
  ]);
  assert.equal(results.filter((x) => x.status === "fulfilled").length, 1);
  assert.equal(results.filter((x) => x.status === "rejected").length, 1);
  const rows = (
    await pool.query(
      "SELECT revision FROM series_seed_events WHERE case_id=$1 ORDER BY revision",
      [record.id],
    )
  ).rows;
  assert.deepEqual(
    rows.map((x) => x.revision),
    [0, 1],
  );
});
test("replayed decisions are idempotent and altered reuse is rejected", async () => {
  const record = await workflow.create("operator", "Replay", null);
  const input = decision("research", 0);
  await workflow.advance("operator", record.id, input);
  assert.equal(
    (await workflow.advance("operator", record.id, input)).replayed,
    true,
  );
  await assert.rejects(
    workflow.advance("operator", record.id, {
      ...input,
      reason: "A different request reuses the key",
    }),
    /different decision/,
  );
  assert.equal(
    (
      await pool.query(
        "SELECT count(*)::int AS count FROM series_seed_events WHERE case_id=$1",
        [record.id],
      )
    ).rows[0].count,
    2,
  );
});
test("skips fail and material stages require a reviewed evidence reference", async () => {
  const record = await workflow.create("operator", "Lifecycle", null);
  await assert.rejects(
    workflow.advance("operator", record.id, decision("closing", 0)),
    /next lifecycle/,
  );
  for (let i = 1; i < SEED_STAGES.length; i++) {
    const input = decision(SEED_STAGES[i], i - 1);
    if (i >= SEED_STAGES.indexOf("term_sheet")) {
      await assert.rejects(
        workflow.advance("operator", record.id, input),
        /evidence reference/,
      );
      input.evidenceReference = `reviewed-decision:${i}`;
    }
    const result = await workflow.advance("operator", record.id, input);
    assert.equal(result.case.stage, SEED_STAGES[i]);
  }
});
test("failed audit insertion rolls back the stage and revision", async () => {
  const record = await workflow.create("operator", "Atomic audit", null);
  await pool.query(
    `CREATE FUNCTION reject_seed_event() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN IF NEW.reason='force audit failure' THEN RAISE EXCEPTION 'audit unavailable'; END IF; RETURN NEW; END $$; CREATE TRIGGER reject_seed_event BEFORE INSERT ON series_seed_events FOR EACH ROW EXECUTE FUNCTION reject_seed_event()`,
  );
  await assert.rejects(
    workflow.advance("operator", record.id, {
      ...decision("research", 0),
      reason: "force audit failure",
    }),
    /audit unavailable/,
  );
  assert.deepEqual(
    (
      await pool.query(
        "SELECT stage,revision FROM series_seed_cases WHERE id=$1",
        [record.id],
      )
    ).rows[0],
    { stage: "discovery", revision: 0 },
  );
});
test("legacy commitments remain unchanged and unlinked cases disclose nothing", async () => {
  const record = await workflow.create("operator", "Unlinked prospect", null);
  assert.equal(await workflow.readForInvestor(record.id, "investor-a"), null);
  assert.deepEqual((await pool.query("SELECT * FROM commitments")).rows, [
    { id: "legacy", legacy_data: { tokens: 123, vesting: "unchanged" } },
  ]);
});

test("linking an invited investor is audited and cannot transfer another investor's case", async () => {
  const record = await workflow.create("operator", "Initially unlinked", null);
  const linked = await workflow.linkInvestor(
    "operator",
    record.id,
    "investor-a",
    0,
    "Identity and case association reviewed",
  );
  assert.equal(linked.revision, 1);
  assert.equal(
    (await workflow.readForInvestor(record.id, "investor-a")).id,
    record.id,
  );
  assert.equal(await workflow.readForInvestor(record.id, "investor-b"), null);
  await assert.rejects(
    workflow.linkInvestor(
      "operator",
      record.id,
      "investor-b",
      1,
      "Attempt to reassign the existing case",
    ),
    /cannot be reassigned/,
  );
  assert.equal(
    (
      await workflow.linkInvestor(
        "operator",
        record.id,
        "investor-a",
        0,
        "Identity and case association reviewed",
      )
    ).revision,
    1,
  );
  const events = (
    await pool.query(
      "SELECT revision,evidence_reference FROM series_seed_events WHERE case_id=$1 ORDER BY revision",
      [record.id],
    )
  ).rows;
  assert.deepEqual(events, [
    { revision: 0, evidence_reference: null },
    { revision: 1, evidence_reference: "investor-user:investor-a" },
  ]);
});
