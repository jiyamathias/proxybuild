import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { isStaff } from "@/lib/permissions";
import { getProjectForUser } from "@/lib/services/projects";
import { db } from "@/lib/db";
import { ledgerEntries } from "@/db/schema";
import { z } from "zod/v4";

const LEDGER_TYPES = [
  "CLIENT_PAYMENT",
  "MATERIAL_COST",
  "LABOUR_COST",
  "CONTRACTOR_COST",
  "PROFESSIONAL_FEE",
  "LOGISTICS",
  "OTHER_EXPENSE",
  "REFUND",
  "ADJUSTMENT",
  "CHANGE_ORDER",
  "PROXYBUILD_FEE",
] as const;

const schema = z.object({
  amount: z.number().positive(),
  currency: z.string(),
  entryType: z.enum(LEDGER_TYPES),
  description: z.string().min(1).max(500),
  milestoneId: z.string().uuid().nullable().optional(),
  entryDate: z.string(),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const session = await getSession();
  if (!session || !isStaff(session)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { projectId } = await params;
  const project = await getProjectForUser(projectId, session);
  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = schema.safeParse(await req.json());
  if (!body.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const { amount, currency, entryType, description, milestoneId, entryDate } = body.data;

  const [entry] = await db
    .insert(ledgerEntries)
    .values({
      projectId,
      recordedById: session.id,
      entryType,
      description,
      currency: currency as "NGN" | "USD" | "GBP" | "EUR" | "CAD" | "AUD",
      amount: amount.toString(),
      milestoneId: milestoneId ?? null,
      entryDate: new Date(entryDate),
    })
    .returning();

  return NextResponse.json({ entry });
}
