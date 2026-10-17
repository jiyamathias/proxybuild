import { NextResponse } from "next/server";
import { deleteSession, getSession } from "@/lib/auth/session";
import { createAuditLog, AuditActions } from "@/lib/audit";

export async function POST() {
  // Resolve identity before the session is destroyed
  const session = await getSession();

  await deleteSession();

  if (session) {
    await createAuditLog({
      actorId: session.id,
      actorEmail: session.email,
      action: AuditActions.USER_LOGOUT,
      entityType: "user",
      entityId: session.id,
    });
  }

  return NextResponse.redirect(
    new URL("/", process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
    303
  );
}
