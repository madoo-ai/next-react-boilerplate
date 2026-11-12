# 0008 — Boilerplate is a scaffold

- Status: accepted
- Date: 2026-11-12

## Context

A boilerplate that tries to be every product becomes a maintenance burden and
forces unrelated features into the next project.

## Decision

Treat this repository as a scaffold.

- Keep the core: auth, approval, RBAC, users, roles, settings, i18n, theme and
  the app shell.
- Leave domain modules (documents, attendance, leave requests, billing,
  inventory, etc.) out.
- When a project needs a different domain, replace the models, routes, actions,
  navigation and tests rather than preserving unused demo code.
- When a project needs a different visual identity, replace `DESIGN.md`,
  `src/app/globals.css` and the shared components.
- Keep the quality gates green after changing the shape.

## Consequences

- The next project starts with a small, understandable base.
- Removing a feature is a normal operation, not a regression.
- `AGENTS.md` tells agents to rework or remove what the product does not need.
