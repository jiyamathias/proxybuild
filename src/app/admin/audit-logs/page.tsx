export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { canViewAuditLogs } from "@/lib/permissions";
import { db } from "@/lib/db";
import { auditLogs, profiles, users } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { Badge } from "@/components/ui/badge";
import { formatRelativeDate } from "@/lib/utils";
import { Shield } from "lucide-react";

function actionVariant(action: string): "success" | "warning" | "danger" | "secondary" | "default" {
  if (action.includes("deleted") || action.includes("rejected") || action.includes("cancelled")) return "danger";
  if (action.includes("approved") || action.includes("created") || action.includes("login")) return "success";
  if (action.includes("updated") || action.includes("changed") || action.includes("status")) return "warning";
  return "secondary";
}

function actionColor(action: string) {
  if (action.startsWith("user.")) return "text-blue-400";
  if (action.startsWith("project.")) return "text-purple-400";
  if (action.startsWith("milestone.")) return "text-[var(--pb-green)]";
  if (action.startsWith("payment.")) return "text-[var(--pb-success)]";
  if (action.startsWith("document.")) return "text-yellow-400";
  if (action.startsWith("change_order.")) return "text-pink-400";
  return "text-[var(--pb-text-muted)]";
}

export default async function AuditLogsPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!canViewAuditLogs(session)) redirect("/admin");

  const logs = await db
    .select({
      log: auditLogs,
      actorFirstName: profiles.firstName,
      actorLastName: profiles.lastName,
      actorEmail: users.email,
    })
    .from(auditLogs)
    .leftJoin(profiles, eq(profiles.userId, auditLogs.actorId))
    .leftJoin(users, eq(users.id, auditLogs.actorId))
    .orderBy(desc(auditLogs.createdAt))
    .limit(200);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Shield className="h-6 w-6 text-[var(--pb-text-muted)]" />
          Audit Logs
        </h1>
        <p className="text-sm text-[var(--pb-text-muted)] mt-0.5">
          Last {logs.length} actions · SUPER_ADMIN and ADMIN only
        </p>
      </div>

      {logs.length === 0 ? (
        <p className="text-sm text-[var(--pb-text-muted)]">
          No audit events yet.
        </p>
      ) : (
        <div className="space-y-1">
          {logs.map(({ log, actorFirstName, actorLastName, actorEmail }) => {
            const actorName =
              actorFirstName || actorLastName
                ? `${actorFirstName ?? ""} ${actorLastName ?? ""}`.trim()
                : actorEmail ?? log.actorEmail ?? "System";

            return (
              <div
                key={log.id}
                className="flex items-start gap-3 px-4 py-3 rounded-lg hover:bg-[var(--pb-surface-elevated)] transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium text-white">
                      {actorName}
                    </span>
                    <span
                      className={`text-xs font-mono ${actionColor(log.action)}`}
                    >
                      {log.action}
                    </span>
                    {log.entityType && (
                      <span className="text-xs text-[var(--pb-text-subtle)]">
                        {log.entityType}
                        {log.entityId && (
                          <span className="font-mono opacity-60">
                            {" "}
                            {log.entityId.slice(0, 8)}…
                          </span>
                        )}
                      </span>
                    )}
                  </div>
                  {log.after != null && Object.keys(log.after as object).length > 0 && (
                    <p className="text-xs text-[var(--pb-text-subtle)] mt-0.5 font-mono truncate">
                      {JSON.stringify(log.after)}
                    </p>
                  )}
                </div>
                <span className="text-xs text-[var(--pb-text-subtle)] shrink-0 whitespace-nowrap">
                  {formatRelativeDate(log.createdAt)}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
