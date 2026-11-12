"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { cn } from "cn";
import { Check, Monitor, Moon, Sun } from "lucide-react";
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
import { COLOR_THEME_OPTIONS } from "@/lib/theme/theme-options";
import type { Theme } from "@/lib/theme/theme";

export function AppearanceSettings() {
  const t = useTranslations("settings.appearance");
  const currentLocale = useLocale();
  const { theme, colorTheme, setTheme, setColorTheme } = useTheme();
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
        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium">{t("colorTheme")}</span>
          <p className="text-sm text-muted-foreground">
            {t("colorThemeDescription")}
          </p>
          <div className="grid max-h-[28rem] gap-2 overflow-y-auto pr-1 sm:grid-cols-2 xl:grid-cols-3">
            {COLOR_THEME_OPTIONS.map((option) => {
              const selected = colorTheme === option.id;

              return (
                <button
                  key={option.id}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => setColorTheme(option.id)}
                  className={cn(
                    "flex items-center gap-3 rounded-lg border p-2.5 text-left transition-colors",
                    selected
                      ? "border-primary bg-primary/5"
                      : "hover:bg-muted/50",
                  )}
                >
                  <span className="flex shrink-0 overflow-hidden rounded-md border">
                    {[
                      option.light.neutral,
                      option.light.primary,
                      option.dark.neutral,
                      option.dark.primary,
                    ].map((color, index) => (
                      <span
                        key={`${option.id}-${index}`}
                        className="size-6"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </span>
                  <span className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate text-sm font-medium">
                      {option.name}
                    </span>
                    <span className="truncate text-xs text-muted-foreground">
                      {option.id}
                    </span>
                  </span>
                  {selected ? (
                    <Check className="size-4 shrink-0 text-primary" />
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
