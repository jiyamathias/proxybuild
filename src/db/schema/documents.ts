import {
  pgTable,
  uuid,
  text,
  timestamp,
  integer,
  boolean,
  pgEnum,
  index,
} from "drizzle-orm/pg-core";
import { projects } from "./projects";
import { milestones } from "./milestones";
import { users } from "./users";

export const documentCategoryEnum = pgEnum("document_category", [
  "ARCHITECTURAL_DRAWING",
  "STRUCTURAL_DRAWING",
  "ELECTRICAL_PLAN",
  "PLUMBING_PLAN",
  "BOQ",
  "CONTRACT",
  "PERMIT",
  "INVOICE",
  "RECEIPT",
  "REPORT",
  "WARRANTY",
  "PHOTO",
  "VIDEO",
  "OTHER",
]);

export const documents = pgTable(
  "documents",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    milestoneId: uuid("milestone_id").references(() => milestones.id),
    uploadedById: uuid("uploaded_by_id")
      .notNull()
      .references(() => users.id),

    category: documentCategoryEnum("category").notNull().default("OTHER"),
    title: text("title").notNull(),
    description: text("description"),
    storageKey: text("storage_key").notNull(),
    fileName: text("file_name").notNull(),
    mimeType: text("mime_type").notNull(),
    fileSizeBytes: integer("file_size_bytes"),
    version: integer("version").notNull().default(1),
    parentDocumentId: uuid("parent_document_id"),

    isClientVisible: boolean("is_client_visible").notNull().default(true),

    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [
    index("documents_project_idx").on(t.projectId),
    index("documents_milestone_idx").on(t.milestoneId),
    index("documents_category_idx").on(t.category),
  ]
);
