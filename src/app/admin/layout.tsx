export const dynamic = 'force-dynamic';

import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { AdminSidebar } from "@/components/admin/sidebar";
import { AdminTopNav } from "@/components/admin/top-nav";

const ADMIN_ROLES = [
  "SUPER_ADMIN",
  "ADMIN",
  "PROJECT_MANAGER",
  "SITE_SUPERVISOR",
  "FINANCE",
] as const;

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!ADMIN_ROLES.includes(session.role as (typeof ADMIN_ROLES)[number])) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen flex bg-[var(--pb-bg)]">
      <div className="hidden lg:block">
        <AdminSidebar session={session} />
      </div>
      <div className="flex-1 flex flex-col min-w-0">
        <AdminTopNav session={session} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
