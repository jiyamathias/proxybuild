import { db } from "@/lib/db";
import {
  budgets,
  budgetItems,
  payments,
  ledgerEntries,
  changeOrders,
  projects,
  profiles,
  users,
  milestones,
} from "@/db/schema";
import { eq, desc, asc, sum, and } from "drizzle-orm";

export async function getProjectFinancials(projectId: string) {
  const [budget, budgetItemRows, paymentRows, ledgerRows, changeOrderRows] =
    await Promise.all([
      db
        .select()
        .from(budgets)
        .where(eq(budgets.projectId, projectId))
        .limit(1)
        .then((r) => r[0] ?? null),

      db
        .select({
          item: budgetItems,
          milestoneName: milestones.title,
        })
        .from(budgetItems)
        .leftJoin(
          budgets,
          eq(budgets.id, budgetItems.budgetId)
        )
        .leftJoin(milestones, eq(milestones.id, budgetItems.milestoneId))
        .where(eq(budgets.projectId, projectId))
        .orderBy(asc(budgetItems.category)),

      db
        .select({
          payment: payments,
          payerFirstName: profiles.firstName,
          payerLastName: profiles.lastName,
        })
        .from(payments)
        .leftJoin(profiles, eq(profiles.userId, payments.payerId))
        .where(eq(payments.projectId, projectId))
        .orderBy(desc(payments.createdAt)),

      db
        .select({
          entry: ledgerEntries,
          recorderFirstName: profiles.firstName,
          recorderLastName: profiles.lastName,
        })
        .from(ledgerEntries)
        .leftJoin(profiles, eq(profiles.userId, ledgerEntries.recordedById))
        .where(eq(ledgerEntries.projectId, projectId))
        .orderBy(desc(ledgerEntries.entryDate)),

      db
        .select()
        .from(changeOrders)
        .where(eq(changeOrders.projectId, projectId))
        .orderBy(desc(changeOrders.createdAt)),
    ]);

  return {
    budget,
    budgetItems: budgetItemRows,
    payments: paymentRows,
    ledger: ledgerRows,
    changeOrders: changeOrderRows,
  };
}

export async function getProjectChangeOrders(projectId: string) {
  return db
    .select()
    .from(changeOrders)
    .where(eq(changeOrders.projectId, projectId))
    .orderBy(desc(changeOrders.createdAt));
}
