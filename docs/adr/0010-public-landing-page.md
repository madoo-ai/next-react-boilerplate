# 0010 — The root path is a public landing page

- Status: accepted
- Date: 2026-11-12

## Context

The first version used `/` as the authenticated dashboard. That made the
boilerplate impossible to evaluate without a session and gave the theme system
no public place to show itself.

## Decision

Split the public and authenticated entry points.

- `/` is a public landing page in the `(marketing)` route group.
- `/dashboard` is the authenticated home in the `(app)` route group.
- `src/proxy.ts` allows `/` without a session.
- Login, registration, 2FA and redirects point to `/dashboard`.
- The landing page uses the real theme data, a live palette rail, a dashboard
  preview and the seeded demo accounts.
- Marketing headings use Instrument Serif; the product shell keeps Inter.
- Motion is CSS-only, compositor-friendly and gated by `prefers-reduced-motion`.

## Alternatives

- Keep `/` as the dashboard and add `/landing`: the public entry is buried and
  the root would still redirect guests.
- A separate marketing app: duplicates the theme system and the design tokens.
- A static screenshot instead of the preview: cheaper, but it would not prove
  that the themes are real.

## Consequences

- Guests can evaluate the design and features before signing in.
- Every authenticated link and redirect now uses `/dashboard`.
- The landing page imports the same theme data and components as Settings, so
  the palette cannot drift between the two surfaces.
- The route tree has three clear groups: `(marketing)`, `(auth)` and `(app)`.
