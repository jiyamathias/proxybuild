import {
  pgTable,
  uuid,
  text,
  timestamp,
  pgEnum,
  index,
  jsonb,
} from "drizzle-orm/pg-core";
import { users } from "./users";

export const consultationStatusEnum = pgEnum("consultation_status", [
  "NEW",
  "REVIEWING",
  "CONTACTED",
  "SCHEDULED",
  "COMPLETED",
  "REJECTED",
]);

export const landStatusEnum = pgEnum("land_status", [
  "OWNED_WITH_TITLE",
  "OWNED_WITHOUT_TITLE",
  "FAMILY_LAND",
  "NOT_YET_ACQUIRED",
  "OTHER",
]);

export const consultations = pgTable(
  "consultations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    // Link to user account if they later register
    userId: uuid("user_id").references(() => users.id),

    // Contact information
    firstName: text("first_name").notNull(),
    lastName: text("last_name").notNull(),
    email: text("email").notNull(),
    phone: text("phone"),
    countryOfResidence: text("country_of_residence").notNull(),
    preferredContact: text("preferred_contact"), // 'email' | 'phone' | 'whatsapp'

    // Project information
    projectLocation: text("project_location").notNull(),
    projectState: text("project_state"),
    projectCountry: text("project_country").notNull().default("Nigeria"),
    projectType: text("project_type").notNull(),
    landStatus: landStatusEnum("land_status"),
    estimatedBudget: text("estimated_budget"),
    desiredTimeline: text("desired_timeline"),
    description: text("description").notNull(),

    // Status
    status: consultationStatusEnum("status").notNull().default("NEW"),
    internalNotes: text("internal_notes"),
    assignedToId: uuid("assigned_to_id").references(() => users.id),
    scheduledAt: timestamp("scheduled_at"),

    // Attachments stored as array of storage keys
    attachmentKeys: jsonb("attachment_keys").$type<string[]>(),

    // Metadata
    referralSource: text("referral_source"),
    ipAddress: text("ip_address"),

    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [
    index("consultations_email_idx").on(t.email),
    index("consultations_status_idx").on(t.status),
    index("consultations_created_idx").on(t.createdAt),
  ]
);
