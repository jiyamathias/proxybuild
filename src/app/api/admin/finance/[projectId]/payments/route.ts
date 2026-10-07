import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { isStaff } from "@/lib/permissions";
import { getProjectForUser } from "@/lib/services/projects";
import { db } from "@/lib/db";
import { payments, ledgerEntries } from "@/db/schema";
import { createAuditLog, AuditActions } from "@/lib/audit";
import { z } from "zod/v4";

const schema = z.object({
  amount: z.number().positive(),
  currency: z.string(),
  status: z.enum(["PENDING", "PROCESSING", "SUCCESSFUL", "FAILED", "CANCELLED"]),
  milestoneId: z.string().uuid().nullable().optional(),
  description: z.string().max(500).optional(),
  provider: z.string().max(100).optional(),
  providerReference: z.string().max(200).optional(),
  paidAt: z.string().optional(),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const session = await getSession();
  if (!session || !isStaff(session)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { projectId } = await params;
  const project = await getProjectForUser(projectId, session);
  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = schema.safeParse(await req.json());
  if (!body.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const { amount, currency, status, milestoneId, description, provider, providerReference, paidAt } = body.data;

  const [payment] = await db
    .insert(payments)
    .values({
      projectId,
      recordedById: session.id,
      currency: currency as "NGN" | "USD" | "GBP" | "EUR" | "CAD" | "AUD",
      amount: amount.toString(),
      status,
      milestoneId: milestoneId ?? null,
      description: description ?? null,
      provider: provider ?? null,
      providerReference: providerReference ?? null,
      paidAt: paidAt ? new Date(paidAt) : new Date(),
    })
    .returning();

  // Add ledger entry for successful payments
  if (status === "SUCCESSFUL") {
    await db.insert(ledgerEntries).values({
      projectId,
      recordedById: session.id,
      entryType: "CLIENT_PAYMENT",
      description: description ?? "Client payment",
      currency: currency as "NGN" | "USD" | "GBP" | "EUR" | "CAD" | "AUD",
      amount: amount.toString(),
      referenceId: payment.id,
      referenceType: "payment",
      entryDate: paidAt ? new Date(paidAt) : new Date(),
    });
  }

  await createAuditLog({
    actorId: session.id,
    action: AuditActions.PAYMENT_RECORDED,
    entityType: "payment",
    entityId: payment.id,
    projectId,
    after: { amount, currency, status },
  });

  return NextResponse.json({ payment });
}
