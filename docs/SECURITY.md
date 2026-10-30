# Security

## Implemented controls

Private APIs use a Mongo-backed cookie session, regenerate its ID on login, destroy it on logout, and require ownership for user-ID routes. Cookie settings are HttpOnly, SameSite=Lax, one-day expiry, and Secure in production. Passwords use bcrypt with cost 12; new passwords require at least eight characters and are bounded to bcrypt's 72-byte limit. No password hashes are serialized to clients. Login failures use the same message for unknown users and incorrect passwords.

All mutations require JSON (DELETE is bodyless) and `X-Bagiya-Request: 1`. Browsers must preflight that custom header; CORS permits only configured exact origins. Requests from disallowed origins or with cross-site fetch metadata are rejected. Cookie SameSite protection is additional defense. This application supports same-origin hosting/proxying; do not loosen CORS to arbitrary credentialed origins.

Zod schemas constrain body types, lengths, allowed fields, dates and enums. User-supplied Mongo operators and arbitrary wallet fields are rejected. Public member search accepts a short alphanumeric username prefix, not arbitrary regular expressions. Ownership comes from the session, never request JSON. The old self-minting reward API returns 410. Server-owned rewards and prices use transactions and unique operation indexes.

Helmet, a 32 KB JSON body limit, bounded pagination, request timeouts, per-IP auth/API rate limits and production error redaction are enabled. Logs contain request ID, method, status and latency; no passwords, tokens, cookies, bodies, emails or URL query strings are logged. React text rendering supplies escaping; no HTML injection or file-upload endpoint is used.

## Configuration and secrets

The root `.env` is local-only and ignored. `.env.example` has a local-only development secret; production startup rejects obvious example secrets and non-HTTPS origins. `.env.production.example` describes placeholders; it is not runnable production configuration.

`backend/.env` previously contained tracked configuration. With owner approval it now contains only a non-secret notice. Its previous values remain in Git history: the owner must rotate any real historical credentials and arrange history cleanup if this repository was shared. No external account, legacy database or production credential was tested or changed. Removing a current file does not revoke leaked secrets.

Generated backend `node_modules` files have been removed from Git tracking without deleting the local installation. Lockfiles now control dependency installation. The legacy Vercel frontend proxy pointed at an unrelated deployment and was removed along with the incompatible backend serverless config; the supported deployment path is Docker with a same-origin reverse proxy.

## Production boundary

Production API/web images run as non-root. Only the frontend is published to loopback in the production Compose file. A separately provisioned TLS reverse proxy must be the only public entrypoint. nginx forwards HTTPS as the scheme to the API because that frontend port is intended solely for the trusted TLS terminator. Use `TRUST_PROXY=1`; do not expose API ports or serve that frontend publicly over HTTP. MongoDB must be an authenticated replica set on a private network, with TLS as appropriate for your provider.

Rate-limit state is process-local; add a shared rate-limit store before horizontal deployment. No email verification, password reset, file uploads, real planting or payments are implemented. Username search is available to authenticated members. Leaderboard sharing is explicitly opt-in. Timer rewards prove elapsed server time; they cannot establish whether a person remained attentive.

Dependency audits passed during this work; they are point-in-time checks. Re-run audits and review lockfile updates. Production TLS integration, credential rotation, real backup restoration, abuse/load tests and external-service configuration remain operator responsibilities. This is not an assertion that every possible security defect has been eliminated.

Design references: [Express session documentation](https://expressjs.com/en/resources/middleware/session/) for regeneration and secure cookies; [MongoDB transactions](https://www.mongodb.com/docs/manual/core/transactions/) for replica-set transaction semantics.
