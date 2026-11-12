import { MarketingFooter } from "@/components/marketing/marketing-footer";
import { MarketingHeader } from "@/components/marketing/marketing-header";
import { getSession } from "@/lib/auth/session";

export default async function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  return (
    <div className="flex min-h-svh flex-col bg-background">
      <MarketingHeader isAuthenticated={!!session} />
      <main className="flex-1">{children}</main>
      <MarketingFooter />
    </div>
  );
}
