import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { getProjectForUser } from "@/lib/services/projects";
import { db } from "@/lib/db";
import {
  milestones,
  milestoneApprovals,
  notifications,
  projectMembers,
  users,
} from "@/db/schema";
import { eq, and, ne, inArray, isNull } from "drizzle-orm";
import { createAuditLog, AuditActions } from "@/lib/audit";
import { z } from "zod/v4";

const schema = z.object({
  action: z.enum(["approve", "reject"]),
  notes: z.string().max(1000).optional(),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string; milestoneId: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { projectId, milestoneId } = await params;
  const project = await getProjectForUser(projectId, session);
  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = schema.safeParse(await req.json());
  if (!body.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const [milestone] = await db
    .select()
    .from(milestones)
    .where(and(eq(milestones.id, milestoneId), eq(milestones.projectId, projectId)))
    .limit(1);

  if (!milestone) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (milestone.approvalStatus !== "AWAITING_CLIENT") {
    return NextResponse.json({ error: "Not awaiting approval" }, { status: 400 });
  }

  const { action, notes } = body.data;
  const approved = action === "approve";

  await db.transaction(async (tx) => {
    await tx
      .update(milestones)
      .set({
        approvalStatus: approved ? "APPROVED" : "REJECTED",
        status: approved ? "APPROVED" : "IN_PROGRESS",
        actualEndDate: approved ? new Date() : null,
        updatedAt: new Date(),
      })
      .where(eq(milestones.id, milestoneId));

    await tx.insert(milestoneApprovals).values({
      milestoneId,
      projectId,
      reviewedById: session.id,
      decision: approved ? "APPROVED" : "REJECTED",
      comment: notes ?? null,
    });
  });

  // Notify the team of the client's decision
  const assigned = await db
    .select({ id: projectMembers.userId })
    .from(projectMembers)
    .where(
      and(
        eq(projectMembers.projectId, projectId),
        isNull(projectMembers.removedAt)
      )
    );

  const targets =
    assigned.length > 0
      ? assigned
      : await db
          .select({ id: users.id })
          .from(users)
          .where(
            and(
              inArray(users.role, ["SUPER_ADMIN", "ADMIN"]),
              eq(users.isActive, true),
              ne(users.id, session.id)
            )
          );

  if (targets.length > 0) {
    const label = milestone.clientVisibleTitle ?? milestone.title;
    await db.insert(notifications).values(
      targets.map((t) => ({
        userId: t.id,
        type: "CLIENT_APPROVAL_RECEIVED" as const,
        title: approved
          ? `Client approved: ${label}`
          : `Client requested changes: ${label}`,
        body: notes ?? `${project.title} — ${label}`,
        projectId,
        actionUrl: `/admin/projects/${projectId}/milestones`,
      }))
    );
  }

  await createAuditLog({
    actorId: session.id,
    action: approved ? AuditActions.MILESTONE_APPROVED : AuditActions.MILESTONE_REJECTED,
    entityType: "milestone",
    entityId: milestoneId,
    projectId,
    after: { action, notes },
  });

  return NextResponse.json({ success: true });
}
