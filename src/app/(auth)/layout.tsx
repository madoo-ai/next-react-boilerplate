import { getTranslations } from "next-intl/server";

import { AppLogo } from "@/components/app-shell/app-logo";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const t = await getTranslations("auth.brand");

  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-8 p-6 md:p-10">
        <div className="flex justify-center md:justify-start">
          <AppLogo />
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-sm">{children}</div>
        </div>
        <p className="text-center text-xs text-muted-foreground md:text-left">
          {t("stack")}
        </p>
      </div>
      <div className="relative hidden overflow-hidden border-l bg-mesh lg:block">
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-primary/10" />
        <div className="relative flex h-full flex-col justify-end gap-4 p-10">
          <blockquote className="max-w-md text-2xl leading-snug font-light tracking-tight text-brand-ink">
            {t("tagline")}
          </blockquote>
          <p className="text-sm text-muted-foreground">{t("stack")}</p>
        </div>
      </div>
    </div>
  );
}
