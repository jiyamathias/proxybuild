export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { getUserNotifications } from "@/lib/services/projects";
import { formatRelativeDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { MarkAllReadButton } from "@/components/dashboard/mark-all-read-button";
import { NotificationIcon } from "@/components/ui/notification-icon";
import Link from "next/link";
import { Bell } from "lucide-react";

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
          {notifications.map((notif) => {
            const content = (
              <div
                className={`flex gap-4 p-4 rounded-xl border transition-colors ${
                  !notif.isRead
                    ? "bg-[var(--pb-green-muted)] border-[var(--pb-green)]/20"
                    : "bg-[var(--pb-surface-elevated)] border-[var(--pb-border-subtle)]"
                } ${notif.actionUrl ? "hover:border-[var(--pb-green)]/40" : ""}`}
              >
                <div className="h-8 w-8 rounded-lg bg-[var(--pb-surface)] border border-[var(--pb-border-subtle)] flex items-center justify-center shrink-0 mt-0.5">
                  <NotificationIcon type={notif.type} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-medium text-white">
                      {notif.title}
                    </p>
                    {!notif.isRead && (
                      <span className="h-2 w-2 rounded-full bg-[var(--pb-green)] shrink-0 mt-1.5" />
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
            );

            return notif.actionUrl ? (
              <Link key={notif.id} href={notif.actionUrl} className="block">
                {content}
              </Link>
            ) : (
              <div key={notif.id}>{content}</div>
            );
          })}
        </div>
      )}
    </div>
  );
}
