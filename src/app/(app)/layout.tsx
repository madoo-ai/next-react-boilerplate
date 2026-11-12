import { AppHeader } from "@/components/app-shell/app-header";
import { AppSidebar } from "@/components/app-shell/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { requireSession } from "@/lib/auth/session";
import type { SessionUser } from "@/types/auth";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireSession();
  const user: SessionUser = {
    id: session.user.id,
    name: session.user.name,
    email: session.user.email,
    role: session.user.role
      ? {
          id: session.user.role.id,
          name: session.user.role.name,
          label: session.user.role.label,
        }
      : null,
    permissions: session.user.permissions,
  };

  return (
    <SidebarProvider>
      <AppSidebar user={user} />
      <SidebarInset>
        <AppHeader />
        <div className="flex flex-1 flex-col gap-6 app-canvas p-4 md:p-6 lg:p-8">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
