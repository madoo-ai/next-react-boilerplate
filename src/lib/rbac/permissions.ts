export const PERMISSIONS = {
  VIEW_ADMIN: "view_admin",
  MANAGE_USERS: "manage_users",
  MANAGE_ROLES: "manage_roles",
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

export const PERMISSION_LABELS: Record<Permission, string> = {
  [PERMISSIONS.VIEW_ADMIN]: "Access the admin area",
  [PERMISSIONS.MANAGE_USERS]: "Create, edit, verify and delete users",
  [PERMISSIONS.MANAGE_ROLES]: "Create, edit and delete roles",
};

export const ALL_PERMISSIONS = Object.values(PERMISSIONS);

export function isPermission(value: string): value is Permission {
  return ALL_PERMISSIONS.includes(value as Permission);
}
