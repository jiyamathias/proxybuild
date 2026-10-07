import {
  pgTable,
  uuid,
  text,
  timestamp,
  integer,
  numeric,
  boolean,
  pgEnum,
  index,
} from "drizzle-orm/pg-core";
import { projects } from "./projects";
import { users } from "./users";

export const milestoneStatusEnum = pgEnum("milestone_status", [
  "NOT_STARTED",
  "IN_PROGRESS",
  "COMPLETED",
  "APPROVED",
  "ON_HOLD",
]);

export const milestoneApprovalStatusEnum = pgEnum("milestone_approval_status", [
  "PENDING",
  "AWAITING_CLIENT",
  "APPROVED",
  "REJECTED",
  "REVISION_REQUESTED",
]);

export const milestones = pgTable(
  "milestones",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    description: text("description"),
    sequence: integer("sequence").notNull(),
    weightPercent: integer("weight_percent").notNull().default(0),
    budgetAmount: numeric("budget_amount", { precision: 18, scale: 2 }),

    status: milestoneStatusEnum("status").notNull().default("NOT_STARTED"),
    approvalStatus: milestoneApprovalStatusEnum("approval_status")
      .notNull()
      .default("PENDING"),

    plannedStartDate: timestamp("planned_start_date"),
    plannedEndDate: timestamp("planned_end_date"),
    actualStartDate: timestamp("actual_start_date"),
    actualEndDate: timestamp("actual_end_date"),

    // Displayed to client
    clientVisibleTitle: text("client_visible_title"),
    clientVisibleStatus: text("client_visible_status"),

    notes: text("notes"),
    isClientVisible: boolean("is_client_visible").notNull().default(true),

    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [
    index("milestones_project_idx").on(t.projectId),
    index("milestones_status_idx").on(t.status),
    index("milestones_sequence_idx").on(t.projectId, t.sequence),
  ]
);

export const milestoneApprovals = pgTable(
  "milestone_approvals",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    milestoneId: uuid("milestone_id")
      .notNull()
      .references(() => milestones.id, { onDelete: "cascade" }),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id),
    reviewedById: uuid("reviewed_by_id").references(() => users.id),
    decision: milestoneApprovalStatusEnum("decision").notNull(),
    comment: text("comment"),
    reviewedAt: timestamp("reviewed_at").notNull().defaultNow(),
  },
  (t) => [
    index("milestone_approvals_milestone_idx").on(t.milestoneId),
    index("milestone_approvals_project_idx").on(t.projectId),
  ]
);
