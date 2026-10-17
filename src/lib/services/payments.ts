import { db } from "@/lib/db";
import {
  payments,
  ledgerEntries,
  notifications,
  projects,
  projectMembers,
  users,
} from "@/db/schema";
import { eq, and, inArray, isNull } from "drizzle-orm";
import type { VerifiedTransaction } from "@/lib/flutterwave";
import { createAuditLog, AuditActions } from "@/lib/audit";
import { formatCurrency } from "@/lib/utils";

export type FinalizeResult =
  | { outcome: "succeeded"; alreadyProcessed: boolean }
  | { outcome: "failed"; reason: string }
  | { outcome: "unknown_reference" };

/**
 * Applies a Flutterwave-verified transaction to our records.
 *
 * Safe to call more than once for the same transaction — both the webhook and the
 * browser redirect land here, and either may arrive first.
 */
export async function finalizeFlutterwavePayment(
  verified: VerifiedTransaction
): Promise<FinalizeResult> {
  const [payment] = await db
    .select()
    .from(payments)
    .where(eq(payments.txRef, verified.txRef))
    .limit(1);

  if (!payment) return { outcome: "unknown_reference" };

  if (payment.status === "SUCCESSFUL") {
    return { outcome: "succeeded", alreadyProcessed: true };
  }

  const expected = Number(payment.amount);
  const amountOk = verified.amount >= expected;
  const currencyOk = verified.currency === payment.currency;

  if (verified.status !== "successful" || !amountOk || !currencyOk) {
    await db
      .update(payments)
      .set({
        status: "FAILED",
        providerReference: verified.flwRef,
        updatedAt: new Date(),
      })
      .where(eq(payments.id, payment.id));

    const reason =
      verified.status !== "successful"
        ? `gateway status ${verified.status}`
        : !amountOk
        ? "amount mismatch"
        : "currency mismatch";
    return { outcome: "failed", reason };
  }

  const paidAt = new Date();

  // Guard the write on status so two concurrent callers cannot both credit.
  const updated = await db
    .update(payments)
    .set({
      status: "SUCCESSFUL",
      providerReference: verified.flwRef,
      paidAt,
      updatedAt: paidAt,
    })
    .where(and(eq(payments.id, payment.id), eq(payments.status, "PENDING")))
    .returning({ id: payments.id });

  if (updated.length === 0) {
    // Another caller finalized it between our read and write
    return { outcome: "succeeded", alreadyProcessed: true };
  }

  await db.insert(ledgerEntries).values({
    projectId: payment.projectId,
    entryType: "CLIENT_PAYMENT",
    description: payment.description ?? "Client payment",
    currency: payment.currency,
    amount: payment.amount,
    referenceId: payment.id,
    referenceType: "payment",
    entryDate: paidAt,
  });

  const [project] = await db
    .select({ title: projects.title, clientId: projects.clientId })
    .from(projects)
    .where(eq(projects.id, payment.projectId))
    .limit(1);

  const pretty = formatCurrency(Number(payment.amount), payment.currency);

  if (project?.clientId) {
    await db.insert(notifications).values({
      userId: project.clientId,
      type: "PAYMENT_RECORDED",
      title: `Payment confirmed: ${pretty}`,
      body: `Your payment for ${project.title} has been received.`,
      projectId: payment.projectId,
      actionUrl: `/dashboard/projects/${payment.projectId}/payments`,
    });
  }

  const assigned = await db
    .select({ id: projectMembers.userId })
    .from(projectMembers)
    .where(
      and(
        eq(projectMembers.projectId, payment.projectId),
        isNull(projectMembers.removedAt)
      )
    );

  const staff =
    assigned.length > 0
      ? assigned
      : await db
          .select({ id: users.id })
          .from(users)
          .where(
            and(
              inArray(users.role, ["SUPER_ADMIN", "ADMIN", "FINANCE"]),
              eq(users.isActive, true)
            )
          );

  if (staff.length > 0) {
    await db.insert(notifications).values(
      staff.map((s) => ({
        userId: s.id,
        type: "PAYMENT_RECORDED" as const,
        title: `Payment received: ${pretty}`,
        body: `${project?.title ?? "Project"} — payment confirmed via Flutterwave.`,
        projectId: payment.projectId,
        actionUrl: `/admin/finance/${payment.projectId}`,
      }))
    );
  }

  await createAuditLog({
    actorId: payment.payerId ?? undefined,
    action: AuditActions.PAYMENT_RECORDED,
    entityType: "payment",
    entityId: payment.id,
    projectId: payment.projectId,
    after: {
      status: "SUCCESSFUL",
      amount: payment.amount,
      currency: payment.currency,
      flwRef: verified.flwRef,
    },
  });

  return { outcome: "succeeded", alreadyProcessed: false };
}
