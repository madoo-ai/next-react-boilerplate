import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations } from "next-intl/server";

import { AuthCard } from "@/components/auth/auth-card";
import { FormAlert } from "@/components/auth/form-alert";
import { Button } from "@/components/ui/button";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("auth.verify");
  return { title: t("title") };
}

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ verified?: string; error?: string }>;
}) {
  const [params, t] = await Promise.all([
    searchParams,
    getTranslations("auth.verify"),
  ]);

  const failed = !!params.error || params.verified === "false";
  const succeeded = params.verified === "true" && !failed;

  return (
    <AuthCard
      title={t("title")}
      description={succeeded ? undefined : t("description")}
      footer={
        <Button asChild variant="outline" className="w-full">
          <Link href="/login">{t("back")}</Link>
        </Button>
      }
    >
      <div className="flex flex-col gap-4">
        {failed ? (
          <FormAlert message={t("error")} />
        ) : succeeded ? (
          <FormAlert message={t("success")} variant="default" />
        ) : (
          <FormAlert message={t("description")} variant="default" />
        )}
      </div>
    </AuthCard>
  );
}
