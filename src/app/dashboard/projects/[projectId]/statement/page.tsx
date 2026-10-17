export const dynamic = "force-dynamic";

import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import {
  getProjectForUser,
  getProjectPayments,
  getProjectBudget,
} from "@/lib/services/projects";
import { formatCurrency, formatDate } from "@/lib/utils";
import { PrintButton } from "@/components/dashboard/print-button";

export default async function StatementPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  const { projectId } = await params;
  const [project, allPayments, budget] = await Promise.all([
    getProjectForUser(projectId, session),
    getProjectPayments(projectId),
    getProjectBudget(projectId),
  ]);
  if (!project) notFound();

  const currency = project.currency ?? "NGN";
  const settled = allPayments.filter((p) => p.status === "SUCCESSFUL");
  const paid = settled.reduce((sum, p) => sum + Number(p.amount), 0);
  const contracted = budget
    ? Number(budget.totalAmount)
    : Number(project.budgetAmount ?? 0);
  const outstanding = Math.max(0, contracted - paid);

  const issued = new Date();

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-4 print:hidden">
        <h1 className="text-lg font-semibold text-white">Project Statement</h1>
        <PrintButton label="Download / Print" />
      </div>

      <article className="bg-white text-neutral-900 rounded-xl p-8 sm:p-10 print:p-0 print:rounded-none">
        <header className="flex items-start justify-between gap-6 pb-6 border-b border-neutral-200">
          <div>
            <p className="text-xl font-bold tracking-tight">ProxyBuild Africa</p>
            <p className="text-xs text-neutral-500 mt-0.5">
              Construction execution for the diaspora
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs uppercase tracking-wide text-neutral-500">
              Statement of Account
            </p>
            <p className="text-sm font-semibold">{formatDate(issued)}</p>
          </div>
        </header>

        <section className="grid grid-cols-2 gap-6 py-6 border-b border-neutral-200">
          <div>
            <p className="text-xs uppercase tracking-wide text-neutral-500 mb-1">
              Client
            </p>
            <p className="text-sm font-medium">
              {session.firstName} {session.lastName}
            </p>
            <p className="text-sm text-neutral-600">{session.email}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-neutral-500 mb-1">
              Project
            </p>
            <p className="text-sm font-medium">{project.title}</p>
            {(project.city || project.state) && (
              <p className="text-sm text-neutral-600">
                {[project.area, project.city, project.state]
                  .filter(Boolean)
                  .join(", ")}
              </p>
            )}
          </div>
        </section>

        {/* Summary */}
        <section className="py-6 border-b border-neutral-200">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-xs uppercase tracking-wide text-neutral-500 mb-1">
                Contracted
              </p>
              <p className="text-base font-semibold">
                {formatCurrency(contracted, currency)}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-neutral-500 mb-1">
                Paid to Date
              </p>
              <p className="text-base font-semibold text-green-700">
                {formatCurrency(paid, currency)}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-neutral-500 mb-1">
                Outstanding
              </p>
              <p className="text-base font-semibold">
                {formatCurrency(outstanding, currency)}
              </p>
            </div>
          </div>
        </section>

        {/* Ledger */}
        <section className="py-6">
          <p className="text-xs uppercase tracking-wide text-neutral-500 mb-3">
            Payments Received
          </p>

          {settled.length === 0 ? (
            <p className="text-sm text-neutral-500">
              No payments have been received on this project yet.
            </p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-neutral-500">
                  <th className="pb-2 font-medium">Date</th>
                  <th className="pb-2 font-medium">Description</th>
                  <th className="pb-2 font-medium">Reference</th>
                  <th className="pb-2 font-medium text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {settled.map((p) => (
                  <tr key={p.id} className="border-t border-neutral-200">
                    <td className="py-2.5 whitespace-nowrap">
                      {formatDate(p.paidAt ?? p.createdAt)}
                    </td>
                    <td className="py-2.5">{p.description ?? "Project payment"}</td>
                    <td className="py-2.5 font-mono text-xs text-neutral-500">
                      {p.txRef ?? p.providerReference ?? "—"}
                    </td>
                    <td className="py-2.5 text-right font-medium whitespace-nowrap">
                      {formatCurrency(Number(p.amount), p.currency ?? currency)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-neutral-900">
                  <td className="pt-3 font-semibold" colSpan={3}>
                    Total Received
                  </td>
                  <td className="pt-3 text-right text-base font-bold whitespace-nowrap">
                    {formatCurrency(paid, currency)}
                  </td>
                </tr>
              </tfoot>
            </table>
          )}
        </section>

        <footer className="pt-6 border-t border-neutral-200">
          <p className="text-xs text-neutral-500 leading-relaxed">
            Statement generated {formatDate(issued)} and reflects payments recorded
            as at that date. For questions, contact hello@proxybuild.africa.
          </p>
        </footer>
      </article>
    </div>
  );
}
