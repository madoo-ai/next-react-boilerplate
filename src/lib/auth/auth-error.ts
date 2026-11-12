type AuthError =
  | {
      code?: string;
      message?: string;
    }
  | null
  | undefined;

export function authErrorMessage(
  error: AuthError,
  t: (key: string) => string,
): string | null {
  if (!error) return null;

  const code = error.code ?? "";
  const message = error.message ?? "";
  const normalized = `${code} ${message}`.toLowerCase();

  if (
    normalized.includes("pending") ||
    normalized.includes("account_pending")
  ) {
    return t("auth.messages.pendingApproval");
  }

  if (
    normalized.includes("suspended") ||
    normalized.includes("account_suspended")
  ) {
    return t("auth.messages.suspended");
  }

  if (
    normalized.includes("invalid_email_or_password") ||
    normalized.includes("invalid email or password") ||
    normalized.includes("invalid password")
  ) {
    return t("auth.messages.invalidCredentials");
  }

  if (
    normalized.includes("email_not_verified") ||
    normalized.includes("verify your email")
  ) {
    return t("auth.messages.emailNotVerified");
  }

  return message || t("errors.unexpected");
}
