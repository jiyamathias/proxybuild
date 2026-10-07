export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { getUserNotifications } from "@/lib/services/projects";
import { formatRelativeDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { MarkAllReadButton } from "@/components/dashboard/mark-all-read-button";
import {
  Bell,
  CheckCircle2,
  DollarSign,
  MessageSquare,
  FileText,
  AlertCircle,
  Info,
} from "lucide-react";

function notifIcon(type: string) {
  const cls = "h-4 w-4";
  switch (type) {
    case "MILESTONE_APPROVED":
    case "MILESTONE_COMPLETED":
      return <CheckCircle2 className={`${cls} text-[var(--pb-success)]`} />;
    case "PAYMENT_RECEIVED":
    case "PAYMENT_DUE":
      return <DollarSign className={`${cls} text-yellow-500`} />;
    case "NEW_MESSAGE":
      return <MessageSquare className={`${cls} text-blue-400`} />;
    case "DOCUMENT_ADDED":
      return <FileText className={`${cls} text-purple-400`} />;
    case "PROJECT_UPDATE":
      return <Info className={`${cls} text-[var(--pb-orange)]`} />;
    case "ACTION_REQUIRED":
      return <AlertCircle className={`${cls} text-[var(--pb-danger)]`} />;
    default:
      return <Bell className={`${cls} text-[var(--pb-text-muted)]`} />;
  }
}

export default async function NotificationsPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const notifications = await getUserNotifications(session.id, 50);
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-white">Notifications</h1>
          {unreadCount > 0 && (
            <p className="text-sm text-[var(--pb-text-muted)] mt-0.5">
              {unreadCount} unread
            </p>
          )}
        </div>
        {unreadCount > 0 && <MarkAllReadButton />}
      </div>

      {notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Bell className="h-12 w-12 text-[var(--pb-border)] mb-4" />
          <h3 className="text-base font-semibold text-white mb-1">
            No notifications
          </h3>
          <p className="text-sm text-[var(--pb-text-muted)]">
            You&apos;re all caught up. Notifications will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-1">
          {notifications.map((notif) => (
            <div
              key={notif.id}
              className={`flex gap-4 p-4 rounded-xl border transition-colors ${
                !notif.isRead
                  ? "bg-[var(--pb-orange-muted)] border-[var(--pb-orange)]/20"
                  : "bg-[var(--pb-surface-elevated)] border-[var(--pb-border-subtle)]"
              }`}
            >
              <div className="h-8 w-8 rounded-lg bg-[var(--pb-surface)] border border-[var(--pb-border-subtle)] flex items-center justify-center shrink-0 mt-0.5">
                {notifIcon(notif.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-medium text-white">
                    {notif.title}
                  </p>
                  {!notif.isRead && (
                    <span className="h-2 w-2 rounded-full bg-[var(--pb-orange)] shrink-0 mt-1.5" />
                  )}
                </div>
                {notif.body && (
                  <p className="text-sm text-[var(--pb-text-muted)] mt-0.5 leading-relaxed">
                    {notif.body}
                  </p>
                )}
                <p className="text-xs text-[var(--pb-text-subtle)] mt-1.5">
                  {formatRelativeDate(notif.createdAt)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
