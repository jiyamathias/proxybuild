import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { isStaff } from "@/lib/permissions";
import { getProjectForUser } from "@/lib/services/projects";
import { db } from "@/lib/db";
import { changeOrders, notifications } from "@/db/schema";
import { eq } from "drizzle-orm";
import { createAuditLog, AuditActions } from "@/lib/audit";
import { z } from "zod/v4";

const schema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().min(1).max(5000),
  reason: z.string().max(2000).optional(),
  costImpact: z.number().nullable().optional(),
  timelineImpactDays: z.number().int().nullable().optional(),
  status: z.enum(["DRAFT", "SUBMITTED", "UNDER_REVIEW"]).default("DRAFT"),
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

  const { title, description, reason, costImpact, timelineImpactDays, status } = body.data;

  const [co] = await db
    .insert(changeOrders)
    .values({
      projectId,
      requestedById: session.id,
      title,
      description,
      reason: reason ?? null,
      costImpact: costImpact != null ? costImpact.toString() : null,
      timelineImpactDays: timelineImpactDays != null ? timelineImpactDays.toString() : null,
      status,
    })
    .returning();

  // Notify client if submitted for review
  if (status === "SUBMITTED" && project.clientId) {
    await db.insert(notifications).values({
      userId: project.clientId,
      type: "CHANGE_ORDER_SUBMITTED",
      title: "Change Order Requires Your Approval",
      body: `A change order "${title}" has been submitted for your review on ${project.title}.`,
      projectId,
      actionUrl: `/dashboard/projects/${projectId}/change-orders/${co.id}`,
    });
  }

  await createAuditLog({
    actorId: session.id,
    action: AuditActions.CHANGE_ORDER_CREATED,
    entityType: "change_order",
    entityId: co.id,
    projectId,
    after: { title, status },
  });

  return NextResponse.json({ changeOrder: co });
}
