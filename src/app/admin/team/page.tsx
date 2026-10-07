export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { canManageTeam, isStaff } from "@/lib/permissions";
import { db } from "@/lib/db";
import { users, profiles, teams, teamMembers } from "@/db/schema";
import { eq, desc, and } from "drizzle-orm";
import { Badge } from "@/components/ui/badge";
import { formatRelativeDate } from "@/lib/utils";
import { Users, Shield } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { InviteUserButton } from "@/components/admin/invite-user-button";

const roleColors: Record<string, "success" | "warning" | "danger" | "secondary" | "default" | "info"> = {
  SUPER_ADMIN: "danger",
  ADMIN: "warning",
  PROJECT_MANAGER: "default",
  SITE_SUPERVISOR: "info",
  FINANCE: "success",
  CLIENT: "secondary",
};

export default async function AdminTeamPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!isStaff(session)) redirect("/dashboard");

  const canManage = canManageTeam(session);

  const staffMembers = await db
    .select({
      user: users,
      profile: profiles,
    })
    .from(users)
    .leftJoin(profiles, eq(profiles.userId, users.id))
    .where(
      and(
        eq(users.isActive, true)
      )
    )
    .orderBy(users.role, users.createdAt);

  // Filter to staff only
  const STAFF_ROLES = ["SUPER_ADMIN", "ADMIN", "PROJECT_MANAGER", "SITE_SUPERVISOR", "FINANCE"];
  const staff = staffMembers.filter((m) => STAFF_ROLES.includes(m.user.role));
  const clients = staffMembers.filter((m) => m.user.role === "CLIENT");

  const allTeams = await db
    .select({
      team: teams,
      memberCount: db
        .$count(teamMembers, and(
          eq(teamMembers.teamId, teams.id),
          eq(teamMembers.isActive, true)
        )),
    })
    .from(teams)
    .where(eq(teams.isActive, true))
    .orderBy(teams.name);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Team</h1>
          <p className="text-sm text-[var(--pb-text-muted)] mt-0.5">
            {staff.length} staff · {clients.length} clients
          </p>
        </div>
        {canManage && <InviteUserButton />}
      </div>

      {/* Staff section */}
      <section>
        <h2 className="text-sm font-semibold text-[var(--pb-text-muted)] uppercase tracking-wide mb-3">
          Staff ({staff.length})
        </h2>
        <div className="space-y-2">
          {staff.map(({ user, profile }) => {
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
              <div
                key={user.id}
                className="flex items-center gap-4 bg-[var(--pb-surface-elevated)] border border-[var(--pb-border-subtle)] rounded-xl p-4"
              >
                <div className="h-10 w-10 rounded-full bg-[var(--pb-orange)]/20 flex items-center justify-center shrink-0">
                  <span className="text-sm font-bold text-[var(--pb-orange)]">
                    {initials}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white">{name}</p>
                  <p className="text-xs text-[var(--pb-text-subtle)]">
                    {user.email}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge variant={roleColors[user.role] ?? "secondary"}>
                    {user.role.replace(/_/g, " ")}
                  </Badge>
                  {user.id === session.id && (
                    <span className="text-xs text-[var(--pb-text-subtle)]">You</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Clients section */}
      <section>
        <h2 className="text-sm font-semibold text-[var(--pb-text-muted)] uppercase tracking-wide mb-3">
          Clients ({clients.length})
        </h2>
        {clients.length === 0 ? (
          <p className="text-sm text-[var(--pb-text-muted)]">No clients yet.</p>
        ) : (
          <div className="space-y-2">
            {clients.map(({ user, profile }) => {
              const name =
                profile?.firstName || profile?.lastName
                  ? `${profile.firstName ?? ""} ${profile.lastName ?? ""}`.trim()
                  : user.email;
              return (
                <Link
                  key={user.id}
                  href={`/admin/clients/${user.id}`}
                  className="flex items-center gap-4 bg-[var(--pb-surface-elevated)] border border-[var(--pb-border-subtle)] rounded-xl p-4 hover:border-[var(--pb-border)] transition-colors"
                >
                  <div className="h-10 w-10 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0">
                    <span className="text-sm font-bold text-blue-400">
                      {name[0]?.toUpperCase() ?? "C"}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white">{name}</p>
                    <p className="text-xs text-[var(--pb-text-subtle)]">
                      {user.email}
                    </p>
                  </div>
                  <Badge variant="secondary">Client</Badge>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
