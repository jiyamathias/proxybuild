import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { isStaff } from "@/lib/permissions";
import { db } from "@/lib/db";
import { documents, auditLogs } from "@/db/schema";
import { z } from "zod/v4";

const schema = z.object({
  title: z.string().min(1).max(200),
  storageKey: z.string().min(1),
  fileName: z.string().min(1),
  mimeType: z.string(),
  fileSizeBytes: z.number().int().optional(),
  category: z.string().default("OTHER"),
  description: z.string().optional(),
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
    title,
    storageKey,
    fileName,
    mimeType,
    fileSizeBytes,
    category,
    description,
    isClientVisible,
    milestoneId,
  } = body.data;

  const [doc] = await db
    .insert(documents)
    .values({
      projectId,
      uploadedById: session.id,
      title,
      storageKey,
      fileName,
      mimeType,
      fileSizeBytes: fileSizeBytes ?? null,
      category: category as any,
      description: description ?? null,
      isClientVisible,
      milestoneId: milestoneId ?? null,
    })
    .returning();

  await db.insert(auditLogs).values({
    actorId: session.id,
    action: "UPLOAD",
    entityType: "DOCUMENT",
    entityId: doc.id,
    after: { title, fileName, category },
  });

  return NextResponse.json({ document: doc }, { status: 201 });
}
