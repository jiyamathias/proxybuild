import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { notifications } from "@/db/schema";
import { and, eq } from "drizzle-orm";

export async function POST() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await db
    .update(notifications)
    .set({ isRead: true, readAt: new Date() })
    .where(
      and(eq(notifications.userId, session.id), eq(notifications.isRead, false))
    );

  return NextResponse.json({ success: true });
}
