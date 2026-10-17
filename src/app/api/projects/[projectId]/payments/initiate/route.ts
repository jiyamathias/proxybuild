import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { getProjectForUser } from "@/lib/services/projects";
import { db } from "@/lib/db";
import { payments, milestones } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { initiatePayment, buildTxRef } from "@/lib/flutterwave";
import { createAuditLog, AuditActions } from "@/lib/audit";
import { z } from "zod/v4";

const schema = z.object({
  amount: z.number().positive().max(1_000_000_000),
  milestoneId: z.string().uuid().nullable().optional(),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { projectId } = await params;
  const project = await getProjectForUser(projectId, session);
  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Only the project's own client pays
  if (project.clientId !== session.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = schema.safeParse(await req.json());
  if (!body.success) {
    return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
  }

  const { amount, milestoneId } = body.data;

  // If paying against a milestone, confirm it belongs to this project
  if (milestoneId) {
    const [m] = await db
      .select({ id: milestones.id })
      .from(milestones)
      .where(
        and(eq(milestones.id, milestoneId), eq(milestones.projectId, projectId))
      )
      .limit(1);
    if (!m) {
      return NextResponse.json({ error: "Invalid milestone" }, { status: 400 });
    }
  }

  const txRef = buildTxRef(projectId);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://proxybuild.africa";

  // Record the intent as PENDING before redirecting the client out
  const [payment] = await db
    .insert(payments)
    .values({
      projectId,
      milestoneId: milestoneId ?? null,
      payerId: session.id,
      currency: project.currency,
      amount: amount.toString(),
      status: "PENDING",
      provider: "flutterwave",
      txRef,
      description: milestoneId
        ? "Milestone payment"
        : "Project payment",
    })
    .returning();

  try {
    const link = await initiatePayment({
      txRef,
      amount,
      currency: project.currency,
      redirectUrl: `${appUrl}/dashboard/projects/${projectId}/payments/callback`,
      customer: {
        email: session.email,
        name: `${session.firstName} ${session.lastName}`.trim(),
      },
      title: "ProxyBuild Africa",
      description: `Payment for ${project.title}`,
      meta: { projectId, paymentId: payment.id },
    });

    await createAuditLog({
      actorId: session.id,
      action: AuditActions.PAYMENT_RECORDED,
      entityType: "payment",
      entityId: payment.id,
      projectId,
      after: { amount, currency: project.currency, status: "PENDING", txRef },
    });

    return NextResponse.json({ link });
  } catch (err) {
    // Roll the intent back so a failed handoff doesn't leave a ghost PENDING row
    await db
      .update(payments)
      .set({ status: "FAILED", updatedAt: new Date() })
      .where(eq(payments.id, payment.id));

    console.error("[Flutterwave initiate]", err);
    return NextResponse.json(
      { error: "Could not start payment. Please try again." },
      { status: 502 }
    );
  }
}
