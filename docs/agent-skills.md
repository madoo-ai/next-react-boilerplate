# Agent skills

This repository ships vendor-authored agent skills for the stack. They are
committed under `.agents/skills/`, and `.claude/skills/` and `.windsurf/skills/`
contain relative symlinks to the same directories. `skills-lock.json` records
the source repository, skill path and content hash for every installed skill.

Skills are on-demand instructions. They do not run by themselves; the agent
loads one when its description matches the task. Review a skill before you
trust it, because a skill runs with the same permissions as the agent.

## Inventory

| Stack       | Source                     | Skills installed                                                                                                                                                    |
| ----------- | -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Next.js     | `vercel/next.js`           | `next-dev-loop`, `next-bundle-optimizer`, `next-cache-components-adoption`                                                                                          |
| Prisma      | `prisma/skills`            | `prisma-cli`, `prisma-client-api`, plus the Prisma 8/Compute/Postgres/upgrade skills installed by `prisma init`                                                     |
| Better Auth | `better-auth/skills`       | `better-auth-best-practices`, `create-auth`, `email-and-password-best-practices`, `two-factor-authentication-best-practices`, `better-auth-security-best-practices` |
| shadcn/ui   | `shadcn/ui`                | `shadcn`                                                                                                                                                            |
| Docker      | `docker/skills`            | `docker-project-foundations`, `docker-build-strategies`, `docker-compose-patterns`, `docker-docs`                                                                   |
| Playwright  | `microsoft/playwright-cli` | `playwright-cli`                                                                                                                                                    |

Next.js also writes its version-matched docs to `node_modules/next/dist/docs/`
and regenerates its own `AGENTS.md` block during `next dev`. The workflow
skills above sit on top of those docs.

## Stack items without an official vendor skill

These are in the stack, but the vendor does not publish an official skill:

- Tailwind CSS — use the shadcn skill for Tailwind 4 and semantic-token
  patterns; the Tailwind docs are the source of truth.
- next-intl — use the project rules in `AGENTS.md` and
  `docs/internationalization.md`.
- Zod, React Hook Form, next-safe-action — use the project schemas and forms
  as the reference.
- Vitest, ESLint, Prettier, Sonner, Recharts — no official vendor skill.

Do not add a community skill just to fill the gap. If a community skill is
useful, pin it in `skills-lock.json`, review it and document why it is there.

## Commands

```bash
npx skills list                 # installed skills
npx skills update               # update to the latest upstream versions
npx skills experimental_install # restore from skills-lock.json
```

Install a specific official skill into the canonical `.agents` layout:

```bash
npx skills add vercel/next.js \
  --skill next-dev-loop \
  --skill next-bundle-optimizer \
  --copy -a opencode -y
```

Reinstall the current set if you intentionally reset the lockfile:

```bash
npx skills add vercel/next.js \
  --skill next-dev-loop \
  --skill next-bundle-optimizer \
  --skill next-cache-components-adoption \
  --copy -a opencode -y

npx skills add prisma/skills \
  --skill prisma-cli \
  --skill prisma-client-api \
  --copy -a opencode -y

npx skills add better-auth/skills \
  --skill better-auth-best-practices \
  --skill create-auth \
  --skill email-and-password-best-practices \
  --skill two-factor-authentication-best-practices \
  --skill better-auth-security-best-practices \
  --copy -a opencode -y

npx skills add shadcn/ui --skill shadcn --copy -a opencode -y

npx skills add docker/skills \
  --skill docker-project-foundations \
  --skill docker-build-strategies \
  --skill docker-compose-patterns \
  --skill docker-docs \
  --copy -a opencode -y

npx skills add microsoft/playwright-cli \
  --skill playwright-cli \
  --copy -a opencode -y
```

## Add a project-specific skill

Use a project skill when the convention is not covered by a vendor skill:

```bash
npx skills init my-project-convention
# writes .agents/skills/my-project-convention/SKILL.md
```

Keep the `SKILL.md` short and action-oriented. Put reference material next to
it and point to the project files it protects. Do not duplicate `AGENTS.md`
rules; go deeper on one workflow.

## Licenses

| Source             | License                                                                                |
| ------------------ | -------------------------------------------------------------------------------------- |
| Next.js            | MIT                                                                                    |
| Prisma skills      | MIT                                                                                    |
| shadcn/ui          | MIT                                                                                    |
| Docker skills      | Apache-2.0                                                                             |
| Playwright         | Apache-2.0                                                                             |
| Better Auth skills | No license detected at the time of installation; review upstream before redistributing |

The Better Auth skills are installed from the official
`better-auth/skills` repository. If you redistribute this boilerplate, check
that repository for a current license and replace or remove those skill files
if the terms do not fit your distribution.
