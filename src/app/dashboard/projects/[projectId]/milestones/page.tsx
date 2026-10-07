export const dynamic = "force-dynamic";

import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { getProjectForUser, getProjectMilestones } from "@/lib/services/projects";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { formatDate } from "@/lib/utils";
import {
  CheckCircle2,
  Clock,
  Circle,
  XCircle,
  AlertCircle,
  CalendarDays,
} from "lucide-react";
import { MilestoneApproveButton } from "@/components/dashboard/project/milestone-approve-button";

function statusIcon(status: string) {
  switch (status) {
    case "APPROVED":
      return <CheckCircle2 className="h-5 w-5 text-[var(--pb-success)] shrink-0" />;
    case "COMPLETED":
      return <CheckCircle2 className="h-5 w-5 text-[var(--pb-text-muted)] shrink-0" />;
    case "IN_PROGRESS":
      return <Clock className="h-5 w-5 text-[var(--pb-green)] shrink-0" />;
    case "ON_HOLD":
      return <AlertCircle className="h-5 w-5 text-yellow-500 shrink-0" />;
    case "CANCELLED":
      return <XCircle className="h-5 w-5 text-[var(--pb-danger)] shrink-0" />;
    default:
      return <Circle className="h-5 w-5 text-[var(--pb-border)] shrink-0" />;
  }
}

function approvalBadge(status: string | null) {
  if (!status) return null;
  const map: Record<string, { variant: "success" | "warning" | "danger" | "secondary"; label: string }> = {
    APPROVED: { variant: "success", label: "Approved" },
    AWAITING_CLIENT: { variant: "warning", label: "Awaiting Your Approval" },
    REJECTED: { variant: "danger", label: "Rejected" },
  };
  const entry = map[status];
  if (!entry) return null;
  return <Badge variant={entry.variant}>{entry.label}</Badge>;
}

export default async function MilestonesPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  const { projectId } = await params;
  const [project, milestones] = await Promise.all([
    getProjectForUser(projectId, session),
    getProjectMilestones(projectId, true),
  ]);
  if (!project) notFound();

  const completedCount = milestones.filter(
    (m) => m.status === "APPROVED" || m.status === "COMPLETED"
  ).length;
  const totalWeight = milestones.reduce((sum, m) => sum + (m.weightPercent ?? 0), 0);
  const completedWeight = milestones
    .filter((m) => m.status === "APPROVED" || m.status === "COMPLETED")
    .reduce((sum, m) => sum + (m.weightPercent ?? 0), 0);

  return (
    <div className="space-y-6">
      {/* Summary bar */}
      <div className="bg-[var(--pb-surface-elevated)] border border-[var(--pb-border)] rounded-xl p-5">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-sm font-semibold text-white">
              {completedCount} of {milestones.length} milestones complete
            </p>
            <p className="text-xs text-[var(--pb-text-muted)]">
              {completedWeight}% of project weight delivered
            </p>
          </div>
          <span className="text-2xl font-bold text-[var(--pb-green)]">
            {totalWeight > 0 ? Math.round((completedWeight / totalWeight) * 100) : 0}%
          </span>
        </div>
        <Progress
          value={totalWeight > 0 ? (completedWeight / totalWeight) * 100 : 0}
          className="h-2"
        />
      </div>

      {/* Milestone list */}
      <div className="space-y-3">
        {milestones.map((milestone, i) => {
          const done =
            milestone.status === "APPROVED" || milestone.status === "COMPLETED";
          const active = milestone.status === "IN_PROGRESS";
          const needsApproval = milestone.approvalStatus === "AWAITING_CLIENT";

          return (
            <div
              key={milestone.id}
              className={`border rounded-xl p-5 transition-colors ${
                needsApproval
                  ? "border-[var(--pb-green)]/40 bg-[var(--pb-green-muted)]"
                  : active
                  ? "border-[var(--pb-border)] bg-[var(--pb-surface-elevated)]"
                  : "border-[var(--pb-border-subtle)] bg-[var(--pb-surface-elevated)]"
              }`}
            >
              <div className="flex items-start gap-4">
                <div className="flex items-center gap-2 pt-0.5">
                  <span className="text-xs text-[var(--pb-text-subtle)] w-5 text-right font-mono">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  {statusIcon(milestone.status)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3 mb-1">
                    <h3
                      className={`font-semibold ${
                        done
                          ? "text-[var(--pb-text-muted)] line-through"
                          : "text-white"
                      }`}
                    >
                      {milestone.title}
                    </h3>
                    <div className="flex items-center gap-2 shrink-0">
                      {approvalBadge(milestone.approvalStatus)}
                      <span className="text-xs text-[var(--pb-text-subtle)] bg-[var(--pb-surface)] px-2 py-0.5 rounded-full border border-[var(--pb-border-subtle)]">
                        {milestone.weightPercent}%
                      </span>
                    </div>
                  </div>
                  {milestone.description && (
                    <p className="text-sm text-[var(--pb-text-muted)] mb-3 leading-relaxed">
                      {milestone.description}
                    </p>
                  )}
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[var(--pb-text-subtle)]">
                    {milestone.plannedStartDate && (
                      <span className="flex items-center gap-1">
                        <CalendarDays className="h-3 w-3" />
                        Start: {formatDate(milestone.plannedStartDate)}
                      </span>
                    )}
                    {milestone.plannedEndDate && (
                      <span className="flex items-center gap-1">
                        <CalendarDays className="h-3 w-3" />
                        End: {formatDate(milestone.plannedEndDate)}
                      </span>
                    )}
                    {milestone.actualEndDate && (
                      <span className="flex items-center gap-1 text-[var(--pb-success)]">
                        <CheckCircle2 className="h-3 w-3" />
                        Completed: {formatDate(milestone.actualEndDate)}
                      </span>
                    )}
                  </div>
                  {needsApproval && (
                    <div className="mt-4 pt-4 border-t border-[var(--pb-green)]/20">
                      <p className="text-sm text-[var(--pb-text-muted)] mb-3">
                        This milestone is ready for your review and approval.
                      </p>
                      <MilestoneApproveButton
                        milestoneId={milestone.id}
                        projectId={projectId}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
