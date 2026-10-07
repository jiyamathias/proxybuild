import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { getProjectForUser } from "@/lib/services/projects";
import { db } from "@/lib/db";
import { messages, profiles, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod/v4";

const schema = z.object({
  body: z.string().min(1).max(5000),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { projectId } = await params;
  const project = await getProjectForUser(projectId, session);
  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = schema.safeParse(await req.json());
  if (!body.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const [inserted] = await db
    .insert(messages)
    .values({
      projectId,
      senderId: session.id,
      body: body.data.body,
    })
    .returning();

  // Fetch sender profile for the response
  const [profile] = await db
    .select({ firstName: profiles.firstName, lastName: profiles.lastName })
    .from(profiles)
    .where(eq(profiles.userId, session.id))
    .limit(1);

  return NextResponse.json({
    message: {
      message: inserted,
      senderFirstName: profile?.firstName ?? null,
      senderLastName: profile?.lastName ?? null,
      senderRole: session.role,
    },
  });
}
