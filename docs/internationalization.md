# Internationalization

## Source of truth

The `locale` cookie is the single source of truth. There is no `/[locale]`
segment and no locale prefix in URLs.

- `src/i18n/config.ts` defines locales, the default (`id`), labels and the
  cookie name.
- `src/i18n/request.ts` reads the cookie, validates it and loads
  `src/messages/<locale>.json`.
- The root layout passes the locale and messages to `NextIntlClientProvider`.
- `src/lib/i18n/locale-actions.ts` sets the cookie and revalidates the layout.

If the cookie is missing or invalid, the default locale is Indonesian. The
browser language is not used automatically; set the cookie to change language.

## Message files

`src/messages/en.json` and `src/messages/id.json` share the same key tree.
Sections:

- `common`, `nav`, `auth`, `validation`, `errors`
- `dashboard`, `users`, `roles`, `settings`
- `permissions`, `preferences`, `errorPages`

Use nested sections and section-scoped keys. Do not use dots inside a key; the
dot is the path separator.

## Using translations

Server Components:

```ts
const t = await getTranslations("users");
t("title");
```

Client Components:

```ts
const t = useTranslations("users");
t("messages.created");
```

Do not call translation hooks in async components. Use the `next-intl/server`
helpers there.

## Validation and errors

Zod schemas use message keys:

```ts
z.string().min(8, "validation.passwordLength");
```

Forms translate them with `translateFieldError`. Server actions throw
`ActionError("errors.someKey")`; the client translates the key with the full
message path.

## Adding a locale

1. Add the locale to `locales` in `src/i18n/config.ts`.
2. Add a label to `localeLabels`.
3. Copy `src/messages/en.json` to the new locale and translate every value.
4. Add the locale to `APP_LOCALE` in `src/lib/env.ts` if it should be a valid
   server default.
5. Run `npm run check:i18n`.
6. Add a test or screenshot for the locale switch if the layout changes.

## Checks

`npm run check:i18n` compares the key sets and fails on missing keys, extra
keys or empty values. It is part of `make lint`.

## Time zone

The dashboard aggregates sign-ups by Jakarta day (`Asia/Jakarta`). If the
product moves to another operating time zone, change
`src/lib/dashboard/queries.ts` and the `timeZone` in `src/i18n/request.ts`.
