export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { profiles } from "@/db/schema";
import { eq } from "drizzle-orm";
import {
  ClientProfileForm,
  ChangePasswordForm,
} from "@/components/dashboard/client-settings-form";
import { Settings, KeyRound, UserCircle } from "lucide-react";

export default async function DashboardSettingsPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const [profile] = await db
    .select()
    .from(profiles)
    .where(eq(profiles.userId, session.id))
    .limit(1);

  return (
    <div className="max-w-xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Settings className="h-6 w-6 text-[var(--pb-text-muted)]" />
          Account Settings
        </h1>
        <p className="text-sm text-[var(--pb-text-muted)] mt-0.5">
          Manage your profile and security settings
        </p>
      </div>

      {/* Profile */}
      <section className="bg-[var(--pb-surface-elevated)] border border-[var(--pb-border)] rounded-xl p-6">
        <h2 className="text-base font-semibold text-white mb-5 flex items-center gap-2">
          <UserCircle className="h-4 w-4 text-[var(--pb-text-muted)]" />
          Your Profile
        </h2>
        <ClientProfileForm
          userId={session.id}
          initialData={{
            firstName: profile?.firstName ?? session.firstName,
            lastName: profile?.lastName ?? session.lastName,
            phone: profile?.phone ?? "",
            countryOfResidence: profile?.countryOfResidence ?? "",
            timezone: profile?.timezone ?? "",
          }}
        />
      </section>

      {/* Account info (read-only) */}
      <section className="bg-[var(--pb-surface-elevated)] border border-[var(--pb-border)] rounded-xl p-6">
        <h2 className="text-sm font-semibold text-white mb-4">Account</h2>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-[var(--pb-text-muted)]">Email</span>
            <span className="text-white">{session.email}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[var(--pb-text-muted)]">Role</span>
            <span className="text-white capitalize">
              {session.role.toLowerCase().replace(/_/g, " ")}
            </span>
          </div>
        </div>
      </section>

      {/* Password */}
      <section className="bg-[var(--pb-surface-elevated)] border border-[var(--pb-border)] rounded-xl p-6">
        <h2 className="text-base font-semibold text-white mb-5 flex items-center gap-2">
          <KeyRound className="h-4 w-4 text-[var(--pb-text-muted)]" />
          Change Password
        </h2>
        <ChangePasswordForm />
      </section>
    </div>
  );
}
