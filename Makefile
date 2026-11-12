SHELL := /bin/bash
.DEFAULT_GOAL := help

.PHONY: help setup install env dev test test-e2e lint format typecheck build \
	db-start db-create-postgres db-migrate db-seed db-reset db-studio \
	docker-up docker-down docker-logs clean

help:
	@printf '%s\n' \
	  'setup                Install deps, prepare .env, start Postgres, migrate/seed' \
	  'dev                  Start the Next.js dev server' \
	  'test                 Run Vitest unit tests' \
	  'test-e2e             Run Playwright against the test database' \
	  'lint                 ESLint, i18n parity, Prettier and TypeScript checks' \
	  'format               Apply Prettier' \
	  'typecheck            Run tsc --noEmit' \
	  'build                Production build' \
	  'db-start             Start the local Postgres cluster in .manus/postgres' \
	  'db-create-postgres   Create the dev and test databases' \
	  'db-migrate           Apply pending migrations' \
	  'db-seed              Seed permissions, roles and demo users' \
	  'db-reset             Drop and rebuild the dev database (destructive)' \
	  'db-studio            Open Prisma Studio' \
	  'docker-up            Build and start the Compose stack' \
	  'docker-down          Stop the Compose stack (keeps the data volume)' \
	  'docker-logs          Follow Compose logs' \
	  'clean                Remove the Next.js build output'

install:
	npm ci

env:
	@if [ ! -f .env ]; then cp .env.example .env; fi
	@if grep -q "replace-me-with-a-32-byte-secret" .env; then \
	  secret=$$(openssl rand -base64 32); \
	  sed -i "s|replace-me-with-a-32-byte-secret|$$secret|" .env; \
	  echo "Generated BETTER_AUTH_SECRET in .env"; \
	fi

setup: install env db-create-postgres
	npm run setup

dev:
	npm run dev

test:
	npm run test

test-e2e: db-create-postgres
	npm run test:e2e

lint:
	npm run lint:check
	npm run check:i18n
	npm run format:check
	npm run typecheck

format:
	npm run format

typecheck:
	npm run typecheck

build:
	npm run build

db-start:
	bash scripts/start-postgres.sh

db-create-postgres: db-start
	@for db in next_boilerplate next_boilerplate_test; do \
	  PGPASSWORD=$${PGPASSWORD:-postgres} psql -h $${PGHOST:-127.0.0.1} -p $${PGPORT:-5432} -U $${PGUSER:-postgres} -d postgres -tAc "SELECT 1 FROM pg_database WHERE datname='$$db'" | grep -q 1 || \
	    PGPASSWORD=$${PGPASSWORD:-postgres} createdb -h $${PGHOST:-127.0.0.1} -p $${PGPORT:-5432} -U $${PGUSER:-postgres} $$db; \
	done

db-migrate: db-create-postgres
	npm run db:migrate:deploy

db-seed: db-create-postgres
	npm run db:seed

db-reset:
	npm run db:reset

db-studio:
	npm run db:studio

docker-up:
	docker compose up --build -d

docker-down:
	docker compose down

docker-logs:
	docker compose logs -f

clean:
	rm -rf .next
