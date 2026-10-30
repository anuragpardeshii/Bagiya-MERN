.DEFAULT_GOAL := help
COMPOSE ?= docker compose
.PHONY: help install dev-up dev-down dev-logs dev-restart build prod-build test test-integration test-e2e lint format format-check migrate migrate-status migrate-rollback db-shell db-backup clean verify-dev
help: ## Show available commands
	@awk 'BEGIN {FS = ":.*## "} /^[a-zA-Z_-]+:.*## / {printf "  %-20s %s\n", $$1, $$2}' $(MAKEFILE_LIST)
install: ## Install all locked dependencies locally (Node 22 or 24)
	npm ci
	npm ci --prefix backend
	npm ci --prefix frontend
dev-up: ## Build and start development services with persistent data
	$(COMPOSE) up -d --build --wait
dev-down: ## Stop services and preserve database volumes
	$(COMPOSE) down
dev-logs: ## Follow development logs
	$(COMPOSE) logs -f
dev-restart: ## Restart application services
	$(COMPOSE) restart api web
build: ## Build frontend artifacts
	npm run build
prod-build: ## Build production API and web images
	docker build --target api-production -t bagiya-api:local .
	docker build --target web-production -t bagiya-web:local .
test: ## Run unit and HTTP boundary tests
	npm test
test-integration: ## Test real MongoDB transactions (requires isolated TEST_MONGO_URI)
	npm run test:integration --prefix backend
test-e2e: ## Run browser tests against running development services
	npm run test:e2e
lint: ## Run JavaScript and React static analysis
	npm run lint
format: ## Apply project formatting
	npm run format
format-check: ## Check project formatting
	npm run format:check
migrate: ## Apply pending non-destructive database migrations
	$(COMPOSE) run --rm migrate
migrate-status: ## Show migration status
	$(COMPOSE) run --rm migrate npm run migrate:status
migrate-rollback: ## Explain forward-only baseline recovery (returns nonzero)
	$(COMPOSE) run --rm migrate npm run migrate:rollback
db-shell: ## Open the development database shell
	$(COMPOSE) exec mongo mongosh bagiya
db-backup: ## Back up development data to an ignored timestamped archive
	@mkdir -p backups
	$(COMPOSE) exec -T mongo mongodump --db bagiya --archive --gzip > backups/bagiya-$$(date -u +%Y%m%dT%H%M%SZ).archive.gz
clean: ## Remove disposable frontend and test artifacts; preserve data
	node -e "for (const p of ['frontend/dist','playwright-report','test-results','coverage']) require('fs').rmSync(p,{recursive:true,force:true})"
verify-dev: ## Verify backend watch reload and frontend HMR in the running dev stack
	node scripts/verify-dev.cjs

.PHONY: extension
extension: ## Package the desktop Strict Focus extension for download
	npm run extension:pack
