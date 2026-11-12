import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";

import { AuthCard } from "@/components/auth/auth-card";
import { RegisterForm } from "@/components/auth/register-form";
import { getSession } from "@/lib/auth/session";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("auth.register");
  return { title: t("title") };
}

export default async function RegisterPage() {
  const session = await getSession();

  if (session) {
    redirect("/");
  }

  const t = await getTranslations("auth.register");

  return (
    <AuthCard
      title={t("title")}
      description={t("description")}
      footer={
        <p className="text-center">
          {t("hasAccount")}{" "}
          <Link
            href="/login"
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            {t("login")}
          </Link>
        </p>
      }
    >
      <RegisterForm />
    </AuthCard>
  );
}
