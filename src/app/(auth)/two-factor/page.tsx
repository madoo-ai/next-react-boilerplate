import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations } from "next-intl/server";

import { AuthCard } from "@/components/auth/auth-card";
import { TwoFactorForm } from "@/components/auth/two-factor-form";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("auth.twoFactor");
  return { title: t("title") };
}

export default async function TwoFactorPage() {
  const t = await getTranslations("auth.twoFactor");

  return (
    <AuthCard
      title={t("title")}
      description={t("description")}
      footer={
        <Link
          href="/login"
          className="text-center font-medium text-primary underline-offset-4 hover:underline"
        >
          {t("backToLogin")}
        </Link>
      }
    >
      <TwoFactorForm />
    </AuthCard>
  );
}
