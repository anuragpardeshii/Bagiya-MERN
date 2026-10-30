# Testing

Tests exercise business outcomes rather than implementation details. The test database is isolated from development and legacy data.

## Host checks

```sh
make install
make lint
make format-check
make test
make build
```

Nine unit/HTTP tests cover phone normalization and identifier validation, paused/running time, duration and price forgery, input normalization/NoSQL operator rejection, bcrypt length limits, UTC month/week boundaries, configuration/pagination, unauthenticated access, CSRF/CORS boundaries and validation responses. HTTP-boundary tests inject MemoryStore only for unauthenticated requests; running applications and integration tests use Mongo-backed sessions.

The codebase remains JavaScript. ESLint supplies syntax, undefined-variable and React-hook static checks. There is no TypeScript typecheck, and no claim that typechecking was run. Prettier checks source, documentation and configuration.

## Real database integration

Use a disposable MongoDB replica set. For example:

```sh
docker run -d --name bagiya-test-mongo -p 127.0.0.1:27028:27017 \
  mongo:7 mongod --replSet rs0 --bind_ip_all
# Wait for mongosh ping to succeed, then initialize:
docker exec bagiya-test-mongo mongosh --quiet --eval \
  'rs.initiate({_id:"rs0",members:[{_id:0,host:"localhost:27017"}]})'
# Wait until db.hello().isWritablePrimary is true.
TEST_MONGO_URI='mongodb://127.0.0.1:27028/?replicaSet=rs0&directConnection=true' \
  NODE_ENV=test make test-integration
```

The suite creates only `bagiya_test_<pid>` and explicitly named legacy/collision test databases and drops those databases afterward. Never point tests at a shared/production server. Missing TEST_MONGO_URI fails clearly instead of silently skipping.

Thirty-two integration tests cover nursery owner isolation, UTC month boundaries and complete pagination, public username availability, email/username/phone sign-in, ambiguous phone rejection and profile phone changes, fresh/repeated migrations and readiness, identity collisions, cookies/hash redaction, production Secure-cookie proxy handling, ownership/profile updates, session replay and early-completion rejection, simultaneous starts, pause/resume/reload semantics, concurrent completion, wallet/session rollback on injected ledger failure, overspend and replay protection, challenge eligibility/ownership/repeated redemption, pagination/UTC aggregation, friend lifecycle, ranking privacy, logout, and representative legacy normalization/collision protection. Additional checks cover daily-login concurrency, repeat sign-ins, UTC midnight rollover and reward rollback; strict owner-only leaderboard preferences; and exact daily calendar aggregation. The ledger-failure test deliberately injects an exception at the persistence boundary while retaining real MongoDB transactions, then confirms rollback and successful retry.

## Browser journeys

Install a browser with `npx playwright install chromium`, or set `PLAYWRIGHT_EXECUTABLE_PATH` to installed Chrome. Use a separate API backed by a database whose name starts with `bagiya_test_`. The browser fixture enables candidate milestone definitions only to exercise reward mechanics. The approved daily-login reward is always available. Other milestone rules remain deferred; keep the candidate catalog disabled in development and production configuration.

```sh
# These variables must be exported in the terminal launching the test API.
export NODE_ENV=test PORT=3011 CLIENT_ORIGIN=http://localhost:5181
export ENABLE_MILESTONE_CHALLENGES=true
export SESSION_SECRET=browser-test-only-secret-at-least-32-characters
export MONGO_URI='mongodb://127.0.0.1:27028/bagiya_test_browser?replicaSet=rs0&directConnection=true'
node backend/scripts/migrate.js up
node backend/index.js
```

In a second terminal:

```sh
API_PROXY_TARGET=http://localhost:3011 npm run dev --prefix frontend -- --port 5181
```

In a third:

```sh
E2E_BASE_URL=http://localhost:5181 \
E2E_TEST_MONGO_URI='mongodb://127.0.0.1:27028/bagiya_test_browser?replicaSet=rs0&directConnection=true' \
make test-e2e
```

Twelve Playwright cases (six journeys at desktop and Pixel-sized mobile viewports) exercise signup/login, empty dashboard, timer pause/reload/resume/cancel and confirmation, garden/challenges/friends/rankings, profile persistence, logout and protected navigation, failed-network retry, missing routes, completed focus, milestone rewards and persisted tree purchases. Additional journeys cover debounced/cached username checks and stale responses, live password feedback and eye controls, all three login identifiers, profile Edit/Cancel/Save, every growth stage after reload, pause and withering, one plant per date (including 3 successful out of 5 attempts and 27 sessions in one cell), interrupted-only trunks, absence of stage/count labels, reduced motion, direct leaderboard opt-in, refresh and real top-three bars. Tests assert no horizontal page overflow on affected pages and no JavaScript runtime errors on the broad signup/profile journey.

To avoid waiting 25 minutes, the reward journey adjusts only its new test account's stored resumed timestamp in the isolated test database. It then uses the real browser, API, transaction and database for completion and every subsequent reward/purchase. No UI API responses are mocked for successful flows. The network-recovery case intentionally aborts the auth request.

Screenshots and traces are generated under ignored `test-results/` and `playwright-report/`. Curated screenshots are in `docs/screenshots/`. The hosted CI workflow is configured in `.github/workflows/ci.yml`; execution on GitHub requires a push and was not performed here.

## Infrastructure checks and limits

`make verify-dev` checks actual Node watch restart and Vite HMR without rebuilding. It temporarily edits two known source anchors, restores both in a finally block and captures landing screenshots. Run it only against this checkout's own development stack while those files are not being edited.

Verified results and any failures corrected during implementation are recorded in IMPLEMENTATION_REPORT.md. Browser coverage is Chromium desktop/mobile emulation, not every browser or a real mobile device. No comprehensive accessibility certification, sustained load benchmark, external production database migration, real credential rotation or remote production deployment has been performed.

## Strict focus coverage

Four URL-policy/validation tests bring unit/HTTP coverage to 13 checks. Six additional real-database tests bring integration coverage to 32: strict origin and replay validation, capability rotation/scope, rejected pause/direct completion, exact-once concurrent completion, expiry without a browser, late-heartbeat rejection and rollback on ledger failure. The separate `npm run test:extension` journey loads the actual unpacked extension in Chromium and exercises popup connection, allowed/disallowed navigation, completion and a simulated monitoring gap against the real isolated API. Physical laptop suspend and Edge are manual platform checks; simulated clock gaps do not claim to verify physical sleep detection. See [Strict focus testing](STRICT_FOCUS.md#verification).
