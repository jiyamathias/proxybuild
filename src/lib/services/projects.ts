import { db } from "@/lib/db";
import {
  projects,
  milestones,
  projectUpdates,
  projectMedia,
  documents,
  payments,
  messages,
  notifications,
  profiles,
  users,
  budgets,
  changeOrders,
} from "@/db/schema";
import { eq, and, desc, asc, count, sql } from "drizzle-orm";
import type { SessionUser } from "@/lib/auth/session";
import { isStaff } from "@/lib/permissions";

/** Returns a project only if the session user is authorized to view it */
export async function getProjectForUser(
  projectId: string,
  session: SessionUser
) {
  const where = isStaff(session)
    ? eq(projects.id, projectId)
    : and(eq(projects.id, projectId), eq(projects.clientId, session.id));

  const [project] = await db
    .select()
    .from(projects)
    .where(where)
    .limit(1);

  return project ?? null;
}

export async function getProjectMilestones(
  projectId: string,
  clientVisible = false
) {
  const where = clientVisible
    ? and(
        eq(milestones.projectId, projectId),
        eq(milestones.isClientVisible, true)
      )
    : eq(milestones.projectId, projectId);

  return db
    .select()
    .from(milestones)
    .where(where)
    .orderBy(asc(milestones.sequence));
}

export async function getProjectUpdates(
  projectId: string,
  clientVisible = false
) {
  const where = clientVisible
    ? and(
        eq(projectUpdates.projectId, projectId),
        eq(projectUpdates.isClientVisible, true),
        eq(projectUpdates.isPublished, true)
      )
    : eq(projectUpdates.projectId, projectId);

  const rows = await db
    .select({
      update: projectUpdates,
      authorFirstName: profiles.firstName,
      authorLastName: profiles.lastName,
    })
    .from(projectUpdates)
    .leftJoin(profiles, eq(profiles.userId, projectUpdates.authorId))
    .where(where)
    .orderBy(desc(projectUpdates.createdAt));

  return rows;
}

export async function getProjectMedia(
  projectId: string,
  clientVisible = false
) {
  const where = clientVisible
    ? and(
        eq(projectMedia.projectId, projectId),
        eq(projectMedia.isClientVisible, true)
      )
    : eq(projectMedia.projectId, projectId);

  return db
    .select()
    .from(projectMedia)
    .where(where)
    .orderBy(desc(projectMedia.createdAt));
}

export async function getProjectDocuments(
  projectId: string,
  clientVisible = false
) {
  const where = clientVisible
    ? and(
        eq(documents.projectId, projectId),
        eq(documents.isClientVisible, true)
      )
    : eq(documents.projectId, projectId);

  return db
    .select({
      doc: documents,
      uploaderFirstName: profiles.firstName,
      uploaderLastName: profiles.lastName,
    })
    .from(documents)
    .leftJoin(profiles, eq(profiles.userId, documents.uploadedById))
    .where(where)
    .orderBy(desc(documents.createdAt));
}

export async function getProjectPayments(projectId: string) {
  return db
    .select()
    .from(payments)
    .where(eq(payments.projectId, projectId))
    .orderBy(desc(payments.createdAt));
}

export async function getProjectBudget(projectId: string) {
  const [budget] = await db
    .select()
    .from(budgets)
    .where(eq(budgets.projectId, projectId))
    .limit(1);
  return budget ?? null;
}

export async function getProjectMessages(projectId: string) {
  return db
    .select({
      message: messages,
      senderFirstName: profiles.firstName,
      senderLastName: profiles.lastName,
      senderRole: users.role,
    })
    .from(messages)
    .leftJoin(profiles, eq(profiles.userId, messages.senderId))
    .leftJoin(users, eq(users.id, messages.senderId))
    .where(
      and(
        eq(messages.projectId, projectId),
        eq(messages.isDeleted, false)
      )
    )
    .orderBy(asc(messages.createdAt));
}

export async function getUnreadNotificationCount(userId: string) {
  const [{ value }] = await db
    .select({ value: count() })
    .from(notifications)
    .where(
      and(eq(notifications.userId, userId), eq(notifications.isRead, false))
    );
  return value;
}

export async function getUserNotifications(userId: string, limit = 30) {
  return db
    .select()
    .from(notifications)
    .where(eq(notifications.userId, userId))
    .orderBy(desc(notifications.createdAt))
    .limit(limit);
}
