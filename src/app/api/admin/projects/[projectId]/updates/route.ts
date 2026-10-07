import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { isStaff } from "@/lib/permissions";
import { getProjectForUser } from "@/lib/services/projects";
import { db } from "@/lib/db";
import { projectUpdates, projects, notifications } from "@/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod/v4";

const schema = z.object({
  title: z.string().min(1).max(200),
  body: z.string().min(1),
  phase: z.string().max(100).optional(),
  progressDelta: z.number().int().min(0).max(100).default(0),
  milestoneId: z.string().uuid().nullable().optional(),
  isClientVisible: z.boolean().default(true),
  isPublished: z.boolean().default(true),
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

  const { title, body: updateBody, phase, progressDelta, milestoneId, isClientVisible, isPublished } = body.data;

  const [update] = await db
    .insert(projectUpdates)
    .values({
      projectId,
      authorId: session.id,
      title,
      body: updateBody,
      phase: phase ?? null,
      progressDelta: progressDelta ?? 0,
      milestoneId: milestoneId ?? null,
      isClientVisible,
      isPublished,
    })
    .returning();

  // Update project progress if delta > 0
  if (progressDelta > 0) {
    const newProgress = Math.min(100, project.progressPercent + progressDelta);
    await db
      .update(projects)
      .set({ progressPercent: newProgress, updatedAt: new Date() })
      .where(eq(projects.id, projectId));
  }

  // Notify client if client-visible
  if (isClientVisible && isPublished && project.clientId) {
    await db.insert(notifications).values({
      userId: project.clientId,
      type: "PROJECT_UPDATE",
      title: `New update: ${title}`,
      body: `${project.title} has a new project update.`,
      projectId,
      actionUrl: `/dashboard/projects/${projectId}/updates`,
    });
  }

  return NextResponse.json({ update });
}
