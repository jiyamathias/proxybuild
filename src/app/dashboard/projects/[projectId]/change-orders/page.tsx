export const dynamic = "force-dynamic";

import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { getProjectForUser } from "@/lib/services/projects";
import { getProjectChangeOrders } from "@/lib/services/finance";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatRelativeDate } from "@/lib/utils";
import { ChangeOrderApproveButton } from "@/components/dashboard/project/change-order-approve-button";
import { ClipboardList, CalendarDays, DollarSign } from "lucide-react";

const statusVariant: Record<string, "success" | "warning" | "danger" | "secondary"> = {
  DRAFT: "secondary",
  SUBMITTED: "warning",
  UNDER_REVIEW: "warning",
  APPROVED: "success",
  REJECTED: "danger",
  IMPLEMENTED: "success",
};

export default async function ChangeOrdersPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  const { projectId } = await params;
  const [project, changeOrders] = await Promise.all([
    getProjectForUser(projectId, session),
    getProjectChangeOrders(projectId),
  ]);
  if (!project) notFound();

  const currency = project.currency ?? "NGN";
  const pendingCount = changeOrders.filter(
    (co) => co.status === "SUBMITTED" || co.status === "UNDER_REVIEW"
  ).length;

  if (changeOrders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <ClipboardList className="h-10 w-10 text-[var(--pb-border)] mb-4" />
        <h3 className="text-base font-semibold text-white mb-1">
          No change orders
        </h3>
        <p className="text-sm text-[var(--pb-text-muted)]">
          Change orders will appear here when your project scope is adjusted.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {pendingCount > 0 && (
        <div className="bg-[var(--pb-orange-muted)] border border-[var(--pb-orange)]/20 rounded-xl p-4">
          <p className="text-sm font-semibold text-white">
            {pendingCount} change order{pendingCount > 1 ? "s" : ""} awaiting your
            review
          </p>
          <p className="text-xs text-[var(--pb-text-muted)] mt-0.5">
            Review each one below and approve or request changes.
          </p>
        </div>
      )}

      {changeOrders.map((co) => {
        const needsApproval =
          co.status === "SUBMITTED" || co.status === "UNDER_REVIEW";
        return (
          <div
            key={co.id}
            className={`border rounded-xl p-5 ${
              needsApproval
                ? "border-[var(--pb-orange)]/40 bg-[var(--pb-surface-elevated)]"
                : "border-[var(--pb-border-subtle)] bg-[var(--pb-surface-elevated)]"
            }`}
          >
            <div className="flex items-start justify-between gap-3 mb-3">
              <h3 className="font-semibold text-white">{co.title}</h3>
              <Badge variant={statusVariant[co.status] ?? "secondary"}>
                {co.status.replace(/_/g, " ")}
              </Badge>
            </div>

            <p className="text-sm text-[var(--pb-text-muted)] leading-relaxed mb-3 whitespace-pre-wrap">
              {co.description}
            </p>

            {co.reason && (
              <div className="mb-3 p-3 bg-[var(--pb-surface)] rounded-lg border border-[var(--pb-border-subtle)]">
                <p className="text-xs text-[var(--pb-text-subtle)] mb-0.5">
                  Reason
                </p>
                <p className="text-sm text-[var(--pb-text-muted)]">
                  {co.reason}
                </p>
              </div>
            )}

            <div className="flex flex-wrap gap-4 mb-3 text-xs text-[var(--pb-text-subtle)]">
              {co.costImpact && (
                <span className="flex items-center gap-1">
                  <DollarSign className="h-3 w-3" />
                  Cost impact:{" "}
                  <span className="font-semibold text-white">
                    +{formatCurrency(Number(co.costImpact), currency)}
                  </span>
                </span>
              )}
              {co.timelineImpactDays && (
                <span className="flex items-center gap-1">
                  <CalendarDays className="h-3 w-3" />
                  Timeline impact:{" "}
                  <span className="font-semibold text-white">
                    +{co.timelineImpactDays} days
                  </span>
                </span>
              )}
              <span>{formatRelativeDate(co.createdAt)}</span>
            </div>

            {needsApproval && (
              <div className="pt-3 border-t border-[var(--pb-orange)]/20">
                <ChangeOrderApproveButton
                  changeOrderId={co.id}
                  projectId={projectId}
                />
              </div>
            )}

            {co.clientApproved === true && (
              <p className="text-sm text-[var(--pb-success)] flex items-center gap-1.5 pt-2 border-t border-[var(--pb-border-subtle)]">
                ✓ You approved this change order
              </p>
            )}
            {co.clientApproved === false && (
              <p className="text-sm text-[var(--pb-danger)] flex items-center gap-1.5 pt-2 border-t border-[var(--pb-border-subtle)]">
                ✗ You rejected this change order
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
