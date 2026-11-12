import { describe, expect, it } from "vitest";

import {
  can,
  canAssignRole,
  canDeleteUser,
  canManageUser,
  hasRole,
  isSuperadmin,
} from "@/lib/rbac/authorize";
import { PERMISSIONS, type Permission } from "@/lib/rbac/permissions";
import { ROLE_PERMISSIONS, ROLES } from "@/lib/rbac/roles";

const superadmin = {
  id: "user-superadmin",
  role: { name: ROLES.SUPERADMIN },
  permissions: ROLE_PERMISSIONS[ROLES.SUPERADMIN] as Permission[],
};

const hr = {
  id: "user-hr",
  role: { name: ROLES.HR },
  permissions: ROLE_PERMISSIONS[ROLES.HR] as Permission[],
};

const user = {
  id: "user-regular",
  role: { name: ROLES.USER },
  permissions: ROLE_PERMISSIONS[ROLES.USER] as Permission[],
};

const targetUser = {
  id: "user-target",
  role: { name: ROLES.USER },
};

const targetSuperadmin = {
  id: "user-other-superadmin",
  role: { name: ROLES.SUPERADMIN },
};

describe("RBAC helpers", () => {
  it("checks permissions", () => {
    expect(can(superadmin, PERMISSIONS.MANAGE_ROLES)).toBe(true);
    expect(can(hr, PERMISSIONS.MANAGE_ROLES)).toBe(false);
    expect(can(user, PERMISSIONS.VIEW_ADMIN)).toBe(false);
  });

  it("checks roles", () => {
    expect(hasRole(superadmin, ROLES.SUPERADMIN)).toBe(true);
    expect(hasRole(hr, [ROLES.HR, ROLES.SUPERADMIN])).toBe(true);
    expect(isSuperadmin(user)).toBe(false);
  });

  it("lets HR manage regular users but not superadmins", () => {
    expect(canManageUser(hr, targetUser)).toBe(true);
    expect(canManageUser(hr, targetSuperadmin)).toBe(false);
    expect(canManageUser(superadmin, targetSuperadmin)).toBe(true);
  });

  it("prevents privilege escalation", () => {
    expect(canAssignRole(hr, ROLES.USER)).toBe(true);
    expect(canAssignRole(hr, ROLES.SUPERADMIN)).toBe(false);
    expect(canAssignRole(superadmin, ROLES.SUPERADMIN)).toBe(true);
  });

  it("prevents self deletion and deleting the last superadmin", () => {
    expect(canDeleteUser(superadmin, targetUser, 1)).toBe(true);
    expect(canDeleteUser(superadmin, superadmin, 2)).toBe(false);
    expect(canDeleteUser(superadmin, targetSuperadmin, 1)).toBe(false);
    expect(canDeleteUser(hr, targetUser, 1)).toBe(true);
  });
});
