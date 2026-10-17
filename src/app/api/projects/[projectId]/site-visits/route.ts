import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { getProjectForUser } from "@/lib/services/projects";
import { db } from "@/lib/db";
import {
  siteVisitRequests,
  notifications,
  projectMembers,
  users,
} from "@/db/schema";
import { eq, and, inArray, isNull } from "drizzle-orm";
import { createAuditLog, AuditActions } from "@/lib/audit";
import { z } from "zod/v4";

const VISIT_TYPE_LABEL: Record<string, string> = {
  VIDEO_WALKTHROUGH: "Video walkthrough",
  IN_PERSON: "In-person visit",
  THIRD_PARTY_INSPECTION: "Independent inspection",
};

const schema = z.object({
  visitType: z.enum([
    "VIDEO_WALKTHROUGH",
    "IN_PERSON",
    "THIRD_PARTY_INSPECTION",
  ]),
  preferredDate: z.string().optional(),
  notes: z.string().max(1000).optional(),
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

  if (project.clientId !== session.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = schema.safeParse(await req.json());
  if (!body.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const { visitType, preferredDate, notes } = body.data;

  const [request] = await db
    .insert(siteVisitRequests)
    .values({
      projectId,
      requestedById: session.id,
      visitType,
      preferredDate: preferredDate ? new Date(preferredDate) : null,
      notes: notes ?? null,
    })
    .returning();

  // Alert the team
  const assigned = await db
    .select({ id: projectMembers.userId })
    .from(projectMembers)
    .where(
      and(
        eq(projectMembers.projectId, projectId),
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
              inArray(users.role, ["SUPER_ADMIN", "ADMIN", "PROJECT_MANAGER"]),
              eq(users.isActive, true)
            )
          );

  if (staff.length > 0) {
    await db.insert(notifications).values(
      staff.map((s) => ({
        userId: s.id,
        type: "NEW_MESSAGE" as const,
        title: `Site visit requested: ${VISIT_TYPE_LABEL[visitType]}`,
        body: `${session.firstName} ${session.lastName} requested a visit on ${project.title}.`,
        projectId,
        actionUrl: `/admin/projects/${projectId}/messages`,
      }))
    );
  }

  await createAuditLog({
    actorId: session.id,
    actorEmail: session.email,
    action: AuditActions.SITE_VISIT_REQUESTED,
    entityType: "site_visit_request",
    entityId: request.id,
    projectId,
    after: { visitType, preferredDate: preferredDate ?? null },
  });

  return NextResponse.json({ success: true, id: request.id });
}
