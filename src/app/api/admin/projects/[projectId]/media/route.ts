import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { isStaff } from "@/lib/permissions";
import { db } from "@/lib/db";
import { projectMedia, auditLogs } from "@/db/schema";
import { z } from "zod/v4";

const schema = z.object({
  storageKey: z.string().min(1),
  fileName: z.string().min(1),
  mimeType: z.string(),
  fileSizeBytes: z.number().int().optional(),
  caption: z.string().max(500).optional(),
  isClientVisible: z.boolean().default(true),
  milestoneId: z.string().uuid().nullable().optional(),
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
  const body = schema.safeParse(await req.json());
  if (!body.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const {
    storageKey,
    fileName,
    mimeType,
    fileSizeBytes,
    caption,
    isClientVisible,
    milestoneId,
  } = body.data;

  const mediaType = mimeType.startsWith("video/") ? "video" : "photo";

  const [media] = await db
    .insert(projectMedia)
    .values({
      projectId,
      uploadedById: session.id,
      mediaType,
      storageKey,
      fileName,
      mimeType,
      fileSizeBytes: fileSizeBytes ?? null,
      caption: caption ?? null,
      isClientVisible,
      milestoneId: milestoneId ?? null,
    })
    .returning();

  await db.insert(auditLogs).values({
    actorId: session.id,
    action: "UPLOAD",
    entityType: "MEDIA",
    entityId: media.id,
    after: { mediaType, fileName },
  });

  return NextResponse.json({ media }, { status: 201 });
}
