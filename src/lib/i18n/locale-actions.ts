"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

import { isLocale, localeCookieName } from "@/i18n/config";

export async function setLocale(locale: string) {
  if (!isLocale(locale)) {
    return { ok: false as const };
  }

  const cookieStore = await cookies();
  cookieStore.set(localeCookieName, locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });

  revalidatePath("/", "layout");

  return { ok: true as const };
}
