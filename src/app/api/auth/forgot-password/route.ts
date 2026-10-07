import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users, profiles } from "@/db/schema";
import { eq } from "drizzle-orm";
import { sendPasswordReset } from "@/lib/email";
import crypto from "crypto";
import { z } from "zod/v4";

const schema = z.object({
  email: z.email(),
});

export async function POST(req: NextRequest) {
  const body = schema.safeParse(await req.json());
  if (!body.success) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }

  const email = body.data.email.toLowerCase();

  // Always return 200 to avoid email enumeration
  const [user] = await db
    .select({
      id: users.id,
      email: users.email,
      firstName: profiles.firstName,
    })
    .from(users)
    .innerJoin(profiles, eq(profiles.userId, users.id))
    .where(eq(users.email, email))
    .limit(1);

  if (user) {
    const token = crypto.randomBytes(32).toString("hex");
    const expiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await db
      .update(users)
      .set({ passwordResetToken: token, passwordResetExpiry: expiry })
      .where(eq(users.id, user.id));

    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? "https://proxybuild.africa"}/reset-password?token=${token}`;

    // Fire-and-forget — don't block response on email delivery
    void sendPasswordReset({
      to: user.email,
      firstName: user.firstName,
      resetUrl,
    });
  }

  return NextResponse.json({ success: true });
}
