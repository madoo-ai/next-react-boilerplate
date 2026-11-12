import "server-only";

import { cache } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/prisma";
import type { Permission } from "@/lib/rbac/permissions";
import type { RoleName } from "@/lib/rbac/roles";

export type CurrentUser = {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image: string | null;
  status: "pending" | "active" | "suspended";
  phoneNumber: string | null;
  jobTitle: string | null;
  department: string | null;
  twoFactorEnabled: boolean;
  role: {
    id: string;
    name: string;
    label: string;
    isSystem: boolean;
  } | null;
  permissions: Permission[];
};

export type CurrentSession = {
  session: {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    expiresAt: Date;
    ipAddress: string | null;
    userAgent: string | null;
  };
  user: CurrentUser;
};

export const getSession = cache(async (): Promise<CurrentSession | null> => {
  const authSession = await auth.api.getSession({
    headers: await headers(),
  });

  if (!authSession) return null;

  const user = await prisma.user.findUnique({
    where: { id: authSession.user.id },
    include: {
      role: {
        include: {
          permissions: {
            include: { permission: true },
          },
        },
      },
    },
  });

  if (!user) return null;

  return {
    session: {
      id: authSession.session.id,
      createdAt: authSession.session.createdAt,
      updatedAt: authSession.session.updatedAt,
      expiresAt: authSession.session.expiresAt,
      ipAddress: authSession.session.ipAddress ?? null,
      userAgent: authSession.session.userAgent ?? null,
    },
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      emailVerified: user.emailVerified,
      image: user.image,
      status: user.status,
      phoneNumber: user.phoneNumber,
      jobTitle: user.jobTitle,
      department: user.department,
      twoFactorEnabled: user.twoFactorEnabled,
      role: user.role
        ? {
            id: user.role.id,
            name: user.role.name,
            label: user.role.label,
            isSystem: user.role.isSystem,
          }
        : null,
      permissions: (user.role?.permissions ?? []).map(
        ({ permission }) => permission.key as Permission,
      ),
    },
  };
});

export async function requireSession(): Promise<CurrentSession> {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  if (session.user.status !== "active") {
    redirect("/login?error=account_inactive");
  }

  return session;
}

export async function requirePermission(
  permission: Permission,
): Promise<CurrentSession> {
  const session = await requireSession();

  if (!session.user.permissions.includes(permission)) {
    redirect("/403");
  }

  return session;
}

export async function requireRole(role: RoleName): Promise<CurrentSession> {
  const session = await requireSession();

  if (session.user.role?.name !== role) {
    redirect("/403");
  }

  return session;
}
