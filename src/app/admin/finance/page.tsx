export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { isStaff, canManageFinance } from "@/lib/permissions";
import { db } from "@/lib/db";
import { projects, payments, budgets, changeOrders } from "@/db/schema";
import { eq, desc, sum, count, and } from "drizzle-orm";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { formatCurrency, formatDate, formatRelativeDate } from "@/lib/utils";
import {
  DollarSign,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  Building2,
} from "lucide-react";

export default async function AdminFinancePage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!isStaff(session)) redirect("/dashboard");

  const allProjects = await db
    .select({
      project: projects,
    })
    .from(projects)
    .where(eq(projects.status, "ACTIVE"))
    .orderBy(desc(projects.updatedAt));

  const projectIds = allProjects.map((p) => p.project.id);

  // For each active project, get financials in parallel
  const financials = await Promise.all(
    allProjects.map(async ({ project }) => {
      const [budget, successfulPayments, pendingChangeOrders] =
        await Promise.all([
          db
            .select()
            .from(budgets)
            .where(eq(budgets.projectId, project.id))
            .limit(1)
            .then((r) => r[0] ?? null),

          db
            .select()
            .from(payments)
            .where(
              and(
                eq(payments.projectId, project.id),
                eq(payments.status, "SUCCESSFUL")
              )
            ),

          db
            .select({ cnt: count() })
            .from(changeOrders)
            .where(
              and(
                eq(changeOrders.projectId, project.id),
                eq(changeOrders.status, "SUBMITTED")
              )
            )
            .then((r) => r[0]?.cnt ?? 0),
        ]);

      const totalBudget = budget ? Number(budget.totalAmount) : Number(project.budgetAmount ?? 0);
      const totalPaid = successfulPayments.reduce((s, p) => s + Number(p.amount), 0);
      const paidPercent = totalBudget > 0 ? (totalPaid / totalBudget) * 100 : 0;

      return {
        project,
        budget,
        totalBudget,
        totalPaid,
        paidPercent,
        pendingChangeOrders: Number(pendingChangeOrders),
      };
    })
  );

  const totalBudgetAllProjects = financials.reduce((s, f) => s + f.totalBudget, 0);
  const totalPaidAllProjects = financials.reduce((s, f) => s + f.totalPaid, 0);
  const pendingChangeOrdersTotal = financials.reduce(
    (s, f) => s + f.pendingChangeOrders,
    0
  );
  const overallPercent =
    totalBudgetAllProjects > 0
      ? (totalPaidAllProjects / totalBudgetAllProjects) * 100
      : 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Finance Overview</h1>
        <p className="text-sm text-[var(--pb-text-muted)] mt-0.5">
          {allProjects.length} active projects
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-[var(--pb-surface-elevated)] border border-[var(--pb-border)] rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="h-4 w-4 text-[var(--pb-green)]" />
            <p className="text-xs text-[var(--pb-text-muted)]">Total Budget</p>
          </div>
          <p className="text-xl font-bold text-white">
            {formatCurrency(totalBudgetAllProjects, "NGN")}
          </p>
        </div>
        <div className="bg-[var(--pb-surface-elevated)] border border-[var(--pb-border)] rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="h-4 w-4 text-[var(--pb-success)]" />
            <p className="text-xs text-[var(--pb-text-muted)]">Total Received</p>
          </div>
          <p className="text-xl font-bold text-[var(--pb-success)]">
            {formatCurrency(totalPaidAllProjects, "NGN")}
          </p>
        </div>
        <div className="bg-[var(--pb-surface-elevated)] border border-[var(--pb-border)] rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-4 w-4 text-blue-400" />
            <p className="text-xs text-[var(--pb-text-muted)]">Outstanding</p>
          </div>
          <p className="text-xl font-bold text-white">
            {formatCurrency(
              Math.max(0, totalBudgetAllProjects - totalPaidAllProjects),
              "NGN"
            )}
          </p>
        </div>
        <div className="bg-[var(--pb-surface-elevated)] border border-[var(--pb-border)] rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="h-4 w-4 text-yellow-500" />
            <p className="text-xs text-[var(--pb-text-muted)]">Change Orders</p>
          </div>
          <p className="text-xl font-bold text-yellow-400">
            {pendingChangeOrdersTotal} pending
          </p>
        </div>
      </div>

      {/* Overall collection bar */}
      {totalBudgetAllProjects > 0 && (
        <div className="bg-[var(--pb-surface-elevated)] border border-[var(--pb-border)] rounded-xl p-5">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-semibold text-white">
              Overall Collection Rate
            </p>
            <span className="text-sm font-bold text-[var(--pb-green)]">
              {Math.round(overallPercent)}%
            </span>
          </div>
          <Progress value={overallPercent} className="h-2" />
        </div>
      )}

      {/* Per-project breakdown */}
      <div>
        <h2 className="text-sm font-semibold text-[var(--pb-text-muted)] uppercase tracking-wide mb-3">
          Project Breakdown
        </h2>
        {financials.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Building2 className="h-10 w-10 text-[var(--pb-border)] mb-4" />
            <p className="text-sm text-[var(--pb-text-muted)]">
              No active projects.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {financials.map(
              ({
                project,
                totalBudget,
                totalPaid,
                paidPercent,
                pendingChangeOrders,
              }) => (
                <Link
                  key={project.id}
                  href={`/admin/finance/${project.id}`}
                  className="block bg-[var(--pb-surface-elevated)] border border-[var(--pb-border-subtle)] rounded-xl p-5 hover:border-[var(--pb-border)] transition-colors"
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <h3 className="font-semibold text-white">{project.title}</h3>
                      <p className="text-xs text-[var(--pb-text-muted)] mt-0.5">
                        {project.city}, {project.country}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {pendingChangeOrders > 0 && (
                        <Badge variant="warning">
                          {pendingChangeOrders} CO
                        </Badge>
                      )}
                      <ArrowRight className="h-4 w-4 text-[var(--pb-text-subtle)]" />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3 mb-3 text-xs">
                    <div>
                      <p className="text-[var(--pb-text-subtle)]">Budget</p>
                      <p className="font-semibold text-white">
                        {totalBudget > 0
                          ? formatCurrency(totalBudget, project.currency ?? "NGN")
                          : "—"}
                      </p>
                    </div>
                    <div>
                      <p className="text-[var(--pb-text-subtle)]">Paid</p>
                      <p className="font-semibold text-[var(--pb-success)]">
                        {formatCurrency(totalPaid, project.currency ?? "NGN")}
                      </p>
                    </div>
                    <div>
                      <p className="text-[var(--pb-text-subtle)]">Remaining</p>
                      <p className="font-semibold text-white">
                        {formatCurrency(
                          Math.max(0, totalBudget - totalPaid),
                          project.currency ?? "NGN"
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Progress value={paidPercent} className="h-1.5 flex-1" />
                    <span className="text-xs text-[var(--pb-text-subtle)] w-10 text-right">
                      {Math.round(paidPercent)}%
                    </span>
                  </div>
                </Link>
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
}
