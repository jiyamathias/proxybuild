import { db } from "@/lib/db";
import { auditLogs } from "@/db/schema";
import { headers } from "next/headers";

type AuditParams = {
  actorId?: string;
  actorEmail?: string;
  action: string;
  entityType: string;
  entityId?: string;
  projectId?: string;
  ipAddress?: string;
  userAgent?: string;
  before?: Record<string, unknown>;
  after?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
};

/** Keys whose values must never reach the audit trail. */
const REDACTED_KEYS = [
  "password",
  "newpassword",
  "currentpassword",
  "passwordhash",
  "token",
  "secret",
  "apikey",
  "authorization",
];

/**
 * Strips credential-like values from before/after snapshots.
 *
 * Audit records are long-lived and widely readable by staff, so a secret that
 * lands here is far harder to contain than one in a transient log line.
 */
function redact(
  obj: Record<string, unknown> | undefined
): Record<string, unknown> | undefined {
  if (!obj) return undefined;
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) {
    out[k] = REDACTED_KEYS.includes(k.toLowerCase()) ? "[redacted]" : v;
  }
  return out;
}

/**
 * Reads IP and user agent from the incoming request.
 *
 * Safe to call from any server context; returns empty values when no request
 * scope is available (background jobs, webhooks invoked outside a request).
 */
export async function auditContext(): Promise<{
  ipAddress?: string;
  userAgent?: string;
}> {
  try {
    const h = await headers();
    return {
      ipAddress:
        h.get("x-forwarded-for")?.split(",")[0].trim() ??
        h.get("x-real-ip") ??
        undefined,
      userAgent: h.get("user-agent") ?? undefined,
    };
  } catch {
    return {};
  }
}

/**
 * Writes an audit record.
 *
 * Never throws. A failed audit write must not roll back or block the business
 * operation that triggered it — the failure is reported to the server log instead,
 * where infrastructure alerting can pick it up.
 */
export async function createAuditLog(params: AuditParams): Promise<void> {
  try {
    // Capture request context automatically unless the caller supplied it
    const ctx =
      params.ipAddress && params.userAgent ? {} : await auditContext();

    await db.insert(auditLogs).values({
      actorId: params.actorId,
      actorEmail: params.actorEmail,
      action: params.action,
      entityType: params.entityType,
      entityId: params.entityId,
      projectId: params.projectId,
      ipAddress: params.ipAddress ?? ctx.ipAddress,
      userAgent: params.userAgent ?? ctx.userAgent,
      before: redact(params.before),
      after: redact(params.after),
      metadata: redact(params.metadata),
    });
  } catch (err) {
    console.error("[Audit] Failed to write audit log", {
      action: params.action,
      entityType: params.entityType,
      entityId: params.entityId,
      err,
    });
  }
}

export const AuditActions = {
  USER_CREATED: "user.created",
  USER_INVITED: "user.invited",
  USER_LOGIN: "user.login",
  USER_LOGOUT: "user.logout",
  USER_ROLE_CHANGED: "user.role_changed",
  USER_PASSWORD_RESET: "user.password_reset",
  USER_PASSWORD_RESET_REQUESTED: "user.password_reset_requested",
  USER_PASSWORD_CHANGED: "user.password_changed",
  USER_LOGIN_FAILED: "user.login_failed",
  USER_PROFILE_UPDATED: "user.profile_updated",

  PROJECT_CREATED: "project.created",
  PROJECT_UPDATED: "project.updated",
  PROJECT_STATUS_CHANGED: "project.status_changed",
  PROJECT_HEALTH_CHANGED: "project.health_changed",
  PROJECT_DELETED: "project.deleted",

  MILESTONE_CREATED: "milestone.created",
  MILESTONE_UPDATED: "milestone.updated",
  MILESTONE_DELETED: "milestone.deleted",
  MILESTONE_STATUS_CHANGED: "milestone.status_changed",
  MILESTONE_APPROVED: "milestone.approved",
  MILESTONE_REJECTED: "milestone.rejected",

  PAYMENT_RECORDED: "payment.recorded",
  PAYMENT_APPROVED: "payment.approved",
  PAYMENT_STATUS_CHANGED: "payment.status_changed",

  DOCUMENT_UPLOADED: "document.uploaded",
  DOCUMENT_DELETED: "document.deleted",
  DOCUMENT_SIGNED: "document.signed",

  MEDIA_UPLOADED: "media.uploaded",
  MEDIA_DELETED: "media.deleted",

  BUDGET_UPDATED: "budget.updated",

  CHANGE_ORDER_CREATED: "change_order.created",
  CHANGE_ORDER_APPROVED: "change_order.approved",
  CHANGE_ORDER_REJECTED: "change_order.rejected",

  CONSULTATION_CREATED: "consultation.created",
  CONSULTATION_STATUS_CHANGED: "consultation.status_changed",

  UPDATE_PUBLISHED: "update.published",
  LEDGER_ENTRY_CREATED: "ledger_entry.created",
  SITE_VISIT_REQUESTED: "site_visit.requested",
} as const;
