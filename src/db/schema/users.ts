import {
  pgTable,
  uuid,
  text,
  timestamp,
  boolean,
  pgEnum,
  index,
} from "drizzle-orm/pg-core";

export const userRoleEnum = pgEnum("user_role", [
  "SUPER_ADMIN",
  "ADMIN",
  "PROJECT_MANAGER",
  "SITE_SUPERVISOR",
  "FINANCE",
  "CLIENT",
]);

export const users = pgTable(
  "users",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    email: text("email").notNull().unique(),
    passwordHash: text("password_hash"),
    role: userRoleEnum("role").notNull().default("CLIENT"),
    emailVerified: boolean("email_verified").notNull().default(false),
    emailVerificationToken: text("email_verification_token"),
    emailVerificationExpiry: timestamp("email_verification_expiry"),
    passwordResetToken: text("password_reset_token"),
    passwordResetExpiry: timestamp("password_reset_expiry"),
    isActive: boolean("is_active").notNull().default(true),
    invitedBy: uuid("invited_by"),
    lastLoginAt: timestamp("last_login_at"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [
    index("users_email_idx").on(t.email),
    index("users_role_idx").on(t.role),
  ]
);

export const profiles = pgTable("profiles", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" })
    .unique(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  phone: text("phone"),
  avatarUrl: text("avatar_url"),
  countryOfResidence: text("country_of_residence"),
  timezone: text("timezone"),
  bio: text("bio"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const sessions = pgTable(
  "sessions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    token: text("token").notNull().unique(),
    expiresAt: timestamp("expires_at").notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [
    index("sessions_token_idx").on(t.token),
    index("sessions_user_idx").on(t.userId),
  ]
);
