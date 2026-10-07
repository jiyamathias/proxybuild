export const dynamic = 'force-dynamic';

import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { DashboardNav } from "@/components/dashboard/nav";
import { DashboardSidebar } from "@/components/dashboard/sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  // Admins/internal staff go to /admin
  if (session.role !== "CLIENT") redirect("/admin");

  return (
    <div className="min-h-screen flex bg-[var(--pb-bg)]">
      <DashboardSidebar session={session} />
      <div className="flex-1 flex flex-col min-w-0">
        <DashboardNav session={session} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
