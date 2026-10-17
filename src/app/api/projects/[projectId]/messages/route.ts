import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { getProjectForUser } from "@/lib/services/projects";
import { db } from "@/lib/db";
import { messages, profiles, users, notifications, projectMembers } from "@/db/schema";
import { eq, and, ne, inArray, isNull } from "drizzle-orm";
import { isStaff } from "@/lib/permissions";
import { z } from "zod/v4";

const schema = z.object({
  body: z.string().min(1).max(5000),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { projectId } = await params;
  const project = await getProjectForUser(projectId, session);
  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = schema.safeParse(await req.json());
  if (!body.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const [inserted] = await db
    .insert(messages)
    .values({
      projectId,
      senderId: session.id,
      body: body.data.body,
    })
    .returning();

  // Fetch sender profile for the response
  const [profile] = await db
    .select({ firstName: profiles.firstName, lastName: profiles.lastName })
    .from(profiles)
    .where(eq(profiles.userId, session.id))
    .limit(1);

  const senderName = profile
    ? `${profile.firstName} ${profile.lastName}`.trim()
    : "ProxyBuild";
  const preview =
    body.data.body.length > 120
      ? `${body.data.body.slice(0, 120)}…`
      : body.data.body;

  // Notify the other side of the conversation
  if (isStaff(session)) {
    // Staff replied — notify the client
    if (project.clientId) {
      await db.insert(notifications).values({
        userId: project.clientId,
        type: "NEW_MESSAGE",
        title: `New message from ${senderName}`,
        body: preview,
        projectId,
        actionUrl: `/dashboard/projects/${projectId}/messages`,
      });
    }
  } else {
    // Client wrote — notify assigned project members, falling back to admins
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
      await db.insert(notifications).values(
        targets.map((t) => ({
          userId: t.id,
          type: "NEW_MESSAGE" as const,
          title: `New message from ${senderName}`,
          body: preview,
          projectId,
          actionUrl: `/admin/projects/${projectId}/messages`,
        }))
      );
    }
  }

  return NextResponse.json({
    message: {
      message: inserted,
      senderFirstName: profile?.firstName ?? null,
      senderLastName: profile?.lastName ?? null,
      senderRole: session.role,
    },
  });
}
