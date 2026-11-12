import "server-only";

import { TZDate } from "@date-fns/tz";
import { format, startOfDay, subDays } from "date-fns";
import { enUS, id as idLocale } from "date-fns/locale";

import { prisma } from "@/lib/db/prisma";

const APP_TIME_ZONE = "Asia/Jakarta";

export async function getDashboardData(locale: "en" | "id" = "id") {
  const now = new TZDate(new Date(), APP_TIME_ZONE);
  const since = startOfDay(subDays(now, 29));
  const dateLocale = locale === "id" ? idLocale : enUS;
  const dayLabelFormat = locale === "id" ? "d MMM" : "MMM d";

  const [
    totalUsers,
    activeUsers,
    pendingUsers,
    roles,
    recentUsers,
    recentSignups,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { status: "active" } }),
    prisma.user.count({ where: { status: "pending" } }),
    prisma.role.findMany({
      orderBy: { name: "asc" },
      select: {
        name: true,
        label: true,
        _count: { select: { users: true } },
      },
    }),
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { role: true },
    }),
    prisma.user.findMany({
      where: { createdAt: { gte: since } },
      select: { createdAt: true },
    }),
  ]);

  const buckets = new Map<string, { label: string; users: number }>();

  for (let index = 0; index < 30; index += 1) {
    const day = subDays(now, 29 - index);
    buckets.set(format(day, "yyyy-MM-dd"), {
      label: format(day, dayLabelFormat, { locale: dateLocale }),
      users: 0,
    });
  }

  for (const signup of recentSignups) {
    const key = format(
      new TZDate(signup.createdAt, APP_TIME_ZONE),
      "yyyy-MM-dd",
    );
    const bucket = buckets.get(key);

    if (bucket) {
      bucket.users += 1;
    }
  }

  return {
    totalUsers,
    activeUsers,
    pendingUsers,
    rolesCount: roles.length,
    roleData: roles.map((role) => ({
      name: role.name,
      label: role.label,
      users: role._count.users,
    })),
    signupData: [...buckets.values()].map((bucket) => ({
      date: bucket.label,
      users: bucket.users,
    })),
    recentUsers,
  };
}
