"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  CheckIcon as Check,
  Translate01Icon as Languages,
} from "@x1nx3r/altics-react-icons";
import { useLocale, useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { isLocale, localeLabels, locales, type Locale } from "@/i18n/config";
import { setLocale } from "@/lib/i18n/locale-actions";

export function LocaleSwitcher() {
  const t = useTranslations("preferences");
  const currentLocale = useLocale();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleSelect(locale: Locale) {
    if (locale === currentLocale) return;

    startTransition(async () => {
      await setLocale(locale);
      router.refresh();
    });
  }

  const activeLocale = isLocale(currentLocale)
    ? currentLocale
    : ("id" as const);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="gap-2"
          disabled={isPending}
          aria-label={t("language")}
        >
          <Languages />
          <span className="hidden sm:inline">{localeLabels[activeLocale]}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-40">
        {locales.map((locale) => (
          <DropdownMenuItem key={locale} onSelect={() => handleSelect(locale)}>
            <span className="flex-1">{localeLabels[locale]}</span>
            {activeLocale === locale ? <Check className="size-4" /> : null}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
