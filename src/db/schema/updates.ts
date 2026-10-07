import {
  pgTable,
  uuid,
  text,
  timestamp,
  integer,
  boolean,
  index,
} from "drizzle-orm/pg-core";
import { projects } from "./projects";
import { milestones } from "./milestones";
import { users } from "./users";

export const projectUpdates = pgTable(
  "project_updates",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    milestoneId: uuid("milestone_id").references(() => milestones.id),
    authorId: uuid("author_id")
      .notNull()
      .references(() => users.id),

    title: text("title").notNull(),
    body: text("body").notNull(),
    progressDelta: integer("progress_delta").notNull().default(0),

    isClientVisible: boolean("is_client_visible").notNull().default(false),
    isPublished: boolean("is_published").notNull().default(false),
    publishedAt: timestamp("published_at"),

    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [
    index("project_updates_project_idx").on(t.projectId),
    index("project_updates_milestone_idx").on(t.milestoneId),
    index("project_updates_published_idx").on(t.isPublished),
  ]
);

export const projectMedia = pgTable(
  "project_media",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    milestoneId: uuid("milestone_id").references(() => milestones.id),
    updateId: uuid("update_id").references(() => projectUpdates.id),
    uploadedById: uuid("uploaded_by_id")
      .notNull()
      .references(() => users.id),

    mediaType: text("media_type").notNull(), // 'photo' | 'video'
    storageKey: text("storage_key").notNull(),
    thumbnailKey: text("thumbnail_key"),
    fileName: text("file_name").notNull(),
    mimeType: text("mime_type").notNull(),
    fileSizeBytes: integer("file_size_bytes"),
    caption: text("caption"),
    takenAt: timestamp("taken_at"),

    isClientVisible: boolean("is_client_visible").notNull().default(false),
    sortOrder: integer("sort_order").notNull().default(0),

    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [
    index("project_media_project_idx").on(t.projectId),
    index("project_media_milestone_idx").on(t.milestoneId),
    index("project_media_update_idx").on(t.updateId),
  ]
);
