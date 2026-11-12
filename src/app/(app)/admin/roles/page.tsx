import { getTranslations } from "next-intl/server";

import { PageHeader } from "@/components/common/page-header";
import {
  CreateRoleDialog,
  EditRoleDialog,
} from "@/components/roles/role-form-dialog";
import { RoleDeleteDialog } from "@/components/roles/role-delete-dialog";
import { Badge } from "@/components/ui/badge";
import { requirePermission } from "@/lib/auth/session";
import { getPermissions, getRolesWithPermissions } from "@/lib/roles/queries";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default async function RolesPage() {
  await requirePermission("manage_roles");
  const [t, tCommon, tPermissions] = await Promise.all([
    getTranslations("roles"),
    getTranslations("common"),
    getTranslations("permissions"),
  ]);
  const [roles, permissions] = await Promise.all([
    getRolesWithPermissions(),
    getPermissions(),
  ]);
  const permissionOptions = permissions.map((permission) => ({
    id: permission.id,
    key: permission.key,
    label: permission.label,
  }));

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={t("title")}
        description={t("description")}
        actions={<CreateRoleDialog permissions={permissionOptions} />}
      />
      <div className="overflow-x-auto rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("columns.name")}</TableHead>
              <TableHead>{t("columns.description")}</TableHead>
              <TableHead>{t("columns.permissions")}</TableHead>
              <TableHead>{t("columns.users")}</TableHead>
              <TableHead className="w-24 text-right">
                <span className="sr-only">{tCommon("actions")}</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {roles.map((role) => {
              const isProtected = role.name === "superadmin";
              const isDefault = role.name === "user";
              const permissionKeys = role.permissions.map(
                ({ permission }) => permission.key,
              );
              const canDelete =
                !isProtected && !isDefault && role._count.users === 0;

              return (
                <TableRow key={role.id}>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{role.label}</span>
                        {isProtected ? (
                          <Badge variant="secondary">
                            {tCommon("protected")}
                          </Badge>
                        ) : null}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {role.name}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="max-w-xs text-sm text-muted-foreground">
                    {role.description ?? "—"}
                  </TableCell>
                  <TableCell>
                    {permissionKeys.length === 0 ? (
                      <span className="text-sm text-muted-foreground">—</span>
                    ) : (
                      <div className="flex flex-wrap gap-1">
                        {permissionKeys.map((key) => (
                          <Badge key={key} variant="outline">
                            {tPermissions(key as never)}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="tabular-nums">
                    {role._count.users}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      {isProtected ? (
                        <span className="text-xs text-muted-foreground">
                          {tCommon("protected")}
                        </span>
                      ) : (
                        <>
                          <EditRoleDialog
                            role={{
                              id: role.id,
                              name: role.name,
                              label: role.label,
                              description: role.description,
                              permissions: permissionKeys,
                            }}
                            permissions={permissionOptions}
                          />
                          <RoleDeleteDialog
                            role={{ id: role.id, label: role.label }}
                            disabled={!canDelete}
                          />
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
