"use server";

import { revalidatePath } from "next/cache";
import { hashPassword } from "better-auth/crypto";
import { ulid } from "ulid";

import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/db/prisma";
import {
  canAssignRole,
  canDeleteUser,
  canManageUser,
  type Actor,
} from "@/lib/rbac/authorize";
import { permissionActionClient, ActionError } from "@/lib/safe-action";
import { ROLES } from "@/lib/rbac/roles";
import {
  createUserSchema,
  registrationApprovalSchema,
  updateUserSchema,
  userIdSchema,
} from "./schema";

function actorFromSession(session: {
  user: {
    id: string;
    role: { name: string } | null;
    permissions: string[];
  };
}): Actor {
  return {
    id: session.user.id,
    role: session.user.role ? { name: session.user.role.name } : null,
    permissions: session.user.permissions,
  };
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function emptyToNull(value: string | undefined) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

async function ensureEmailAvailable(email: string, excludeId?: string) {
  const existing = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });

  if (existing && existing.id !== excludeId) {
    throw new ActionError("errors.emailInUse");
  }
}

async function getAssignableRole(actor: Actor, roleName: string) {
  const role = await prisma.role.findUnique({
    where: { name: roleName },
  });

  if (!role) {
    throw new ActionError("errors.roleNotFound");
  }

  if (!canAssignRole(actor, role.name)) {
    throw new ActionError("errors.forbidden");
  }

  return role;
}

async function setCredentialPassword(
  client: Prisma.TransactionClient,
  userId: string,
  password: string,
) {
  const passwordHash = await hashPassword(password);
  const account = await client.account.findFirst({
    where: { userId, providerId: "credential" },
    select: { id: true },
  });

  if (account) {
    await client.account.update({
      where: { id: account.id },
      data: { password: passwordHash },
    });
    return;
  }

  await client.account.create({
    data: {
      id: ulid(),
      userId,
      accountId: userId,
      providerId: "credential",
      password: passwordHash,
    },
  });
}

export const createUserAction = permissionActionClient("manage_users")
  .inputSchema(createUserSchema)
  .action(async ({ parsedInput, ctx }) => {
    const actor = actorFromSession(ctx.session);
    const role = await getAssignableRole(actor, parsedInput.role);
    const email = normalizeEmail(parsedInput.email);

    await ensureEmailAvailable(email);

    const userId = ulid();
    const passwordHash = await hashPassword(parsedInput.password);

    await prisma.user.create({
      data: {
        id: userId,
        name: parsedInput.name,
        email,
        emailVerified: false,
        status: parsedInput.status,
        roleId: role.id,
        phoneNumber: emptyToNull(parsedInput.phone),
        jobTitle: emptyToNull(parsedInput.jobTitle),
        department: emptyToNull(parsedInput.department),
        accounts: {
          create: {
            id: ulid(),
            accountId: userId,
            providerId: "credential",
            password: passwordHash,
          },
        },
      },
    });

    revalidatePath("/admin/users");
    revalidatePath("/");

    return { ok: true };
  });

export const updateUserAction = permissionActionClient("manage_users")
  .inputSchema(updateUserSchema)
  .action(async ({ parsedInput, ctx }) => {
    const actor = actorFromSession(ctx.session);
    const target = await prisma.user.findUnique({
      where: { id: parsedInput.id },
      include: { role: true },
    });

    if (!target) {
      throw new ActionError("errors.userNotFound");
    }

    if (!canManageUser(actor, target)) {
      throw new ActionError("errors.forbidden");
    }

    const role = await getAssignableRole(actor, parsedInput.role);
    const isSelf = target.id === actor.id;

    if (
      isSelf &&
      (role.name !== target.role?.name || parsedInput.status !== target.status)
    ) {
      throw new ActionError("errors.protectedUser");
    }

    if (
      target.role?.name === ROLES.SUPERADMIN &&
      role.name !== ROLES.SUPERADMIN
    ) {
      const superadminCount = await prisma.user.count({
        where: { role: { name: ROLES.SUPERADMIN } },
      });

      if (superadminCount <= 1) {
        throw new ActionError("errors.lastSuperadmin");
      }
    }

    const email = normalizeEmail(parsedInput.email);
    await ensureEmailAvailable(email, target.id);

    const emailChanged = email !== target.email;

    await prisma.$transaction(async (transaction) => {
      await transaction.user.update({
        where: { id: target.id },
        data: {
          name: parsedInput.name,
          email,
          emailVerified: emailChanged ? false : target.emailVerified,
          status: parsedInput.status,
          roleId: role.id,
          phoneNumber: emptyToNull(parsedInput.phone),
          jobTitle: emptyToNull(parsedInput.jobTitle),
          department: emptyToNull(parsedInput.department),
        },
      });

      if (parsedInput.password) {
        await setCredentialPassword(
          transaction,
          target.id,
          parsedInput.password,
        );
      }

      if (parsedInput.status !== "active") {
        await transaction.session.deleteMany({
          where: { userId: target.id },
        });
      }
    });

    revalidatePath("/admin/users");
    revalidatePath(`/admin/users/${target.id}/edit`);
    revalidatePath("/", "layout");

    return { ok: true };
  });

export const deleteUserAction = permissionActionClient("manage_users")
  .inputSchema(userIdSchema)
  .action(async ({ parsedInput, ctx }) => {
    const actor = actorFromSession(ctx.session);
    const target = await prisma.user.findUnique({
      where: { id: parsedInput.id },
      include: { role: true },
    });

    if (!target) {
      throw new ActionError("errors.userNotFound");
    }

    const superadminCount = await prisma.user.count({
      where: { role: { name: ROLES.SUPERADMIN } },
    });

    if (!canDeleteUser(actor, target, superadminCount)) {
      throw new ActionError(
        actor.id === target.id
          ? "errors.cannotDeleteSelf"
          : target.role?.name === ROLES.SUPERADMIN
            ? "errors.lastSuperadmin"
            : "errors.forbidden",
      );
    }

    await prisma.user.delete({ where: { id: target.id } });
    revalidatePath("/admin/users");
    revalidatePath("/");

    return { ok: true };
  });

export const verifyUserAction = permissionActionClient("manage_users")
  .inputSchema(userIdSchema)
  .action(async ({ parsedInput, ctx }) => {
    const actor = actorFromSession(ctx.session);
    const target = await prisma.user.findUnique({
      where: { id: parsedInput.id },
      select: {
        id: true,
        status: true,
        role: { select: { name: true } },
      },
    });

    if (!target) {
      throw new ActionError("errors.userNotFound");
    }

    if (!canManageUser(actor, target)) {
      throw new ActionError("errors.forbidden");
    }

    if (target.status === "pending") {
      await prisma.user.update({
        where: { id: target.id },
        data: { status: "active" },
      });
    }

    revalidatePath("/admin/users");
    revalidatePath("/");

    return { ok: true };
  });

export const setRegistrationApprovalAction = permissionActionClient(
  "manage_users",
)
  .inputSchema(registrationApprovalSchema)
  .action(async ({ parsedInput }) => {
    await prisma.setting.upsert({
      where: { key: "registration_approval" },
      update: { value: String(parsedInput.enabled) },
      create: {
        id: ulid(),
        key: "registration_approval",
        value: String(parsedInput.enabled),
      },
    });

    revalidatePath("/admin/users");

    return { ok: true };
  });
