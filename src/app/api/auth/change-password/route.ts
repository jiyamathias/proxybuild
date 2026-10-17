import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { hashPassword } from "@/lib/auth/password";
import { createAuditLog, AuditActions } from "@/lib/audit";
import { z } from "zod/v4";

const schema = z.object({
  newPassword: z.string().min(8).max(128),
});

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = schema.safeParse(await req.json());
  if (!body.success) {
    return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
  }

  const newHash = await hashPassword(body.data.newPassword);

  await db
    .update(users)
    .set({
      passwordHash: newHash,
      mustChangePassword: false,
      updatedAt: new Date(),
    })
    .where(eq(users.id, session.id));

  await createAuditLog({
    actorId: session.id,
    actorEmail: session.email,
    action: AuditActions.USER_PASSWORD_CHANGED,
    entityType: "user",
    entityId: session.id,
    metadata: { reason: "forced_first_login" },
  });

  return NextResponse.json({ success: true });
}
