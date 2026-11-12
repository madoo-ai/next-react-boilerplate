<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Next React Boilerplate — agent guide

This is a Next.js 16 + Prisma 7 + Better Auth application. Treat it as the
product, not as a collection of generated files.

## Boilerplate, not the product

This repository is a starting point, not the final application. It exists to
give the next project a working auth, RBAC, localization, settings and design
baseline.

If the requested product does not need a part of this boilerplate, rework or
remove it. Do not preserve a feature only because it is already here.

Examples:

- A request for a public landing page may remove the admin screens.
- A request for a small API may remove the React shell.
- A request for a different domain may replace the users, roles and settings
  model with the new domain model.
- A request for a different visual identity may replace `DESIGN.md`,
  `src/app/globals.css` and the shared components.

Before you delete, check:

- routes and layouts
- Prisma models and seed data
- server actions and tests
- navigation and permission checks
- shared components and translations

After you change the shape, run `make lint` and `make test`. If the app no
longer builds, fix the build before you continue.

## Before you build

1. Read `README.md`, `DESIGN.md`, `docs/architecture.md`, `docs/adr/README.md`
   and this file.
2. Read the relevant Next.js guide in `node_modules/next/dist/docs/` before
   using a framework API. Next 16 renamed middleware to `proxy.ts` and
   changed several defaults.
3. Ask what is being changed and who uses it.
4. For cross-cutting or irreversible decisions, add or supersede an ADR under
   `docs/adr/` before you write code.
5. If behavior changes, update the matching page under `docs/` in the same
   change.
6. Work in a small scope. Do not mix unrelated refactors with a feature.

## Map

| Need                               | Read                                        |
| ---------------------------------- | ------------------------------------------- |
| Product scope and setup            | `README.md`                                 |
| Request lifecycle and conventions  | `docs/architecture.md`                      |
| Auth, approval and RBAC flows      | `docs/auth-and-rbac.md`                     |
| User and role management           | `docs/users-and-roles.md`                   |
| Settings, 2FA and account deletion | `docs/settings.md`                          |
| Locale system                      | `docs/internationalization.md`              |
| Every route and gate               | `docs/routes-reference.md`                  |
| Demo script                        | `docs/demo-guide.md`                        |
| Architecture decisions             | `docs/adr/`                                 |
| Visual rules                       | `DESIGN.md`                                 |
| Routes and layouts                 | `src/app/`                                  |
| Auth server config                 | `src/lib/auth/auth.ts`                      |
| Auth client                        | `src/lib/auth/auth-client.ts`               |
| Session, permissions and guards    | `src/lib/auth/session.ts`, `src/lib/rbac/`  |
| Server actions                     | `src/lib/{users,roles,settings}/actions.ts` |
| Prisma                             | `prisma/schema.prisma`, `prisma/seed.ts`    |
| Navigation                         | `src/config/navigation.ts`                  |
| UI primitives                      | `src/components/ui/`                        |
| App shell                          | `src/components/app-shell/`                 |
| Translations                       | `src/messages/{en,id}.json`                 |
| Tests                              | `tests/unit`, `tests/e2e`                   |
| Vendor agent skills                | `.agents/skills/`, `docs/agent-skills.md`   |

## Commands

```sh
make setup                  # install, env, local Postgres, migrate, seed
make dev                    # Next.js dev server on :3000
make test                   # Vitest
make test-e2e               # Playwright on :3100 with the test database
make lint                   # ESLint, i18n, Prettier and TypeScript
make format                 # Prettier
make typecheck              # tsc --noEmit
make build                  # next build
make db-migrate             # prisma migrate deploy
make db-seed                # idempotent seed
make db-reset               # destructive reset of the dev database
docker compose up --build   # app + Postgres + Mailpit + migrate/seed
```

The app listens on `http://localhost:3000` by default.

## Architecture rules

- Default to Server Components. Add `"use client"` only for state, effects,
  browser APIs or event handlers.
- Use Server Actions for mutations. Do not add a REST layer for the web app
  unless a second client needs it.
- `src/proxy.ts` is an optimistic redirect layer only. It checks the session
  cookie, not the database. Every page, action and route handler re-checks the
  session and permission close to the data.
- Use `requireSession`, `requirePermission` or `permissionActionClient` from
  the server side. Never trust a client-supplied user ID or role.
- Keep data access in `src/lib/<domain>/queries.ts` and mutations in
  `src/lib/<domain>/actions.ts`.
- Use `revalidatePath` after a mutation that changes a server-rendered list.
- Postgres is the only local database. Do not add a second database path.
- Prisma 7 uses the `prisma-client` generator and a driver adapter. Run
  `npm run db:generate` after schema changes. Do not edit
  `src/generated/prisma`.

## Auth and RBAC rules

- Better Auth owns authentication. RBAC is app-owned.
- Roles and permissions are defined in `src/lib/rbac/roles.ts` and
  `src/lib/rbac/permissions.ts`. The seed writes them to Postgres.
- A user has one role. `superadmin` is immutable; `user` is the default role
  and its name cannot change.
- Only actors with `manage_roles` may assign `superadmin`. The last superadmin
  cannot be deleted or demoted. HR cannot manage a superadmin.
- Pending or suspended users cannot create a session. The session hook and the
  UI both block them.
- Registration approval is a database setting. Read it in the sign-up hook,
  not from a client value.
- Sensitive actions that need a recent password confirmation use
  `hasRecentPasswordConfirmation()`.

## UI rules

- Build on `src/components/ui` (shadcn). Add a primitive with
  `npx shadcn@latest add <name>`. Do not add a second component library.
- Icons come from `@x1nx3r/altics-react-icons` with named imports. Do not
  import `lucide-react`; an ESLint rule blocks it. The shadcn CLI config still
  says `iconLibrary: "lucide"` because the CLI has no Altics adapter. After
  adding a primitive, replace any Lucide imports it brings in.
- Use semantic tokens (`bg-background`, `text-muted-foreground`,
  `border-border`), not raw palette classes, for app surfaces.
- Use `FieldGroup` + `Field` for forms, `gap-*` instead of `space-y-*`,
  `size-*` for equal dimensions and `cn()` for conditional classes.
- Every page has one `h1`, rendered by `PageHeader` or the auth card.
- Pages use the full content width; constrain the grid, not the page.
- The primary table sits in a bare `overflow-x-auto rounded-lg border` wrapper.
- Use the full Card composition (`CardHeader`, `CardContent`, `CardFooter`).
- Overlays need a title. Use `AlertDialog` for destructive confirmation.
- Send feedback through Sonner toasts. Use `FormAlert` for form-level errors.
- Color themes are generated. Edit `src/lib/theme/opencode-themes.json` and run
  `npm run themes:generate`; do not hand-edit `src/app/themes.css` or
  `src/lib/theme/theme-options.ts`.

## i18n rules

- Every user-facing string goes through next-intl. Add keys to both
  `src/messages/en.json` and `src/messages/id.json`.
- Do not add a `[locale]` segment. The `locale` cookie is the source of truth.
- Use `getTranslations` in Server Components and `useTranslations` in Client
  Components. Do not call hooks in async components.
- Zod messages are translation keys (`validation.*`). Translate them in the
  form with `translateFieldError`.
- Run `npm run check:i18n` after changing messages.

## Testing rules

- Unit-test policies, schemas and pure helpers with Vitest.
- E2E-test auth, RBAC, approval, user CRUD, roles and settings with Playwright.
- The E2E suite uses `next_boilerplate_test` on port 3100. It cleans up the
  users and roles it creates and resets the approval setting.
- Do not disable security checks to make a test pass. Fix the flow.

## Agent skills

The repository ships the official vendor skills for the stack. They are
committed under `.agents/skills/` and linked from `.claude/skills/` and
`.windsurf/skills/`.

- Next.js: `vercel/next.js`
- Prisma: `prisma/skills`
- Better Auth: `better-auth/skills`
- shadcn/ui: `shadcn/ui`
- Docker: `docker/skills`
- Playwright: `microsoft/playwright-cli`

Use them when the task matches. Update with `npx skills update`. See
`docs/agent-skills.md` for the exact inventory and for stack items that do not
publish an official skill.

## Demo accounts

All demo accounts use the password `password`.

| Role       | Email                    |
| ---------- | ------------------------ |
| superadmin | `superadmin@example.com` |
| hr         | `hr@example.com`         |
| user       | `user@example.com`       |

The seed creates additional active, pending and suspended users.
