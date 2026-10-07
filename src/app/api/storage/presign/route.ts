import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { isStaff } from "@/lib/permissions";
import {
  getPresignedUploadUrl,
  validateUpload,
  buildStorageKey,
} from "@/lib/r2";
import { z } from "zod/v4";

const schema = z.object({
  projectId: z.string().uuid(),
  fileName: z.string().min(1).max(255),
  mimeType: z.string(),
  fileSizeBytes: z.number().int().positive(),
  category: z.string().default("documents"),
});

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || !isStaff(session)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = schema.safeParse(await req.json());
  if (!body.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const { projectId, fileName, mimeType, fileSizeBytes, category } = body.data;

  const validationError = validateUpload(mimeType, fileSizeBytes);
  if (validationError) {
    return NextResponse.json({ error: validationError }, { status: 400 });
  }

  const key = buildStorageKey(projectId, category, fileName);
  const { url } = await getPresignedUploadUrl(key, mimeType, fileSizeBytes);

  return NextResponse.json({ url, key });
}
