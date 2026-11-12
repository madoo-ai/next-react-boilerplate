import "server-only";

import { cookies } from "next/headers";

const CONFIRM_PASSWORD_COOKIE = "pwd_confirmed";
const CONFIRM_PASSWORD_MAX_AGE = 15 * 60;

export async function hasRecentPasswordConfirmation() {
  const cookieStore = await cookies();
  const value = cookieStore.get(CONFIRM_PASSWORD_COOKIE)?.value;

  if (!value) return false;

  const timestamp = Number(value);

  if (!Number.isFinite(timestamp)) return false;

  return Date.now() - timestamp < CONFIRM_PASSWORD_MAX_AGE * 1000;
}

export async function setPasswordConfirmed() {
  const cookieStore = await cookies();
  cookieStore.set(CONFIRM_PASSWORD_COOKIE, String(Date.now()), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: CONFIRM_PASSWORD_MAX_AGE,
    secure: process.env.NODE_ENV === "production",
  });
}

export async function clearPasswordConfirmation() {
  const cookieStore = await cookies();
  cookieStore.delete(CONFIRM_PASSWORD_COOKIE);
}
