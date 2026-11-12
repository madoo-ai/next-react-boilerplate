import "server-only";

import { createSafeActionClient } from "next-safe-action";

import { getSession } from "@/lib/auth/session";
import { can } from "@/lib/rbac/authorize";
import type { Permission } from "@/lib/rbac/permissions";

export class ActionError extends Error {
  constructor(public code: string) {
    super(code);
    this.name = "ActionError";
  }
}

export const actionClient = createSafeActionClient({
  handleServerError(error) {
    if (error instanceof ActionError) {
      return error.code;
    }

    console.error(error);
    return "errors.unexpected";
  },
});

export const authActionClient = actionClient.use(async ({ next }) => {
  const session = await getSession();

  if (!session) {
    throw new ActionError("errors.unauthorized");
  }

  if (session.user.status !== "active") {
    throw new ActionError("errors.accountInactive");
  }

  return next({ ctx: { session } });
});

export function permissionActionClient(permission: Permission) {
  return authActionClient.use(async ({ next, ctx }) => {
    if (!can(ctx.session.user, permission)) {
      throw new ActionError("errors.forbidden");
    }

    return next({ ctx });
  });
}

export function roleActionClient(role: string) {
  return authActionClient.use(async ({ next, ctx }) => {
    if (ctx.session.user.role?.name !== role) {
      throw new ActionError("errors.forbidden");
    }

    return next({ ctx });
  });
}
