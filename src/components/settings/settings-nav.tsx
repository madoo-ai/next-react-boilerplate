"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Route } from "next";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";

const items = [
  { href: "/settings/profile", key: "profile" },
  { href: "/settings/password", key: "password" },
  { href: "/settings/appearance", key: "appearance" },
  { href: "/settings/security", key: "security" },
] as const;

export function SettingsNav() {
  const pathname = usePathname();
  const t = useTranslations("nav");

  return (
    <nav className="flex gap-1 overflow-x-auto lg:flex-col">
      {items.map((item) => {
        const active = pathname === item.href;

        return (
          <Button
            key={item.href}
            asChild
            variant={active ? "secondary" : "ghost"}
            className="justify-start whitespace-nowrap"
          >
            <Link href={item.href as Route}>{t(item.key)}</Link>
          </Button>
        );
      })}
    </nav>
  );
}
