export const dynamic = "force-dynamic";

import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { isStaff } from "@/lib/permissions";
import { getProjectForUser, getProjectUpdates, getProjectMilestones } from "@/lib/services/projects";
import Link from "next/link";
import { PostUpdateForm } from "@/components/admin/post-update-form";
import { Badge } from "@/components/ui/badge";
import { formatRelativeDate } from "@/lib/utils";
import { TrendingUp } from "lucide-react";

export default async function AdminProjectUpdatesPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!isStaff(session)) redirect("/dashboard");

  const { projectId } = await params;
  const [project, updates, milestones] = await Promise.all([
    getProjectForUser(projectId, session),
    getProjectUpdates(projectId, false),
    getProjectMilestones(projectId, false),
  ]);
  if (!project) notFound();

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <div className="flex items-center gap-2 mb-1 text-sm">
          <Link
            href={`/admin/projects/${projectId}`}
            className="text-[var(--pb-text-muted)] hover:text-white transition-colors"
          >
            {project.title}
          </Link>
          <span className="text-[var(--pb-border)]">/</span>
          <span className="text-white">Updates</span>
        </div>
        <h1 className="text-2xl font-bold text-white">Post Update</h1>
      </div>

      <PostUpdateForm
        projectId={projectId}
        currentProgress={project.progressPercent}
        milestones={milestones.map((m) => ({ id: m.id, title: m.title }))}
      />

      {/* Existing updates */}
      {updates.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-[var(--pb-text-muted)] uppercase tracking-wide mb-3">
            Previous Updates ({updates.length})
          </h2>
          <div className="space-y-3">
            {updates.map(({ update, authorFirstName, authorLastName }) => (
              <article
                key={update.id}
                className="bg-[var(--pb-surface-elevated)] border border-[var(--pb-border-subtle)] rounded-xl p-4"
              >
                <div className="flex items-center justify-between gap-2 mb-1">
                  <p className="text-sm font-semibold text-white">
                    {update.title}
                  </p>
                  <div className="flex gap-2 shrink-0">
                    {update.progressDelta > 0 && (
                      <Badge variant="success">+{update.progressDelta}%</Badge>
                    )}
                    {!update.isPublished && (
                      <Badge variant="secondary">Draft</Badge>
                    )}
                    {!update.isClientVisible && (
                      <Badge variant="warning">Internal</Badge>
                    )}
                  </div>
                </div>
                <p className="text-sm text-[var(--pb-text-muted)] line-clamp-2 mb-2">
                  {update.body}
                </p>
                <p className="text-xs text-[var(--pb-text-subtle)]">
                  {authorFirstName} {authorLastName} ·{" "}
                  {formatRelativeDate(update.createdAt)}
                </p>
              </article>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
