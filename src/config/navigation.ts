import {
  KeyRound,
  LayoutGrid,
  Palette,
  ShieldCheck,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import type { Permission } from "@/lib/rbac/permissions";
import type { RoleName } from "@/lib/rbac/roles";

export type NavTitleKey =
  | "dashboard"
  | "users"
  | "roles"
  | "administration"
  | "profile"
  | "password"
  | "appearance"
  | "security";

export type NavItem = {
  titleKey: NavTitleKey;
  href: string;
  icon: LucideIcon;
  permissions?: Permission[];
  roles?: RoleName[];
  children?: NavItem[];
};

export type NavUser = {
  permissions: Permission[];
  role: string | null;
};

export const mainNavItems: NavItem[] = [
  {
    titleKey: "dashboard",
    href: "/",
    icon: LayoutGrid,
  },
];

export const adminNavItems: NavItem[] = [
  {
    titleKey: "users",
    href: "/admin/users",
    icon: Users,
    permissions: ["manage_users"],
  },
  {
    titleKey: "roles",
    href: "/admin/roles",
    icon: KeyRound,
    permissions: ["manage_roles"],
  },
];

export const adminGroup = {
  labelKey: "administration" as const,
  icon: ShieldCheck,
  permissions: ["view_admin"] as Permission[],
};

export function canSeeNavItem(item: NavItem, user: NavUser): boolean {
  if (item.permissions?.length) {
    const hasPermission = item.permissions.some((permission) =>
      user.permissions.includes(permission),
    );
    if (!hasPermission) return false;
  }

  if (item.roles?.length) {
    if (!user.role || !item.roles.includes(user.role as RoleName)) {
      return false;
    }
  }

  return true;
}

export function filterNavItems(items: NavItem[], user: NavUser): NavItem[] {
  return items
    .filter((item) => canSeeNavItem(item, user))
    .map((item) => ({
      ...item,
      children: item.children ? filterNavItems(item.children, user) : undefined,
    }))
    .filter((item) => !item.children || item.children.length > 0);
}

export function shouldShowAdminGroup(user: NavUser): boolean {
  const hasGroupPermission = adminGroup.permissions.some((permission) =>
    user.permissions.includes(permission),
  );

  return hasGroupPermission && filterNavItems(adminNavItems, user).length > 0;
}

export const settingsNavItems: NavItem[] = [
  {
    titleKey: "profile",
    href: "/settings/profile",
    icon: Users,
  },
  {
    titleKey: "password",
    href: "/settings/password",
    icon: KeyRound,
  },
  {
    titleKey: "appearance",
    href: "/settings/appearance",
    icon: Palette,
  },
  {
    titleKey: "security",
    href: "/settings/security",
    icon: ShieldCheck,
  },
];
