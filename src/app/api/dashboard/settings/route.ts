import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { profiles } from "@/db/schema";
import { eq } from "drizzle-orm";
import { createAuditLog, AuditActions } from "@/lib/audit";
import { z } from "zod/v4";

const schema = z.object({
  firstName: z.string().min(1).max(100).optional(),
  lastName: z.string().min(1).max(100).optional(),
  phone: z.string().max(30).optional(),
  countryOfResidence: z.string().max(100).optional(),
  timezone: z.string().max(60).optional(),
  // "" is the "Naira only" choice from the select; normalise it to null
  preferredCurrency: z
    .union([z.enum(["GBP", "USD", "CAD", "EUR", "AUD"]), z.literal("")])
    .optional()
    .transform((v) => (v === "" ? null : v)),
});

export async function PATCH(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = schema.safeParse(await req.json());
  if (!body.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  await db
    .update(profiles)
    .set({ ...body.data, updatedAt: new Date() })
    .where(eq(profiles.userId, session.id));

  await createAuditLog({
    actorId: session.id,
    actorEmail: session.email,
    action: AuditActions.USER_PROFILE_UPDATED,
    entityType: "user",
    entityId: session.id,
    after: body.data,
    metadata: { selfEdit: true },
  });

  return NextResponse.json({ success: true });
}
