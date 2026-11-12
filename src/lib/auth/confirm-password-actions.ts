"use server";

import { headers } from "next/headers";

import { auth } from "@/lib/auth/auth";
import { setPasswordConfirmed } from "@/lib/auth/confirm-password";
import { getSession } from "@/lib/auth/session";

function safeNextPath(next: string | undefined) {
  if (!next) return "/settings/profile";
  if (!next.startsWith("/") || next.startsWith("//")) {
    return "/settings/profile";
  }
  return next;
}

export async function confirmPasswordAction(
  password: string,
  next?: string,
): Promise<
  | { ok: true; next: string }
  | { ok: false; error: "errors.unauthorized" | "errors.incorrectPassword" }
> {
  const session = await getSession();

  if (!session) {
    return { ok: false, error: "errors.unauthorized" };
  }

  try {
    const result = await auth.api.verifyPassword({
      body: { password },
      headers: await headers(),
    });

    if (!result.status) {
      return { ok: false, error: "errors.incorrectPassword" };
    }
  } catch {
    return { ok: false, error: "errors.incorrectPassword" };
  }

  await setPasswordConfirmed();

  return { ok: true, next: safeNextPath(next) };
}
