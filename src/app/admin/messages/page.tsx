export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth/session";
import { isStaff } from "@/lib/permissions";
import { db } from "@/lib/db";
import { projects, messages, profiles, users } from "@/db/schema";
import { eq, desc, sql, and, inArray } from "drizzle-orm";
import { MessageSquare, ArrowRight, Building2 } from "lucide-react";

export default async function AdminMessagesPage() {
  const session = await getSession();
  if (!session || !isStaff(session)) redirect("/login");

  // All active projects with last message info
  const projectRows = await db
    .select({
      id: projects.id,
      title: projects.title,
      status: projects.status,
      city: projects.city,
      state: projects.state,
      clientId: projects.clientId,
      clientFirst: profiles.firstName,
      clientLast: profiles.lastName,
    })
    .from(projects)
    .innerJoin(profiles, eq(profiles.userId, projects.clientId))
    .where(
      inArray(projects.status, ["ACTIVE", "PLANNING", "CONTRACT", "ON_HOLD"])
    )
    .orderBy(desc(projects.updatedAt));

  // Last message per project
  const lastMsgs = await db.execute(sql`
    SELECT DISTINCT ON (project_id)
      project_id,
      body,
      created_at,
      sender_id
    FROM messages
    ORDER BY project_id, created_at DESC
  `);

  const lastMsgMap = new Map<string, { body: string; createdAt: Date; senderId: string }>();
  for (const row of lastMsgs.rows as any[]) {
    lastMsgMap.set(row.project_id, {
      body: row.body,
      createdAt: new Date(row.created_at),
      senderId: row.sender_id,
    });
  }

  // Unread counts (messages from clients that haven't been read)
  const unreadRows = await db.execute(sql`
    SELECT m.project_id, count(*) as cnt
    FROM messages m
    JOIN users u ON u.id = m.sender_id
    WHERE u.role = 'CLIENT'
      AND m.read_at IS NULL
      AND m.is_deleted = false
    GROUP BY m.project_id
  `);

  const unreadMap = new Map<string, number>();
  for (const row of unreadRows.rows as any[]) {
    unreadMap.set(row.project_id, Number(row.cnt));
  }

  function timeAgo(d: Date) {
    const diff = Date.now() - d.getTime();
    const mins = Math.floor(diff / 60_000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  }

  const statusColors: Record<string, string> = {
    ACTIVE: "text-[var(--pb-success)] bg-[var(--pb-success)]/10",
    PLANNING: "text-[var(--pb-info)] bg-[var(--pb-info)]/10",
    ON_HOLD: "text-[var(--pb-warning)] bg-[var(--pb-warning)]/10",
    CONTRACT: "text-[var(--pb-green)] bg-[var(--pb-green-muted)]",
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <MessageSquare className="h-6 w-6 text-[var(--pb-text-muted)]" />
          Messages
        </h1>
        <p className="text-sm text-[var(--pb-text-muted)] mt-0.5">
          Client message threads across all active projects
        </p>
      </div>

      {projectRows.length === 0 ? (
        <div className="bg-[var(--pb-surface-elevated)] border border-[var(--pb-border)] rounded-xl p-12 text-center">
          <Building2 className="h-8 w-8 text-[var(--pb-text-subtle)] mx-auto mb-2" />
          <p className="text-[var(--pb-text-muted)] text-sm">
            No active projects yet
          </p>
        </div>
      ) : (
        <div className="divide-y divide-[var(--pb-border)] border border-[var(--pb-border)] rounded-xl overflow-hidden">
          {projectRows.map((p) => {
            const lastMsg = lastMsgMap.get(p.id);
            const unread = unreadMap.get(p.id) ?? 0;

            return (
              <Link
                key={p.id}
                href={`/admin/projects/${p.id}/messages`}
                className="flex items-center gap-4 px-5 py-4 bg-[var(--pb-surface-elevated)] hover:bg-[var(--pb-surface-raised)] transition-colors"
              >
                {/* Avatar initials */}
                <div className="h-10 w-10 rounded-full bg-[var(--pb-green-muted)] flex items-center justify-center text-sm font-bold text-[var(--pb-green)] shrink-0">
                  {p.clientFirst?.[0]}
                  {p.clientLast?.[0]}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-sm font-medium text-white truncate">
                      {p.title}
                    </span>
                    <span
                      className={`text-[10px] font-medium px-1.5 py-0.5 rounded shrink-0 ${statusColors[p.status] ?? "text-[var(--pb-text-muted)] bg-[var(--pb-border)]"}`}
                    >
                      {p.status}
                    </span>
                  </div>
                  <p className="text-xs text-[var(--pb-text-subtle)] truncate">
                    {p.clientFirst} {p.clientLast}
                    {p.city || p.state
                      ? ` · ${[p.city, p.state].filter(Boolean).join(", ")}`
                      : ""}
                  </p>
                  {lastMsg && (
                    <p className="text-xs text-[var(--pb-text-muted)] mt-0.5 truncate">
                      {lastMsg.senderId === session.id ? "You: " : ""}
                      {lastMsg.body}
                    </p>
                  )}
                </div>

                <div className="flex flex-col items-end gap-1.5 shrink-0">
                  {lastMsg && (
                    <span className="text-[10px] text-[var(--pb-text-subtle)]">
                      {timeAgo(lastMsg.createdAt)}
                    </span>
                  )}
                  {unread > 0 && (
                    <span className="h-5 w-5 rounded-full bg-[var(--pb-green)] text-white text-[10px] font-bold flex items-center justify-center">
                      {unread > 9 ? "9+" : unread}
                    </span>
                  )}
                  <ArrowRight className="h-3.5 w-3.5 text-[var(--pb-text-subtle)]" />
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
