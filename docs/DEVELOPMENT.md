# Development

## Start from a clean checkout

Requirements: Docker Engine/Desktop with Compose v2+ and Make. Node 22 or 24 is needed only for host-side development and checks.

```sh
cp .env.example .env
make dev-up
make migrate
make migrate-status
```

Default browser URL is `http://localhost:5173`; API is loopback-only on port 3000. MongoDB has no published port. API/web/mongo health checks gate startup. A one-shot migration service runs before API startup; explicit migration reruns are safe. There is no seed account: use Create account. Keep `ENABLE_MILESTONE_CHALLENGES=false`: the owner has deferred the additional one-time milestones pending defined rules. The approved 10-coin daily-login reward is available independently of this flag. Define and approve thresholds and bonuses before enabling the catalog. Recreate the API container when changing environment values.

This working checkout uses `WEB_PORT=5179`, `PORT=3012`, `CLIENT_ORIGIN=http://localhost:5179` because the default ports were occupied by other projects. Keep `CLIENT_ORIGIN` aligned with the browser URL. `.env` is intentionally not committed. Compose always uses API port 3000 internally; `PORT` controls only the host mapping. For host-side frontend development, also align `API_PROXY_TARGET` with your local API port.

## Hot reload and dependencies

The backend uses Node's watch mode against the bind-mounted source. Vite supplies actual HMR, with polling in Docker and a writable `/tmp/bagiya-vite` optimizer cache. `make verify-dev` adds/removes a temporary API probe, updates text in an already-open browser, asserts both changes and restores original files in a finally block. It requires the root Playwright dependency and a browser. If using system Chrome, set `PLAYWRIGHT_EXECUTABLE_PATH=/usr/bin/google-chrome`.

Dependencies live in separate API/web volumes. A clean build seeds them from `npm ci` layers. After changing a dependency lockfile, refresh that service's dependency volume before restarting; for example:

```sh
docker compose run --rm --no-deps --user root api npm ci
docker compose run --rm --no-deps --user root web npm ci
make dev-restart
```

These commands update generated dependency files only; they do not reset MongoDB. Root is used only during dependency installation; app processes remain non-root.

## Host development

`make install` installs all three lockfiles. Configure a local MongoDB replica set in root `.env`, run `npm run migrate --prefix backend`, then run these in separate terminals:

```sh
npm run dev --prefix backend
npm run dev --prefix frontend
```

Vite proxies `/api` to `API_PROXY_TARGET` (default port 3000). Export that variable when running a custom local port; Vite does not load root `.env` automatically. Backend startup loads root `.env` and never reads the legacy `backend/.env`.

## Commands and troubleshooting

Run `make help` for actual command descriptions. Common commands: `dev-up`, `dev-down`, `dev-logs`, `dev-restart`, `build`, `prod-build`, `test`, `test-integration`, `test-e2e`, `lint`, `format`, `format-check`, `migrate`, `migrate-status`, `migrate-rollback`, `db-shell`, `db-backup`, `verify-dev`, `clean`.

- Port occupied: change `PORT`, `WEB_PORT` and `CLIENT_ORIGIN` in root `.env`; do not stop unrelated processes.
- Not ready: inspect `docker compose logs migrate api mongo` and migration status.
- Transaction unsupported: configure a replica set; do not fall back to non-atomic writes.
- Vite optimizer permission error: verify `VITE_CACHE_DIR=/tmp/bagiya-vite` in Compose and recreate the web container.
- Migration lock: follow the inspection/recovery procedure in DATABASE.md; do not automatically delete it.
- Auth cookie missing in production: verify HTTPS, the trusted proxy and CLIENT_ORIGIN. Browsing a Secure-cookie deployment directly over HTTP is unsupported.
- Dependency differences after a lock update: refresh dependency volumes as shown above.

## Production preparation

```sh
make prod-build
cp .env.production.example .env.production
# Replace every placeholder with your own provisioned settings before starting.
PRODUCTION_ENV_FILE=.env.production docker compose -f compose.production.yaml config --quiet
```

Production Compose is independent of development Compose. It uses immutable image contents, no source mounts, no dev servers, no database port and no automatic deployment workflow. Provision an authenticated MongoDB replica set, take a verified backup, rehearse migration on a restored copy, and configure a TLS reverse proxy forwarding to `127.0.0.1:8080`. The API is private to the Compose network. Read SECURITY.md before setting trust-proxy configuration.

Deploy only after review. To roll back application code, rebuild/use the prior reviewed image digest and confirm schema compatibility. For data changes, use the documented forward-repair or backup-restoration procedure. A successful image build does not verify an actual production TLS/database deployment.

Strict focus extension sources and its packaging script are bind-mounted into the development web container. `make extension` regenerates the local unpacked policy file and downloadable ZIP; frontend startup/build does the same. Reload the unpacked browser extension after changing its files. See [Strict focus](STRICT_FOCUS.md) for installation and the separate real-extension test.
