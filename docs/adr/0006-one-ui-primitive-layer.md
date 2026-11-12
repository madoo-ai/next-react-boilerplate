# 0006 — One UI primitive layer

- Status: accepted
- Date: 2026-11-12

## Context

The Laravel app uses shadcn/ui on Radix. The Next.js version needs the same
components, form conventions and dark-mode behavior. Mixing component
libraries makes the design system inconsistent and increases bundle size.

## Decision

Use shadcn/ui as the only primitive layer.

- Add primitives with `npx shadcn@latest add <name>`.
- Put app-specific composition in `src/components/common`, `app-shell`,
  `dashboard`, `users`, `roles`, `settings` and `auth`.
- Use the generated `Field` primitives for forms and `AlertDialog` for
  destructive confirmation.
- Use semantic tokens, not raw palette classes.
- `DESIGN.md` is the visual contract.
- Do not add a second component library (MUI, Chakra, Ant, Mantine, etc.).

## Consequences

- The project owns the component source and can adjust it.
- Upgrades use the shadcn CLI diff workflow, not raw file copies.
- The UI has one consistent set of tokens, radii and interaction states.
