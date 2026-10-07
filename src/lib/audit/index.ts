import { db } from "@/lib/db";
import { auditLogs } from "@/db/schema";

type AuditParams = {
  actorId?: string;
  actorEmail?: string;
  action: string;
  entityType: string;
  entityId?: string;
  projectId?: string;
  ipAddress?: string;
  before?: Record<string, unknown>;
  after?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
};

export async function createAuditLog(params: AuditParams): Promise<void> {
  await db.insert(auditLogs).values({
    actorId: params.actorId,
    actorEmail: params.actorEmail,
    action: params.action,
    entityType: params.entityType,
    entityId: params.entityId,
    projectId: params.projectId,
    ipAddress: params.ipAddress,
    before: params.before,
    after: params.after,
    metadata: params.metadata,
  });
}

export const AuditActions = {
  USER_CREATED: "user.created",
  USER_INVITED: "user.invited",
  USER_LOGIN: "user.login",
  USER_LOGOUT: "user.logout",
  USER_ROLE_CHANGED: "user.role_changed",
  USER_PASSWORD_RESET: "user.password_reset",

  PROJECT_CREATED: "project.created",
  PROJECT_UPDATED: "project.updated",
  PROJECT_STATUS_CHANGED: "project.status_changed",
  PROJECT_HEALTH_CHANGED: "project.health_changed",
  PROJECT_DELETED: "project.deleted",

  MILESTONE_CREATED: "milestone.created",
  MILESTONE_UPDATED: "milestone.updated",
  MILESTONE_STATUS_CHANGED: "milestone.status_changed",
  MILESTONE_APPROVED: "milestone.approved",
  MILESTONE_REJECTED: "milestone.rejected",

  PAYMENT_RECORDED: "payment.recorded",
  PAYMENT_APPROVED: "payment.approved",
  PAYMENT_STATUS_CHANGED: "payment.status_changed",

  DOCUMENT_UPLOADED: "document.uploaded",
  DOCUMENT_DELETED: "document.deleted",

  CHANGE_ORDER_CREATED: "change_order.created",
  CHANGE_ORDER_APPROVED: "change_order.approved",
  CHANGE_ORDER_REJECTED: "change_order.rejected",

  CONSULTATION_CREATED: "consultation.created",
  CONSULTATION_STATUS_CHANGED: "consultation.status_changed",
} as const;
