export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { isStaff } from "@/lib/permissions";
import { db } from "@/lib/db";
import { users, profiles, projects } from "@/db/schema";
import { eq, desc, count } from "drizzle-orm";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { formatRelativeDate } from "@/lib/utils";
import { Users } from "lucide-react";
import { InviteUserButton } from "@/components/admin/invite-user-button";

export default async function AdminClientsPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!isStaff(session)) redirect("/dashboard");

  const clients = await db
    .select({
      user: users,
      profile: profiles,
      projectCount: count(projects.id),
    })
    .from(users)
    .leftJoin(profiles, eq(profiles.userId, users.id))
    .leftJoin(projects, eq(projects.clientId, users.id))
    .where(eq(users.role, "CLIENT"))
    .groupBy(users.id, profiles.id)
    .orderBy(desc(users.createdAt));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Clients</h1>
          <p className="text-sm text-[var(--pb-text-muted)] mt-0.5">
            {clients.length} total clients
          </p>
        </div>
        <InviteUserButton />
      </div>

      {clients.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Users className="h-12 w-12 text-[var(--pb-border)] mb-4" />
          <h3 className="text-base font-semibold text-white mb-1">
            No clients yet
          </h3>
          <p className="text-sm text-[var(--pb-text-muted)]">
            Invite clients to give them project access.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {clients.map(({ user, profile, projectCount }) => {
            const name =
              profile?.firstName || profile?.lastName
                ? `${profile.firstName ?? ""} ${profile.lastName ?? ""}`.trim()
                : user.email;
            const initials = name
              .split(" ")
              .map((p) => p[0])
              .join("")
              .slice(0, 2)
              .toUpperCase();

            return (
              <Link
                key={user.id}
                href={`/admin/clients/${user.id}`}
                className="flex items-center gap-4 bg-[var(--pb-surface-elevated)] border border-[var(--pb-border-subtle)] rounded-xl p-4 hover:border-[var(--pb-border)] transition-colors"
              >
                <div className="h-10 w-10 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0">
                  <span className="text-sm font-bold text-blue-400">
                    {initials}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white">{name}</p>
                  <p className="text-xs text-[var(--pb-text-subtle)] mt-0.5">
                    {user.email}
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <p className="text-xs font-semibold text-white">
                      {projectCount}
                    </p>
                    <p className="text-xs text-[var(--pb-text-subtle)]">
                      project{projectCount !== 1 ? "s" : ""}
                    </p>
                  </div>
                  <Badge variant={user.isActive ? "success" : "secondary"}>
                    {user.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
