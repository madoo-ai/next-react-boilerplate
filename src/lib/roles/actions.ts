"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/db/prisma";
import {
  createRoleSchema,
  deleteRoleSchema,
  updateRoleSchema,
} from "@/lib/roles/schema";
import { isPermission } from "@/lib/rbac/permissions";
import { ROLES } from "@/lib/rbac/roles";
import { ActionError, permissionActionClient } from "@/lib/safe-action";

function validPermissions(permissions: string[]) {
  return permissions.filter(isPermission);
}

async function resolvePermissionIds(permissions: string[]) {
  const keys = validPermissions(permissions);

  if (keys.length === 0) return [];

  const records = await prisma.permission.findMany({
    where: { key: { in: keys } },
    select: { id: true },
  });

  return records.map((record) => record.id);
}

export const createRoleAction = permissionActionClient("manage_roles")
  .inputSchema(createRoleSchema)
  .action(async ({ parsedInput }) => {
    const existing = await prisma.role.findUnique({
      where: { name: parsedInput.name },
      select: { id: true },
    });

    if (existing) {
      throw new ActionError("errors.roleInUse");
    }

    const permissionIds = await resolvePermissionIds(parsedInput.permissions);

    await prisma.$transaction(async (transaction) => {
      const role = await transaction.role.create({
        data: {
          name: parsedInput.name,
          label: parsedInput.label,
          description: parsedInput.description || null,
          isSystem: false,
        },
      });

      if (permissionIds.length > 0) {
        await transaction.rolePermission.createMany({
          data: permissionIds.map((permissionId) => ({
            roleId: role.id,
            permissionId,
          })),
        });
      }
    });

    revalidatePath("/admin/roles");
    revalidatePath("/admin/users");

    return { ok: true };
  });

export const updateRoleAction = permissionActionClient("manage_roles")
  .inputSchema(updateRoleSchema)
  .action(async ({ parsedInput }) => {
    const role = await prisma.role.findUnique({
      where: { id: parsedInput.id },
    });

    if (!role) {
      throw new ActionError("errors.roleNotFound");
    }

    if (role.name === ROLES.SUPERADMIN) {
      throw new ActionError("errors.immutableRole");
    }

    if (role.name === ROLES.USER && parsedInput.name !== ROLES.USER) {
      throw new ActionError("errors.defaultRole");
    }

    const duplicate = await prisma.role.findUnique({
      where: { name: parsedInput.name },
      select: { id: true },
    });

    if (duplicate && duplicate.id !== role.id) {
      throw new ActionError("errors.roleInUse");
    }

    const permissionIds = await resolvePermissionIds(parsedInput.permissions);

    await prisma.$transaction(async (transaction) => {
      await transaction.role.update({
        where: { id: role.id },
        data: {
          name: parsedInput.name,
          label: parsedInput.label,
          description: parsedInput.description || null,
        },
      });

      await transaction.rolePermission.deleteMany({
        where: { roleId: role.id },
      });

      if (permissionIds.length > 0) {
        await transaction.rolePermission.createMany({
          data: permissionIds.map((permissionId) => ({
            roleId: role.id,
            permissionId,
          })),
        });
      }
    });

    revalidatePath("/admin/roles");
    revalidatePath("/admin/users");
    revalidatePath("/", "layout");

    return { ok: true };
  });

export const deleteRoleAction = permissionActionClient("manage_roles")
  .inputSchema(deleteRoleSchema)
  .action(async ({ parsedInput }) => {
    const role = await prisma.role.findUnique({
      where: { id: parsedInput.id },
      include: { _count: { select: { users: true } } },
    });

    if (!role) {
      throw new ActionError("errors.roleNotFound");
    }

    if (role.name === ROLES.SUPERADMIN) {
      throw new ActionError("errors.immutableRole");
    }

    if (role.name === ROLES.USER) {
      throw new ActionError("errors.defaultRole");
    }

    if (role._count.users > 0) {
      throw new ActionError("errors.roleInUse");
    }

    await prisma.role.delete({ where: { id: role.id } });

    revalidatePath("/admin/roles");
    revalidatePath("/admin/users");

    return { ok: true };
  });
