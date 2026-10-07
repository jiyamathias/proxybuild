import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { isStaff } from "@/lib/permissions";
import { db } from "@/lib/db";
import { consultations } from "@/db/schema";
import { eq } from "drizzle-orm";
import { createAuditLog, AuditActions } from "@/lib/audit";
import { z } from "zod/v4";

const schema = z.object({
  status: z
    .enum(["NEW", "CONTACTED", "QUALIFIED", "PROPOSAL_SENT", "CONVERTED", "CLOSED"])
    .optional(),
  internalNotes: z.string().max(5000).optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ consultationId: string }> }
) {
  const session = await getSession();
  if (!session || !isStaff(session)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { consultationId } = await params;
  const body = schema.safeParse(await req.json());
  if (!body.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const [existing] = await db
    .select({ status: consultations.status })
    .from(consultations)
    .where(eq(consultations.id, consultationId))
    .limit(1);
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await db
    .update(consultations)
    .set({ ...body.data, updatedAt: new Date() })
    .where(eq(consultations.id, consultationId));

  if (body.data.status && body.data.status !== existing.status) {
    await createAuditLog({
      actorId: session.id,
      action: AuditActions.CONSULTATION_STATUS_CHANGED,
      entityType: "consultation",
      entityId: consultationId,
      before: { status: existing.status },
      after: { status: body.data.status },
    });
  }

  return NextResponse.json({ success: true });
}
