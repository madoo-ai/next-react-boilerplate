import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import { PlusIcon as Plus } from "@x1nx3r/altics-react-icons";

import { PageHeader } from "@/components/common/page-header";
import { DataPagination } from "@/components/common/data-pagination";
import { RegistrationApprovalCard } from "@/components/users/registration-approval-card";
import { UsersTable } from "@/components/users/users-table";
import { UsersToolbar } from "@/components/users/users-toolbar";
import { Button } from "@/components/ui/button";
import { requirePermission } from "@/lib/auth/session";
import { canDeleteUser, canManageUser, type Actor } from "@/lib/rbac/authorize";
import {
  getRegistrationApproval,
  getSuperadminCount,
  getUsersPage,
  getAllRoles,
} from "@/lib/users/queries";
import { parseUserFilters, USERS_PAGE_SIZE } from "@/lib/users/schema";

export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await requirePermission("manage_users");
  const [params, t, tCommon, locale] = await Promise.all([
    searchParams,
    getTranslations("users"),
    getTranslations("common"),
    getLocale(),
  ]);
  const filters = parseUserFilters(params);
  const actor: Actor = {
    id: session.user.id,
    role: session.user.role ? { name: session.user.role.name } : null,
    permissions: session.user.permissions,
  };

  const [
    { users, page, pageCount, total },
    roles,
    approvalRequired,
    superadminCount,
  ] = await Promise.all([
    getUsersPage(filters),
    getAllRoles(),
    getRegistrationApproval(),
    getSuperadminCount(),
  ]);

  const dateFormat = new Intl.DateTimeFormat(
    locale === "id" ? "id-ID" : "en-US",
    { dateStyle: "medium" },
  );

  const rows = users.map((user) => ({
    id: user.id,
    name: user.name,
    email: user.email,
    roleLabel: user.role?.label ?? tCommon("unknown"),
    status: user.status,
    createdAtLabel: dateFormat.format(user.createdAt),
    canManage: canManageUser(actor, user),
    canDelete: canDeleteUser(actor, user, superadminCount),
  }));

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={t("title")}
        description={t("description")}
        actions={
          <Button asChild>
            <Link href="/admin/users/create">
              <Plus data-icon="inline-start" />
              {t("create")}
            </Link>
          </Button>
        }
      />
      <RegistrationApprovalCard
        key={approvalRequired ? "approval-on" : "approval-off"}
        enabled={approvalRequired}
      />
      <div className="flex flex-col gap-3">
        <UsersToolbar
          roles={roles.map((role) => ({
            name: role.name,
            label: role.label,
          }))}
          initialSearch={filters.search}
          initialRole={filters.role}
          initialStatus={filters.status}
        />
        <UsersTable users={rows} />
        <DataPagination
          page={page}
          pageCount={pageCount}
          total={total}
          pageSize={USERS_PAGE_SIZE}
          basePath="/admin/users"
          query={{
            search: filters.search,
            role: filters.role,
            status: filters.status,
          }}
        />
      </div>
    </div>
  );
}
