export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { canManageFinance } from "@/lib/permissions";
import { db } from "@/lib/db";
import { projects, budgets, budgetItems } from "@/db/schema";
import { eq } from "drizzle-orm";
import { BudgetEditor } from "@/components/admin/finance/budget-editor";
import { DollarSign } from "lucide-react";

export default async function BudgetEditorPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const session = await getSession();
  if (!session || !canManageFinance(session)) redirect("/admin");

  const { projectId } = await params;

  const [project] = await db
    .select({ id: projects.id, title: projects.title })
    .from(projects)
    .where(eq(projects.id, projectId))
    .limit(1);

  if (!project) redirect("/admin/finance");

  const [existingBudget] = await db
    .select()
    .from(budgets)
    .where(eq(budgets.projectId, projectId))
    .limit(1);

  const existingItems = existingBudget
    ? await db
        .select()
        .from(budgetItems)
        .where(eq(budgetItems.budgetId, existingBudget.id))
    : [];

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <DollarSign className="h-6 w-6 text-[var(--pb-text-muted)]" />
          Budget Editor
        </h1>
        <p className="text-sm text-[var(--pb-text-muted)] mt-0.5">
          {project.title}
        </p>
      </div>

      <BudgetEditor
        projectId={projectId}
        existing={
          existingBudget
            ? {
                id: existingBudget.id,
                totalAmount: existingBudget.totalAmount,
                notes: existingBudget.notes,
                currency: existingBudget.currency,
              }
            : null
        }
        existingItems={existingItems.map((i) => ({
          id: i.id,
          category: i.category,
          description: i.description,
          amount: i.amount,
          quantity: i.quantity,
          unitCost: i.unitCost,
        }))}
      />
    </div>
  );
}
