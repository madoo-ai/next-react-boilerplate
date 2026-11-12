import "server-only";

import { prisma } from "@/lib/db/prisma";

export async function getRolesWithPermissions() {
  return prisma.role.findMany({
    orderBy: { name: "asc" },
    include: {
      permissions: {
        include: { permission: true },
      },
      _count: {
        select: { users: true },
      },
    },
  });
}

export async function getPermissions() {
  return prisma.permission.findMany({
    orderBy: { key: "asc" },
  });
}
