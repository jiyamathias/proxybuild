import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { getProjectForUser } from "@/lib/services/projects";
import { db } from "@/lib/db";
import { messages, users } from "@/db/schema";
import { eq, and, inArray, ne } from "drizzle-orm";
import { isStaff } from "@/lib/permissions";

export async function PATCH(
  _req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { projectId } = await params;
  const project = await getProjectForUser(projectId, session);
  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const now = new Date();

  if (isStaff(session)) {
    // Admin reading: mark CLIENT messages as read
    const clientMessages = await db
      .select({ id: messages.id })
      .from(messages)
      .innerJoin(users, eq(users.id, messages.senderId))
      .where(
        and(
          eq(messages.projectId, projectId),
          eq(messages.isRead, false),
          eq(messages.isDeleted, false),
          eq(users.role, "CLIENT")
        )
      );

    if (clientMessages.length > 0) {
      await db
        .update(messages)
        .set({ isRead: true, readAt: now })
        .where(
          inArray(
            messages.id,
            clientMessages.map((m) => m.id)
          )
        );
    }
  } else {
    // Client reading: mark staff messages as read
    const staffMessages = await db
      .select({ id: messages.id })
      .from(messages)
      .innerJoin(users, eq(users.id, messages.senderId))
      .where(
        and(
          eq(messages.projectId, projectId),
          eq(messages.isRead, false),
          eq(messages.isDeleted, false),
          ne(users.role, "CLIENT")
        )
      );

    if (staffMessages.length > 0) {
      await db
        .update(messages)
        .set({ isRead: true, readAt: now })
        .where(
          inArray(
            messages.id,
            staffMessages.map((m) => m.id)
          )
        );
    }
  }

  return NextResponse.json({ success: true });
}
