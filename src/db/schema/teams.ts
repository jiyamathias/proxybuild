import {
  pgTable,
  uuid,
  text,
  timestamp,
  boolean,
  index,
  pgEnum,
} from "drizzle-orm/pg-core";
import { users } from "./users";
import { projects } from "./projects";

export const teamSpecializationEnum = pgEnum("team_specialization", [
  "GENERAL_CONSTRUCTION",
  "MASONRY",
  "ROOFING",
  "PLUMBING",
  "ELECTRICAL",
  "PAINTING",
  "TILING",
  "CARPENTRY",
  "ALUMINIUM",
  "STEEL",
  "LANDSCAPING",
  "FINISHING",
  "SITE_PREPARATION",
  "OTHER",
]);

export const teams = pgTable("teams", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  specialization: teamSpecializationEnum("specialization").notNull(),
  description: text("description"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const teamMembers = pgTable(
  "team_members",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    teamId: uuid("team_id")
      .notNull()
      .references(() => teams.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id),
    roleInTeam: text("role_in_team"),
    joinedAt: timestamp("joined_at").notNull().defaultNow(),
    leftAt: timestamp("left_at"),
    isActive: boolean("is_active").notNull().default(true),
  },
  (t) => [
    index("team_members_team_idx").on(t.teamId),
    index("team_members_user_idx").on(t.userId),
  ]
);

export const teamAssignments = pgTable(
  "team_assignments",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    teamId: uuid("team_id")
      .notNull()
      .references(() => teams.id),
    assignedById: uuid("assigned_by_id").references(() => users.id),
    startDate: timestamp("start_date"),
    endDate: timestamp("end_date"),
    isActive: boolean("is_active").notNull().default(true),
    notes: text("notes"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [
    index("team_assignments_project_idx").on(t.projectId),
    index("team_assignments_team_idx").on(t.teamId),
  ]
);
