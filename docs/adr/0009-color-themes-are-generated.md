# 0009 — Color themes are generated from vendor palettes

- Status: accepted
- Date: 2026-11-12

## Context

The app started with one Stripe-inspired light and dark palette. The next
project wants the OpenCode desktop theme catalogue available as color themes
without hand-maintaining 37 palettes and their light/dark variants.

## Decision

Keep the appearance mode and the color palette separate.

- `theme` cookie: `light`, `dark` or `system`.
- `color-theme` cookie: the default Stripe palette or an OpenCode theme id.
- `src/lib/theme/opencode-themes.json` is the palette source, copied with its
  source commit metadata.
- `scripts/generate-themes.ts` generates:
  - `src/app/themes.css` — `html[data-color-theme="<id>"]` and
    `html[data-color-theme="<id>"].dark` variable blocks.
  - `src/lib/theme/theme-options.ts` — ids, names and preview swatches for the
    picker.
- The root layout reads both cookies and writes `data-color-theme` on `<html>`
  before paint.
- The default palette stays in `:root` and `.dark`; the attribute is omitted for
  the default.

## Alternatives

- One flat list of 74 light/dark variants: doubles the picker and loses the
  independent mode switch.
- Runtime CSS-in-JS for palettes: more client work and a flash risk.
- Hand-writing the 37 themes: unmaintainable when the upstream catalogue moves.

## Consequences

- The picker has one option per theme, while light/dark/system stay separate.
- The generated CSS adds roughly 3,500 lines and the picker data is imported by
  the client. Both are acceptable for a boilerplate that ships 37 palettes.
- Updating the catalogue is a data change and a generator run.
- The test suite checks the option ids and one generated palette in the browser.
