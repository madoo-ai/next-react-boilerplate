"use client";

import Link from "next/link";
import { UserRound } from "lucide-react";
import { useTranslations } from "next-intl";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { UserRowActions } from "./user-row-actions";

type UserRow = {
  id: string;
  name: string;
  email: string;
  roleLabel: string;
  status: "pending" | "active" | "suspended";
  createdAtLabel: string;
  canManage: boolean;
  canDelete: boolean;
};

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function statusVariant(status: UserRow["status"]) {
  if (status === "active") return "default" as const;
  if (status === "suspended") return "destructive" as const;
  return "secondary" as const;
}

export function UsersTable({ users }: { users: UserRow[] }) {
  const t = useTranslations("users");
  const tCommon = useTranslations("common");

  if (users.length === 0) {
    return (
      <Empty className="border">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <UserRound />
          </EmptyMedia>
          <EmptyTitle>{t("title")}</EmptyTitle>
          <EmptyDescription>{t("empty")}</EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button asChild>
            <Link href="/admin/users/create">{t("create")}</Link>
          </Button>
        </EmptyContent>
      </Empty>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t("columns.name")}</TableHead>
            <TableHead>{t("columns.role")}</TableHead>
            <TableHead>{t("columns.status")}</TableHead>
            <TableHead>{t("columns.createdAt")}</TableHead>
            <TableHead className="w-12 text-right">
              <span className="sr-only">{tCommon("actions")}</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar className="size-8">
                    <AvatarFallback className="bg-primary/10 text-xs text-primary">
                      {initials(user.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex min-w-0 flex-col">
                    <span className="truncate font-medium">{user.name}</span>
                    <span className="truncate text-xs text-muted-foreground">
                      {user.email}
                    </span>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="outline">{user.roleLabel}</Badge>
              </TableCell>
              <TableCell>
                <Badge variant={statusVariant(user.status)}>
                  {tCommon(user.status)}
                </Badge>
              </TableCell>
              <TableCell className="text-muted-foreground">
                {user.createdAtLabel}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end">
                  <UserRowActions
                    user={user}
                    canManage={user.canManage}
                    canDelete={user.canDelete}
                  />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
