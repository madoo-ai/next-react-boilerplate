import Link from "next/link";
import { getTranslations } from "next-intl/server";

import { Button } from "@/components/ui/button";

export default async function NotFound() {
  const [t, tCommon] = await Promise.all([
    getTranslations("errorPages.notFound"),
    getTranslations("common"),
  ]);

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-4 p-6 text-center">
      <p className="text-sm font-medium text-primary">404</p>
      <h1 className="text-2xl font-light tracking-tight">{t("title")}</h1>
      <p className="max-w-md text-sm text-muted-foreground">
        {t("description")}
      </p>
      <Button asChild>
        <Link href="/">{tCommon("backToDashboard")}</Link>
      </Button>
    </div>
  );
}
