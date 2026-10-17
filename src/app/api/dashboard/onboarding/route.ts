import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { profiles } from "@/db/schema";
import { eq } from "drizzle-orm";

/** Marks the first-run welcome as dismissed for the signed-in user. */
export async function POST() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await db
    .update(profiles)
    .set({ onboardedAt: new Date(), updatedAt: new Date() })
    .where(eq(profiles.userId, session.id));

  return NextResponse.json({ success: true });
}
