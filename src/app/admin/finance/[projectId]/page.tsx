export const dynamic = "force-dynamic";

import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { isStaff } from "@/lib/permissions";
import { getProjectForUser } from "@/lib/services/projects";
import { getProjectFinancials } from "@/lib/services/finance";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { formatCurrency, formatDate, formatRelativeDate } from "@/lib/utils";
import {
  DollarSign,
  CheckCircle2,
  Clock,
  ArrowRight,
  BookOpen,
  ClipboardList,
  Plus,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const categoryLabel: Record<string, string> = {
  MATERIAL: "Materials",
  LABOUR: "Labour",
  CONTRACTOR: "Contractor",
  PROFESSIONAL_FEES: "Professional Fees",
  LOGISTICS: "Logistics",
  PROXYBUILD_FEE: "ProxyBuild Fee",
  CONTINGENCY: "Contingency",
  OTHER: "Other",
};

const ledgerTypeLabel: Record<string, string> = {
  CLIENT_PAYMENT: "Client Payment",
  MATERIAL_COST: "Material Cost",
  LABOUR_COST: "Labour Cost",
  CONTRACTOR_COST: "Contractor Cost",
  PROFESSIONAL_FEE: "Professional Fee",
  LOGISTICS: "Logistics",
  OTHER_EXPENSE: "Other Expense",
  REFUND: "Refund",
  ADJUSTMENT: "Adjustment",
  CHANGE_ORDER: "Change Order",
  PROXYBUILD_FEE: "ProxyBuild Fee",
};

function isIncome(type: string) {
  return type === "CLIENT_PAYMENT" || type === "REFUND";
}

export default async function AdminProjectFinancePage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!isStaff(session)) redirect("/dashboard");

  const { projectId } = await params;
  const [project, financials] = await Promise.all([
    getProjectForUser(projectId, session),
    getProjectFinancials(projectId),
  ]);
  if (!project) notFound();

  const { budget, budgetItems, payments, ledger, changeOrders } = financials;

  const currency = project.currency ?? "NGN";
  const totalBudget = budget ? Number(budget.totalAmount) : Number(project.budgetAmount ?? 0);
  const successfulPaid = payments
    .filter((p) => p.payment.status === "SUCCESSFUL")
    .reduce((s, p) => s + Number(p.payment.amount), 0);
  const paidPercent = totalBudget > 0 ? (successfulPaid / totalBudget) * 100 : 0;

  // Ledger totals
  const totalIncome = ledger
    .filter((e) => isIncome(e.entry.entryType))
    .reduce((s, e) => s + Number(e.entry.amount), 0);
  const totalExpenses = ledger
    .filter((e) => !isIncome(e.entry.entryType))
    .reduce((s, e) => s + Number(e.entry.amount), 0);

  // Budget items by category
  const itemsByCategory = budgetItems.reduce<
    Record<string, typeof budgetItems>
  >((acc, item) => {
    const cat = item.item.category;
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {});

  const pendingCOs = changeOrders.filter(
    (co) => co.status === "SUBMITTED" || co.status === "UNDER_REVIEW"
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1 text-sm">
            <Link
              href="/admin/finance"
              className="text-[var(--pb-text-muted)] hover:text-white transition-colors"
            >
              Finance
            </Link>
            <span className="text-[var(--pb-border)]">/</span>
            <span className="text-white">{project.title}</span>
          </div>
          <h1 className="text-2xl font-bold text-white">{project.title}</h1>
        </div>
        <div className="flex gap-2 shrink-0">
          <Button variant="secondary" size="sm" asChild>
            <Link href={`/admin/finance/${projectId}/record-payment`}>
              <Plus className="h-3.5 w-3.5 mr-1.5" />
              Record Payment
            </Link>
          </Button>
          <Button variant="secondary" size="sm" asChild>
            <Link href={`/admin/finance/${projectId}/add-expense`}>
              <Plus className="h-3.5 w-3.5 mr-1.5" />
              Log Expense
            </Link>
          </Button>
        </div>
      </div>

      {/* Financial summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-[var(--pb-surface-elevated)] border border-[var(--pb-border)] rounded-xl p-4">
          <p className="text-xs text-[var(--pb-text-subtle)] mb-1">Total Budget</p>
          <p className="text-lg font-bold text-white">
            {totalBudget > 0 ? formatCurrency(totalBudget, currency) : "—"}
          </p>
        </div>
        <div className="bg-[var(--pb-surface-elevated)] border border-[var(--pb-border)] rounded-xl p-4">
          <p className="text-xs text-[var(--pb-text-subtle)] mb-1">Payments Received</p>
          <p className="text-lg font-bold text-[var(--pb-success)]">
            {formatCurrency(successfulPaid, currency)}
          </p>
        </div>
        <div className="bg-[var(--pb-surface-elevated)] border border-[var(--pb-border)] rounded-xl p-4">
          <p className="text-xs text-[var(--pb-text-subtle)] mb-1">Total Expenses</p>
          <p className="text-lg font-bold text-red-400">
            {formatCurrency(totalExpenses, currency)}
          </p>
        </div>
        <div className="bg-[var(--pb-surface-elevated)] border border-[var(--pb-border)] rounded-xl p-4">
          <p className="text-xs text-[var(--pb-text-subtle)] mb-1">Net Position</p>
          <p
            className={`text-lg font-bold ${
              totalIncome - totalExpenses >= 0
                ? "text-[var(--pb-success)]"
                : "text-red-400"
            }`}
          >
            {formatCurrency(totalIncome - totalExpenses, currency)}
          </p>
        </div>
      </div>

      {/* Payment collection bar */}
      {totalBudget > 0 && (
        <div className="bg-[var(--pb-surface-elevated)] border border-[var(--pb-border)] rounded-xl p-5">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-semibold text-white">
              Payment Collection
            </p>
            <span className="text-sm font-bold text-[var(--pb-green)]">
              {Math.round(paidPercent)}%
            </span>
          </div>
          <Progress value={paidPercent} className="h-2" />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Budget breakdown */}
        <section className="bg-[var(--pb-surface-elevated)] border border-[var(--pb-border)] rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-white flex items-center gap-2">
              <ClipboardList className="h-4 w-4 text-[var(--pb-text-muted)]" />
              Budget Breakdown
            </h2>
            {budgetItems.length > 0 && (
              <Link
                href={`/admin/finance/${projectId}/budget`}
                className="text-xs text-[var(--pb-green)] hover:underline"
              >
                Edit budget →
              </Link>
            )}
          </div>
          {budgetItems.length === 0 ? (
            <div className="flex flex-col items-center py-6 text-center">
              <p className="text-sm text-[var(--pb-text-muted)] mb-3">
                No budget items yet.
              </p>
              <Button variant="outline" size="sm" asChild>
                <Link href={`/admin/finance/${projectId}/budget`}>
                  <Plus className="h-3.5 w-3.5 mr-1.5" />
                  Set up budget
                </Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {Object.entries(itemsByCategory).map(([category, items]) => {
                const total = items.reduce(
                  (s, i) => s + Number(i.item.amount),
                  0
                );
                const pct =
                  totalBudget > 0 ? (total / totalBudget) * 100 : 0;
                return (
                  <div key={category}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-[var(--pb-text-muted)]">
                        {categoryLabel[category] ?? category}
                      </span>
                      <span className="text-xs font-semibold text-white">
                        {formatCurrency(total, currency)}
                      </span>
                    </div>
                    <Progress value={pct} className="h-1" />
                  </div>
                );
              })}
              <div className="pt-2 border-t border-[var(--pb-border-subtle)] flex justify-between">
                <span className="text-xs font-semibold text-[var(--pb-text-muted)]">
                  Total
                </span>
                <span className="text-xs font-bold text-white">
                  {formatCurrency(
                    budgetItems.reduce((s, i) => s + Number(i.item.amount), 0),
                    currency
                  )}
                </span>
              </div>
            </div>
          )}
        </section>

        {/* Payments */}
        <section className="bg-[var(--pb-surface-elevated)] border border-[var(--pb-border)] rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-white flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-[var(--pb-text-muted)]" />
              Payments ({payments.length})
            </h2>
            <Link
              href={`/admin/finance/${projectId}/record-payment`}
              className="text-xs text-[var(--pb-green)] hover:underline"
            >
              + Record
            </Link>
          </div>
          {payments.length === 0 ? (
            <p className="text-sm text-[var(--pb-text-muted)]">
              No payments recorded.
            </p>
          ) : (
            <div className="space-y-2">
              {payments.slice(0, 6).map(
                ({ payment, payerFirstName, payerLastName }) => (
                  <div
                    key={payment.id}
                    className="flex items-center justify-between gap-2"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white truncate">
                        {payment.description ?? "Payment"}
                      </p>
                      <p className="text-xs text-[var(--pb-text-subtle)]">
                        {payerFirstName} {payerLastName} ·{" "}
                        {formatDate(payment.paidAt ?? payment.createdAt)}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-semibold text-white">
                        {formatCurrency(Number(payment.amount), currency)}
                      </p>
                      <Badge
                        variant={
                          payment.status === "SUCCESSFUL" ? "success" : "warning"
                        }
                        className="text-[10px]"
                      >
                        {payment.status}
                      </Badge>
                    </div>
                  </div>
                )
              )}
            </div>
          )}
        </section>
      </div>

      {/* Ledger */}
      <section className="bg-[var(--pb-surface-elevated)] border border-[var(--pb-border)] rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-white flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-[var(--pb-text-muted)]" />
            Ledger ({ledger.length} entries)
          </h2>
          <Link
            href={`/admin/finance/${projectId}/add-expense`}
            className="text-xs text-[var(--pb-green)] hover:underline"
          >
            + Log expense
          </Link>
        </div>
        {ledger.length === 0 ? (
          <p className="text-sm text-[var(--pb-text-muted)]">
            No ledger entries yet.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--pb-border-subtle)]">
                  <th className="text-left text-xs text-[var(--pb-text-subtle)] font-medium py-2 pr-4">
                    Date
                  </th>
                  <th className="text-left text-xs text-[var(--pb-text-subtle)] font-medium py-2 pr-4">
                    Type
                  </th>
                  <th className="text-left text-xs text-[var(--pb-text-subtle)] font-medium py-2 pr-4">
                    Description
                  </th>
                  <th className="text-right text-xs text-[var(--pb-text-subtle)] font-medium py-2">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--pb-border-subtle)]">
                {ledger.map(({ entry, recorderFirstName, recorderLastName }) => (
                  <tr key={entry.id}>
                    <td className="py-2.5 pr-4 text-xs text-[var(--pb-text-subtle)] whitespace-nowrap">
                      {formatDate(entry.entryDate)}
                    </td>
                    <td className="py-2.5 pr-4">
                      <Badge
                        variant={isIncome(entry.entryType) ? "success" : "secondary"}
                        className="text-[10px]"
                      >
                        {ledgerTypeLabel[entry.entryType] ?? entry.entryType}
                      </Badge>
                    </td>
                    <td className="py-2.5 pr-4 text-[var(--pb-text-muted)] max-w-xs truncate">
                      {entry.description}
                    </td>
                    <td
                      className={`py-2.5 text-right font-semibold whitespace-nowrap ${
                        isIncome(entry.entryType)
                          ? "text-[var(--pb-success)]"
                          : "text-red-400"
                      }`}
                    >
                      {isIncome(entry.entryType) ? "+" : "−"}
                      {formatCurrency(Number(entry.amount), currency)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t border-[var(--pb-border)]">
                  <td
                    colSpan={3}
                    className="py-2.5 text-xs font-semibold text-[var(--pb-text-muted)]"
                  >
                    Net
                  </td>
                  <td
                    className={`py-2.5 text-right font-bold ${
                      totalIncome - totalExpenses >= 0
                        ? "text-[var(--pb-success)]"
                        : "text-red-400"
                    }`}
                  >
                    {formatCurrency(totalIncome - totalExpenses, currency)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </section>

      {/* Change orders */}
      <section className="bg-[var(--pb-surface-elevated)] border border-[var(--pb-border)] rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-white">
            Change Orders ({changeOrders.length})
            {pendingCOs.length > 0 && (
              <Badge variant="warning" className="ml-2">
                {pendingCOs.length} pending
              </Badge>
            )}
          </h2>
          <Link
            href={`/admin/finance/${projectId}/change-orders/new`}
            className="text-xs text-[var(--pb-green)] hover:underline"
          >
            + New CO
          </Link>
        </div>
        {changeOrders.length === 0 ? (
          <p className="text-sm text-[var(--pb-text-muted)]">
            No change orders.
          </p>
        ) : (
          <div className="space-y-2">
            {changeOrders.map((co) => {
              const statusVariantMap: Record<string, "success" | "warning" | "danger" | "secondary"> = {
                DRAFT: "secondary",
                SUBMITTED: "warning",
                UNDER_REVIEW: "warning",
                APPROVED: "success",
                REJECTED: "danger",
                IMPLEMENTED: "success",
              };
              return (
                <Link
                  key={co.id}
                  href={`/admin/finance/${projectId}/change-orders/${co.id}`}
                  className="flex items-center gap-3 p-3 rounded-lg border border-[var(--pb-border-subtle)] hover:border-[var(--pb-border)] transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">
                      {co.title}
                    </p>
                    <p className="text-xs text-[var(--pb-text-subtle)]">
                      {formatRelativeDate(co.createdAt)}
                      {co.costImpact ? ` · ${formatCurrency(Number(co.costImpact), currency)}` : ""}
                    </p>
                  </div>
                  <Badge variant={statusVariantMap[co.status] ?? "secondary"}>
                    {co.status.replace(/_/g, " ")}
                  </Badge>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
