export const dynamic = "force-dynamic";

import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { getProjectForUser } from "@/lib/services/projects";
import { db } from "@/lib/db";
import { payments, profiles } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { formatCurrency, formatDate } from "@/lib/utils";
import { PrintButton } from "@/components/dashboard/print-button";

export default async function ReceiptPage({
  params,
}: {
  params: Promise<{ projectId: string; paymentId: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  const { projectId, paymentId } = await params;
  const project = await getProjectForUser(projectId, session);
  if (!project) notFound();

  const [payment] = await db
    .select()
    .from(payments)
    .where(and(eq(payments.id, paymentId), eq(payments.projectId, projectId)))
    .limit(1);

  if (!payment) notFound();
  // A receipt only exists for money actually received
  if (payment.status !== "SUCCESSFUL") notFound();

  const [payer] = payment.payerId
    ? await db
        .select({ firstName: profiles.firstName, lastName: profiles.lastName })
        .from(profiles)
        .where(eq(profiles.userId, payment.payerId))
        .limit(1)
    : [undefined];

  const payerName = payer
    ? `${payer.firstName} ${payer.lastName}`.trim()
    : `${session.firstName} ${session.lastName}`.trim();

  const reference = payment.txRef ?? payment.id.slice(0, 18).toUpperCase();

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-4 print:hidden">
        <h1 className="text-lg font-semibold text-white">Payment Receipt</h1>
        <PrintButton label="Download / Print" />
      </div>

      {/* Printable document — forced to light so it prints legibly */}
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
              Receipt
            </p>
            <p className="text-sm font-semibold">{reference}</p>
          </div>
        </header>

        <section className="grid grid-cols-2 gap-6 py-6 border-b border-neutral-200">
          <div>
            <p className="text-xs uppercase tracking-wide text-neutral-500 mb-1">
              Received From
            </p>
            <p className="text-sm font-medium">{payerName}</p>
            <p className="text-sm text-neutral-600">{session.email}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-neutral-500 mb-1">
              Date Paid
            </p>
            <p className="text-sm font-medium">
              {formatDate(payment.paidAt ?? payment.createdAt)}
            </p>
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
          <div>
            <p className="text-xs uppercase tracking-wide text-neutral-500 mb-1">
              Method
            </p>
            <p className="text-sm font-medium capitalize">
              {payment.provider ?? "Recorded by ProxyBuild"}
            </p>
            {payment.providerReference && (
              <p className="text-xs text-neutral-500 font-mono mt-0.5">
                {payment.providerReference}
              </p>
            )}
          </div>
        </section>

        <section className="py-6">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-neutral-500">
                <th className="pb-2 font-medium">Description</th>
                <th className="pb-2 font-medium text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t border-neutral-200">
                <td className="py-3">{payment.description ?? "Project payment"}</td>
                <td className="py-3 text-right font-medium">
                  {formatCurrency(Number(payment.amount), payment.currency)}
                </td>
              </tr>
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-neutral-900">
                <td className="pt-3 font-semibold">Total Paid</td>
                <td className="pt-3 text-right text-lg font-bold">
                  {formatCurrency(Number(payment.amount), payment.currency)}
                </td>
              </tr>
            </tfoot>
          </table>
        </section>

        <footer className="pt-6 border-t border-neutral-200">
          <p className="inline-block text-xs font-semibold text-green-700 bg-green-50 border border-green-200 rounded px-2 py-1">
            PAID
          </p>
          <p className="text-xs text-neutral-500 mt-4 leading-relaxed">
            This receipt confirms payment received against the project named above.
            Retain it for your records. For questions, contact
            hello@proxybuild.africa quoting reference {reference}.
          </p>
        </footer>
      </article>
    </div>
  );
}
