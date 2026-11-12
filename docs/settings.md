# Settings

The Settings area lives under `/settings` and requires a session. The layout
renders one `PageHeader` and a left navigation for Profile, Password,
Appearance and Security.

## Profile

`/settings/profile` updates:

- name
- email
- phone
- job title
- department

Changing the email checks uniqueness, sets `emailVerified` to false and tries
to send a verification email. If SMTP is unavailable, the update still
succeeds and the link is logged.

The page also contains the danger zone.

## Password

`/settings/password` uses Better Auth's `changePassword`:

- current password is required,
- new password is 8–128 characters,
- confirmation must match,
- other sessions are revoked.

On success the form resets and shows a toast.

## Appearance

`/settings/appearance` contains:

- theme: light, dark or system
- color theme: the Stripe-inspired default and 37 OpenCode palettes
- language: Bahasa Indonesia or English

Theme is stored in a `theme` cookie and applied by the root layout's inline
script before paint. The client provider updates the class and the cookie.

The color theme is stored separately in a `color-theme` cookie. The root layout
reads both cookies and writes `data-color-theme` on `<html>`. Each OpenCode
palette has a light block and a dark block in `src/app/themes.css`, so the mode
and the palette stay independent. The default palette lives in `:root` and
`.dark` in `src/app/globals.css`.

The palette data comes from `src/lib/theme/opencode-themes.json`. The CSS and
the picker metadata are generated:

```bash
npm run themes:generate
```

Do not edit `src/app/themes.css` or `src/lib/theme/theme-options.ts` by hand.
Language is stored in a `locale` cookie and the layout is revalidated.

## Security

`/settings/security` enables and disables TOTP two-factor authentication.

Enabling:

1. Confirm the account password.
2. Receive a TOTP URI and ten backup codes.
3. Scan the QR code.
4. Enter a 6-digit code to finish.

Disabling also requires the password. The page refreshes after either action
so the status badge and the session user reflect the change.

## Account deletion

The danger zone on the Profile page deletes the current account.

- It requires a recent password confirmation. If the 15-minute cookie is
  missing, the page links to `/confirm-password?next=/settings/profile`.
- The last superadmin cannot delete their account.
- The deletion cascades sessions, accounts, 2FA records and any other user
  relations.
- The client signs out and redirects to `/login?deleted=1`.
