export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { projects } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { formatCurrency } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { FolderOpen, MapPin, ArrowRight, Plus } from "lucide-react";

function healthVariant(
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

const HEALTH_LABEL: Record<string, string> = {
  ON_TRACK: "On Track",
  AT_RISK: "At Risk",
  DELAYED: "Delayed",
  COMPLETED: "Completed",
  ON_HOLD: "On Hold",
  CANCELLED: "Cancelled",
};

export default async function ClientProjectsPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const clientProjects = await db
    .select()
    .from(projects)
    .where(eq(projects.clientId, session.id))
    .orderBy(desc(projects.updatedAt));

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <FolderOpen className="h-6 w-6 text-[var(--pb-text-muted)]" />
          Your Projects
        </h1>
        <p className="text-sm text-[var(--pb-text-muted)] mt-0.5">
          {clientProjects.length === 0
            ? "No projects yet"
            : `${clientProjects.length} ${clientProjects.length === 1 ? "project" : "projects"}`}
        </p>
      </div>

      {clientProjects.length === 0 ? (
        <Card className="text-center p-12">
          <div className="h-16 w-16 rounded-xl bg-[var(--pb-green-muted)] flex items-center justify-center mx-auto mb-4">
            <FolderOpen className="h-8 w-8 text-[var(--pb-green)]" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">No projects yet</h2>
          <p className="text-[var(--pb-text-muted)] mb-6 max-w-sm mx-auto">
            Your construction projects will appear here once ProxyBuild sets them
            up for you.
          </p>
          <Button asChild>
            <Link href="/book-consultation">
              <Plus className="h-4 w-4" />
              Book a Consultation
            </Link>
          </Button>
        </Card>
      ) : (
        <div className="grid gap-4">
          {clientProjects.map((project) => (
            <Link
              key={project.id}
              href={`/dashboard/projects/${project.id}`}
              className="block group"
            >
              <Card className="hover:border-[var(--pb-green)]/30 transition-colors">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="min-w-0">
                      <h2 className="text-base font-semibold text-white truncate">
                        {project.title}
                      </h2>
                      {(project.city || project.state) && (
                        <p className="text-sm text-[var(--pb-text-muted)] mt-0.5 flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5 shrink-0" />
                          {[project.area, project.city, project.state]
                            .filter(Boolean)
                            .join(", ")}
                        </p>
                      )}
                    </div>
                    <Badge variant={healthVariant(project.health)}>
                      {HEALTH_LABEL[project.health] ?? project.health}
                    </Badge>
                  </div>

                  <div className="space-y-1.5 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-[var(--pb-text-muted)]">
                        Overall Progress
                      </span>
                      <span className="text-white font-medium">
                        {project.progressPercent}%
                      </span>
                    </div>
                    <Progress value={project.progressPercent} />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-[var(--pb-text-subtle)]">
                        Contract Value
                      </p>
                      <p className="text-sm font-semibold text-white">
                        {project.contractValue
                          ? formatCurrency(
                              Number(project.contractValue),
                              project.currency
                            )
                          : "—"}
                      </p>
                    </div>
                    <span className="text-sm text-[var(--pb-text-muted)] group-hover:text-white flex items-center gap-1 transition-colors">
                      View <ArrowRight className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
