export const dynamic = "force-dynamic";

import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import {
  getProjectForUser,
  getProjectPayments,
  getProjectBudget,
} from "@/lib/services/projects";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { formatCurrency, formatDate } from "@/lib/utils";
import { DollarSign, CheckCircle2, Clock, XCircle } from "lucide-react";

function paymentStatusBadge(status: string) {
  const map: Record<string, { variant: "success" | "warning" | "danger" | "secondary"; label: string }> = {
    CONFIRMED: { variant: "success", label: "Confirmed" },
    PENDING: { variant: "warning", label: "Pending" },
    FAILED: { variant: "danger", label: "Failed" },
    REFUNDED: { variant: "secondary", label: "Refunded" },
  };
  return map[status] ?? { variant: "secondary", label: status };
}

function paymentStatusIcon(status: string) {
  switch (status) {
    case "CONFIRMED":
      return <CheckCircle2 className="h-4 w-4 text-[var(--pb-success)]" />;
    case "PENDING":
      return <Clock className="h-4 w-4 text-yellow-500" />;
    case "FAILED":
      return <XCircle className="h-4 w-4 text-[var(--pb-danger)]" />;
    default:
      return <DollarSign className="h-4 w-4 text-[var(--pb-text-muted)]" />;
  }
}

export default async function PaymentsPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  const { projectId } = await params;
  const [project, payments, budget] = await Promise.all([
    getProjectForUser(projectId, session),
    getProjectPayments(projectId),
    getProjectBudget(projectId),
  ]);
  if (!project) notFound();

  const currency = project.currency ?? "NGN";
  const confirmedTotal = payments
    .filter((p) => p.status === "CONFIRMED")
    .reduce((sum, p) => sum + Number(p.amount), 0);
  const budgetAmount = budget
    ? Number(budget.totalBudget)
    : Number(project.budgetAmount ?? 0);
  const paidPercent = budgetAmount > 0 ? (confirmedTotal / budgetAmount) * 100 : 0;
  const remaining = budgetAmount - confirmedTotal;

  return (
    <div className="space-y-6">
      {/* Budget summary */}
      {budgetAmount > 0 && (
        <div className="bg-[var(--pb-surface-elevated)] border border-[var(--pb-border)] rounded-xl p-5">
          <h2 className="text-sm font-semibold text-white mb-4">
            Payment Summary
          </h2>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div>
              <p className="text-xs text-[var(--pb-text-subtle)]">Total Budget</p>
              <p className="text-base font-bold text-white">
                {formatCurrency(budgetAmount, currency)}
              </p>
            </div>
            <div>
              <p className="text-xs text-[var(--pb-text-subtle)]">Paid</p>
              <p className="text-base font-bold text-[var(--pb-success)]">
                {formatCurrency(confirmedTotal, currency)}
              </p>
            </div>
            <div>
              <p className="text-xs text-[var(--pb-text-subtle)]">Remaining</p>
              <p className="text-base font-bold text-white">
                {formatCurrency(Math.max(0, remaining), currency)}
              </p>
            </div>
          </div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs text-[var(--pb-text-muted)]">
              {Math.round(paidPercent)}% paid
            </span>
          </div>
          <Progress value={paidPercent} className="h-2" />
        </div>
      )}

      {/* Payment list */}
      {payments.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <DollarSign className="h-10 w-10 text-[var(--pb-border)] mb-4" />
          <h3 className="text-base font-semibold text-white mb-1">
            No payments yet
          </h3>
          <p className="text-sm text-[var(--pb-text-muted)]">
            Payment records will appear here as they are processed.
          </p>
        </div>
      ) : (
        <div>
          <h2 className="text-sm font-semibold text-[var(--pb-text-muted)] uppercase tracking-wide mb-3">
            Payment History ({payments.length})
          </h2>
          <div className="space-y-2">
            {payments.map((payment) => {
              const { variant, label } = paymentStatusBadge(payment.status);
              return (
                <div
                  key={payment.id}
                  className="flex items-center gap-4 bg-[var(--pb-surface-elevated)] border border-[var(--pb-border-subtle)] rounded-xl p-4"
                >
                  <div className="h-10 w-10 rounded-lg bg-[var(--pb-surface)] border border-[var(--pb-border-subtle)] flex items-center justify-center shrink-0">
                    {paymentStatusIcon(payment.status)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white">
                      {payment.description ?? payment.paymentType.replace(/_/g, " ")}
                    </p>
                    <p className="text-xs text-[var(--pb-text-subtle)] mt-0.5">
                      {payment.paymentMethod?.replace(/_/g, " ") ?? "—"} ·{" "}
                      {formatDate(payment.paidAt ?? payment.createdAt)}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold text-white">
                      {formatCurrency(Number(payment.amount), payment.currency ?? currency)}
                    </p>
                    <Badge variant={variant} className="mt-1">
                      {label}
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
