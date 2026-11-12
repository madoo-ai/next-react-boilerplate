# 0005 — Cookie locale and theme

- Status: accepted
- Date: 2026-11-12

## Context

The Laravel app stores the locale and appearance in cookies and reads them in
middleware before rendering. The Next.js version needs the same behavior
without a `[locale]` URL segment and without a flash of the wrong theme.

## Decision

Store the locale in a `locale` cookie and the theme in a `theme` cookie.

- `src/i18n/request.ts` reads the locale cookie for every request.
- The root layout reads the theme cookie and writes an inline script that
  applies the `dark` class before paint.
- The client theme provider updates the class and the cookie on change.
- The locale switcher calls a Server Action that sets the cookie and
  revalidates the layout.
- There is no `/[locale]` segment and no browser-language auto-detection.

## Alternatives

- URL-prefixed locales: better for public SEO, unnecessary for an
  authenticated app and a larger change from the Laravel sibling.
- `localStorage` theme: no flash prevention because the server cannot read it.
- `next-themes` with local storage: same limitation; a small cookie-backed
  provider is simpler.

## Consequences

- The first HTML response already has the correct language and theme.
- Every page is dynamic because the root layout reads cookies. That is
  acceptable for an authenticated app.
- Locale changes require a layout revalidation.
