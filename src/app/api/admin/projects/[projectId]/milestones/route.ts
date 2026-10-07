import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { canManageProjects } from "@/lib/permissions";
import { db } from "@/lib/db";
import { milestones, auditLogs } from "@/db/schema";
import { z } from "zod/v4";

const createSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().optional().nullable(),
  sequence: z.number().int().min(1),
  weightPercent: z.number().int().min(0).max(100).default(0),
  plannedStartDate: z.string().optional().nullable(),
  plannedEndDate: z.string().optional().nullable(),
  budgetAmount: z.string().optional().nullable(),
  isClientVisible: z.boolean().default(true),
  clientVisibleTitle: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const session = await getSession();
  if (!session || !canManageProjects(session)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { projectId } = await params;
  const body = createSchema.safeParse(await req.json());
  if (!body.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const {
    title,
    description,
    sequence,
    weightPercent,
    plannedStartDate,
    plannedEndDate,
    budgetAmount,
    isClientVisible,
    clientVisibleTitle,
    notes,
  } = body.data;

  const [milestone] = await db
    .insert(milestones)
    .values({
      projectId,
      title,
      description: description ?? null,
      sequence,
      weightPercent,
      plannedStartDate: plannedStartDate ? new Date(plannedStartDate) : null,
      plannedEndDate: plannedEndDate ? new Date(plannedEndDate) : null,
      budgetAmount: budgetAmount ?? null,
      isClientVisible,
      clientVisibleTitle: clientVisibleTitle ?? null,
      notes: notes ?? null,
    })
    .returning();

  await db.insert(auditLogs).values({
    actorId: session.id,
    action: "CREATE",
    entityType: "MILESTONE",
    entityId: milestone.id,
    after: { title, sequence },
  });

  return NextResponse.json({ milestone }, { status: 201 });
}
