import {
  pgTable,
  uuid,
  text,
  timestamp,
  boolean,
  pgEnum,
  index,
  integer,
} from "drizzle-orm/pg-core";
import { projects } from "./projects";
import { users } from "./users";

export const notificationTypeEnum = pgEnum("notification_type", [
  "PROJECT_CREATED",
  "MILESTONE_STARTED",
  "MILESTONE_COMPLETED",
  "MILESTONE_AWAITING_APPROVAL",
  "CLIENT_APPROVAL_RECEIVED",
  "PAYMENT_RECORDED",
  "PAYMENT_REMINDER",
  "NEW_UPDATE",
  "NEW_DOCUMENT",
  "NEW_MESSAGE",
  "PROJECT_DELAY",
  "PROJECT_COMPLETED",
  "CONSULTATION_RECEIVED",
  "CHANGE_ORDER_SUBMITTED",
  "CHANGE_ORDER_APPROVED",
]);

export const messages = pgTable(
  "messages",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    senderId: uuid("sender_id")
      .notNull()
      .references(() => users.id),
    parentMessageId: uuid("parent_message_id"),

    body: text("body").notNull(),
    isRead: boolean("is_read").notNull().default(false),
    readAt: timestamp("read_at"),
    isDeleted: boolean("is_deleted").notNull().default(false),

    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [
    index("messages_project_idx").on(t.projectId),
    index("messages_sender_idx").on(t.senderId),
    index("messages_created_idx").on(t.createdAt),
  ]
);

export const messageAttachments = pgTable("message_attachments", {
  id: uuid("id").primaryKey().defaultRandom(),
  messageId: uuid("message_id")
    .notNull()
    .references(() => messages.id, { onDelete: "cascade" }),
  storageKey: text("storage_key").notNull(),
  fileName: text("file_name").notNull(),
  mimeType: text("mime_type").notNull(),
  fileSizeBytes: integer("file_size_bytes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const notifications = pgTable(
  "notifications",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: notificationTypeEnum("type").notNull(),
    title: text("title").notNull(),
    body: text("body"),
    actionUrl: text("action_url"),
    isRead: boolean("is_read").notNull().default(false),
    readAt: timestamp("read_at"),
    projectId: uuid("project_id").references(() => projects.id),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [
    index("notifications_user_idx").on(t.userId),
    index("notifications_read_idx").on(t.userId, t.isRead),
    index("notifications_project_idx").on(t.projectId),
  ]
);
