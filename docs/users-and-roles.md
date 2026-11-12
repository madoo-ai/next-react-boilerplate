# Users and roles

## Users

The Users page is at `/admin/users` and requires `manage_users`.

### List

- Search matches name or email (case-insensitive).
- Filter by role and status.
- Server-side pagination, ten rows per page.
- The registration approval switch sits above the table.
- Each row shows name/email, role, status, creation date and actions.
- Pending users have a Verify action. Active and suspended users do not.

### Create

`/admin/users/create` renders the shared user form. Fields:

- name, email, phone, job title, department
- role (only roles the actor may assign)
- status (`active`, `pending`, `suspended`)
- password (required, 8–128 characters)

The action hashes the password with Better Auth's password hasher, creates the
user and the credential account in one Prisma transaction, and revalidates the
list and dashboard.

### Edit

`/admin/users/[id]/edit` reuses the form. The password field is optional; an
empty value keeps the current password. Changing the email marks it
unverified. Changing the status away from `active` deletes the user's sessions,
so the next request needs a fresh login.

### Delete

Deletion is confirmed with an `AlertDialog`. The action refuses to delete:

- yourself,
- another superadmin when you are not a superadmin,
- the last superadmin.

Deleting a user cascades sessions, accounts and 2FA records.

### Protection rules

| Rule                                                          | Where                                     |
| ------------------------------------------------------------- | ----------------------------------------- |
| HR can manage users but not roles                             | `canAssignRole`, `permissionActionClient` |
| HR cannot edit or delete a superadmin                         | `canManageUser`                           |
| Only `manage_roles` can assign `superadmin`                   | `canAssignRole`                           |
| You cannot delete yourself                                    | `canDeleteUser`                           |
| The last superadmin cannot be deleted                         | `canDeleteUser` + superadmin count        |
| You cannot change your own role or status from the admin form | `updateUserAction`                        |

## Roles

The Roles page is at `/admin/roles` and requires `manage_roles`.

### List

- Name, label, description, assigned permissions and user count.
- The `superadmin` row shows a Protected badge and has no actions.
- Edit opens a dialog with the label, description and permission checkboxes.
- Delete is disabled when the role is `superadmin`, the default `user` role, or
  assigned to at least one user.

### Create

The create dialog validates:

- name: lowercase letters, numbers and underscores, 2–60 characters
- label: required, up to 80 characters
- description: optional, up to 240 characters
- permissions: any subset of the permission registry

Role names are unique. Permissions are resolved by key before the join rows are
created.

### Edit

- The superadmin role cannot be edited.
- The default `user` role can change its label, description and permissions,
  but not its name.
- Renaming another role is allowed if the new name is unique.
- Permission rows are replaced in a transaction.

### Delete

- The superadmin role is immutable.
- The default `user` role cannot be deleted.
- A role assigned to users cannot be deleted.
- A custom role with no users can be deleted; its permission join rows cascade.

## Adding a user or role programmatically

Use `src/lib/users/actions.ts` and `src/lib/roles/actions.ts` from the UI. If a
new module needs the same behavior, call the same schemas and policies instead
of writing a second authorization path.
