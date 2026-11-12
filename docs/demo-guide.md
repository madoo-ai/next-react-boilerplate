# Demo guide

## Accounts

All demo accounts use the password `password`.

| Role       | Email                    | What to look at                         |
| ---------- | ------------------------ | --------------------------------------- |
| superadmin | `superadmin@example.com` | Everything, including Roles             |
| hr         | `hr@example.com`         | Users, approval switch, no Roles        |
| user       | `user@example.com`       | Personal dashboard, settings            |
| pending    | `nabila@example.com`     | Blocked login with an approval message  |
| suspended  | `hendra@example.com`     | Blocked login with a suspension message |

## Script

1. **Open the landing page.** Click "Buka demo", sign in as superadmin and
   continue to `/dashboard`. The dashboard shows totals, role distribution,
   30-day user growth and recent users.
2. **Open Users.** Search for `Andi`, filter by status `pending`, then clear the
   filters. The table is server-rendered and paginated.
3. **Create a user.** Use the Create user button, fill the profile, pick a role
   and status, set a password and submit. The new user appears at the top.
4. **Edit the user.** Change the name or department and save. The list
   refreshes from the server.
5. **Delete the user.** Use the row menu, confirm the destructive dialog and
   verify the row disappears.
6. **Open Roles.** Create a role with `view_admin`, edit its label, then delete
   it. Try to edit the superadmin row: it is protected.
7. **Toggle registration approval.** On Users, turn on "Require approval".
   Sign out and register a new account. The account is created as pending and
   login is blocked. Sign back in as superadmin, verify the account, then sign
   in as the new user.
8. **Open Settings.** Update the profile, switch to English, try an OpenCode
   color theme (or use the live palette strip on the landing page), switch to
   dark mode, then open Security and enable 2FA. Scan the QR code with an
   authenticator app, verify a code, sign out and sign back in to see the
   challenge page.
9. **Try a forbidden route.** Sign in as the regular user and open
   `/admin/users` directly. The page guard redirects to `/403`.
10. **Delete an account.** On the Profile danger zone, confirm the password and
    delete the account. The session ends and login shows the deletion notice.

## Notes

- Verification and reset emails go to Mailpit at `http://localhost:8025` when
  the Compose stack is running. Without SMTP, the link is logged by the app.
- The approval setting is global. The E2E suite resets it after its test.
- The seed is idempotent. `npm run db:seed` does not delete existing users or
  custom roles.
