# Next React Boilerplate

Opinionated Next.js 16 + React 19 boilerplate with Better Auth, Prisma, RBAC, i18n and a shadcn/ui shell.

This is the core-only sibling of the Laravel React boilerplate: auth, roles and permissions, user management, settings, locale, theme and the app shell. Employee documents, attendance and leave requests are deliberately left out so the next project can add its own domain.

## What's inside

- **Auth**: Better Auth with email/password, email verification, password reset, 2FA (TOTP + backup codes), session management, rate limiting and a confirm-password gate.
- **Registration approval**: optional approval mode where new accounts stay `pending` until an HR user verifies them.
- **RBAC**: three seeded roles (`superadmin`, `hr`, `user`), a permission registry, user/role management, protected superadmin, navigation gating and privilege-escalation checks.
- **Users and roles**: searchable, filterable and paginated users; create/edit/delete; role permission matrix; protected system roles.
- **Settings**: profile, password, appearance, security (2FA) and account deletion.
- **i18n**: Indonesian default and English, cookie-based with no URL prefix.
- **Appearance**: light/dark/system, plus the Stripe-inspired default palette and 37 OpenCode color themes. Both the mode and the palette are cookie-backed with no flash on load.
- **Frontend**: App Router, React Server Components, Server Actions, Tailwind CSS 4, shadcn/ui, `@x1nx3r/altics-react-icons`, Recharts, Sonner and route-typed links.
- **Data**: PostgreSQL 18, Prisma 7, generated client, migrations and an idempotent seed.
- **Quality**: ESLint 9, Prettier, TypeScript strict, Vitest, Playwright, i18n key parity check and GitHub Actions.
- **Ops**: multi-stage Dockerfile, Compose stack with Postgres and Mailpit, Makefile and a project rename script.
- **Agent skills**: versioned vendor skills for Next.js, Prisma, Better Auth, shadcn/ui, Docker and Playwright are committed under `.agents/skills`.

## Stack

| Layer         | Choice                                                                            |
| ------------- | --------------------------------------------------------------------------------- |
| Framework     | Next.js 16 (App Router, RSC, Server Actions, Turbopack)                           |
| UI            | React 19, Tailwind CSS 4, shadcn/ui (Radix), Altics React Icons, Sonner, Recharts |
| Data          | Prisma 7, PostgreSQL 18, `@prisma/adapter-pg`                                     |
| Auth          | Better Auth 1.x (email/password, 2FA, verification, reset)                        |
| Authorization | App-owned RBAC tables and guards                                                  |
| Forms         | Zod 4, React Hook Form, next-safe-action                                          |
| i18n          | next-intl, cookie locale                                                          |
| Tests         | Vitest, Testing Library, Playwright                                               |
| Runtime       | Node 24, Docker, Compose                                                          |

## Demo accounts

All demo accounts use the password `password`.

| Account      | Email                    | Role         | Can do                            |
| ------------ | ------------------------ | ------------ | --------------------------------- |
| Super Admin  | `superadmin@example.com` | `superadmin` | Everything                        |
| HR Staff     | `hr@example.com`         | `hr`         | Manage users, cannot manage roles |
| Regular User | `user@example.com`       | `user`       | Self-service only                 |

The seed also creates eleven more users, including pending and suspended accounts, so the dashboard and user list have realistic data.

## Requirements

- Node.js 22 or newer (Node 24 is used in the container)
- npm 10 or newer
- PostgreSQL 18 for local development, or Docker

## Quick start

```bash
make setup   # install, create .env, start local Postgres, migrate and seed
make dev     # http://localhost:3000
```

`make setup` starts a local cluster under `.manus/postgres` and creates `next_boilerplate` and `next_boilerplate_test`. Change `DATABASE_URL` in `.env` if you use another Postgres instance.

If you prefer the container stack:

```bash
docker compose up --build
```

- App: http://localhost:3000
- Mailpit: http://localhost:8025
- Postgres: `127.0.0.1:5432` (Compose only)

The Compose stack runs `prisma migrate deploy` and the seed once before the app starts.

## Scripts

| Command                                     | Purpose                                          |
| ------------------------------------------- | ------------------------------------------------ |
| `npm run dev`                               | Start the development server                     |
| `npm run build`                             | Production build                                 |
| `npm run start`                             | Run the production server                        |
| `npm run lint:check`                        | ESLint                                           |
| `npm run format:check`                      | Prettier check                                   |
| `npm run typecheck`                         | `tsc --noEmit`                                   |
| `npm run check:i18n`                        | Compare `en` and `id` message keys               |
| `npm run test`                              | Unit tests                                       |
| `npm run test:e2e`                          | Playwright against the test database             |
| `npm run db:generate`                       | Generate the Prisma client                       |
| `npm run db:migrate`                        | Create/apply a development migration             |
| `npm run db:migrate:deploy`                 | Apply migrations in CI or production             |
| `npm run db:seed`                           | Seed permissions, roles, settings and demo users |
| `npm run db:studio`                         | Open Prisma Studio                               |
| `npm run db:reset`                          | Drop and rebuild the dev database                |
| `npm run rename -- "Client App" client-app` | Rename the project identity                      |

`make lint` runs ESLint, i18n parity, Prettier and TypeScript together.

## RBAC wiring

- Role and permission definitions live in `src/lib/rbac/`.
- Database rows live in `roles`, `permissions` and `role_permissions`; a user has one role.
- Coarse gate: `requirePermission("view_admin")` or the `permissionActionClient` middleware.
- Fine gate: policies in `src/lib/rbac/authorize.ts` (for example `canManageUser`, `canDeleteUser`, `canAssignRole`).
- Navigation gating: `permissions` and `roles` arrays in `src/config/navigation.ts`, applied by `filterNavItems`.
- Privilege escalation is blocked in the actions: only actors with `manage_roles` may assign `superadmin`, and the last superadmin cannot be removed.
- The superadmin role is immutable. The default `user` role can change label and permissions, but not its name.

## Auth and approval

- Better Auth owns credentials, sessions, verification, reset and 2FA.
- Registration uses `autoSignIn: false`. After sign-up the form reads the new user's status:
  - `active` → explicit sign-in and redirect to the dashboard.
  - `pending` → redirect to login with an approval message.
- The database hook on session creation also blocks pending or suspended users, so direct login attempts fail with a clear message.
- The approval switch on the Users page writes `settings.registration_approval`.
- Sensitive actions can require a recent password confirmation. The cookie lasts 15 minutes and is used by account deletion.

## i18n

- Messages: `src/messages/en.json` and `src/messages/id.json`.
- Request config: `src/i18n/request.ts` reads the `locale` cookie.
- Locale switch: `src/lib/i18n/locale-actions.ts` sets the cookie and revalidates the layout.
- The `locale` cookie is the single source of truth. There is no `/[locale]` URL segment.
- `npm run check:i18n` fails when the catalogues drift.

## Where things live

| What                   | Where                                                                     |
| ---------------------- | ------------------------------------------------------------------------- |
| Routes                 | `src/app/` (`(app)` for the authenticated shell, `(auth)` for auth pages) |
| Auth config            | `src/lib/auth/auth.ts`                                                    |
| Auth client            | `src/lib/auth/auth-client.ts`                                             |
| Session and guards     | `src/lib/auth/session.ts`                                                 |
| RBAC                   | `src/lib/rbac/`                                                           |
| Server actions         | `src/lib/{users,roles,settings}/actions.ts`                               |
| Prisma schema          | `prisma/schema.prisma`                                                    |
| Seed                   | `prisma/seed.ts`                                                          |
| UI primitives          | `src/components/ui/` (shadcn, do not hand-roll)                           |
| App shell              | `src/components/app-shell/`                                               |
| Navigation             | `src/config/navigation.ts`                                                |
| Messages               | `src/messages/`                                                           |
| Design contract        | `DESIGN.md`                                                               |
| Architecture decisions | `docs/adr/`                                                               |
| Product docs           | `docs/`                                                                   |
| Vendor agent skills    | `.agents/skills/`                                                         |

## Agent skills

The repository ships the official vendor skills that are useful for this stack. They live in `.agents/skills/` and are linked into `.claude/skills/` and `.windsurf/skills/` for other agents.

```bash
npx skills list
npx skills update
```

See `docs/agent-skills.md` for the inventory, sources and the stack items that do not publish an official skill.

## Testing

```bash
npm run test       # unit tests
npm run test:e2e   # Playwright, uses next_boilerplate_test
```

Playwright starts its own dev server on port 3100, applies migrations and seeds the test database, and cleans up the users and roles it creates.

## Docker and deployment

- The Dockerfile builds a standalone Next.js server and runs as a non-root user.
- The Compose stack includes Postgres, Mailpit, a one-shot migrate/seed service and the app.
- Set `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `DATABASE_URL`, `NEXT_PUBLIC_APP_URL` and `NEXT_PUBLIC_APP_NAME` in the deployment environment.
- The app listens on `0.0.0.0:3000` inside the container. The Compose file publishes it on loopback by default; change the port mapping or put a reverse proxy in front for a public deployment.

## Not included

Employee documents, attendance and leave requests are intentionally absent. The Laravel sibling keeps those as a demo domain; add your own modules here. Deploy pipelines, backups and monitoring vary by host and are also left out.

## Docs

- `docs/architecture.md`
- `docs/auth-and-rbac.md`
- `docs/users-and-roles.md`
- `docs/settings.md`
- `docs/internationalization.md`
- `docs/routes-reference.md`
- `docs/demo-guide.md`
- `docs/agent-skills.md`
- `docs/adr/README.md`
- `AGENTS.md`
- `DESIGN.md`

## License

MIT.
