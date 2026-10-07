export const dynamic = 'force-dynamic';

import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { projects, milestones, notifications } from "@/db/schema";
import { eq, and, desc, count } from "drizzle-orm";
import Link from "next/link";
import { formatCurrency, formatRelativeDate } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { ArrowRight, Bell, FolderOpen, Plus, Clock } from "lucide-react";

function getHealthBadgeVariant(
  health: string
): "success" | "warning" | "danger" | "secondary" {
  switch (health) {
    case "ON_TRACK":
      return "success";
    case "AT_RISK":
    case "DELAYED":
      return "warning";
    case "CANCELLED":
      return "danger";
    default:
      return "secondary";
  }
}

function getHealthLabel(health: string): string {
  const map: Record<string, string> = {
    ON_TRACK: "On Track",
    AT_RISK: "At Risk",
    DELAYED: "Delayed",
    COMPLETED: "Completed",
    ON_HOLD: "On Hold",
    CANCELLED: "Cancelled",
  };
  return map[health] ?? health;
}

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  // Fetch client's projects
  const clientProjects = await db
    .select()
    .from(projects)
    .where(eq(projects.clientId, session.id))
    .orderBy(desc(projects.updatedAt));

  // Unread notifications count
  const [{ value: unreadCount }] = await db
    .select({ value: count() })
    .from(notifications)
    .where(
      and(eq(notifications.userId, session.id), eq(notifications.isRead, false))
    );

  const activeProjects = clientProjects.filter(
    (p) => p.status === "ACTIVE" || p.status === "CONTRACT"
  );

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Greeting */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">
            {greeting}, {session.firstName}.
          </h1>
          <p className="text-[var(--pb-text-muted)] mt-1">
            {activeProjects.length === 0
              ? "No active projects yet."
              : activeProjects.length === 1
              ? "You have 1 active project."
              : `You have ${activeProjects.length} active projects.`}
          </p>
        </div>
        {unreadCount > 0 && (
          <Link href="/dashboard/notifications">
            <div className="flex items-center gap-2 bg-[var(--pb-orange-muted)] border border-[var(--pb-orange)]/30 text-[var(--pb-orange)] text-sm px-3 py-2 rounded-lg">
              <Bell className="h-4 w-4" />
              {unreadCount} new
            </div>
          </Link>
        )}
      </div>

      {/* No projects state */}
      {clientProjects.length === 0 && (
        <Card className="text-center p-12">
          <div className="h-16 w-16 rounded-xl bg-[var(--pb-orange-muted)] flex items-center justify-center mx-auto mb-4">
            <FolderOpen className="h-8 w-8 text-[var(--pb-orange)]" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">No projects yet</h2>
          <p className="text-[var(--pb-text-muted)] mb-6 max-w-sm mx-auto">
            Your construction projects will appear here once ProxyBuild sets
            them up for you.
          </p>
          <Button asChild>
            <Link href="/book-consultation">
              <Plus className="h-4 w-4" />
              Book a Consultation
            </Link>
          </Button>
        </Card>
      )}

      {/* Project cards */}
      {clientProjects.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Your Projects</h2>
            <Link
              href="/dashboard/projects"
              className="text-sm text-[var(--pb-text-muted)] hover:text-white flex items-center gap-1 transition-colors"
            >
              View all <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="grid gap-4">
            {clientProjects.slice(0, 5).map((project) => (
              <Link
                key={project.id}
                href={`/dashboard/projects/${project.id}`}
                className="block group"
              >
                <Card className="hover:border-[var(--pb-orange)]/30 transition-colors cursor-pointer">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div>
                        <h3 className="text-base font-bold text-white group-hover:text-[var(--pb-orange)] transition-colors">
                          {project.title}
                        </h3>
                        <p className="text-sm text-[var(--pb-text-muted)] mt-0.5">
                          {[project.area, project.city, project.state]
                            .filter(Boolean)
                            .join(", ")}
                        </p>
                      </div>
                      <Badge variant={getHealthBadgeVariant(project.health)}>
                        {getHealthLabel(project.health)}
                      </Badge>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-[var(--pb-text-muted)]">
                          Progress
                        </span>
                        <span className="font-semibold text-[var(--pb-orange)]">
                          {project.progressPercent}%
                        </span>
                      </div>
                      <Progress value={project.progressPercent} />
                    </div>

                    {project.budgetAmount && (
                      <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-[var(--pb-border)]">
                        <div>
                          <p className="text-xs text-[var(--pb-text-subtle)]">
                            Budget
                          </p>
                          <p className="text-sm font-semibold text-white">
                            {formatCurrency(
                              project.budgetAmount,
                              project.currency
                            )}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-[var(--pb-text-subtle)]">
                            Status
                          </p>
                          <p className="text-sm font-semibold text-white capitalize">
                            {project.status.toLowerCase().replace(/_/g, " ")}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-[var(--pb-text-subtle)]">
                            Updated
                          </p>
                          <p className="text-sm text-[var(--pb-text-muted)]">
                            <Clock className="inline h-3 w-3 mr-1" />
                            {formatRelativeDate(project.updatedAt)}
                          </p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
