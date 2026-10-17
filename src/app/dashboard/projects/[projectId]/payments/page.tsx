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
import { MakePaymentButton } from "@/components/dashboard/project/make-payment-button";
import { DollarSign, CheckCircle2, Clock, XCircle } from "lucide-react";
import { db } from "@/lib/db";
import { profiles } from "@/db/schema";
import { eq } from "drizzle-orm";
import { approxLabel } from "@/lib/fx";

function paymentStatusBadge(status: string) {
  const map: Record<string, { variant: "success" | "warning" | "danger" | "secondary"; label: string }> = {
    SUCCESSFUL: { variant: "success", label: "Successful" },
    PENDING: { variant: "warning", label: "Pending" },
    PROCESSING: { variant: "warning", label: "Processing" },
    FAILED: { variant: "danger", label: "Failed" },
    REFUNDED: { variant: "secondary", label: "Refunded" },
    PARTIALLY_REFUNDED: { variant: "secondary", label: "Partial Refund" },
    CANCELLED: { variant: "secondary", label: "Cancelled" },
  };
  return map[status] ?? { variant: "secondary", label: status };
}

function paymentStatusIcon(status: string) {
  switch (status) {
    case "SUCCESSFUL":
      return <CheckCircle2 className="h-4 w-4 text-[var(--pb-success)]" />;
    case "PENDING":
    case "PROCESSING":
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
  const successfulTotal = payments
    .filter((p) => p.status === "SUCCESSFUL")
    .reduce((sum, p) => sum + Number(p.amount), 0);
  const budgetAmount = budget
    ? Number(budget.totalAmount)
    : Number(project.budgetAmount ?? 0);
  const paidPercent = budgetAmount > 0 ? (successfulTotal / budgetAmount) * 100 : 0;
  const remaining = budgetAmount - successfulTotal;

  const outstanding = Math.max(0, remaining);
  const isClient = project.clientId === session.id;

  // Indicative conversion for clients who think in their country's currency
  const [{ preferredCurrency }] = await db
    .select({ preferredCurrency: profiles.preferredCurrency })
    .from(profiles)
    .where(eq(profiles.userId, session.id))
    .limit(1);

  const outstandingApprox = await approxLabel(
    outstanding,
    currency,
    preferredCurrency
  );

  return (
    <div className="space-y-6">
      {/* What's owed — the client's first question */}
      <div className="bg-[var(--pb-surface-elevated)] border border-[var(--pb-border)] rounded-xl p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-5">
          <div>
            <p className="text-xs text-[var(--pb-text-subtle)] uppercase tracking-wide mb-1">
              {outstanding > 0 ? "Outstanding Balance" : "Balance"}
            </p>
            <p className="text-3xl font-bold text-white">
              {formatCurrency(outstanding, currency)}
            </p>
            {outstandingApprox && (
              <p className="text-sm text-[var(--pb-text-subtle)] mt-0.5">
                {outstandingApprox}{" "}
                <span className="text-xs">· indicative rate</span>
              </p>
            )}
            {budgetAmount > 0 && (
              <p className="text-sm text-[var(--pb-text-muted)] mt-1">
                {formatCurrency(successfulTotal, currency)} paid of{" "}
                {formatCurrency(budgetAmount, currency)}
              </p>
            )}
          </div>

          {isClient && (
            <MakePaymentButton
              projectId={projectId}
              currency={currency}
              suggestedAmount={outstanding}
            />
          )}
        </div>

        {budgetAmount > 0 && (
          <>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs text-[var(--pb-text-muted)]">
                {Math.round(paidPercent)}% paid
              </span>
              {outstanding === 0 && (
                <span className="text-xs text-[var(--pb-success)] font-medium">
                  Fully paid
                </span>
              )}
            </div>
            <Progress value={paidPercent} className="h-2" />
          </>
        )}
      </div>

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
                      {payment.description ?? "Payment"}
                    </p>
                    <p className="text-xs text-[var(--pb-text-subtle)] mt-0.5">
                      {payment.provider ?? "—"} ·{" "}
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
