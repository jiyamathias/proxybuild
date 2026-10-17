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
    // Admin marks a document (typically a CONTRACT) as needing client sign-off
    requiresSignature: boolean("requires_signature").notNull().default(false),

    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [
    index("documents_project_idx").on(t.projectId),
    index("documents_milestone_idx").on(t.milestoneId),
    index("documents_category_idx").on(t.category),
  ]
);

/**
 * Records a client's electronic acceptance of a document.
 *
 * Evidence captured follows common e-signature practice: who signed, the name they
 * typed, when, from where, and which exact version of the file was on screen.
 */
export const documentSignatures = pgTable(
  "document_signatures",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    documentId: uuid("document_id")
      .notNull()
      .references(() => documents.id, { onDelete: "cascade" }),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    signerId: uuid("signer_id")
      .notNull()
      .references(() => users.id),

    // Typed name is the signature mark; kept verbatim as entered
    signerName: text("signer_name").notNull(),
    // The exact wording the signer agreed to, stored so it survives copy changes
    agreementStatement: text("agreement_statement").notNull(),

    // What was actually on screen at signing
    documentVersion: integer("document_version").notNull(),
    documentStorageKey: text("document_storage_key").notNull(),

    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    signedAt: timestamp("signed_at").notNull().defaultNow(),
  },
  (t) => [
    index("document_signatures_document_idx").on(t.documentId),
    index("document_signatures_project_idx").on(t.projectId),
  ]
);
