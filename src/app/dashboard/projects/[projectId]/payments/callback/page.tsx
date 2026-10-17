export const dynamic = "force-dynamic";

import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth/session";
import { getProjectForUser } from "@/lib/services/projects";
import { verifyTransaction } from "@/lib/flutterwave";
import { finalizeFlutterwavePayment } from "@/lib/services/payments";
import { CheckCircle2, XCircle, Clock, ArrowRight } from "lucide-react";

type Outcome = "success" | "failed" | "cancelled" | "pending";

export default async function PaymentCallbackPage({
  params,
  searchParams,
}: {
  params: Promise<{ projectId: string }>;
  searchParams: Promise<{
    status?: string;
    tx_ref?: string;
    transaction_id?: string;
  }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  const { projectId } = await params;
  const { status, transaction_id } = await searchParams;

  const project = await getProjectForUser(projectId, session);
  if (!project) notFound();

  let outcome: Outcome = "pending";

  if (status === "cancelled") {
    outcome = "cancelled";
  } else if (transaction_id) {
    // Verify with Flutterwave rather than trusting the redirect query string
    const verified = await verifyTransaction(transaction_id);
    if (!verified) {
      outcome = "failed";
    } else {
      const result = await finalizeFlutterwavePayment(verified);
      outcome =
        result.outcome === "succeeded"
          ? "success"
          : result.outcome === "failed"
          ? "failed"
          : "pending";
    }
  } else {
    outcome = "failed";
  }

  const COPY: Record<
    Outcome,
    { icon: React.ReactNode; title: string; body: string; tone: string }
  > = {
    success: {
      icon: <CheckCircle2 className="h-8 w-8 text-[var(--pb-green)]" />,
      title: "Payment confirmed",
      body: "Thank you. Your payment has been received and recorded against your project. A receipt is available in your payment history.",
      tone: "bg-[var(--pb-green-muted)] border-[var(--pb-green)]/20",
    },
    pending: {
      icon: <Clock className="h-8 w-8 text-yellow-400" />,
      title: "Confirming your payment",
      body: "Your payment is being confirmed by our provider. This usually takes a few moments — your payment history will update automatically.",
      tone: "bg-yellow-500/5 border-yellow-500/20",
    },
    cancelled: {
      icon: <XCircle className="h-8 w-8 text-[var(--pb-text-muted)]" />,
      title: "Payment cancelled",
      body: "You cancelled this payment and nothing has been charged. You can start it again whenever you're ready.",
      tone: "bg-[var(--pb-surface-elevated)] border-[var(--pb-border)]",
    },
    failed: {
      icon: <XCircle className="h-8 w-8 text-red-400" />,
      title: "Payment not completed",
      body: "We could not confirm this payment, so nothing has been recorded. If you believe you were charged, contact us and we will resolve it immediately.",
      tone: "bg-red-500/5 border-red-500/20",
    },
  };

  const c = COPY[outcome];

  return (
    <div className="max-w-lg mx-auto py-12">
      <div className={`rounded-2xl border p-8 text-center ${c.tone}`}>
        <div className="flex justify-center mb-4">{c.icon}</div>
        <h1 className="text-xl font-bold text-white mb-2">{c.title}</h1>
        <p className="text-sm text-[var(--pb-text-muted)] leading-relaxed mb-8">
          {c.body}
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href={`/dashboard/projects/${projectId}/payments`}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[var(--pb-green)] hover:bg-[var(--pb-green-hover)] text-white text-sm font-semibold rounded-xl transition-colors"
          >
            View Payment History
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href={`/dashboard/projects/${projectId}`}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[var(--pb-surface-elevated)] hover:bg-[var(--pb-surface-raised)] border border-[var(--pb-border)] text-white text-sm font-semibold rounded-xl transition-colors"
          >
            Back to Project
          </Link>
        </div>
      </div>
    </div>
  );
}
