# 0002 — Next.js App Router and Server Actions baseline

- Status: accepted
- Date: 2026-11-12

## Context

The sibling boilerplate uses Laravel, Inertia and React. Inertia gives an SPA
feel with server-owned routing and shared props. The Next.js version needs the
same server-first behavior without an Inertia layer.

## Decision

Use the Next.js 16 App Router with React Server Components and Server Actions.

- Pages and layouts are Server Components by default.
- Mutations are Server Actions colocated with their domain under
  `src/lib/<domain>/actions.ts`.
- Route Handlers are reserved for Better Auth, health checks and future
  webhooks or downloads.
- Do not add a REST or tRPC layer unless a second client needs it.
- `src/proxy.ts` is only an optimistic redirect layer.

## Alternatives

- Pages Router: older data-fetching model, no RSC, not the current default.
- Separate API + client SPA: duplicates types and loses server rendering.
- tRPC: useful for a second client, unnecessary for this web-only app.

## Consequences

- Data access stays on the server.
- The client bundle is smaller because only interactive islands are client
  components.
- Developers must understand the server/client boundary and revalidate paths
  after mutations.
