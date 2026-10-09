export const dynamic = "force-dynamic";

import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { isStaff } from "@/lib/permissions";
import { db } from "@/lib/db";
import { users, profiles, projects } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Mail, MapPin, Building2 } from "lucide-react";

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ clientId: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!isStaff(session)) redirect("/dashboard");

  const { clientId } = await params;

  const [clientUser] = await db
    .select({ user: users, profile: profiles })
    .from(users)
    .leftJoin(profiles, eq(profiles.userId, users.id))
    .where(eq(users.id, clientId))
    .limit(1);

  if (!clientUser || clientUser.user.role !== "CLIENT") notFound();

  const clientProjects = await db
    .select()
    .from(projects)
    .where(eq(projects.clientId, clientId))
    .orderBy(desc(projects.updatedAt));

  const { user, profile } = clientUser;
  const name =
    profile?.firstName || profile?.lastName
      ? `${profile.firstName ?? ""} ${profile.lastName ?? ""}`.trim()
      : user.email;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-1 text-sm">
          <Link
            href="/admin/clients"
            className="text-[var(--pb-text-muted)] hover:text-white transition-colors"
          >
            Clients
          </Link>
          <span className="text-[var(--pb-border)]">/</span>
          <span className="text-white">{name}</span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-2xl font-bold text-white">{name}</h1>
          <Badge variant={user.isActive ? "success" : "secondary"}>
            {user.isActive ? "Active" : "Inactive"}
          </Badge>
        </div>
      </div>

      {/* Profile card */}
      <div className="bg-[var(--pb-surface-elevated)] border border-[var(--pb-border)] rounded-xl p-5">
        <h2 className="text-sm font-semibold text-[var(--pb-text-muted)] uppercase tracking-wide mb-4">
          Contact
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex items-center gap-2.5">
            <Mail className="h-4 w-4 text-[var(--pb-text-subtle)] shrink-0" />
            <div>
              <p className="text-xs text-[var(--pb-text-subtle)]">Email</p>
              <a
                href={`mailto:${user.email}`}
                className="text-sm text-[var(--pb-green)] hover:underline"
              >
                {user.email}
              </a>
            </div>
          </div>
          {profile?.phone && (
            <div>
              <p className="text-xs text-[var(--pb-text-subtle)]">Phone</p>
              <p className="text-sm text-white">{profile.phone}</p>
            </div>
          )}
          {profile?.countryOfResidence && (
            <div className="flex items-center gap-2.5">
              <MapPin className="h-4 w-4 text-[var(--pb-text-subtle)] shrink-0" />
              <div>
                <p className="text-xs text-[var(--pb-text-subtle)]">Location</p>
                <p className="text-sm text-white">{profile.countryOfResidence}</p>
              </div>
            </div>
          )}
          <div>
            <p className="text-xs text-[var(--pb-text-subtle)]">Member since</p>
            <p className="text-sm text-white">{formatDate(user.createdAt)}</p>
          </div>
        </div>
      </div>

      {/* Projects */}
      <section>
        <h2 className="text-sm font-semibold text-[var(--pb-text-muted)] uppercase tracking-wide mb-3">
          Projects ({clientProjects.length})
        </h2>
        {clientProjects.length === 0 ? (
          <p className="text-sm text-[var(--pb-text-muted)]">No projects yet.</p>
        ) : (
          <div className="space-y-2">
            {clientProjects.map((project) => {
              const location = [project.area, project.city, project.state]
                .filter(Boolean)
                .join(", ");
              return (
                <Link
                  key={project.id}
                  href={`/admin/projects/${project.id}`}
                  className="flex items-center gap-4 bg-[var(--pb-surface-elevated)] border border-[var(--pb-border-subtle)] rounded-xl p-4 hover:border-[var(--pb-border)] transition-colors"
                >
                  <Building2 className="h-5 w-5 text-[var(--pb-text-muted)] shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white">
                      {project.title}
                    </p>
                    {location && (
                      <p className="text-xs text-[var(--pb-text-subtle)]">
                        {location}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="flex items-center gap-2">
                      <Progress
                        value={project.progressPercent}
                        className="h-1.5 w-16"
                      />
                      <span className="text-xs text-[var(--pb-green)] font-semibold">
                        {project.progressPercent}%
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
