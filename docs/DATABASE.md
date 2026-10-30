# Database and migrations

MongoDB 7 runs as a single-node development replica set. Production needs an authenticated replica set and separately managed secrets/backups. No legacy or externally configured database was accessed during this work.

## Collections and relationships

- `users`: normalized unique email/username; indexed `phoneNormalized` for phone sign-in; bcrypt hash excluded from default queries; personal profile; opt-in ranking flag; wallet balance and virtual tree count. Legacy `wallet.transactions` arrays are retained but no longer appended: the indexed ledger is the source of history.
- `sessions`: user reference, planned minutes, start/end dates, outcome, status, elapsed milliseconds, last resumed timestamp, active flag, operation ID and reward. Legacy completed records remain readable without the new fields.
- `transactions`: user reference, signed coin amount, type, reference, status, optional idempotency key, timestamp.
- `challenges`: owner, title/description, reward, redeemed flag, optional milestone key and numeric requirements. No automatic inference from legacy prose.
- `friendships`: canonical user-pair key, requester, recipient and pending/accepted status.
- `auth_sessions`: Mongo-backed cookie session data with expiry index.
- `migrations` and `migration_locks`: applied versions and exclusive runner lock.

MongoDB has no relational foreign-key enforcement. Application services validate references. Baseline preflight blocks orphaned sessions, transactions and challenges. No account-deletion API is exposed.

## Workflow

```sh
cp .env.example .env
make dev-up
make migrate
make migrate-status
```

Development startup runs pending migrations before the API starts. Running `make migrate` again is safe. The baseline creates collections/indexes, normalizes identities after duplicate checks and fills absent wallet/ranking defaults. It preserves document IDs, hashes, wallet balances, transactions and session history. A fresh database needs no seed or built-in login: sign up normally. Milestones are server definitions; fake users or rewards are not seeded.

Migration `002-phone-login` adds a normalized phone lookup and index in batches of 500, preserving the original contact field. It strips formatting and keeps all supplied country-code digits without guessing a country. Invalid legacy phone values have no phone lookup; those accounts retain email/username sign-in. Shared numbers are preserved. A lookup matching multiple accounts, including a numeric username colliding with another phone, is rejected with the same generic sign-in error; use email or an unambiguous username. Profile changes update the lookup immediately. Readiness requires every registered migration, including this one.

Migration `003-nursery` adds the compound `userId, endTime, _id` index for owner-specific month filtering and stable nursery pagination. It does not change session records or reward balances.

Do not edit an applied migration. Add a new numbered module and register it in `backend/scripts/migrate.js`. Index creation is not transactionally rolled back; the baseline is idempotent so it can resume after repair. Applied tracking occurs only after successful completion. The exclusive migration lock has no automatic timeout to avoid overlapping slow migrations. After a hard crash, inspect the runner/process and logs before manually deleting only `migration_locks` document `_id: runner`.

## Existing databases

1. Confirm ownership, environment, database name, replica-set support and retention obligations.
2. Take and verify a backup before applying the baseline. Keep the old app version available.
3. On a restored copy, run migration status and `up`. Preflight refuses normalized username/email collisions, negative wallet values and orphan references. Resolve ambiguous records manually against the backup; do not drop records to force success.
4. Compare user, session, transaction and challenge counts, wallet sums, representative relationships and authentication before/after. Legacy corrupted balances and unverifiable rewards require human reconciliation; migration cannot establish their authenticity.
5. Review challenge requirements explicitly. Leave unknown eligibility unset until resolved.
6. Run the regression suite against a disposable copy. Roll forward only after review.

The baseline changes identity normalization and therefore is intentionally forward-only. `make migrate-rollback` exits nonzero with recovery guidance. Recovery is a reviewed forward migration or restoration of a verified backup into a separate database followed by a controlled application cutover. Never automatically drop or restore over a running database.

## Backup and recovery

`make db-backup` writes a gzip archive to ignored `backups/`. It does not erase data. For a consistent development backup, stop API writes (`docker compose stop api`) during the dump, then start it again. Inspect command exit status and verify the archive by restoring into a disposable database:

```sh
# Select a separate scratch database; do not replace the live database.
docker compose exec -T mongo mongorestore --archive --gzip \
  --nsFrom='bagiya.*' --nsTo='bagiya_restore_check.*' < backups/CHOSEN.archive.gz
```

Inspect restored record counts and sample relationships. Production backups need authenticated connection configuration, encryption, retention, point-in-time consistency and a rehearsed restore/cutover. Do not put credentials in shell command arguments.

`make dev-down` preserves the named `bagiya_mongo-data` volume. `make clean` removes only generated artifacts. Deleting the database volume is destructive and is never a routine startup/cleanup step. If you deliberately want a blank local database, first back up and explicitly remove the named volume while services are stopped; this project provides no one-command reset target.

## Migration 004: strict focus

`004-strict-focus` adds `strict_focus_expiry` (deadline index for active strict sessions) and `latest_focus_session` (owner/creation/id ordering). Optional session fields store strict mode, canonical allowed links, Bagiya origin, monitoring deadline, hashed monitor credential and interruption reason. No legacy records or balances are rewritten. Capabilities must never be included in ordinary API responses or logs. Expiry writes a canceled session with zero reward; existing analytics/calendar aggregation includes that outcome.
