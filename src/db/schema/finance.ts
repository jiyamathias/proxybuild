import {
  pgTable,
  uuid,
  text,
  timestamp,
  numeric,
  boolean,
  pgEnum,
  index,
  jsonb,
} from "drizzle-orm/pg-core";
import { projects } from "./projects";
import { milestones } from "./milestones";
import { users } from "./users";
import { currencyEnum } from "./projects";

export const paymentStatusEnum = pgEnum("payment_status", [
  "PENDING",
  "PROCESSING",
  "SUCCESSFUL",
  "FAILED",
  "REFUNDED",
  "PARTIALLY_REFUNDED",
  "CANCELLED",
]);

export const changeOrderStatusEnum = pgEnum("change_order_status", [
  "DRAFT",
  "SUBMITTED",
  "UNDER_REVIEW",
  "APPROVED",
  "REJECTED",
  "IMPLEMENTED",
]);

export const budgetItemCategoryEnum = pgEnum("budget_item_category", [
  "MATERIAL",
  "LABOUR",
  "CONTRACTOR",
  "PROFESSIONAL_FEES",
  "LOGISTICS",
  "PROXYBUILD_FEE",
  "CONTINGENCY",
  "OTHER",
]);

export const ledgerEntryTypeEnum = pgEnum("ledger_entry_type", [
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
]);

export const budgets = pgTable("budgets", {
  id: uuid("id").primaryKey().defaultRandom(),
  projectId: uuid("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" })
    .unique(),
  currency: currencyEnum("currency").notNull().default("NGN"),
  totalAmount: numeric("total_amount", { precision: 18, scale: 2 }).notNull(),
  approvedAt: timestamp("approved_at"),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const budgetItems = pgTable(
  "budget_items",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    budgetId: uuid("budget_id")
      .notNull()
      .references(() => budgets.id, { onDelete: "cascade" }),
    milestoneId: uuid("milestone_id").references(() => milestones.id),
    category: budgetItemCategoryEnum("category").notNull(),
    description: text("description").notNull(),
    quantity: numeric("quantity", { precision: 10, scale: 2 }),
    unitCost: numeric("unit_cost", { precision: 18, scale: 2 }),
    amount: numeric("amount", { precision: 18, scale: 2 }).notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [index("budget_items_budget_idx").on(t.budgetId)]
);

export const payments = pgTable(
  "payments",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id),
    milestoneId: uuid("milestone_id").references(() => milestones.id),
    payerId: uuid("payer_id").references(() => users.id),
    recordedById: uuid("recorded_by_id").references(() => users.id),

    currency: currencyEnum("currency").notNull(),
    amount: numeric("amount", { precision: 18, scale: 2 }).notNull(),
    exchangeRateToNgn: numeric("exchange_rate_to_ngn", {
      precision: 18,
      scale: 6,
    }),

    status: paymentStatusEnum("status").notNull().default("PENDING"),
    provider: text("provider"),
    providerReference: text("provider_reference"),
    description: text("description"),
    receiptUrl: text("receipt_url"),
    paidAt: timestamp("paid_at"),

    // Client must confirm before milestone is unlocked
    clientApproved: boolean("client_approved").notNull().default(false),
    clientApprovedAt: timestamp("client_approved_at"),

    metadata: jsonb("metadata"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [
    index("payments_project_idx").on(t.projectId),
    index("payments_status_idx").on(t.status),
    index("payments_payer_idx").on(t.payerId),
  ]
);

export const ledgerEntries = pgTable(
  "ledger_entries",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id),
    milestoneId: uuid("milestone_id").references(() => milestones.id),
    recordedById: uuid("recorded_by_id")
      .notNull()
      .references(() => users.id),

    entryType: ledgerEntryTypeEnum("entry_type").notNull(),
    description: text("description").notNull(),
    currency: currencyEnum("currency").notNull(),
    amount: numeric("amount", { precision: 18, scale: 2 }).notNull(),
    referenceId: uuid("reference_id"),
    referenceType: text("reference_type"),

    entryDate: timestamp("entry_date").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [
    index("ledger_project_idx").on(t.projectId),
    index("ledger_type_idx").on(t.entryType),
    index("ledger_date_idx").on(t.entryDate),
  ]
);

export const changeOrders = pgTable(
  "change_orders",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id),
    requestedById: uuid("requested_by_id").references(() => users.id),
    reviewedById: uuid("reviewed_by_id").references(() => users.id),

    title: text("title").notNull(),
    description: text("description").notNull(),
    reason: text("reason"),
    costImpact: numeric("cost_impact", { precision: 18, scale: 2 }),
    timelineImpactDays: numeric("timeline_impact_days", {
      precision: 5,
      scale: 0,
    }),

    status: changeOrderStatusEnum("status").notNull().default("DRAFT"),
    clientApproved: boolean("client_approved"),
    clientComment: text("client_comment"),
    clientRespondedAt: timestamp("client_responded_at"),

    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [
    index("change_orders_project_idx").on(t.projectId),
    index("change_orders_status_idx").on(t.status),
  ]
);
