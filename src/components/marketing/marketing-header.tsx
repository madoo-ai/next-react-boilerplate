import Link from "next/link";
import type { Route } from "next";
import { getTranslations } from "next-intl/server";

import { AppLogo } from "@/components/app-shell/app-logo";
import { LocaleSwitcher } from "@/components/app-shell/locale-switcher";
import { ThemeToggle } from "@/components/app-shell/theme-toggle";
import { Button } from "@/components/ui/button";

export async function MarketingHeader({
  isAuthenticated,
}: {
  isAuthenticated: boolean;
}) {
  const t = await getTranslations("landing.nav");

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-6">
        <div className="flex items-center gap-8">
          <AppLogo />
          <nav className="hidden items-center gap-6 text-sm text-muted-foreground lg:flex">
            <a
              href="#features"
              className="transition-colors hover:text-foreground"
            >
              {t("features")}
            </a>
            <a
              href="#themes"
              className="transition-colors hover:text-foreground"
            >
              {t("themes")}
            </a>
            <a
              href="#stack"
              className="transition-colors hover:text-foreground"
            >
              {t("stack")}
            </a>
          </nav>
        </div>
        <div className="flex items-center gap-1.5">
          <LocaleSwitcher />
          <ThemeToggle />
          <Button asChild size="sm" className="ml-1">
            <Link href={(isAuthenticated ? "/dashboard" : "/login") as Route}>
              {isAuthenticated ? t("dashboard") : t("signIn")}
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
