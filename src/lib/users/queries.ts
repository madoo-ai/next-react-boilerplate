import "server-only";

import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/db/prisma";
import { canAssignRole, canManageUser, type Actor } from "@/lib/rbac/authorize";
import { USERS_PAGE_SIZE, type UserFilters } from "./schema";

export async function getUsersPage(filters: UserFilters) {
  const where: Prisma.UserWhereInput = {};

  if (filters.search) {
    where.OR = [
      { name: { contains: filters.search, mode: "insensitive" } },
      { email: { contains: filters.search, mode: "insensitive" } },
    ];
  }

  if (filters.role) {
    where.role = { name: filters.role };
  }

  if (filters.status) {
    where.status = filters.status;
  }

  const total = await prisma.user.count({ where });
  const pageCount = Math.max(1, Math.ceil(total / USERS_PAGE_SIZE));
  const page = Math.min(filters.page, pageCount);

  const users = await prisma.user.findMany({
    where,
    include: { role: true },
    orderBy: { createdAt: "desc" },
    skip: (page - 1) * USERS_PAGE_SIZE,
    take: USERS_PAGE_SIZE,
  });

  return { users, total, page, pageCount };
}

export async function getUserForEdit(id: string) {
  return prisma.user.findUnique({
    where: { id },
    include: { role: true },
  });
}

export async function getAssignableRoles(actor: Actor) {
  const roles = await prisma.role.findMany({
    orderBy: { name: "asc" },
  });

  return roles.filter((role) => canAssignRole(actor, role.name));
}

export async function getAllRoles() {
  return prisma.role.findMany({
    orderBy: { name: "asc" },
  });
}

export async function getSuperadminCount() {
  return prisma.user.count({
    where: { role: { name: "superadmin" } },
  });
}

export async function getRegistrationApproval() {
  const setting = await prisma.setting.findUnique({
    where: { key: "registration_approval" },
    select: { value: true },
  });

  return setting?.value === "true";
}

export function actorCanManageUser(
  actor: Actor,
  target: { id: string; role: { name: string } | null },
) {
  return canManageUser(actor, target);
}
