import { PasswordForm } from "@/components/settings/password-form";
import { requireSession } from "@/lib/auth/session";

export default async function PasswordSettingsPage() {
  await requireSession();

  return <PasswordForm />;
}
