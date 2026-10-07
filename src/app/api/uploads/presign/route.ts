import { NextRequest, NextResponse } from "next/server";
import { z } from "zod/v4";
import { getSession } from "@/lib/auth/session";
import {
  getPresignedUploadUrl,
  validateUpload,
  buildStorageKey,
} from "@/lib/r2";
import { db } from "@/lib/db";
import { projects } from "@/db/schema";
import { eq, and } from "drizzle-orm";

const schema = z.object({
  projectId: z.string().uuid(),
  category: z.string().min(1),
  fileName: z.string().min(1),
  mimeType: z.string().min(1),
  fileSizeBytes: z.number().positive(),
});

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const { projectId, category, fileName, mimeType, fileSizeBytes } =
    parsed.data;

  // Verify the user has access to this project
  const isClient = session.role === "CLIENT";
  const projectQuery = isClient
    ? and(eq(projects.id, projectId), eq(projects.clientId, session.id))
    : eq(projects.id, projectId);

  const [project] = await db
    .select({ id: projects.id })
    .from(projects)
    .where(projectQuery)
    .limit(1);

  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  // Validate file type and size
  const validationError = validateUpload(mimeType, fileSizeBytes);
  if (validationError) {
    return NextResponse.json({ error: validationError }, { status: 400 });
  }

  const key = buildStorageKey(projectId, category, fileName);
  const { url } = await getPresignedUploadUrl(key, mimeType, fileSizeBytes);

  return NextResponse.json({ url, key });
}
