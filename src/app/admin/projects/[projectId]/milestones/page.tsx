export const dynamic = "force-dynamic";

import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth/session";
import { canManageProjects } from "@/lib/permissions";
import { db } from "@/lib/db";
import { projects, milestones } from "@/db/schema";
import { eq, asc } from "drizzle-orm";
import { MilestoneManager } from "@/components/admin/project/milestone-manager";
import { ArrowLeft } from "lucide-react";

export default async function AdminProjectMilestonesPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const session = await getSession();
  if (!session || !canManageProjects(session)) redirect("/login");

  const { projectId } = await params;

  const [project] = await db
    .select({ id: projects.id, title: projects.title, status: projects.status })
    .from(projects)
    .where(eq(projects.id, projectId))
    .limit(1);
  if (!project) notFound();

  const milestoneRows = await db
    .select()
    .from(milestones)
    .where(eq(milestones.projectId, projectId))
    .orderBy(asc(milestones.sequence));

  // Serialise dates for client component
  const serialised = milestoneRows.map((m) => ({
    ...m,
    plannedStartDate: m.plannedStartDate?.toISOString() ?? null,
    plannedEndDate: m.plannedEndDate?.toISOString() ?? null,
    actualStartDate: m.actualStartDate?.toISOString() ?? null,
    actualEndDate: m.actualEndDate?.toISOString() ?? null,
    createdAt: m.createdAt.toISOString(),
    updatedAt: m.updatedAt.toISOString(),
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href={`/admin/projects/${projectId}`}
          className="text-[var(--pb-text-muted)] hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-white">Milestones</h1>
          <p className="text-sm text-[var(--pb-text-muted)]">{project.title}</p>
        </div>
      </div>

      <div className="bg-[var(--pb-surface-elevated)] border border-[var(--pb-border)] rounded-xl p-6">
        <MilestoneManager
          projectId={projectId}
          initialMilestones={serialised as any}
        />
      </div>
    </div>
  );
}
