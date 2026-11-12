import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import {
  CheckCircle2,
  Clock3,
  KeyRound,
  ShieldCheck,
  Users,
} from "lucide-react";

import { DashboardCharts } from "@/components/dashboard/dashboard-charts";
import { PageHeader } from "@/components/common/page-header";
import { StatCard } from "@/components/common/stat-card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { requireSession } from "@/lib/auth/session";
import { getDashboardData } from "@/lib/dashboard/queries";
import { can } from "@/lib/rbac/authorize";

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function statusVariant(status: string) {
  if (status === "active") return "default" as const;
  if (status === "suspended") return "destructive" as const;
  return "secondary" as const;
}

export default async function DashboardPage() {
  const session = await requireSession();
  const [t, tCommon, tUserColumns, locale] = await Promise.all([
    getTranslations("dashboard"),
    getTranslations("common"),
    getTranslations("users.columns"),
    getLocale(),
  ]);
  const numberFormat = new Intl.NumberFormat(
    locale === "id" ? "id-ID" : "en-US",
  );
  const dateFormat = new Intl.DateTimeFormat(
    locale === "id" ? "id-ID" : "en-US",
    { dateStyle: "medium" },
  );

  if (!can(session.user, "view_admin")) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader
          title={t("title")}
          description={t("description")}
          actions={
            <Button asChild variant="outline">
              <Link href="/settings/profile">{tCommon("profile")}</Link>
            </Button>
          }
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard
            label={tCommon("role")}
            value={session.user.role?.label ?? tCommon("unknown")}
            icon={ShieldCheck}
          />
          <StatCard
            label={tCommon("status")}
            value={tCommon(session.user.status)}
            icon={CheckCircle2}
          />
          <StatCard
            label={tCommon("security")}
            value={
              session.user.twoFactorEnabled
                ? tCommon("enabled")
                : tCommon("disabled")
            }
            icon={KeyRound}
          />
        </div>
        <Card>
          <CardHeader>
            <CardTitle>{session.user.name}</CardTitle>
            <CardDescription>{session.user.email}</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="flex flex-col gap-1 text-sm">
              <span className="text-muted-foreground">
                {tCommon("jobTitle")}
              </span>
              <span>{session.user.jobTitle ?? "—"}</span>
            </div>
            <div className="flex flex-col gap-1 text-sm">
              <span className="text-muted-foreground">
                {tCommon("department")}
              </span>
              <span>{session.user.department ?? "—"}</span>
            </div>
            <div className="flex flex-col gap-1 text-sm">
              <span className="text-muted-foreground">{tCommon("phone")}</span>
              <span>{session.user.phoneNumber ?? "—"}</span>
            </div>
          </CardContent>
        </Card>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline">
            <Link href="/settings/profile">{tCommon("profile")}</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/settings/password">{tCommon("password")}</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/settings/security">{tCommon("security")}</Link>
          </Button>
        </div>
      </div>
    );
  }

  const data = await getDashboardData(locale === "id" ? "id" : "en");

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={t("title")}
        description={t("description")}
        actions={
          <Button asChild>
            <Link href="/admin/users">{t("viewAll")}</Link>
          </Button>
        }
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label={t("stats.totalUsers")}
          value={numberFormat.format(data.totalUsers)}
          icon={Users}
        />
        <StatCard
          label={t("stats.activeUsers")}
          value={numberFormat.format(data.activeUsers)}
          icon={CheckCircle2}
        />
        <StatCard
          label={t("stats.pendingUsers")}
          value={numberFormat.format(data.pendingUsers)}
          icon={Clock3}
        />
        <StatCard
          label={t("stats.roles")}
          value={numberFormat.format(data.rolesCount)}
          icon={ShieldCheck}
        />
      </div>
      <DashboardCharts roleData={data.roleData} signupData={data.signupData} />
      <Card>
        <CardHeader>
          <CardTitle>{t("recentUsers")}</CardTitle>
          <CardDescription>
            <Link
              href="/admin/users"
              className="underline-offset-4 hover:text-primary hover:underline"
            >
              {t("viewAll")}
            </Link>
          </CardDescription>
        </CardHeader>
        <CardContent>
          {data.recentUsers.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              {t("recentUsersEmpty")}
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{tCommon("name")}</TableHead>
                  <TableHead>{tCommon("role")}</TableHead>
                  <TableHead>{tCommon("status")}</TableHead>
                  <TableHead className="text-right">
                    {tUserColumns("createdAt")}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.recentUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="size-8">
                          <AvatarFallback className="bg-primary/10 text-xs text-primary">
                            {initials(user.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <span className="font-medium">{user.name}</span>
                          <span className="text-xs text-muted-foreground">
                            {user.email}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {user.role?.label ?? tCommon("unknown")}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusVariant(user.status)}>
                        {tCommon(user.status)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {dateFormat.format(user.createdAt)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
