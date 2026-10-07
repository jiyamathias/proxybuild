import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { canManageFinance } from "@/lib/permissions";
import { db } from "@/lib/db";
import { budgets, budgetItems, auditLogs } from "@/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod/v4";

const itemSchema = z.object({
  category: z.string(),
  description: z.string().min(1),
  amount: z.string(),
  quantity: z.string().optional(),
  unitCost: z.string().optional(),
});

const schema = z.object({
  currency: z.string().default("NGN"),
  totalAmount: z.string(),
  notes: z.string().nullable().optional(),
  items: z.array(itemSchema),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const session = await getSession();
  if (!session || !canManageFinance(session)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { projectId } = await params;
  const body = schema.safeParse(await req.json());
  if (!body.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const { currency, totalAmount, notes, items } = body.data;

  // Upsert budget
  const existing = await db
    .select({ id: budgets.id })
    .from(budgets)
    .where(eq(budgets.projectId, projectId))
    .limit(1);

  let budgetId: string;

  if (existing.length > 0) {
    budgetId = existing[0].id;
    await db
      .update(budgets)
      .set({
        currency: currency as any,
        totalAmount,
        notes: notes ?? null,
        updatedAt: new Date(),
      })
      .where(eq(budgets.id, budgetId));
    // Delete old items and re-insert
    await db.delete(budgetItems).where(eq(budgetItems.budgetId, budgetId));
  } else {
    const [newBudget] = await db
      .insert(budgets)
      .values({
        projectId,
        currency: currency as any,
        totalAmount,
        notes: notes ?? null,
      })
      .returning({ id: budgets.id });
    budgetId = newBudget.id;
  }

  if (items.length > 0) {
    await db.insert(budgetItems).values(
      items.map((item) => ({
        budgetId,
        category: item.category as any,
        description: item.description,
        amount: item.amount,
        quantity: item.quantity ?? null,
        unitCost: item.unitCost ?? null,
      }))
    );
  }

  await db.insert(auditLogs).values({
    actorId: session.id,
    action: "UPDATE",
    entityType: "BUDGET",
    entityId: budgetId,
    after: { totalAmount, currency, itemCount: items.length },
  });

  return NextResponse.json({ success: true, budgetId });
}
