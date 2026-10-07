import {
  pgTable,
  uuid,
  text,
  timestamp,
  jsonb,
  index,
} from "drizzle-orm/pg-core";
import { users } from "./users";

export const auditLogs = pgTable(
  "audit_logs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    actorId: uuid("actor_id").references(() => users.id),
    actorEmail: text("actor_email"),
    action: text("action").notNull(),
    entityType: text("entity_type").notNull(),
    entityId: text("entity_id"),
    projectId: uuid("project_id"),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    // before/after snapshot for mutations
    before: jsonb("before"),
    after: jsonb("after"),
    metadata: jsonb("metadata"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [
    index("audit_actor_idx").on(t.actorId),
    index("audit_entity_idx").on(t.entityType, t.entityId),
    index("audit_project_idx").on(t.projectId),
    index("audit_action_idx").on(t.action),
    index("audit_created_idx").on(t.createdAt),
  ]
);
