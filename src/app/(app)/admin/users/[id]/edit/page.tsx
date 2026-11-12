import { notFound, redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";

import { PageHeader } from "@/components/common/page-header";
import { UserForm } from "@/components/users/user-form";
import { requirePermission } from "@/lib/auth/session";
import { canManageUser, type Actor } from "@/lib/rbac/authorize";
import { getAssignableRoles, getUserForEdit } from "@/lib/users/queries";

export default async function EditUserPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requirePermission("manage_users");
  const [t, { id }] = await Promise.all([getTranslations("users"), params]);
  const actor: Actor = {
    id: session.user.id,
    role: session.user.role ? { name: session.user.role.name } : null,
    permissions: session.user.permissions,
  };
  const user = await getUserForEdit(id);

  if (!user) {
    notFound();
  }

  if (!canManageUser(actor, user)) {
    redirect("/403");
  }

  const roles = await getAssignableRoles(actor);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={t("edit")} description={user.email} />
      <UserForm
        mode="edit"
        roles={roles.map((role) => ({
          name: role.name,
          label: role.label,
        }))}
        user={{
          id: user.id,
          name: user.name,
          email: user.email,
          phoneNumber: user.phoneNumber,
          jobTitle: user.jobTitle,
          department: user.department,
          role: user.role?.name ?? null,
          status: user.status,
        }}
      />
    </div>
  );
}
