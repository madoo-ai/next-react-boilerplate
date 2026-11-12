# Auth and RBAC

## Authentication

Better Auth is configured in `src/lib/auth/auth.ts`.

- Email/password is enabled.
- Email verification is sent on sign-up but is not required to sign in.
- Password reset uses a one-hour token and revokes other sessions.
- Two-factor authentication uses TOTP and ten single-use backup codes.
- Sessions are stored in Postgres (`sessions`), with a five-minute cookie
  cache for the session payload.
- Rate limiting is enabled outside tests and E2E (`process.env.E2E !== "1"`).
- `autoSignIn` is disabled so the registration flow can inspect the new
  account's status before creating a session.

## Registration and approval

1. The public registration form calls `authClient.signUp.email`.
2. The Better Auth `user.create.before` hook reads
   `settings.registration_approval` and sets `status` to `pending` or `active`.
   It also assigns the default `user` role.
3. With `autoSignIn: false`, no session is created during sign-up.
4. The form reads `result.data.user.status`:
   - `pending` → `/login?error=account_pending`
   - `active` → explicit sign-in, then `/`
5. A second database hook on `session.create.before` rejects pending and
   suspended users. A direct login attempt gets `ACCOUNT_PENDING` or
   `ACCOUNT_SUSPENDED`.
6. HR verifies a pending account from the Users page. The account becomes
   `active` and can sign in.

The approval switch is stored in the `settings` table and is gated by
`manage_users`.

## Password reset and email verification

- `sendResetPassword` and `sendVerificationEmail` render React Email templates
  and send them through SMTP.
- In development, Mailpit receives mail at `http://localhost:8025` when the
  Compose stack is running. If SMTP is unavailable, the mailer logs the link
  instead of failing the auth request.
- Reset and verification links are handled by Better Auth under
  `/api/auth/*`. The UI result pages are `/reset-password` and
  `/verify-email`.

## Two-factor authentication

- The `twoFactor` plugin is enabled with a 6-digit, 30-second TOTP and ten
  backup codes.
- The Security settings page asks for the password, returns the TOTP URI and
  backup codes, shows a QR code and verifies the first code before the account
  is marked as enabled.
- Disabling 2FA also requires the password.
- Successful sign-in with 2FA redirects to `/two-factor`; the temporary 2FA
  cookie lasts ten minutes by default.

## Confirm password

Sensitive actions can require a fresh password confirmation:

- `/confirm-password` calls `auth.api.verifyPassword` on the server.
- On success it sets an httpOnly `pwd_confirmed` cookie for 15 minutes.
- `hasRecentPasswordConfirmation()` is checked by account deletion.
- The cookie is cleared when no longer needed.

## RBAC model

```text
users.role_id ──> roles ──< role_permissions >── permissions
```

A user has one role. Roles and permissions are stored in Postgres and seeded
from code:

- `src/lib/rbac/permissions.ts` — permission keys, labels and helpers.
- `src/lib/rbac/roles.ts` — role names, labels, descriptions and the default
  permission set.
- `src/lib/rbac/authorize.ts` — `can`, `canManageUser`, `canDeleteUser`,
  `canAssignRole`, `canManageRole`.

### Seeded roles

| Role         | Permissions                                  |
| ------------ | -------------------------------------------- |
| `superadmin` | `view_admin`, `manage_users`, `manage_roles` |
| `hr`         | `view_admin`, `manage_users`                 |
| `user`       | none                                         |

### Enforcement layers

1. **Page guard** — `requirePermission("manage_users")` or similar in every
   admin page.
2. **Action guard** — `permissionActionClient("manage_users")` validates the
   session, active status and permission before the handler runs.
3. **Policy** — `canManageUser`, `canDeleteUser` and `canAssignRole` enforce
   the fine rules:
   - HR cannot manage a superadmin.
   - Only `manage_roles` can assign `superadmin`.
   - Nobody can delete themselves from the admin UI.
   - The last superadmin cannot be deleted or demoted.
   - The `superadmin` role is immutable.
   - The default `user` role cannot be renamed or deleted.
4. **Navigation** — `filterNavItems` hides links the user cannot use. This is
   a UX layer, not the security boundary.

## Adding a role or permission

1. Add the permission key and label to `src/lib/rbac/permissions.ts`.
2. Add the role or adjust the permission set in `src/lib/rbac/roles.ts`.
3. Update the seed and run `npm run db:seed`.
4. Add the key to both message catalogues under `permissions.*`.
5. Gate the page with `requirePermission` and the actions with
   `permissionActionClient`.
6. Add a unit test in `tests/unit/rbac.test.ts`.
