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
  jsonb,
} from "drizzle-orm/pg-core";
import { users } from "./users";

export const projectStatusEnum = pgEnum("project_status", [
  "ENQUIRY",
  "CONSULTATION",
  "SITE_ASSESSMENT",
  "PLANNING",
  "PROPOSAL",
  "CONTRACT",
  "ACTIVE",
  "ON_HOLD",
  "COMPLETED",
  "CANCELLED",
]);

export const projectHealthEnum = pgEnum("project_health", [
  "ON_TRACK",
  "AT_RISK",
  "DELAYED",
  "COMPLETED",
  "ON_HOLD",
  "CANCELLED",
]);

export const projectTypeEnum = pgEnum("project_type", [
  "RESIDENTIAL_NEW_BUILD",
  "RESIDENTIAL_RENOVATION",
  "RESIDENTIAL_FINISHING",
  "COMMERCIAL_NEW_BUILD",
  "COMMERCIAL_RENOVATION",
  "SITE_PREPARATION",
  "MAINTENANCE",
  "OTHER",
]);

export const currencyEnum = pgEnum("currency", [
  "NGN",
  "USD",
  "GBP",
  "CAD",
  "EUR",
  "AUD",
]);

export const projects = pgTable(
  "projects",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    slug: text("slug").notNull().unique(),
    title: text("title").notNull(),
    description: text("description"),
    projectType: projectTypeEnum("project_type").notNull(),
    status: projectStatusEnum("status").notNull().default("ENQUIRY"),
    health: projectHealthEnum("health").notNull().default("ON_TRACK"),
    healthNote: text("health_note"),
    progressPercent: integer("progress_percent").notNull().default(0),

    // Client
    clientId: uuid("client_id")
      .notNull()
      .references(() => users.id),

    // Location
    country: text("country").notNull().default("Nigeria"),
    state: text("state"),
    city: text("city"),
    area: text("area"),
    address: text("address"),
    latitude: numeric("latitude", { precision: 10, scale: 7 }),
    longitude: numeric("longitude", { precision: 10, scale: 7 }),

    // Financials
    currency: currencyEnum("currency").notNull().default("NGN"),
    budgetAmount: numeric("budget_amount", { precision: 18, scale: 2 }),
    contractValue: numeric("contract_value", { precision: 18, scale: 2 }),

    // Timeline
    plannedStartDate: timestamp("planned_start_date"),
    plannedEndDate: timestamp("planned_end_date"),
    actualStartDate: timestamp("actual_start_date"),
    actualEndDate: timestamp("actual_end_date"),

    // Cover
    coverImageUrl: text("cover_image_url"),

    // Internal
    internalNotes: text("internal_notes"),
    isPublic: boolean("is_public").notNull().default(false),
    metadata: jsonb("metadata"),

    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [
    index("projects_client_idx").on(t.clientId),
    index("projects_status_idx").on(t.status),
    index("projects_health_idx").on(t.health),
    index("projects_slug_idx").on(t.slug),
    index("projects_country_state_idx").on(t.country, t.state),
  ]
);

export const projectMembers = pgTable(
  "project_members",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id),
    role: text("role").notNull(),
    assignedAt: timestamp("assigned_at").notNull().defaultNow(),
    removedAt: timestamp("removed_at"),
    isActive: boolean("is_active").notNull().default(true),
  },
  (t) => [
    index("project_members_project_idx").on(t.projectId),
    index("project_members_user_idx").on(t.userId),
  ]
);
