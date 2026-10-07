export const dynamic = "force-dynamic";

import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import {
  getProjectForUser,
  getProjectMilestones,
  getProjectUpdates,
} from "@/lib/services/projects";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { formatDate, formatRelativeDate } from "@/lib/utils";
import {
  CheckCircle2,
  Clock,
  Circle,
  ArrowRight,
  CalendarDays,
} from "lucide-react";
import Link from "next/link";

export default async function ProjectOverviewPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  const { projectId } = await params;
  const [project, allMilestones, recentUpdates] = await Promise.all([
    getProjectForUser(projectId, session),
    getProjectMilestones(projectId, true),
    getProjectUpdates(projectId, true),
  ]);
  if (!project) notFound();

  const activeMilestone = allMilestones.find((m) => m.status === "IN_PROGRESS");
  const nextMilestone = allMilestones.find((m) => m.status === "NOT_STARTED");
  const completedCount = allMilestones.filter(
    (m) => m.status === "APPROVED" || m.status === "COMPLETED"
  ).length;

  const latestUpdate = recentUpdates[0];

  return (
    <div className="space-y-8">
      {/* Quick stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="bg-[var(--pb-surface-elevated)] rounded-xl p-4 border border-[var(--pb-border-subtle)]">
          <p className="text-xs text-[var(--pb-text-subtle)] mb-1">Milestones Complete</p>
          <p className="text-2xl font-bold text-white">
            {completedCount}
            <span className="text-sm font-normal text-[var(--pb-text-muted)] ml-1">
              / {allMilestones.length}
            </span>
          </p>
        </div>
        {activeMilestone && (
          <div className="bg-[var(--pb-surface-elevated)] rounded-xl p-4 border border-[var(--pb-border-subtle)]">
            <p className="text-xs text-[var(--pb-text-subtle)] mb-1">Current Phase</p>
            <p className="text-sm font-bold text-[var(--pb-orange)]">
              {activeMilestone.title}
            </p>
          </div>
        )}
        {nextMilestone && (
          <div className="bg-[var(--pb-surface-elevated)] rounded-xl p-4 border border-[var(--pb-border-subtle)]">
            <p className="text-xs text-[var(--pb-text-subtle)] mb-1">Next Milestone</p>
            <p className="text-sm font-bold text-white">{nextMilestone.title}</p>
            {nextMilestone.plannedStartDate && (
              <p className="text-xs text-[var(--pb-text-muted)] mt-0.5 flex items-center gap-1">
                <CalendarDays className="h-3 w-3" />
                {formatDate(nextMilestone.plannedStartDate)}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Latest update */}
      {latestUpdate && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold text-white">Latest Update</h2>
            <Link
              href={`/dashboard/projects/${projectId}/updates`}
              className="text-xs text-[var(--pb-text-muted)] hover:text-[var(--pb-orange)] flex items-center gap-1 transition-colors"
            >
              All updates <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="bg-[var(--pb-surface-elevated)] border border-[var(--pb-border)] rounded-xl p-5">
            <div className="flex items-start justify-between gap-3 mb-2">
              <h3 className="font-semibold text-white">
                {latestUpdate.update.title}
              </h3>
              {latestUpdate.update.progressDelta > 0 && (
                <Badge variant="success" className="shrink-0">
                  +{latestUpdate.update.progressDelta}%
                </Badge>
              )}
            </div>
            <p className="text-sm text-[var(--pb-text-muted)] leading-relaxed mb-3">
              {latestUpdate.update.body}
            </p>
            <p className="text-xs text-[var(--pb-text-subtle)] flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatRelativeDate(latestUpdate.update.createdAt)} ·{" "}
              {latestUpdate.authorFirstName} {latestUpdate.authorLastName}
            </p>
          </div>
        </div>
      )}

      {/* Timeline */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-white">Project Timeline</h2>
          <Link
            href={`/dashboard/projects/${projectId}/milestones`}
            className="text-xs text-[var(--pb-text-muted)] hover:text-[var(--pb-orange)] flex items-center gap-1 transition-colors"
          >
            View details <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        <div className="space-y-2">
          {allMilestones.map((milestone) => {
            const done =
              milestone.status === "APPROVED" ||
              milestone.status === "COMPLETED";
            const active = milestone.status === "IN_PROGRESS";
            return (
              <div
                key={milestone.id}
                className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                  active
                    ? "bg-[var(--pb-orange-muted)] border border-[var(--pb-orange)]/20"
                    : "bg-[var(--pb-surface-elevated)] border border-[var(--pb-border-subtle)]"
                }`}
              >
                <div className="shrink-0">
                  {done ? (
                    <CheckCircle2 className="h-4 w-4 text-[var(--pb-success)]" />
                  ) : active ? (
                    <Clock className="h-4 w-4 text-[var(--pb-orange)]" />
                  ) : (
                    <Circle className="h-4 w-4 text-[var(--pb-border)]" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-sm font-medium truncate ${
                        done
                          ? "text-[var(--pb-text-muted)] line-through decoration-[var(--pb-border)]"
                          : active
                          ? "text-white"
                          : "text-[var(--pb-text-muted)]"
                      }`}
                    >
                      {milestone.title}
                    </span>
                    {active && (
                      <Badge variant="default" className="text-[10px] py-0 shrink-0">
                        In Progress
                      </Badge>
                    )}
                    {milestone.approvalStatus === "AWAITING_CLIENT" && (
                      <Badge variant="warning" className="text-[10px] py-0 shrink-0">
                        Needs Review
                      </Badge>
                    )}
                  </div>
                </div>
                <span className="text-xs text-[var(--pb-text-subtle)] shrink-0">
                  {milestone.weightPercent}%
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
