import { SecuritySettings } from "@/components/settings/security-settings";
import { requireSession } from "@/lib/auth/session";

export default async function SecuritySettingsPage() {
  const session = await requireSession();

  return <SecuritySettings twoFactorEnabled={session.user.twoFactorEnabled} />;
}
