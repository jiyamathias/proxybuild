export const dynamic = 'force-dynamic';

import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import {
  projects,
  consultations,
  users,
  payments,
} from "@/db/schema";
import { eq, count, and, ne, desc } from "drizzle-orm";
import Link from "next/link";
import { formatCurrency, formatRelativeDate } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  FolderOpen,
  Users,
  ClipboardList,
  DollarSign,
  AlertTriangle,
  TrendingUp,
  Clock,
  CheckCircle2,
} from "lucide-react";

export default async function AdminOverviewPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  // Stats
  const [
    [{ activeProjectCount }],
    [{ atRiskCount }],
    [{ newConsultationCount }],
    [{ clientCount }],
    recentProjects,
    recentConsultations,
  ] = await Promise.all([
    db
      .select({ activeProjectCount: count() })
      .from(projects)
      .where(eq(projects.status, "ACTIVE")),
    db
      .select({ atRiskCount: count() })
      .from(projects)
      .where(
        and(
          eq(projects.health, "AT_RISK"),
          ne(projects.status, "CANCELLED")
        )
      ),
    db
      .select({ newConsultationCount: count() })
      .from(consultations)
      .where(eq(consultations.status, "NEW")),
    db
      .select({ clientCount: count() })
      .from(users)
      .where(eq(users.role, "CLIENT")),
    db
      .select()
      .from(projects)
      .orderBy(desc(projects.updatedAt))
      .limit(5),
    db
      .select()
      .from(consultations)
      .orderBy(desc(consultations.createdAt))
      .limit(5),
  ]);

  const stats = [
    {
      icon: FolderOpen,
      label: "Active Projects",
      value: activeProjectCount,
      href: "/admin/projects",
      color: "text-[var(--pb-green)]",
    },
    {
      icon: AlertTriangle,
      label: "Projects At Risk",
      value: atRiskCount,
      href: "/admin/projects?health=AT_RISK",
      color: atRiskCount > 0 ? "text-amber-400" : "text-[var(--pb-text-muted)]",
    },
    {
      icon: ClipboardList,
      label: "New Consultations",
      value: newConsultationCount,
      href: "/admin/consultations",
      color:
        newConsultationCount > 0
          ? "text-blue-400"
          : "text-[var(--pb-text-muted)]",
    },
    {
      icon: Users,
      label: "Total Clients",
      value: clientCount,
      href: "/admin/clients",
      color: "text-[var(--pb-text-muted)]",
    },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white">
          Admin Overview
        </h1>
        <p className="text-[var(--pb-text-muted)] mt-1">
          ProxyBuild operations dashboard
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Link key={stat.label} href={stat.href}>
            <Card className="hover:border-[var(--pb-green)]/30 transition-colors cursor-pointer">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
                <p className={`text-3xl font-bold ${stat.color} mb-1`}>
                  {stat.value}
                </p>
                <p className="text-sm text-[var(--pb-text-muted)]">
                  {stat.label}
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Projects */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Recent Projects</CardTitle>
              <Link
                href="/admin/projects"
                className="text-xs text-[var(--pb-text-muted)] hover:text-[var(--pb-green)] transition-colors"
              >
                View all
              </Link>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            {recentProjects.length === 0 ? (
              <p className="text-sm text-[var(--pb-text-subtle)] py-4 text-center">
                No projects yet
              </p>
            ) : (
              <div className="space-y-4">
                {recentProjects.map((project) => (
                  <Link
                    key={project.id}
                    href={`/admin/projects/${project.id}`}
                    className="block group"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <p className="text-sm font-medium text-white group-hover:text-[var(--pb-green)] transition-colors truncate">
                        {project.title}
                      </p>
                      <Badge
                        variant={
                          project.health === "ON_TRACK"
                            ? "success"
                            : project.health === "AT_RISK"
                            ? "warning"
                            : "secondary"
                        }
                        className="shrink-0 ml-2"
                      >
                        {project.health === "ON_TRACK"
                          ? "On Track"
                          : project.health === "AT_RISK"
                          ? "At Risk"
                          : project.health}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3">
                      <Progress
                        value={project.progressPercent}
                        className="flex-1 h-1.5"
                      />
                      <span className="text-xs text-[var(--pb-text-muted)] shrink-0">
                        {project.progressPercent}%
                      </span>
                    </div>
                    <p className="text-xs text-[var(--pb-text-subtle)] mt-1">
                      {[project.city, project.state].filter(Boolean).join(", ")}
                      {" · "}
                      {formatRelativeDate(project.updatedAt)}
                    </p>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Consultations */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">
                Recent Consultation Requests
              </CardTitle>
              <Link
                href="/admin/consultations"
                className="text-xs text-[var(--pb-text-muted)] hover:text-[var(--pb-green)] transition-colors"
              >
                View all
              </Link>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            {recentConsultations.length === 0 ? (
              <p className="text-sm text-[var(--pb-text-subtle)] py-4 text-center">
                No consultation requests yet
              </p>
            ) : (
              <div className="space-y-3">
                {recentConsultations.map((c) => (
                  <Link
                    key={c.id}
                    href={`/admin/consultations/${c.id}`}
                    className="block group"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-medium text-white group-hover:text-[var(--pb-green)] transition-colors">
                          {c.firstName} {c.lastName}
                        </p>
                        <p className="text-xs text-[var(--pb-text-muted)]">
                          {c.projectLocation} · {c.countryOfResidence}
                        </p>
                        <p className="text-xs text-[var(--pb-text-subtle)] mt-0.5 flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatRelativeDate(c.createdAt)}
                        </p>
                      </div>
                      <Badge
                        variant={
                          c.status === "NEW"
                            ? "info"
                            : c.status === "CONTACTED"
                            ? "success"
                            : "secondary"
                        }
                        className="shrink-0"
                      >
                        {c.status}
                      </Badge>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
