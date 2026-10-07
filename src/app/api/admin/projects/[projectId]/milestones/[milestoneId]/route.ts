import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { canManageProjects } from "@/lib/permissions";
import { db } from "@/lib/db";
import { milestones, auditLogs } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { z } from "zod/v4";

const patchSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().nullable().optional(),
  sequence: z.number().int().min(1).optional(),
  weightPercent: z.number().int().min(0).max(100).optional(),
  status: z
    .enum(["NOT_STARTED", "IN_PROGRESS", "COMPLETED", "APPROVED", "ON_HOLD"])
    .optional(),
  plannedStartDate: z.string().nullable().optional(),
  plannedEndDate: z.string().nullable().optional(),
  budgetAmount: z.string().nullable().optional(),
  isClientVisible: z.boolean().optional(),
  clientVisibleTitle: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string; milestoneId: string }> }
) {
  const session = await getSession();
  if (!session || !canManageProjects(session)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { projectId, milestoneId } = await params;
  const body = patchSchema.safeParse(await req.json());
  if (!body.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const updates: Record<string, unknown> = {};
  const d = body.data;
  if (d.title !== undefined) updates.title = d.title;
  if (d.description !== undefined) updates.description = d.description;
  if (d.sequence !== undefined) updates.sequence = d.sequence;
  if (d.weightPercent !== undefined) updates.weightPercent = d.weightPercent;
  if (d.status !== undefined) updates.status = d.status;
  if (d.isClientVisible !== undefined) updates.isClientVisible = d.isClientVisible;
  if (d.clientVisibleTitle !== undefined)
    updates.clientVisibleTitle = d.clientVisibleTitle;
  if (d.notes !== undefined) updates.notes = d.notes;
  if (d.budgetAmount !== undefined) updates.budgetAmount = d.budgetAmount;
  if (d.plannedStartDate !== undefined)
    updates.plannedStartDate = d.plannedStartDate ? new Date(d.plannedStartDate) : null;
  if (d.plannedEndDate !== undefined)
    updates.plannedEndDate = d.plannedEndDate ? new Date(d.plannedEndDate) : null;

  updates.updatedAt = new Date();

  const [milestone] = await db
    .update(milestones)
    .set(updates)
    .where(
      and(eq(milestones.id, milestoneId), eq(milestones.projectId, projectId))
    )
    .returning();

  if (!milestone) {
    return NextResponse.json({ error: "Milestone not found" }, { status: 404 });
  }

  await db.insert(auditLogs).values({
    actorId: session.id,
    action: "UPDATE",
    entityType: "MILESTONE",
    entityId: milestoneId,
    after: updates,
  });

  return NextResponse.json({ milestone });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string; milestoneId: string }> }
) {
  const session = await getSession();
  if (!session || !canManageProjects(session)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { projectId, milestoneId } = await params;

  const [deleted] = await db
    .delete(milestones)
    .where(
      and(eq(milestones.id, milestoneId), eq(milestones.projectId, projectId))
    )
    .returning({ id: milestones.id });

  if (!deleted) {
    return NextResponse.json({ error: "Milestone not found" }, { status: 404 });
  }

  await db.insert(auditLogs).values({
    actorId: session.id,
    action: "DELETE",
    entityType: "MILESTONE",
    entityId: milestoneId,
    before: { milestoneId },
  });

  return NextResponse.json({ success: true });
}
