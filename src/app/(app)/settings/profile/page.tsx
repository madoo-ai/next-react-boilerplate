import { DeleteAccountCard } from "@/components/settings/delete-account-card";
import { ProfileForm } from "@/components/settings/profile-form";
import { requireSession } from "@/lib/auth/session";
import { hasRecentPasswordConfirmation } from "@/lib/auth/confirm-password";
import { ROLES } from "@/lib/rbac/roles";
import { getSuperadminCount } from "@/lib/users/queries";

export default async function ProfileSettingsPage() {
  const session = await requireSession();
  const [confirmed, superadminCount] = await Promise.all([
    hasRecentPasswordConfirmation(),
    getSuperadminCount(),
  ]);
  const canDelete =
    session.user.role?.name !== ROLES.SUPERADMIN || superadminCount > 1;

  return (
    <div className="flex flex-col gap-6">
      <ProfileForm
        user={{
          name: session.user.name,
          email: session.user.email,
          phoneNumber: session.user.phoneNumber,
          jobTitle: session.user.jobTitle,
          department: session.user.department,
        }}
      />
      <DeleteAccountCard canDelete={canDelete} confirmed={confirmed} />
    </div>
  );
}
