# 0003 — Prisma 7 and PostgreSQL

- Status: accepted
- Date: 2026-11-12

## Context

The Laravel app uses PostgreSQL and Eloquent migrations. The Next.js version
needs a typed data layer with migrations, a seed and driver-level control.

## Decision

Use PostgreSQL 18, Prisma 7, the `prisma-client` generator and the
`@prisma/adapter-pg` driver adapter.

- Local development uses one database path: Postgres on `127.0.0.1:5432`.
- Tables use snake_case columns; TypeScript uses camelCase fields.
- IDs are ULIDs.
- Migrations are committed under `prisma/migrations`.
- The seed is idempotent and owns the RBAC and demo data.
- Prisma Studio is available through `npm run db:studio`.

## Alternatives

- Drizzle: lighter and SQL-first, but the team selected Prisma.
- Raw SQL: too much hand-written mapping for a boilerplate.
- SQLite: not a production-parity choice.

## Consequences

- Prisma 7 is ESM-only and requires `"type": "module"` and a driver adapter.
- `prisma7.config.ts` holds the CLI configuration.
- Generated code under `src/generated/prisma` is not edited by hand.
- The runtime image needs the generated client and the `pg` adapter, not a
  separate Prisma query engine binary.
