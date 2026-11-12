"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

import { prisma } from "@/lib/db/prisma";
import { auth } from "@/lib/auth/auth";
import { hasRecentPasswordConfirmation } from "@/lib/auth/confirm-password";
import { ActionError, authActionClient } from "@/lib/safe-action";
import { ROLES } from "@/lib/rbac/roles";
import { profileSchema } from "./schema";

function emptyToNull(value: string | undefined) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

export const updateProfileAction = authActionClient
  .inputSchema(profileSchema)
  .action(async ({ parsedInput, ctx }) => {
    const email = parsedInput.email.trim().toLowerCase();
    const currentEmail = ctx.session.user.email;

    if (email !== currentEmail) {
      const existing = await prisma.user.findUnique({
        where: { email },
        select: { id: true },
      });

      if (existing && existing.id !== ctx.session.user.id) {
        throw new ActionError("errors.emailInUse");
      }
    }

    await prisma.user.update({
      where: { id: ctx.session.user.id },
      data: {
        name: parsedInput.name,
        email,
        emailVerified:
          email === currentEmail ? ctx.session.user.emailVerified : false,
        phoneNumber: emptyToNull(parsedInput.phone),
        jobTitle: emptyToNull(parsedInput.jobTitle),
        department: emptyToNull(parsedInput.department),
      },
    });

    if (email !== currentEmail) {
      try {
        await auth.api.sendVerificationEmail({
          body: {
            email,
            callbackURL: "/verify-email",
          },
          headers: await headers(),
        });
      } catch (error) {
        console.error("Could not send verification email", error);
      }
    }

    revalidatePath("/settings/profile");
    revalidatePath("/", "layout");

    return { ok: true };
  });

export const deleteAccountAction = authActionClient.action(async ({ ctx }) => {
  const confirmed = await hasRecentPasswordConfirmation();

  if (!confirmed) {
    throw new ActionError("errors.confirmPasswordRequired");
  }

  const user = await prisma.user.findUnique({
    where: { id: ctx.session.user.id },
    select: {
      id: true,
      role: { select: { name: true } },
    },
  });

  if (!user) {
    throw new ActionError("errors.userNotFound");
  }

  if (user.role?.name === ROLES.SUPERADMIN) {
    const superadminCount = await prisma.user.count({
      where: { role: { name: ROLES.SUPERADMIN } },
    });

    if (superadminCount <= 1) {
      throw new ActionError("errors.lastSuperadmin");
    }
  }

  await prisma.user.delete({ where: { id: user.id } });
  revalidatePath("/");

  return { ok: true };
});
