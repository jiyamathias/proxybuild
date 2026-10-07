export const dynamic = "force-dynamic";

import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { isStaff } from "@/lib/permissions";
import {
  getProjectForUser,
  getProjectMilestones,
  getProjectUpdates,
  getProjectDocuments,
  getProjectPayments,
  getProjectBudget,
  getProjectMessages,
} from "@/lib/services/projects";
import { db } from "@/lib/db";
import { projectMembers, users, profiles } from "@/db/schema";
import { eq } from "drizzle-orm";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { formatCurrency, formatDate, formatRelativeDate } from "@/lib/utils";
import {
  MapPin,
  Users,
  CheckCircle2,
  Clock,
  Circle,
  DollarSign,
  FileText,
  MessageSquare,
  CalendarDays,
  Building2,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

function healthVariant(h: string): "success" | "warning" | "danger" | "secondary" {
  const map: Record<string, "success" | "warning" | "danger" | "secondary"> = {
    ON_TRACK: "success", AT_RISK: "warning", DELAYED: "warning",
    COMPLETED: "secondary", ON_HOLD: "secondary", CANCELLED: "danger",
  };
  return map[h] ?? "secondary";
}

export default async function AdminProjectDetailPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!isStaff(session)) redirect("/dashboard");

  const { projectId } = await params;

  const [project, milestones, recentUpdates, documents, payments, budget, messages, members] =
    await Promise.all([
      getProjectForUser(projectId, session),
      getProjectMilestones(projectId, false),
      getProjectUpdates(projectId, false),
      getProjectDocuments(projectId, false),
      getProjectPayments(projectId),
      getProjectBudget(projectId),
      getProjectMessages(projectId),
      db
        .select({
          userId: projectMembers.userId,
          role: projectMembers.role,
          firstName: profiles.firstName,
          lastName: profiles.lastName,
          email: users.email,
          userRole: users.role,
        })
        .from(projectMembers)
        .leftJoin(users, eq(users.id, projectMembers.userId))
        .leftJoin(profiles, eq(profiles.userId, projectMembers.userId))
        .where(eq(projectMembers.projectId, projectId)),
    ]);

  if (!project) notFound();

  const location = [project.area, project.city, project.state].filter(Boolean).join(", ");
  const confirmedPaid = payments
    .filter((p) => p.status === "SUCCESSFUL")
    .reduce((s, p) => s + Number(p.amount), 0);
  const budgetTotal = budget ? Number(budget.totalAmount) : Number(project.budgetAmount ?? 0);
  const completedMilestones = milestones.filter(
    (m) => m.status === "APPROVED" || m.status === "COMPLETED"
  ).length;
  const awaitingApproval = milestones.filter(
    (m) => m.approvalStatus === "AWAITING_CLIENT"
  ).length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link
              href="/admin/projects"
              className="text-sm text-[var(--pb-text-muted)] hover:text-white transition-colors"
            >
              Projects
            </Link>
            <span className="text-[var(--pb-border)]">/</span>
            <span className="text-sm text-white">{project.title}</span>
          </div>
          {location && (
            <p className="text-sm text-[var(--pb-text-muted)] flex items-center gap-1 mb-1">
              <MapPin className="h-3.5 w-3.5" />
              {location}
            </p>
          )}
          <h1 className="text-2xl font-bold text-white">{project.title}</h1>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Badge variant={healthVariant(project.health)}>
            {project.health.replace(/_/g, " ")}
          </Badge>
          <Button variant="secondary" size="sm" asChild>
            <Link href={`/admin/projects/${projectId}/edit`}>Edit Project</Link>
          </Button>
        </div>
      </div>

      {/* Progress */}
      <div className="bg-[var(--pb-surface-elevated)] border border-[var(--pb-border)] rounded-xl p-5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-white">Overall Progress</span>
          <span className="text-sm font-bold text-[var(--pb-green)]">
            {project.progressPercent}%
          </span>
        </div>
        <Progress value={project.progressPercent} className="h-2 mb-4" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <p className="text-xs text-[var(--pb-text-subtle)]">Status</p>
            <p className="text-sm font-semibold text-white capitalize">
              {project.status.toLowerCase().replace(/_/g, " ")}
            </p>
          </div>
          <div>
            <p className="text-xs text-[var(--pb-text-subtle)]">Budget</p>
            <p className="text-sm font-semibold text-white">
              {budgetTotal > 0
                ? formatCurrency(budgetTotal, project.currency ?? "NGN")
                : "—"}
            </p>
          </div>
          <div>
            <p className="text-xs text-[var(--pb-text-subtle)]">Paid</p>
            <p className="text-sm font-semibold text-[var(--pb-success)]">
              {formatCurrency(confirmedPaid, project.currency ?? "NGN")}
            </p>
          </div>
          {project.plannedEndDate && (
            <div>
              <p className="text-xs text-[var(--pb-text-subtle)]">Est. End</p>
              <p className="text-sm font-semibold text-white">
                {formatDate(project.plannedEndDate)}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Two-column grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Milestones */}
        <section className="bg-[var(--pb-surface-elevated)] border border-[var(--pb-border)] rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-white">
              Milestones
              {awaitingApproval > 0 && (
                <Badge variant="warning" className="ml-2">
                  {awaitingApproval} pending
                </Badge>
              )}
            </h2>
            <span className="text-xs text-[var(--pb-text-muted)]">
              {completedMilestones}/{milestones.length}
            </span>
          </div>
          <div className="space-y-2">
            {milestones.slice(0, 8).map((m) => {
              const done = m.status === "APPROVED" || m.status === "COMPLETED";
              const active = m.status === "IN_PROGRESS";
              return (
                <div key={m.id} className="flex items-center gap-2.5">
                  {done ? (
                    <CheckCircle2 className="h-4 w-4 text-[var(--pb-success)] shrink-0" />
                  ) : active ? (
                    <Clock className="h-4 w-4 text-[var(--pb-green)] shrink-0" />
                  ) : (
                    <Circle className="h-4 w-4 text-[var(--pb-border)] shrink-0" />
                  )}
                  <span
                    className={`text-sm flex-1 truncate ${
                      done
                        ? "text-[var(--pb-text-muted)] line-through"
                        : active
                        ? "text-white"
                        : "text-[var(--pb-text-muted)]"
                    }`}
                  >
                    {m.title}
                  </span>
                  {m.approvalStatus === "AWAITING_CLIENT" && (
                    <Badge variant="warning" className="text-[10px] py-0">
                      Review
                    </Badge>
                  )}
                </div>
              );
            })}
            {milestones.length > 8 && (
              <p className="text-xs text-[var(--pb-text-subtle)] pt-1">
                +{milestones.length - 8} more
              </p>
            )}
          </div>
        </section>

        {/* Team members */}
        <section className="bg-[var(--pb-surface-elevated)] border border-[var(--pb-border)] rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-white flex items-center gap-2">
              <Users className="h-4 w-4 text-[var(--pb-text-muted)]" />
              Team ({members.length})
            </h2>
          </div>
          {members.length === 0 ? (
            <p className="text-sm text-[var(--pb-text-muted)]">
              No team members assigned yet.
            </p>
          ) : (
            <div className="space-y-2">
              {members.map((m) => {
                const name =
                  m.firstName || m.lastName
                    ? `${m.firstName ?? ""} ${m.lastName ?? ""}`.trim()
                    : m.email ?? "Unknown";
                const initials = name
                  .split(" ")
                  .map((p) => p[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase();
                return (
                  <div key={m.userId} className="flex items-center gap-3">
                    <div className="h-7 w-7 rounded-full bg-[var(--pb-green)]/20 flex items-center justify-center shrink-0">
                      <span className="text-xs font-semibold text-[var(--pb-green)]">
                        {initials}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">
                        {name}
                      </p>
                      <p className="text-xs text-[var(--pb-text-subtle)]">
                        {m.role?.replace(/_/g, " ") ?? m.userRole}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Recent updates */}
        <section className="bg-[var(--pb-surface-elevated)] border border-[var(--pb-border)] rounded-xl p-5">
          <h2 className="text-base font-semibold text-white mb-4">
            Recent Updates
          </h2>
          {recentUpdates.length === 0 ? (
            <p className="text-sm text-[var(--pb-text-muted)]">No updates posted.</p>
          ) : (
            <div className="space-y-3">
              {recentUpdates.slice(0, 4).map(({ update, authorFirstName, authorLastName }) => (
                <div key={update.id} className="border-l-2 border-[var(--pb-border)] pl-3">
                  <p className="text-sm font-medium text-white">{update.title}</p>
                  <p className="text-xs text-[var(--pb-text-subtle)] mt-0.5">
                    {authorFirstName} {authorLastName} ·{" "}
                    {formatRelativeDate(update.createdAt)}
                  </p>
                </div>
              ))}
            </div>
          )}
          <div className="mt-3 pt-3 border-t border-[var(--pb-border-subtle)]">
            <Link
              href={`/admin/projects/${projectId}/updates`}
              className="text-xs text-[var(--pb-green)] hover:underline"
            >
              Post update →
            </Link>
          </div>
        </section>

        {/* Documents */}
        <section className="bg-[var(--pb-surface-elevated)] border border-[var(--pb-border)] rounded-xl p-5">
          <h2 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
            <FileText className="h-4 w-4 text-[var(--pb-text-muted)]" />
            Documents ({documents.length})
          </h2>
          {documents.length === 0 ? (
            <p className="text-sm text-[var(--pb-text-muted)]">No documents yet.</p>
          ) : (
            <div className="space-y-2">
              {documents.slice(0, 5).map(({ doc }) => (
                <div key={doc.id} className="flex items-center gap-2">
                  <FileText className="h-3.5 w-3.5 text-[var(--pb-text-subtle)] shrink-0" />
                  <span className="text-sm text-[var(--pb-text-muted)] truncate flex-1">
                    {doc.title}
                  </span>
                  <span className="text-xs text-[var(--pb-text-subtle)] shrink-0">
                    {doc.category}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Messages */}
      <section className="bg-[var(--pb-surface-elevated)] border border-[var(--pb-border)] rounded-xl p-5">
        <h2 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-[var(--pb-text-muted)]" />
          Messages ({messages.length})
        </h2>
        {messages.length === 0 ? (
          <p className="text-sm text-[var(--pb-text-muted)]">No messages yet.</p>
        ) : (
          <div className="space-y-2">
            {messages.slice(-3).map(({ message, senderFirstName, senderLastName, senderRole }) => {
              const name =
                senderFirstName || senderLastName
                  ? `${senderFirstName ?? ""} ${senderLastName ?? ""}`.trim()
                  : "Team";
              return (
                <div key={message.id} className="flex gap-3">
                  <div className="h-6 w-6 rounded-full bg-[var(--pb-surface)] border border-[var(--pb-border-subtle)] flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-[10px] font-bold text-[var(--pb-text-muted)]">
                      {name[0]?.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-white">{name}</span>
                      <span className="text-[10px] text-[var(--pb-text-subtle)]">
                        {formatRelativeDate(message.createdAt)}
                      </span>
                    </div>
                    <p className="text-sm text-[var(--pb-text-muted)] truncate">
                      {message.body}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        <div className="mt-3 pt-3 border-t border-[var(--pb-border-subtle)]">
          <Link
            href={`/admin/projects/${projectId}/messages`}
            className="text-xs text-[var(--pb-green)] hover:underline"
          >
            Open full thread →
          </Link>
        </div>
      </section>
    </div>
  );
}
