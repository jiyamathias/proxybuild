export const dynamic = "force-dynamic";

import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { getProjectForUser } from "@/lib/services/projects";
import { ProjectTabs } from "@/components/dashboard/project/project-tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { MapPin } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

function healthBadge(health: string) {
  const map: Record<string, "success" | "warning" | "danger" | "secondary"> = {
    ON_TRACK: "success",
    AT_RISK: "warning",
    DELAYED: "warning",
    COMPLETED: "secondary",
    ON_HOLD: "secondary",
    CANCELLED: "danger",
  };
  const labels: Record<string, string> = {
    ON_TRACK: "On Track",
    AT_RISK: "At Risk",
    DELAYED: "Delayed",
    COMPLETED: "Completed",
    ON_HOLD: "On Hold",
    CANCELLED: "Cancelled",
  };
  return { variant: map[health] ?? "secondary", label: labels[health] ?? health };
}

export default async function ProjectLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ projectId: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  const { projectId } = await params;
  const project = await getProjectForUser(projectId, session);
  if (!project) notFound();

  const hb = healthBadge(project.health);
  const location = [project.area, project.city, project.state]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="max-w-6xl mx-auto space-y-0">
      {/* Project header */}
      <div className="bg-[var(--pb-surface)] border border-[var(--pb-border)] rounded-xl p-6 mb-0">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-5">
          <div>
            {location && (
              <div className="flex items-center gap-1.5 text-sm text-[var(--pb-text-muted)] mb-1">
                <MapPin className="h-3.5 w-3.5" />
                {location}
              </div>
            )}
            <h1 className="text-2xl font-bold text-white">{project.title}</h1>
          </div>
          <Badge variant={hb.variant} className="shrink-0 self-start">
            {hb.label}
          </Badge>
        </div>

        {/* Progress */}
        <div className="mb-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-[var(--pb-text-muted)]">Overall Progress</span>
            <span className="text-sm font-bold text-[var(--pb-orange)]">
              {project.progressPercent}%
            </span>
          </div>
          <Progress value={project.progressPercent} className="h-2" />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div>
            <p className="text-xs text-[var(--pb-text-subtle)]">Status</p>
            <p className="text-sm font-semibold text-white capitalize">
              {project.status.toLowerCase().replace(/_/g, " ")}
            </p>
          </div>
          {project.budgetAmount && (
            <div>
              <p className="text-xs text-[var(--pb-text-subtle)]">Budget</p>
              <p className="text-sm font-semibold text-white">
                {formatCurrency(project.budgetAmount, project.currency)}
              </p>
            </div>
          )}
          {project.plannedEndDate && (
            <div>
              <p className="text-xs text-[var(--pb-text-subtle)]">Est. Completion</p>
              <p className="text-sm font-semibold text-white">
                {new Intl.DateTimeFormat("en-GB", {
                  month: "short",
                  year: "numeric",
                }).format(new Date(project.plannedEndDate))}
              </p>
            </div>
          )}
          <div>
            <p className="text-xs text-[var(--pb-text-subtle)]">Country</p>
            <p className="text-sm font-semibold text-white">{project.country}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-[var(--pb-surface)] border border-[var(--pb-border)] border-t-0 rounded-b-xl overflow-hidden">
        <ProjectTabs projectId={projectId} />
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
