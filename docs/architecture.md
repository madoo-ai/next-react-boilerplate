# Architecture

## Request lifecycle

1. `src/proxy.ts` checks whether the session cookie is present. It redirects
   guests away from protected routes and never treats the cookie as proof of a
   valid session.
2. The authenticated layout calls `requireSession()`. That helper reads the
   Better Auth session, loads the user and role from Postgres and redirects
   pending or suspended users to login.
3. Pages are Server Components. They query Prisma through
   `src/lib/<domain>/queries.ts` and pass plain data to Client Components.
4. Mutations are Server Actions in `src/lib/<domain>/actions.ts`. They validate
   input with Zod, re-check the session and permission, write through Prisma and
   call `revalidatePath`.
5. Client forms use React Hook Form, `next-safe-action` and Sonner. The server
   returns translation keys for application errors; the client translates them.

## Project structure

```text
src/
  app/
    (auth)/                  # login, register, reset, 2FA, confirm password
    (app)/                   # authenticated shell
      admin/users/           # list, create, edit
      admin/roles/           # role and permission matrix
      settings/              # profile, password, appearance, security
      page.tsx               # dashboard
    api/auth/[...all]/       # Better Auth handler
    api/health/              # Docker health check
  components/
    app-shell/               # sidebar, header, breadcrumbs, user menu
    auth/                    # auth forms and auth-only primitives
    common/                  # page header, stat card, pagination
    dashboard/               # charts
    roles/ users/ settings/  # domain forms and tables
    ui/                      # shadcn primitives (Altics icons)
  config/                    # app name and navigation
  emails/                    # React Email templates
  i18n/                      # locale config and request config
  lib/
    auth/                    # Better Auth, session, confirm-password
    dashboard/ db/ mail/     # queries, Prisma client, mail transport
    rbac/                    # roles, permissions, policies
    roles/ settings/ users/  # schemas, queries, server actions
    safe-action.ts           # auth and permission action clients
  messages/                  # en.json, id.json
  proxy.ts                   # optimistic cookie redirects
prisma/
  migrations/
  schema.prisma
  seed.ts
tests/
  unit/
  e2e/
docs/
  adr/
```

## Icons

Icons come from `@x1nx3r/altics-react-icons`. Use named imports from the
package root; the package sets `sideEffects` to `false`, so unused icons are
tree-shaken.

```tsx
import { CheckIcon, SearchLgIcon } from "@x1nx3r/altics-react-icons";
```

The shadcn CLI config still says `iconLibrary: "lucide"` because the CLI has no
Altics adapter. After adding a shadcn primitive, replace any `lucide-react`
imports with the Altics equivalents. ESLint rejects `lucide-react` imports.

## Server and client boundaries

- Server Components are the default. A file gets `"use client"` only when it
  needs state, effects, event handlers or browser APIs.
- Server-only modules import `server-only` (`src/lib/auth/session.ts`,
  `src/lib/db/prisma.ts`, queries and actions).
- Client components receive narrow, serializable props. Do not pass password
  hashes, session tokens or full Prisma rows to the client.
- Route handlers are reserved for Better Auth, health checks and future
  webhooks or downloads. The web app does not need a REST layer.

## Authorization

Authorization is deliberately not handled by the auth library. Better Auth
authenticates; the app owns roles and permissions.

- Coarse checks happen in pages with `requirePermission`.
- Mutations use `permissionActionClient` or `authActionClient`.
- Fine-grained rules live in `src/lib/rbac/authorize.ts` and are unit-tested.
- The sidebar hides links the user cannot use, but hiding is never the only
  protection.

## Validation and errors

- Zod schemas are shared by the client form and the server action.
- Validation messages are i18n keys (`validation.*`).
- Application errors are thrown as `ActionError("errors.someKey")` and returned
  by `next-safe-action` as `serverError`.
- Forms show a `FormAlert` for form-level errors and `FieldError` for field
  errors. Successful mutations use a Sonner toast.

## Data

- Prisma 7 uses the `prisma-client` generator, a generated client under
  `src/generated/prisma` and the `@prisma/adapter-pg` driver adapter.
- IDs are ULIDs. Timestamps are `timestamptz` in Postgres.
- `users` has a single `role_id`. The role tables mirror the useful part of
  `spatie/laravel-permission` without the polymorphic model.
- The seed is idempotent: it upserts permissions, roles and the approval
  setting, then creates demo users that do not exist yet.

## Quality gates

`make lint` runs:

1. ESLint
2. i18n key parity
3. Prettier check
4. `tsc --noEmit`

`make test` runs Vitest. `make test-e2e` runs Playwright against a separate
database on port 3100.
