# 0007 — Commit vendor agent skills

- Status: accepted
- Date: 2026-11-12

## Context

Vendors now publish version-matched agent skills for their tools. Agents
without them fall back to stale training data, especially for Next.js 16,
Prisma 7 and Better Auth.

## Decision

Commit the official vendor skills for the stack under `.agents/skills/`.

- `.claude/skills/` and `.windsurf/skills/` are relative symlinks to the
  canonical `.agents` directories.
- `skills-lock.json` records the source, path and hash of each skill.
- `docs/agent-skills.md` lists the inventory, install commands and licenses.
- Only official vendor skills are committed. Community skills need a review
  and a documented reason.
- Skills are on-demand context, not runtime dependencies.

## Consequences

- The repository is a little larger and needs periodic `npx skills update`.
- Agents get version-accurate guidance for the framework and libraries.
- A no-license upstream (Better Auth at the time of installation) must be
  reviewed before redistribution; the docs call this out.
