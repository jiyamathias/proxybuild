import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { projects, payments, users, profiles, notifications } from "@/db/schema";
import { eq, and, inArray } from "drizzle-orm";
import { sendPaymentReminder } from "@/lib/email";
import { formatCurrency } from "@/lib/utils";
import { isAuthorizedCron } from "@/lib/cron/auth";

export async function GET(req: NextRequest) {
  if (!isAuthorizedCron(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rows = await db
    .select({
      projectId: projects.id,
      title: projects.title,
      currency: projects.currency,
      budgetAmount: projects.budgetAmount,
      clientId: projects.clientId,
      email: users.email,
      firstName: profiles.firstName,
    })
    .from(projects)
    .innerJoin(users, eq(users.id, projects.clientId))
    .innerJoin(profiles, eq(profiles.userId, users.id))
    .where(
      and(
        inArray(projects.status, ["ACTIVE", "CONTRACT"]),
        eq(users.isActive, true)
      )
    );

  if (rows.length === 0) return NextResponse.json({ sent: 0 });

  const projectIds = rows.map((r) => r.projectId);

  const paidRows = await db
    .select({ projectId: payments.projectId, amount: payments.amount })
    .from(payments)
    .where(
      and(
        inArray(payments.projectId, projectIds),
        eq(payments.status, "SUCCESSFUL")
      )
    );

  const paidBy = new Map<string, number>();
  for (const p of paidRows) {
    paidBy.set(p.projectId, (paidBy.get(p.projectId) ?? 0) + Number(p.amount));
  }

  const due = rows
    .map((r) => {
      const budget = Number(r.budgetAmount ?? 0);
      const outstanding = budget - (paidBy.get(r.projectId) ?? 0);
      return { ...r, outstanding };
    })
    // Only chase a meaningful balance, so rounding dust never triggers mail
    .filter((r) => r.outstanding > 1);

  const results = await Promise.allSettled(
    due.map(async (r) => {
      const label = formatCurrency(r.outstanding, r.currency);

      const result = await sendPaymentReminder({
        to: r.email,
        firstName: r.firstName,
        projectId: r.projectId,
        projectTitle: r.title,
        outstandingLabel: label,
      });

      await db.insert(notifications).values({
        userId: r.clientId,
        type: "PAYMENT_REMINDER",
        title: `Outstanding balance: ${label}`,
        body: `A balance remains on ${r.title}.`,
        projectId: r.projectId,
        actionUrl: `/dashboard/projects/${r.projectId}/payments`,
      });

      return result;
    })
  );

  const sent = results.filter(
    (r) => r.status === "fulfilled" && r.value.success
  ).length;

  return NextResponse.json({
    candidates: due.length,
    sent,
    failed: results.length - sent,
  });
}
