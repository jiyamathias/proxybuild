import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/db/schema";
import { eq, and, gt } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { z } from "zod/v4";

const schema = z.object({
  token: z.string().min(1),
  password: z.string().min(8).max(128),
});

export async function POST(req: NextRequest) {
  const body = schema.safeParse(await req.json());
  if (!body.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const { token, password } = body.data;

  const [user] = await db
    .select({ id: users.id })
    .from(users)
    .where(
      and(
        eq(users.passwordResetToken, token),
        gt(users.passwordResetExpiry, new Date())
      )
    )
    .limit(1);

  if (!user) {
    return NextResponse.json(
      { error: "Reset link is invalid or has expired" },
      { status: 400 }
    );
  }

  const hash = await bcrypt.hash(password, 12);

  await db
    .update(users)
    .set({
      passwordHash: hash,
      passwordResetToken: null,
      passwordResetExpiry: null,
      updatedAt: new Date(),
    })
    .where(eq(users.id, user.id));

  return NextResponse.json({ success: true });
}
