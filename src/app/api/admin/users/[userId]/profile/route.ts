import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { profiles } from "@/db/schema";
import { eq } from "drizzle-orm";
import { createAuditLog, AuditActions } from "@/lib/audit";
import { z } from "zod/v4";

const schema = z.object({
  firstName: z.string().max(100).optional(),
  lastName: z.string().max(100).optional(),
  phone: z.string().max(30).optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { userId } = await params;

  // Users can only edit their own profile unless admin
  if (session.id !== userId && !["SUPER_ADMIN", "ADMIN"].includes(session.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = schema.safeParse(await req.json());
  if (!body.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  // Snapshot before so the trail shows what actually changed
  const [before] = await db
    .select({
      firstName: profiles.firstName,
      lastName: profiles.lastName,
      phone: profiles.phone,
    })
    .from(profiles)
    .where(eq(profiles.userId, userId))
    .limit(1);

  await db
    .update(profiles)
    .set({ ...body.data, updatedAt: new Date() })
    .where(eq(profiles.userId, userId));

  await createAuditLog({
    actorId: session.id,
    actorEmail: session.email,
    action: AuditActions.USER_PROFILE_UPDATED,
    entityType: "user",
    entityId: userId,
    before,
    after: body.data,
    metadata: { selfEdit: session.id === userId },
  });

  return NextResponse.json({ success: true });
}
