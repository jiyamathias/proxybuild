export const dynamic = "force-dynamic";

import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { getProjectForUser, getProjectUpdates } from "@/lib/services/projects";
import { Badge } from "@/components/ui/badge";
import { formatRelativeDate, getInitials } from "@/lib/utils";
import { TrendingUp, Clock } from "lucide-react";

export default async function UpdatesPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  const { projectId } = await params;
  const [project, updates] = await Promise.all([
    getProjectForUser(projectId, session),
    getProjectUpdates(projectId, true),
  ]);
  if (!project) notFound();

  if (updates.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <TrendingUp className="h-10 w-10 text-[var(--pb-border)] mb-4" />
        <h3 className="text-base font-semibold text-white mb-1">No updates yet</h3>
        <p className="text-sm text-[var(--pb-text-muted)]">
          Updates will appear here as your project progresses.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {updates.map(({ update, authorFirstName, authorLastName }) => {
        const authorName =
          authorFirstName || authorLastName
            ? `${authorFirstName ?? ""} ${authorLastName ?? ""}`.trim()
            : "ProxyBuild Team";
        const [first = "", last = ""] = authorName.split(" ");
        const initials = getInitials(first, last);

        return (
          <article
            key={update.id}
            className="bg-[var(--pb-surface-elevated)] border border-[var(--pb-border)] rounded-xl p-5"
          >
            <div className="flex items-start justify-between gap-3 mb-3">
              <h3 className="font-semibold text-white">{update.title}</h3>
              <div className="flex items-center gap-2 shrink-0">
                {update.progressDelta > 0 && (
                  <Badge variant="success">+{update.progressDelta}%</Badge>
                )}
              </div>
            </div>

            <p className="text-sm text-[var(--pb-text-muted)] leading-relaxed mb-4 whitespace-pre-wrap">
              {update.body}
            </p>

            <div className="flex items-center gap-3 pt-3 border-t border-[var(--pb-border-subtle)]">
              <div className="h-7 w-7 rounded-full bg-[var(--pb-green)]/20 flex items-center justify-center shrink-0">
                <span className="text-xs font-semibold text-[var(--pb-green)]">
                  {initials}
                </span>
              </div>
              <div>
                <p className="text-xs font-medium text-white">{authorName}</p>
                <p className="text-xs text-[var(--pb-text-subtle)] flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {formatRelativeDate(update.createdAt)}
                </p>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}
