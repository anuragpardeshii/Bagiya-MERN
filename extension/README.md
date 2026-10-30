# Bagiya Strict Focus

This is an unpacked desktop Chrome/Edge extension (Chromium 120+). It is not published in a browser store.

1. Extract the downloaded ZIP into a permanent folder.
2. Open `chrome://extensions` or `edge://extensions`, enable Developer mode, and choose **Load unpacked**. Select the extracted folder containing `manifest.json`.
3. Open the extension from the browser toolbar. Enter your Bagiya address (`http://localhost:5179` for this workspace), then choose **Connect to Bagiya**. Production sites must use HTTPS. Grant access only to your Bagiya site.
4. On the focus timer, enable **Strict focus**, add allowed websites (one per line), choose a duration and start. The extension must say connected.

A domain such as `https://docs.python.org` allows every page on that exact origin. A URL such as `https://example.com/lesson?id=1` allows only that path and query; fragments may change. Subdomains, schemes and ports are distinct. Bagiya itself is always allowed. The list is fixed for the session. A new blank tab has three seconds to navigate to an allowed page.

Visiting an unapproved page, locking the screen or leaving the browser interrupts the session without coins. This extension ends the focus session; it does not block access to websites. Strict mode cannot be paused. It monitors the active tab in the focused browser window, not background tabs. Quiet reading does not count as a violation.

Check-ins run approximately every 30 seconds. After 90 seconds without a valid check-in, the backend expires the session. A background sweep persists expiry within roughly another 15 seconds; completion checks enforce the deadline immediately. Device sleep, network loss, extension removal and browser closure can all cause a monitoring gap. Very brief sleep may fall within the grace period. No browser extension can guarantee a callback at the exact instant a laptop sleeps. Reopening an expired session cannot earn coins.

Only the allowed list and interruption reason are sent to Bagiya. Visited URLs and browsing history are not uploaded. Monitoring uses a random credential scoped to one session, stored in extension-only local storage; it does not store your password or account cookie. A lost network connection cannot erase a detected violation.

This is a voluntary focus tool, not tamper-proof attention verification or parental-control software. Another browser, disabled permissions, modified clients or an uninstalled extension are outside direct observation; missing check-ins eventually end the session. Mobile browsers and Firefox are not supported by this package.

After updating the extension files, select **Reload** on the browser's extensions page and reload Bagiya. Avoid updating during an active session.
