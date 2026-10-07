export const dynamic = "force-dynamic";

import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { isStaff } from "@/lib/permissions";
import { getProjectForUser, getProjectMilestones } from "@/lib/services/projects";
import { AddExpenseForm } from "@/components/admin/finance/add-expense-form";
import Link from "next/link";

export default async function AddExpensePage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!isStaff(session)) redirect("/dashboard");

  const { projectId } = await params;
  const [project, milestones] = await Promise.all([
    getProjectForUser(projectId, session),
    getProjectMilestones(projectId, false),
  ]);
  if (!project) notFound();

  return (
    <div className="max-w-xl space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-1 text-sm">
          <Link
            href={`/admin/finance/${projectId}`}
            className="text-[var(--pb-text-muted)] hover:text-white transition-colors"
          >
            {project.title}
          </Link>
          <span className="text-[var(--pb-border)]">/</span>
          <span className="text-white">Log Expense</span>
        </div>
        <h1 className="text-2xl font-bold text-white">Log Expense</h1>
      </div>
      <AddExpenseForm
        projectId={projectId}
        currency={project.currency ?? "NGN"}
        milestones={milestones.map((m) => ({ id: m.id, title: m.title }))}
      />
    </div>
  );
}
