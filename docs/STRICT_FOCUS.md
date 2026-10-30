# Strict focus

## Using it

Normal focus remains the default. Strict focus adds an immutable allowed-links list, active-tab monitoring, interruption reasons and monitoring expiry. The timer shows a full tree before starting, then starts the seed-to-tree growth animation. Failed strict sessions use the existing canceled-session/calendar behavior and earn no coins.

Open the timer, enable **Strict focus**, and expand **Set up the Chrome / Edge extension**. Download and extract the ZIP, enable Developer mode at `chrome://extensions` or `edge://extensions`, and load the extracted folder. Connect the extension toolbar popup to the Bagiya address shown in the timer. This workspace uses `http://localhost:5179`; use HTTPS for a deployed app. Reload the Bagiya page after an extension reload.

The package is built from local source and is not published to an extension store. The assistant cannot install it into the user's personal browser automatically. The generated archive is served at `/downloads/bagiya-focus-extension.zip`. `npm run extension:pack` or `make extension` regenerates both the archive and `extension/focus-policy.js`; development/build scripts also run packaging. Developers may load the repository's `extension/` folder after packaging.

## Rules and limits

- Up to 30 domains or page URLs. A bare domain defaults to HTTPS. Root URLs allow that exact origin; path/query URLs allow only that page. Fragments are ignored; subdomains, scheme and port are separate. URL parsing rejects credentials and non-web schemes. No substring or wildcard host matching is used.
- Bagiya's configured origin is always allowed. Only the active tab in the focused browser window is checked; background tabs may remain open. A blank/new tab gets three seconds to reach an allowed page without extending the server deadline.
- Opening an unapproved website, locking the screen or leaving the browser interrupts the session. Ordinary idle time while reading is permitted. Switching browser windows has a 700 ms focus-event debounce.
- Strict mode cannot pause. Normal mode retains pause/resume and its existing reward rules. The extension verifies strict completion, including when the timer page is in the background.
- Extension alarms request a check-in every 30 seconds. A 90-second monitoring gap ends the session, including gaps caused by sleep, browser closure, extension removal or network loss. The server sweeps every 15 seconds; completion and reads enforce expiry without waiting for the next sweep.
- Physical sleep is not directly observable on every platform. Short sleep may fall within the grace period; longer gaps cannot be distinguished from lost connectivity. No claim of immediate or infallible sleep detection is made.
- Chrome/Chromium 120+ and Edge are the intended desktop targets. The real extension is tested in Chromium; Edge and physical OS suspend/resume require manual platform checks. Mobile/Firefox are not supported. This is a voluntary focus aid, not tamper-proof proof of attention.

## Implementation

`backend/lib/focusPolicy.js` is the canonical URL policy; packaging copies it into the extension. The backend validates and canonicalizes the allowlist. `POST /api/sessions/start` accepts optional `strictMode` and `allowedLinks`; strict starts must originate from a configured Bagiya origin. Mode, duration, origin and allowlist participate in request-id replay validation.

The content script runs only on the configured Bagiya site, in an isolated world. It executes the cookie-authenticated start request. The service worker receives the single-session monitor credential and returns only the sanitized session to the page. Page-to-extension messages check source, origin, top frame and command. The popup requests host access only for the selected Bagiya host; the worker checks the exact origin including port.

`POST /api/focus-monitor/:id` uses a 256-bit bearer capability, stored as a SHA-256 hash on the session. This narrowly scoped endpoint has separate JSON limits, validation, CORS and rate limiting. It does not accept account cookies as authorization or general user API operations. Credentials are rotated on authenticated start replays, never returned in normal session reads, and not logged. The extension persists a detected violation before networking and never replaces it with a heartbeat.

Monitor events are serialized in the extension. A dedicated finish alarm requests verification at the planned end, independently of the regular heartbeat throttle. On the backend, transactions serialize completion, interruption and wallet/ledger writes. Expiry is checked before completion; no late heartbeat can renew an expired session. Wallet and completion roll back together if the ledger write fails. Replays of completed operations cannot pay again. Recovery selects the most recently created session, avoiding stale results when an expiry's effective end time precedes another record's end time.

Migration `004-strict-focus` adds a partial expiry index and latest-session lookup index. Optional strict fields leave legacy/normal sessions unchanged; no data reset or backfill is required. Existing migrations remain unchanged.

## Verification

Run `npm test`, the documented replica-set integration suite, and `npm run test:e2e` for normal desktop/mobile journeys. The real-extension test requires a disposable `bagiya_test_*` database and its own API/frontend:

```sh
E2E_BASE_URL=http://localhost:5181 \
E2E_TEST_MONGO_URI='mongodb://127.0.0.1:27028/bagiya_test_browser?replicaSet=rs0&directConnection=true' \
npm run test:extension
```

Playwright's bundled Chromium supports unpacked extensions. If necessary, set `EXTENSION_CHROMIUM_PATH` to a compatible Chromium executable. Regular branded Chrome may disable command-line extension loading; this does not affect manual **Load unpacked** installation.

The extension test uses real browser extension APIs, real cookie authentication, the actual backend and database. It verifies popup connection, approved-page navigation, disallowed-page interruption, no reward on failure, persistence across an injected network outage, the real finish-alarm handler, exactly-once completion and a simulated missed-check-in/sleep gap. Only the test user's stored clock is advanced to avoid waiting through a full focus session. Production/development user data is never used as test fixtures.

## Browser API references

- [Tabs and URL permissions](https://developer.chrome.com/docs/extensions/reference/api/tabs)
- [Alarm scheduling and device sleep](https://developer.chrome.com/docs/extensions/reference/api/alarms)
- [Idle and locked state](https://developer.chrome.com/docs/extensions/reference/api/idle)
- [Isolated content scripts](https://developer.chrome.com/docs/extensions/develop/concepts/content-scripts)
- [Optional host permissions](https://developer.chrome.com/docs/extensions/reference/api/permissions)
