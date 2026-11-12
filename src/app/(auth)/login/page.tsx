import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";

import { AuthCard } from "@/components/auth/auth-card";
import { LoginForm } from "@/components/auth/login-form";
import { getSession } from "@/lib/auth/session";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("auth.login");
  return { title: t("title") };
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{
    next?: string;
    error?: string;
    reset?: string;
    deleted?: string;
  }>;
}) {
  const session = await getSession();

  if (session) {
    redirect("/");
  }

  const [params, t, tAll] = await Promise.all([
    searchParams,
    getTranslations("auth.login"),
    getTranslations("auth.messages"),
  ]);

  return (
    <AuthCard
      title={t("title")}
      description={t("description")}
      footer={
        <p className="text-center">
          {t("noAccount")}{" "}
          <Link
            href="/register"
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            {t("register")}
          </Link>
        </p>
      }
    >
      <LoginForm
        next={params.next}
        initialError={params.error}
        notice={
          params.deleted
            ? tAll("accountDeleted")
            : params.reset
              ? tAll("passwordReset")
              : undefined
        }
      />
    </AuthCard>
  );
}
