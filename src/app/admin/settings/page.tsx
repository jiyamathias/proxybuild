export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { canManageTeam } from "@/lib/permissions";
import { db } from "@/lib/db";
import { users, profiles } from "@/db/schema";
import { eq } from "drizzle-orm";
import { AdminProfileForm } from "@/components/admin/admin-profile-form";
import { Shield, Settings } from "lucide-react";
import { siteConfig } from "@/config/site";

export default async function AdminSettingsPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const [profile] = await db
    .select({ profile: profiles })
    .from(profiles)
    .where(eq(profiles.userId, session.id))
    .limit(1);

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Settings className="h-6 w-6 text-[var(--pb-text-muted)]" />
          Settings
        </h1>
        <p className="text-sm text-[var(--pb-text-muted)] mt-0.5">
          Manage your account and platform preferences
        </p>
      </div>

      {/* Profile settings */}
      <section className="bg-[var(--pb-surface-elevated)] border border-[var(--pb-border)] rounded-xl p-6">
        <h2 className="text-base font-semibold text-white mb-4">
          Your Profile
        </h2>
        <AdminProfileForm
          userId={session.id}
          initialData={{
            firstName: profile?.profile?.firstName ?? session.firstName,
            lastName: profile?.profile?.lastName ?? session.lastName,
            phone: profile?.profile?.phone ?? "",
          }}
        />
      </section>

      {/* Platform info */}
      <section className="bg-[var(--pb-surface-elevated)] border border-[var(--pb-border)] rounded-xl p-6">
        <h2 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
          <Shield className="h-4 w-4 text-[var(--pb-text-muted)]" />
          Platform Info
        </h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-xs text-[var(--pb-text-subtle)]">Platform</p>
            <p className="text-white">{siteConfig.name}</p>
          </div>
          <div>
            <p className="text-xs text-[var(--pb-text-subtle)]">Your Role</p>
            <p className="text-white">{session.role.replace(/_/g, " ")}</p>
          </div>
          <div>
            <p className="text-xs text-[var(--pb-text-subtle)]">Email</p>
            <p className="text-white">{session.email}</p>
          </div>
          <div>
            <p className="text-xs text-[var(--pb-text-subtle)]">Support</p>
            <a
              href={`mailto:${siteConfig.emails.support}`}
              className="text-[var(--pb-green)] hover:underline"
            >
              {siteConfig.emails.support}
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
