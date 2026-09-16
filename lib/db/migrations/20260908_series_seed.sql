-- Additive migration. Apply once to the investor database after taking a backup.
-- Existing SAFT, token, commitments, allocations and vesting tables are untouched.
BEGIN;
CREATE TABLE series_seed_cases (
  id uuid PRIMARY KEY,
  prospect_name text NOT NULL,
  investor_user_id text REFERENCES app_users(id) ON DELETE RESTRICT,
  stage text NOT NULL DEFAULT 'discovery' CHECK (stage IN ('discovery','research','qualification','outreach','meeting','diligence','term_sheet','negotiation','commitment','documentation','closing','ongoing_ir')),
  revision integer NOT NULL DEFAULT 0 CHECK (revision >= 0),
  created_by text NOT NULL REFERENCES app_users(id) ON DELETE RESTRICT,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX series_seed_cases_investor_idx ON series_seed_cases(investor_user_id);
CREATE TABLE series_seed_events (
  id uuid PRIMARY KEY,
  case_id uuid NOT NULL REFERENCES series_seed_cases(id) ON DELETE RESTRICT,
  actor_user_id text NOT NULL REFERENCES app_users(id) ON DELETE RESTRICT,
  from_stage text,
  to_stage text NOT NULL,
  revision integer NOT NULL,
  reason text NOT NULL,
  evidence_reference text,
  idempotency_key uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(case_id, revision),
  UNIQUE(case_id, idempotency_key)
);
CREATE INDEX series_seed_events_case_idx ON series_seed_events(case_id, created_at);
COMMIT;
