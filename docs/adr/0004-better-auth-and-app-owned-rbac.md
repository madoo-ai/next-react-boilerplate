# 0004 — Better Auth with app-owned RBAC

- Status: accepted
- Date: 2026-11-12

## Context

Fortify and spatie/laravel-permission cover authentication and authorization
in the Laravel app. The Next.js version needs credential auth, email
verification, reset, 2FA and a roles/permissions UI.

## Decision

Use Better Auth for authentication and keep RBAC in the application.

- Better Auth owns users' credentials, sessions, verification, reset, 2FA and
  rate limiting.
- Roles, permissions and role assignments are Prisma models with app-owned
  policies.
- Better Auth's `user` and `session` tables are mapped to the existing plural
  table names.
- The session hook blocks pending and suspended users.
- The `superadmin` role is immutable; the default `user` role name is fixed.

## Alternatives

- Auth.js: mature, but credentials and 2FA are DIY and v5 remained beta while
  Better Auth took over maintenance.
- Clerk: fastest hosted option, but user data and sessions leave Postgres.
- Better Auth's organization plugin: designed for multi-tenant organizations,
  not a single-role admin app.

## Consequences

- Authentication upgrades and authorization policy changes are independent.
- The roles/permissions UI can mirror the Laravel sibling.
- Every protected action must re-check the session and permission; hiding a
  navigation item is not enough.
