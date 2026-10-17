import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { getProjectForUser } from "@/lib/services/projects";
import { db } from "@/lib/db";
import {
  messages,
  profiles,
  users,
  notifications,
  projectMembers,
  messageAttachments,
} from "@/db/schema";
import { eq, and, ne, inArray, isNull } from "drizzle-orm";
import { isStaff } from "@/lib/permissions";
import { getPresignedDownloadUrl } from "@/lib/r2";
import { z } from "zod/v4";

const attachmentSchema = z.object({
  storageKey: z.string().min(1).max(500),
  fileName: z.string().min(1).max(255),
  mimeType: z.string().min(1).max(120),
  fileSizeBytes: z.number().positive().optional(),
});

const schema = z
  .object({
    body: z.string().max(5000).default(""),
    attachments: z.array(attachmentSchema).max(5).optional(),
  })
  // A message must carry something — text, files, or both
  .refine((v) => v.body.trim().length > 0 || (v.attachments?.length ?? 0) > 0, {
    message: "Message cannot be empty",
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

  const attachmentRows =
    body.data.attachments && body.data.attachments.length > 0
      ? await db
          .insert(messageAttachments)
          .values(
            body.data.attachments.map((a) => ({
              messageId: inserted.id,
              storageKey: a.storageKey,
              fileName: a.fileName,
              mimeType: a.mimeType,
              fileSizeBytes: a.fileSizeBytes ?? null,
            }))
          )
          .returning()
      : [];

  // Fetch sender profile for the response
  const [profile] = await db
    .select({ firstName: profiles.firstName, lastName: profiles.lastName })
    .from(profiles)
    .where(eq(profiles.userId, session.id))
    .limit(1);

  const senderName = profile
    ? `${profile.firstName} ${profile.lastName}`.trim()
    : "ProxyBuild";
  const attachmentNote =
    attachmentRows.length > 0
      ? `${attachmentRows.length} attachment${attachmentRows.length === 1 ? "" : "s"}`
      : "";
  const trimmed = body.data.body.trim();
  const preview = trimmed
    ? trimmed.length > 120
      ? `${trimmed.slice(0, 120)}…`
      : trimmed
    : attachmentNote;

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

  // Hand back viewable URLs so the sender sees their attachments immediately
  const attachments = await Promise.all(
    attachmentRows.map(async (a) => ({
      id: a.id,
      fileName: a.fileName,
      mimeType: a.mimeType,
      fileSizeBytes: a.fileSizeBytes,
      url: await getPresignedDownloadUrl(a.storageKey).catch(() => null),
    }))
  );

  return NextResponse.json({
    message: {
      message: inserted,
      senderFirstName: profile?.firstName ?? null,
      senderLastName: profile?.lastName ?? null,
      senderRole: session.role,
      attachments,
    },
  });
}
