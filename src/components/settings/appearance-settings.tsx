"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Monitor, Moon, Sun } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import { useTheme } from "@/components/providers/theme-provider";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { isLocale, localeLabels, locales, type Locale } from "@/i18n/config";
import { setLocale } from "@/lib/i18n/locale-actions";
import type { Theme } from "@/lib/theme/theme";

export function AppearanceSettings() {
  const t = useTranslations("settings.appearance");
  const currentLocale = useLocale();
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const activeLocale = isLocale(currentLocale) ? currentLocale : "id";

  function handleLocale(locale: Locale) {
    if (locale === activeLocale) return;

    startTransition(async () => {
      await setLocale(locale);
      router.refresh();
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
        <CardDescription>{t("description")}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium">{t("theme")}</span>
          <ToggleGroup
            type="single"
            variant="outline"
            value={theme}
            onValueChange={(value) => {
              if (value) setTheme(value as Theme);
            }}
            className="w-fit"
          >
            <ToggleGroupItem value="light" aria-label={t("light")}>
              <Sun />
              <span className="hidden sm:inline">{t("light")}</span>
            </ToggleGroupItem>
            <ToggleGroupItem value="dark" aria-label={t("dark")}>
              <Moon />
              <span className="hidden sm:inline">{t("dark")}</span>
            </ToggleGroupItem>
            <ToggleGroupItem value="system" aria-label={t("system")}>
              <Monitor />
              <span className="hidden sm:inline">{t("system")}</span>
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
        <div className="flex max-w-sm flex-col gap-2">
          <span className="text-sm font-medium">{t("language")}</span>
          <Select
            value={activeLocale}
            onValueChange={(value) => handleLocale(value as Locale)}
            disabled={isPending}
          >
            <SelectTrigger aria-label={t("language")}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {locales.map((locale) => (
                  <SelectItem key={locale} value={locale}>
                    {localeLabels[locale]}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}
