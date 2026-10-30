# Project audit — 24 October 2026

## Baseline and scope

Inspected the actual Express routes/controllers/models and React route tree, timer, analytics, garden, calendar, profile, authentication, social and landing screens. The stack is React 18/Vite 6/Tailwind 4 with CommonJS Express 4/Mongoose 8/MongoDB. Cookie sessions are the actual authentication mechanism; the unused JWT middleware is disconnected. No Cloudinary upload integration exists: images are remote URLs. README plant-care claims do not describe this application.

The only role is an authenticated member. Workflows are signup/login/logout, focus/pause/cancel/complete, analytics/history, virtual tree purchases, wallet history, profile editing, challenges, friends and rankings. Friends/rankings are static placeholders; challenges have no creation or eligibility workflow. Tree purchases only increment a database counter; no real-world planting service exists.

Baseline: `npm test --prefix backend` fails intentionally (no tests). Frontend build fails (`vite: not found`); lint falls back to incompatible global ESLint because frontend dependencies are absent. Node 24.20.0 and Docker Compose 5.1.4 are installed. Git has pre-existing untracked `.claude/`, which must be preserved. `backend/.env` and dependency files are tracked. No existing database will be contacted: its ownership/data value is unknown.

## Prioritized findings

| ID  | Priority | Evidence / reproduction                                                                                                                                                       | Fix and acceptance criterion                                                                                                                                                    |
| --- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A01 | Critical | `routes/userRoutes.js`, `sessionRoutes.js`, `transactionRoutes.js`, `challenges.js`: no auth. GET a known user ID, PUT another profile, POST any reward amount without login. | Session auth on all private routes, ownership checks, 401/403 regression tests.                                                                                                 |
| A02 | Critical | `controllers/userController.js`: full User responses include password hashes.                                                                                                 | Explicit safe serialization; assert no hashes/private fields in social responses.                                                                                               |
| A03 | Critical | `transactionController.js`, `Times.jsx`: client sets rewards/prices; wallet read-modify-save and separate ledger/session writes.                                              | Server-owned timing/pricing, transactionally coupled reward/ledger/session, idempotency and concurrency tests.                                                                  |
| A04 | High     | `backend/.env` and `backend/node_modules` tracked; unsafe default SESSION_SECRET, session debug logging, MemoryStore, unused JWT path.                                        | Sanitize tracked config, ignore secrets/artifacts, persistent session store, validated config and redacted logs. Historical credentials require owner rotation/history cleanup. |
| A05 | High     | `AuthContext.jsx` GET logout vs POST route; providers remount per route; signup calls undefined toast.                                                                        | Single auth provider, POST logout, working signup redirect; browser tests.                                                                                                      |
| A06 | High     | `Times.jsx`: interval restarts per tick; refresh loses timer; pause ignored by server; request failure clears session.                                                        | Persist server timer state, timestamp-derived display, retryable completion, restoration/pause tests.                                                                           |
| A07 | High     | `challenges.js`: lists all private challenges, redemption changes only a flag; no wallet credit.                                                                              | Owner filter, eligibility based on actual successful sessions, atomic credit, repeat redemption test. Legacy eligibility is unknown and must not be invented.                   |
| A08 | High     | All frontend API URLs fixed at port 3000; server defaults to 5000.                                                                                                            | Same-origin /api proxy and environment config; clean startup test.                                                                                                              |
| A09 | Medium   | `Bagiya.jsx` random contributions/fake streak; `Friends.jsx`/`Rankings.jsx` hardcoded people; profile upload only local preview.                                              | Real data/empty states; implement social requests/ranking opt-in; remove unimplemented upload promise and document scope.                                                       |
| A10 | Medium   | Session/history/transaction queries unbounded; duplicated chart fetches/libraries, date aggregation mixed years and timezones.                                                | Paginated indexed queries, database aggregation, UTC buckets, one summary request, lazy routes, smaller bundle.                                                                 |
| A11 | Medium   | No Docker, migrations, health checks, CI, meaningful tests or reliable Make interface.                                                                                        | Compose replica set, versioned migrations, tests and documented commands.                                                                                                       |
| A12 | Medium   | Browser errors hidden; buttons without actions; inconsistent dense UI, unlabeled inputs, missing responsive states.                                                           | Shared botanical design system, accessible navigation/forms, loading/error/retry/empty states and mobile checks.                                                                |

## Target architecture

Keep React/Vite, Express and Mongoose. Separate app factory/startup, validation/security middleware, domain services, controllers and schemas. Use Mongo-backed cookie sessions and same-origin browser requests. Use Mongo replica-set transactions for operations touching wallets and ledgers. Keep immutable migration history with a lock and explicit legacy preflight. React uses one auth provider, reusable API/data hooks, shared shell and route-level chunks. No microservices, Redis, external uploads, or AI dependencies are needed.

## Implementation checklist

- [x] Inspect source and establish baseline.
- [x] Document confirmed defects and workflows.
- [x] Infrastructure/configuration, migrations and developer commands.
- [x] Authorization, validation and transactional domain repairs.
- [x] UI refresh and real-data workflows (challenge catalog disabled per owner decision pending defined rules).
- [x] Unit/API/database/browser regression checks.
- [x] Clean development/hot reload and production build checks.
- [x] Final documentation, actual evidence and remaining limits.

Suspected operational risks: historical database corruption, leaked historical credentials, and real production topology cannot be verified locally. Do not silently normalize duplicate users or infer challenge eligibility from titles. Back up and inspect before migrating any shared database.

## Final disposition

A01–A03 and A05–A12 have implemented repairs with automated or infrastructure verification. A04 is repaired in the current tree: config is sanitized, sessions persist, unsafe defaults/debug logging are removed and installed artifacts are untracked. Historical credential rotation/history cleanup remains an owner action. Previously fabricated friends/rankings and random activity have been replaced with real stored data. Nonfunctional upload/reset/real-planting promises are explicitly unsupported pending external services and business decisions. See IMPLEMENTATION_REPORT.md for exact checks and limits.

Additional defects discovered and fixed during verification: calendar aggregation syntax; unreachable logout on short desktop viewports; mobile tree count hidden with decorative artwork; Vite optimizer cache permissions under a non-root container user; nginx PID path under a non-root runtime. Tests/checks were rerun after the relevant fixes, without weakening assertions.
