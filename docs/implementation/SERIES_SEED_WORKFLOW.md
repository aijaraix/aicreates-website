# Series Seed lifecycle foundation — 2026-09-08

Status: TESTED for the isolated database service and build; not deployed or certified end to end.

## Reconciliation and scope

EXTEND the investor system with separate `series_seed_cases` and `series_seed_events`. KEEP all existing app users, profiles, SAFT submissions, commitments, token allocations, vesting, payments and legacy routes. No conversion, deletion or financial terms are included. A case records operator activity from discovery through ongoing IR. It is not a subscription, accepted investment, payment or executed legal instrument.

Admin writes use the existing authenticated, live allow-list admin middleware. Investor status reads filter `id AND investor_user_id` in SQL and return only id, stage and timestamp. Internal prospect names, reasons and evidence references are excluded. An unlinked prospect can later be attached to an existing investor identity; an existing link cannot be reassigned through this API.

Transitions lock the case row, require the expected revision and next lifecycle stage, and write their event in the same transaction. Replays with the same key and identical decision are idempotent; conflicting reuse is rejected. From term sheet onward, a reviewed decision evidence reference is required. The reference is a recordkeeping pointer, not verification of legal sufficiency. No external action or disclosure is authorized by changing a stage.

## Activation and recovery

- Default disabled. Apply `lib/db/migrations/20260908_series_seed.sql` once to a backed-up, restored investor staging database. It is an additive transaction; repeat application fails visibly instead of hiding incompatible existing tables.
- Enable `SERIES_SEED_WORKFLOW=true` only after the migration and existing Clerk/admin configuration are verified. No production activation has occurred.
- Existing Drizzle schema exports include both new tables. Do not run a blanket force-push migration against production.
- Roll back application activation by unsetting the flag. Preserve the new tables/events; do not drop recorded activity.
- API prefix is `/api`. Admin endpoints: GET/POST `/admin/series-seed/cases`, POST `/admin/series-seed/cases/:id/decisions`, POST `/admin/series-seed/cases/:id/investor`. Investor endpoint: GET `/series-seed/cases/:id`.

## Verification

Seven real PostgreSQL tests passed on the Ubuntu test host at 2026-09-08T12:04:24Z. Coverage: cross-investor denial and minimal response fields; racing updates; replay/conflicting reuse; lifecycle order/evidence requirement; audit failure rollback; unchanged legacy fixture; audited linking without reassignment. The test uses a unique schema and requires an explicit loopback `SERIES_SEED_TEST_DATABASE_URL`, never the application's ambient DATABASE_URL.

Run: `pnpm --filter @workspace/api-server run test:series-seed` with that isolated test URL. On this run the database was a disposable embedded PostgreSQL cluster; test schema and cluster were removed. Shared library and API TypeScript checks and API build pass.

## Remaining work

Operator UI, authenticated HTTP end-to-end checks, real investor identity reconciliation, approved document access, evidence-content validation, counsel-approved financing transitions, Adam/IR integration and production migration remain open. Keep legacy financing behavior until legal/business decisions and verified replacements permit retirement. No confidential Drive content was published.
