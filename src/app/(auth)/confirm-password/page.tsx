import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { AuthCard } from "@/components/auth/auth-card";
import { ConfirmPasswordForm } from "@/components/auth/confirm-password-form";
import { requireSession } from "@/lib/auth/session";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("auth.confirmPassword");
  return { title: t("title") };
}

export default async function ConfirmPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const [params, t] = await Promise.all([
    searchParams,
    getTranslations("auth.confirmPassword"),
  ]);

  await requireSession();

  return (
    <AuthCard title={t("title")} description={t("description")}>
      <ConfirmPasswordForm next={params.next} />
    </AuthCard>
  );
}
