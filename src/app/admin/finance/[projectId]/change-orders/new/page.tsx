export const dynamic = "force-dynamic";

import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { isStaff } from "@/lib/permissions";
import { getProjectForUser } from "@/lib/services/projects";
import { NewChangeOrderForm } from "@/components/admin/finance/new-change-order-form";
import Link from "next/link";

export default async function NewChangeOrderPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!isStaff(session)) redirect("/dashboard");

  const { projectId } = await params;
  const project = await getProjectForUser(projectId, session);
  if (!project) notFound();

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-1 text-sm">
          <Link
            href={`/admin/finance/${projectId}`}
            className="text-[var(--pb-text-muted)] hover:text-white transition-colors"
          >
            {project.title}
          </Link>
          <span className="text-[var(--pb-border)]">/</span>
          <span className="text-white">New Change Order</span>
        </div>
        <h1 className="text-2xl font-bold text-white">New Change Order</h1>
      </div>
      <div className="max-w-2xl">
        <NewChangeOrderForm
          projectId={projectId}
          currency={project.currency ?? "NGN"}
        />
      </div>
    </div>
  );
}
