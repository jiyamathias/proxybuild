import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { getProjectForUser } from "@/lib/services/projects";
import { db } from "@/lib/db";
import { changeOrders } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { createAuditLog, AuditActions } from "@/lib/audit";
import { z } from "zod/v4";

const schema = z.object({
  decision: z.enum(["approve", "reject"]),
  comment: z.string().max(1000).optional(),
});

export async function POST(
  req: NextRequest,
  {
    params,
  }: { params: Promise<{ projectId: string; changeOrderId: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { projectId, changeOrderId } = await params;
  const project = await getProjectForUser(projectId, session);
  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = schema.safeParse(await req.json());
  if (!body.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const [co] = await db
    .select()
    .from(changeOrders)
    .where(
      and(
        eq(changeOrders.id, changeOrderId),
        eq(changeOrders.projectId, projectId)
      )
    )
    .limit(1);
  if (!co) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { decision, comment } = body.data;
  const approved = decision === "approve";

  await db
    .update(changeOrders)
    .set({
      clientApproved: approved,
      clientComment: comment ?? null,
      clientRespondedAt: new Date(),
      status: approved ? "APPROVED" : "REJECTED",
      updatedAt: new Date(),
    })
    .where(eq(changeOrders.id, changeOrderId));

  await createAuditLog({
    actorId: session.id,
    action: approved
      ? AuditActions.CHANGE_ORDER_APPROVED
      : AuditActions.CHANGE_ORDER_REJECTED,
    entityType: "change_order",
    entityId: changeOrderId,
    projectId,
    after: { decision, comment },
  });

  return NextResponse.json({ success: true });
}
