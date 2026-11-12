# 0001 — Record architecture decisions

- Status: accepted
- Date: 2026-11-12

## Context

The boilerplate makes several choices that are easy to reverse in code but
expensive to reverse after a project has built on them: the auth library, the
data layer, the authorization model, the locale strategy and the UI layer.

Future agents and developers need the reason, not only the code.

## Decision

Record cross-cutting decisions as ADRs in `docs/adr/`. Each record states the
context, the decision, the alternatives considered and the consequences.
Supersede an old record with a new one; do not rewrite the old one.

## Consequences

- New decisions are reviewable before implementation.
- The repository carries a small documentation cost.
- The ADR index in `docs/adr/README.md` must be updated with each record.
