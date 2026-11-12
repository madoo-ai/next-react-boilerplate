import { getTranslations } from "next-intl/server";

import { PageHeader } from "@/components/common/page-header";
import { UserForm } from "@/components/users/user-form";
import { requirePermission } from "@/lib/auth/session";
import type { Actor } from "@/lib/rbac/authorize";
import { getAssignableRoles } from "@/lib/users/queries";

export default async function CreateUserPage() {
  const session = await requirePermission("manage_users");
  const t = await getTranslations("users");
  const actor: Actor = {
    id: session.user.id,
    role: session.user.role ? { name: session.user.role.name } : null,
    permissions: session.user.permissions,
  };
  const roles = await getAssignableRoles(actor);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={t("create")} description={t("description")} />
      <UserForm
        mode="create"
        roles={roles.map((role) => ({
          name: role.name,
          label: role.label,
        }))}
      />
    </div>
  );
}
