import { AppearanceSettings } from "@/components/settings/appearance-settings";
import { requireSession } from "@/lib/auth/session";

export default async function AppearanceSettingsPage() {
  await requireSession();

  return <AppearanceSettings />;
}
