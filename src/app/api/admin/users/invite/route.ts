import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { canManageTeam } from "@/lib/permissions";
import { db } from "@/lib/db";
import { users, profiles } from "@/db/schema";
import { eq } from "drizzle-orm";
import { hashPassword } from "@/lib/auth/password";
import { sendAccountInvitation } from "@/lib/email";
import { createAuditLog, AuditActions } from "@/lib/audit";
import { z } from "zod/v4";

const schema = z.object({
  email: z.email(),
  firstName: z.string().min(1).max(100),
  lastName: z.string().max(100).optional(),
  role: z.enum(["CLIENT", "PROJECT_MANAGER", "SITE_SUPERVISOR", "FINANCE", "ADMIN"]),
});

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || !canManageTeam(session)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = schema.safeParse(await req.json());
  if (!body.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const { email, firstName, lastName, role } = body.data;

  // Check existing
  const existing = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email.toLowerCase()))
    .limit(1);
  if (existing.length > 0) {
    return NextResponse.json(
      { error: "A user with this email already exists" },
      { status: 409 }
    );
  }

  // Generate temporary password
  const tempPassword = Math.random().toString(36).slice(-10) + "A1!";
  const hashedPassword = await hashPassword(tempPassword);

  const [user] = await db
    .insert(users)
    .values({
      email: email.toLowerCase(),
      passwordHash: hashedPassword,
      role,
      isActive: true,
      emailVerified: true,
      mustChangePassword: true,
    })
    .returning();

  await db.insert(profiles).values({
    userId: user.id,
    firstName,
    lastName: lastName ?? "",
  });

  // Send invite email
  const loginUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? "https://proxybuild.africa"}/login?email=${encodeURIComponent(email)}`;
  Promise.allSettled([
    sendAccountInvitation({
      to: email,
      firstName,
      inviteUrl: loginUrl,
      role,
    }),
  ]);

  await createAuditLog({
    actorId: session.id,
    action: AuditActions.USER_INVITED,
    entityType: "user",
    entityId: user.id,
    after: { email, role },
  });

  return NextResponse.json({ userId: user.id });
}
