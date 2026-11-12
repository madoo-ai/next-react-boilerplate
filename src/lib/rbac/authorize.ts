import type { Permission } from "./permissions";
import { ROLES, type RoleName } from "./roles";

export type Actor = {
  id: string;
  role: { name: string } | null;
  permissions: string[];
};

export type TargetUser = {
  id: string;
  role: { name: string } | null;
};

export function can(
  actor: Pick<Actor, "permissions">,
  permission: Permission,
): boolean {
  return actor.permissions.includes(permission);
}

export function canAny(
  actor: Pick<Actor, "permissions">,
  permissions: Permission[],
): boolean {
  return permissions.some((permission) => can(actor, permission));
}

export function hasRole(
  actor: Pick<Actor, "role">,
  role: RoleName | RoleName[],
): boolean {
  if (!actor.role) return false;
  const roles = Array.isArray(role) ? role : [role];
  return roles.includes(actor.role.name as RoleName);
}

export function isSuperadmin(actor: Pick<Actor, "role">): boolean {
  return actor.role?.name === ROLES.SUPERADMIN;
}

/**
 * HR can manage regular users, but only a superadmin can touch another
 * superadmin. Nobody can manage a superadmin without the role permission.
 */
export function canManageUser(actor: Actor, target: TargetUser): boolean {
  if (!can(actor, "manage_users")) return false;
  if (target.role?.name === ROLES.SUPERADMIN && !isSuperadmin(actor)) {
    return false;
  }
  return true;
}

export function canDeleteUser(
  actor: Actor,
  target: TargetUser,
  superadminCount: number,
): boolean {
  if (!canManageUser(actor, target)) return false;
  if (actor.id === target.id) return false;
  if (target.role?.name === ROLES.SUPERADMIN && superadminCount <= 1) {
    return false;
  }
  return true;
}

/**
 * Only actors with manage_roles may assign the superadmin role. This is the
 * validation-level guard that prevents privilege escalation.
 */
export function canAssignRole(actor: Actor, role: string): boolean {
  if (role === ROLES.SUPERADMIN) {
    return can(actor, "manage_roles");
  }
  return can(actor, "manage_users");
}

export function canManageRole(actor: Actor, roleName: string): boolean {
  if (!can(actor, "manage_roles")) return false;
  return roleName !== ROLES.SUPERADMIN;
}
