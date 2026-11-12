# Routes reference

## Public

| Method | Path                        | Purpose                       |
| ------ | --------------------------- | ----------------------------- |
| GET    | `/login`                    | Sign in                       |
| GET    | `/register`                 | Self-registration             |
| GET    | `/forgot-password`          | Request a reset link          |
| GET    | `/reset-password?token=...` | Choose a new password         |
| GET    | `/verify-email`             | Verification result page      |
| GET    | `/two-factor`               | TOTP or backup-code challenge |
| GET    | `/403`                      | Forbidden page                |
| ANY    | `/api/auth/*`               | Better Auth handler           |
| GET    | `/api/health`               | Database health check         |

The proxy requires a session cookie for every other path. `/confirm-password`
also requires a session, checked by the page itself.

## Authenticated

| Method | Path                         | Access          | Purpose                                                          |
| ------ | ---------------------------- | --------------- | ---------------------------------------------------------------- |
| GET    | `/`                          | any active user | Dashboard (team view with `view_admin`, personal view otherwise) |
| GET    | `/settings`                  | any active user | Redirect to `/settings/profile`                                  |
| GET    | `/settings/profile`          | any active user | Profile form and danger zone                                     |
| GET    | `/settings/password`         | any active user | Change password                                                  |
| GET    | `/settings/appearance`       | any active user | Theme and locale                                                 |
| GET    | `/settings/security`         | any active user | Enable/disable 2FA                                               |
| GET    | `/confirm-password?next=...` | any active user | Recent password confirmation                                     |

## Admin

| Method | Path                     | Access         | Purpose                             |
| ------ | ------------------------ | -------------- | ----------------------------------- |
| GET    | `/admin/users`           | `manage_users` | User list, filters, approval switch |
| GET    | `/admin/users/create`    | `manage_users` | Create user                         |
| GET    | `/admin/users/[id]/edit` | `manage_users` | Edit user                           |
| GET    | `/admin/roles`           | `manage_roles` | Role and permission management      |

## Server actions

Actions are not public routes; Next.js exposes them through the page that
imports them.

| Action                          | Permission                | Purpose                                            |
| ------------------------------- | ------------------------- | -------------------------------------------------- |
| `createUserAction`              | `manage_users`            | Create a user and credential account               |
| `updateUserAction`              | `manage_users`            | Update profile, role, status and optional password |
| `deleteUserAction`              | `manage_users`            | Delete a user                                      |
| `verifyUserAction`              | `manage_users`            | Move a pending user to active                      |
| `setRegistrationApprovalAction` | `manage_users`            | Toggle the approval gate                           |
| `createRoleAction`              | `manage_roles`            | Create a role                                      |
| `updateRoleAction`              | `manage_roles`            | Update a role and its permissions                  |
| `deleteRoleAction`              | `manage_roles`            | Delete an unused custom role                       |
| `updateProfileAction`           | session                   | Update the current user's profile                  |
| `deleteAccountAction`           | session + recent password | Delete the current account                         |
| `setLocale`                     | none                      | Set the locale cookie                              |
| `confirmPasswordAction`         | session                   | Verify the password and set the 15-minute cookie   |

## Proxy behavior

`src/proxy.ts`:

- redirects guests to `/login?next=<path>` for protected paths,
- lets public auth pages and `/403` through,
- never validates the session against the database,
- skips `/api/auth`, `/api/health`, Next.js assets and static files.
