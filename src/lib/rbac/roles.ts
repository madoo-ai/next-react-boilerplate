import { PERMISSIONS, type Permission } from "./permissions";

export const ROLES = {
  SUPERADMIN: "superadmin",
  HR: "hr",
  USER: "user",
} as const;

export type RoleName = (typeof ROLES)[keyof typeof ROLES];

export const ROLE_LABELS: Record<RoleName, string> = {
  [ROLES.SUPERADMIN]: "Super Admin",
  [ROLES.HR]: "HR Staff",
  [ROLES.USER]: "User",
};

export const ROLE_DESCRIPTIONS: Record<RoleName, string> = {
  [ROLES.SUPERADMIN]: "Full access, including role management.",
  [ROLES.HR]: "Can manage users but cannot manage roles.",
  [ROLES.USER]: "Self-service access only.",
};

export const ROLE_PERMISSIONS: Record<RoleName, Permission[]> = {
  [ROLES.SUPERADMIN]: [
    PERMISSIONS.VIEW_ADMIN,
    PERMISSIONS.MANAGE_USERS,
    PERMISSIONS.MANAGE_ROLES,
  ],
  [ROLES.HR]: [PERMISSIONS.VIEW_ADMIN, PERMISSIONS.MANAGE_USERS],
  [ROLES.USER]: [],
};

export const SYSTEM_ROLES = Object.values(ROLES);

export function isSystemRole(name: string): name is RoleName {
  return SYSTEM_ROLES.includes(name as RoleName);
}

export function isRoleName(value: string): value is RoleName {
  return isSystemRole(value);
}
