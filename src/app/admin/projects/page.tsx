export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { isStaff } from "@/lib/permissions";
import { db } from "@/lib/db";
import { projects, users, profiles } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Building2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

function healthVariant(
  health: string
): "success" | "warning" | "danger" | "secondary" {
  const map: Record<string, "success" | "warning" | "danger" | "secondary"> = {
    ON_TRACK: "success",
    AT_RISK: "warning",
    DELAYED: "warning",
    COMPLETED: "secondary",
    ON_HOLD: "secondary",
    CANCELLED: "danger",
  };
  return map[health] ?? "secondary";
}

function healthLabel(health: string) {
  return health.replace(/_/g, " ");
}

export default async function AdminProjectsPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!isStaff(session)) redirect("/dashboard");

  const rows = await db
    .select({
      project: projects,
      clientFirstName: profiles.firstName,
      clientLastName: profiles.lastName,
      clientEmail: users.email,
    })
    .from(projects)
    .leftJoin(users, eq(users.id, projects.clientId))
    .leftJoin(profiles, eq(profiles.userId, projects.clientId))
    .orderBy(desc(projects.updatedAt));

  const statusGroups = {
    ACTIVE: rows.filter((r) => r.project.status === "ACTIVE"),
    PLANNING: rows.filter((r) => r.project.status === "PLANNING"),
    ON_HOLD: rows.filter((r) => r.project.status === "ON_HOLD"),
    COMPLETED: rows.filter((r) => r.project.status === "COMPLETED"),
    CANCELLED: rows.filter((r) => r.project.status === "CANCELLED"),
  };

  const statusOrder = ["ACTIVE", "PLANNING", "ON_HOLD", "COMPLETED", "CANCELLED"] as const;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Projects</h1>
          <p className="text-sm text-[var(--pb-text-muted)] mt-0.5">
            {rows.length} total projects
          </p>
        </div>
        <Button variant="default" size="sm" asChild>
          <Link href="/admin/projects/new">
            <Plus className="h-4 w-4 mr-1.5" />
            New Project
          </Link>
        </Button>
      </div>

      {rows.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Building2 className="h-12 w-12 text-[var(--pb-border)] mb-4" />
          <h3 className="text-base font-semibold text-white mb-1">
            No projects yet
          </h3>
          <p className="text-sm text-[var(--pb-text-muted)]">
            Create your first project to get started.
          </p>
        </div>
      )}

      {statusOrder.map((status) => {
        const group = statusGroups[status];
        if (group.length === 0) return null;
        return (
          <section key={status}>
            <h2 className="text-sm font-semibold text-[var(--pb-text-muted)] uppercase tracking-wide mb-3">
              {status.replace(/_/g, " ")} ({group.length})
            </h2>
            <div className="space-y-3">
              {group.map(
                ({ project, clientFirstName, clientLastName, clientEmail }) => {
                  const clientName =
                    clientFirstName || clientLastName
                      ? `${clientFirstName ?? ""} ${clientLastName ?? ""}`.trim()
                      : clientEmail ?? "Unknown Client";
                  const location = [project.area, project.city, project.state]
                    .filter(Boolean)
                    .join(", ");

                  return (
                    <Link
                      key={project.id}
                      href={`/admin/projects/${project.id}`}
                      className="block bg-[var(--pb-surface-elevated)] border border-[var(--pb-border)] rounded-xl p-5 hover:border-[var(--pb-orange)]/40 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div>
                          {location && (
                            <p className="text-xs text-[var(--pb-text-subtle)] mb-0.5">
                              {location}
                            </p>
                          )}
                          <h3 className="font-semibold text-white">
                            {project.title}
                          </h3>
                          <p className="text-xs text-[var(--pb-text-muted)] mt-0.5">
                            Client: {clientName}
                          </p>
                        </div>
                        <Badge
                          variant={healthVariant(project.health)}
                          className="shrink-0"
                        >
                          {healthLabel(project.health)}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-3">
                        <Progress
                          value={project.progressPercent}
                          className="h-1.5 flex-1"
                        />
                        <span className="text-xs font-semibold text-[var(--pb-orange)] shrink-0 w-10 text-right">
                          {project.progressPercent}%
                        </span>
                      </div>

                      {project.budgetAmount && (
                        <p className="text-xs text-[var(--pb-text-subtle)] mt-2">
                          Budget:{" "}
                          {formatCurrency(
                            Number(project.budgetAmount),
                            project.currency ?? "NGN"
                          )}
                        </p>
                      )}
                    </Link>
                  );
                }
              )}
            </div>
          </section>
        );
      })}
    </div>
  );
}
