# Architecture

Bagiya is a focus application with a virtual garden, not a plant-care or real-world tree-planting service. The existing React 18, Vite 6, Express 4, Mongoose 8 and MongoDB stack is retained. Node 22 is used in Docker; local Node 22 or 24 is supported.

## Boundaries

- `backend/index.js`: validates configuration, connects to a replica set, creates the persistent auth store, starts HTTP and shuts down gracefully.
- `backend/app.js`: injectable Express factory; security headers, request IDs, redacted JSON logs, CORS/request protection, rate limits, auth, routing, errors, health/readiness.
- `backend/lib`: validation schemas, HTTP errors and bounded pagination.
- `backend/services/focus.js`: authoritative timer transitions and exactly-once reward writes within MongoDB transactions.
- `backend/services/analytics.js`: indexed database aggregations with UTC date boundaries and zero-filled chart buckets.
- Controllers and routes: small request adapters; ownership is checked before user-specific reads and writes. Wallet purchase and challenge redemption couple their ledger entries and state changes in transactions.
- Models: persisted documents, not API response contracts. `safeUser` explicitly projects private account responses. Social projections exclude email, phone, birthday and passwords.
- `frontend/src/lib/api.js`: same-origin fetch, cookie credentials, request protection, bounded timeouts, JSON error handling and session-expiry notification.
- A single auth provider wraps the app. The shared sidebar/layout, UI states, data hook and design tokens replace repeated navigation and request code. Feature screens are lazy-loaded.

## Important contracts

The server accepts only validated fields. Error responses are `{ message, fields?, requestId? }`. List responses contain records and `{ page, total, pages }`, with limits of 1–100 and default 20. IDs in URLs do not grant access.

Public authentication contracts: `GET /api/auth/username-availability?username=...` returns only the normalized username and an availability boolean. It validates input, uses the unique username index and has a separate 60/minute IP limit. The browser waits 400 ms after typing, cancels obsolete requests, ignores stale responses and caches up to 50 normalized names for 30 seconds. Signup still relies on the database unique index to handle concurrent claims. Password feedback enforces the existing 8-character minimum and 72-byte bcrypt limit, with live confirmation matching and accessible visibility buttons.

`POST /api/auth/login` accepts `{ identifier, password }`, where identifier is email, username or phone. The existing `{ email, password }` contract remains supported. Indexed phone lookups require migration `002-phone-login`; ambiguous identifiers never select an arbitrary account. Private responses omit the phone lookup field. Profile inputs remain disabled until Edit is selected; Cancel restores saved values and successful Save returns to viewing.

Authenticated APIs:

| Endpoint                                                 | Behavior                                                        |
| -------------------------------------------------------- | --------------------------------------------------------------- |
| `GET /api/auth/check-auth`, `POST /api/auth/logout`      | Current sanitized user; destroy session                         |
| `GET/PUT /api/users/:userId`                             | Own profile only; allowlisted edits                             |
| `GET /api/users/balance/:userId`                         | Own wallet                                                      |
| `POST /api/sessions/start`                               | `{ sessionTime, requestId }`; 5–180 minutes, multiples of 5     |
| `GET /api/sessions/active`                               | Recover active/paused timer with remaining time                 |
| `POST /api/sessions/:id/action`                          | `{ action: pause/resume/complete/cancel }`                      |
| `GET /api/sessions/summary?period=hourly/weekly/monthly` | Totals, wallet and chart in one response                        |
| `GET /api/sessions/activity?month=YYYY-MM`               | Actual daily activity for a bounded UTC month                   |
| `GET /api/sessions/nursery?month=YYYY-MM&page=&limit=`   | Legacy per-session nursery API, owner-only, at most 25 per page |
| `GET /api/sessions/user/:userId?page=&limit=`            | Paginated history                                               |
| `POST /api/transactions/spend`                           | `{ type: TREE_PLANTING, requestId }`; fixed 2,500 coin price    |
| `GET /api/transactions/:userId?page=&limit=`             | Paginated wallet journal                                        |
| `GET /api/challenges`, `POST /api/challenges/redeem/:id` | Own milestones, eligibility and atomic redemption               |
| `/api/social/search`, `/friends`, `/rankings`            | Username search, request/accept/remove and opt-in leaderboard   |

The old client-authored session endpoint and arbitrary reward endpoint return 410. Every in-repository caller has been updated. Timer reward remains 100 coins per planned minute on successful completion; canceling earns zero. Tree purchases are virtual and cost 2,500 coins. A paused timer stops accruing elapsed time. A running timer continues while the tab is closed; elapsed time proves time passage, not actual human attention.

The focus illustration uses faceted SVG leaves and a soil cross-section, progressing with server-reported remaining time. Growth-stage labels and the progress strip are intentionally absent. SVG layers animate without image downloads; pausing stops swaying, and reduced-motion preferences disable animation. Canceling shows a withered tree.

The garden keeps a Monday-first monthly calendar. Every date is a small soil bed. A date with completed sessions shows exactly one plant, growing fuller at 1, 2, 3 and 4+ successes; interrupted sessions never erase completed growth. Only dates with interruptions and no completed sessions show a bare trunk. Empty dates contain soil only. Counts are available in accessible descriptions and hover text, without multiplication badges or a session-count legend. UTC completion dates determine placement. The calendar uses the bounded daily aggregation endpoint; the older paginated nursery API remains compatible but is no longer used by the UI. Migration `003-nursery` remains applied and unchanged. These illustrations do not affect wallet/tree-purchase accounting.

The leaderboard always shows three podium positions. Unfilled positions are explicitly unclaimed, with no fabricated scores. Actual participants have proportional bars; first place is Champion. Participation defaults to off. `PATCH /api/social/rankings/preference` accepts only the authenticated user's boolean preference. The join button explains which public fields will appear. Rankings refresh after joining, on period/page changes, on returning to the tab (throttled to ten seconds), or using the refresh button.

Daily login is the approved recurring challenge: the first successful sign-in per UTC date automatically credits 10 coins. A member with an existing session can instead collect today's reward from Challenges; no repeated logout is required. Both entry points call the same transactional service. The unique user/challenge key `daily-login:YYYY-MM-DD`, a serialized wallet update, and a unique ledger operation prevent duplicate credit. The challenge record, wallet balance and ledger commit together. Dates and amounts are server-owned. Challenges displays the next reset (00:00 UTC) and reloads at midnight or on returning to the tab. Existing indexes support this behavior; no migration or backfill is needed.

Three candidate one-time milestone definitions remain behind `ENABLE_MILESTONE_CHALLENGES=true` for testing. Those thresholds and bonuses are still unapproved and disabled in the actual app. Daily login is available independently of that flag. Legacy challenges without numeric eligibility metadata remain visible to their owner but cannot be redeemed until reviewed. Friend requests require recipient acceptance.

## Reliability and scaling

Transactions require a MongoDB replica set. Partial unique indexes enforce one active timer and unique operation IDs. Replay of a completed session/purchase/challenge is safe. Browser mutations disable concurrent clicks; unresolved purchase/start request IDs survive refresh in session storage. MongoDB is the final concurrency boundary.

History reads are paginated, chart aggregation is server-side, and session/ledger/search indexes are migrated explicitly. The browser no longer imports MUI, Chart.js, Flowbite, Moment, circle slider, multiple countdown implementations or Axios. Charts use lightweight accessible HTML/CSS. No service worker or external image/font calls are required for the current UI. Old public media are retained as repository assets but no longer requested by the screens.

The app is intended for one API instance initially. Authentication sessions persist in MongoDB, but rate-limit counters are process-local. Add a shared limiter before scaling horizontally. Large global leaderboards may eventually need precomputed aggregates; no load-test latency claims are made here.

## Strict focus extension

Optional Strict focus delegates completion to the browser extension and expires sessions after 90 seconds without monitoring. A session-bound hashed bearer capability authorizes only monitor events; regular cookie-authenticated APIs remain protected. The extension checks exact origin/page rules, persists violations and sends no browsing history. A 15-second server sweep persists expirations independently of the browser. See [Strict focus](STRICT_FOCUS.md) for installation, protocol, privacy and sleep-detection limits. Normal focus retains its existing behavior.
