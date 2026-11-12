import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations } from "next-intl/server";

import { AuthCard } from "@/components/auth/auth-card";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("auth.reset");
  return { title: t("title") };
}

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const [params, t] = await Promise.all([
    searchParams,
    getTranslations("auth.reset"),
  ]);

  return (
    <AuthCard
      title={t("title")}
      description={t("description")}
      footer={
        <Link
          href="/login"
          className="text-center font-medium text-primary underline-offset-4 hover:underline"
        >
          {t("back")}
        </Link>
      }
    >
      <ResetPasswordForm token={params.token} />
    </AuthCard>
  );
}
