export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth/session";
import { canViewAuditLogs } from "@/lib/permissions";
import { db } from "@/lib/db";
import { auditLogs, profiles, users } from "@/db/schema";
import { desc, eq, and, or, ilike, gte, lte, count, type SQL } from "drizzle-orm";
import { Shield, Search, X } from "lucide-react";
import { AuditLogRow, type AuditRow } from "@/components/admin/audit-log-row";

const PAGE_SIZE = 50;

// Prefix groups, so filtering doesn't require knowing every exact action string
const ACTION_GROUPS = [
  { value: "", label: "All activity" },
  { value: "user.", label: "Users & auth" },
  { value: "project.", label: "Projects" },
  { value: "milestone.", label: "Milestones" },
  { value: "payment.", label: "Payments" },
  { value: "ledger_entry.", label: "Ledger" },
  { value: "budget.", label: "Budgets" },
  { value: "document.", label: "Documents" },
  { value: "media.", label: "Media" },
  { value: "change_order.", label: "Change orders" },
  { value: "consultation.", label: "Consultations" },
  { value: "update.", label: "Project updates" },
  { value: "site_visit.", label: "Site visits" },
];

export default async function AuditLogsPage({
  searchParams,
}: {
  searchParams: Promise<{
    group?: string;
    q?: string;
    from?: string;
    to?: string;
    page?: string;
  }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!canViewAuditLogs(session)) redirect("/admin");

  const sp = await searchParams;
  const group = sp.group ?? "";
  const q = sp.q?.trim() ?? "";
  const from = sp.from ?? "";
  const to = sp.to ?? "";
  const page = Math.max(1, Number(sp.page ?? "1") || 1);

  const filters: SQL[] = [];

  if (group) filters.push(ilike(auditLogs.action, `${group}%`));

  if (q) {
    const pattern = `%${q}%`;
    const actorMatch = or(
      ilike(auditLogs.actorEmail, pattern),
      ilike(profiles.firstName, pattern),
      ilike(profiles.lastName, pattern),
      ilike(users.email, pattern),
      ilike(auditLogs.action, pattern),
      ilike(auditLogs.entityType, pattern)
    );
    if (actorMatch) filters.push(actorMatch);
  }

  if (from) {
    const d = new Date(from);
    if (!Number.isNaN(d.getTime())) filters.push(gte(auditLogs.createdAt, d));
  }
  if (to) {
    const d = new Date(to);
    // Inclusive of the whole end day
    if (!Number.isNaN(d.getTime())) {
      d.setHours(23, 59, 59, 999);
      filters.push(lte(auditLogs.createdAt, d));
    }
  }

  const where = filters.length > 0 ? and(...filters) : undefined;

  const [rows, [{ total }]] = await Promise.all([
    db
      .select({
        log: auditLogs,
        actorFirstName: profiles.firstName,
        actorLastName: profiles.lastName,
        actorUserEmail: users.email,
      })
      .from(auditLogs)
      .leftJoin(profiles, eq(profiles.userId, auditLogs.actorId))
      .leftJoin(users, eq(users.id, auditLogs.actorId))
      .where(where)
      .orderBy(desc(auditLogs.createdAt))
      .limit(PAGE_SIZE)
      .offset((page - 1) * PAGE_SIZE),
    db
      .select({ total: count() })
      .from(auditLogs)
      .leftJoin(profiles, eq(profiles.userId, auditLogs.actorId))
      .leftJoin(users, eq(users.id, auditLogs.actorId))
      .where(where),
  ]);

  const items: AuditRow[] = rows.map(
    ({ log, actorFirstName, actorLastName, actorUserEmail }) => ({
      id: log.id,
      action: log.action,
      entityType: log.entityType,
      entityId: log.entityId,
      projectId: log.projectId,
      ipAddress: log.ipAddress,
      userAgent: log.userAgent,
      before: log.before,
      after: log.after,
      metadata: log.metadata,
      createdAt: log.createdAt,
      actorName:
        actorFirstName || actorLastName
          ? `${actorFirstName ?? ""} ${actorLastName ?? ""}`.trim()
          : actorUserEmail ?? log.actorEmail ?? "System",
      actorEmail: actorUserEmail ?? log.actorEmail,
    })
  );

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const hasFilters = Boolean(group || q || from || to);

  function pageHref(n: number) {
    const params = new URLSearchParams();
    if (group) params.set("group", group);
    if (q) params.set("q", q);
    if (from) params.set("from", from);
    if (to) params.set("to", to);
    if (n > 1) params.set("page", String(n));
    const s = params.toString();
    return s ? `/admin/audit-logs?${s}` : "/admin/audit-logs";
  }

  return (
    <div className="max-w-5xl mx-auto space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Shield className="h-6 w-6 text-[var(--pb-text-muted)]" />
          Audit Logs
        </h1>
        <p className="text-sm text-[var(--pb-text-muted)] mt-0.5">
          {total.toLocaleString()} recorded {total === 1 ? "event" : "events"} ·
          visible to Super Admin and Admin only
        </p>
      </div>

      {/* Filters — plain GET form so it works without client JS */}
      <form
        method="get"
        className="bg-[var(--pb-surface-elevated)] border border-[var(--pb-border)] rounded-xl p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 items-end"
      >
        <div className="lg:col-span-2">
          <label
            htmlFor="q"
            className="block text-xs text-[var(--pb-text-subtle)] mb-1.5"
          >
            Search actor or action
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[var(--pb-text-subtle)] pointer-events-none" />
            <input
              id="q"
              name="q"
              defaultValue={q}
              placeholder="name, email, action…"
              className="w-full h-9 bg-[var(--pb-surface)] border border-[var(--pb-border)] rounded-lg pl-9 pr-3 text-sm text-white placeholder:text-[var(--pb-text-subtle)] focus:outline-none focus:ring-1 focus:ring-[var(--pb-green)]"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="group"
            className="block text-xs text-[var(--pb-text-subtle)] mb-1.5"
          >
            Category
          </label>
          <select
            id="group"
            name="group"
            defaultValue={group}
            className="w-full h-9 bg-[var(--pb-surface)] border border-[var(--pb-border)] rounded-lg px-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[var(--pb-green)]"
          >
            {ACTION_GROUPS.map((g) => (
              <option key={g.value} value={g.value}>
                {g.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="from"
            className="block text-xs text-[var(--pb-text-subtle)] mb-1.5"
          >
            From
          </label>
          <input
            type="date"
            id="from"
            name="from"
            defaultValue={from}
            className="w-full h-9 bg-[var(--pb-surface)] border border-[var(--pb-border)] rounded-lg px-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[var(--pb-green)]"
          />
        </div>

        <div className="flex gap-2">
          <div className="flex-1">
            <label
              htmlFor="to"
              className="block text-xs text-[var(--pb-text-subtle)] mb-1.5"
            >
              To
            </label>
            <input
              type="date"
              id="to"
              name="to"
              defaultValue={to}
              className="w-full h-9 bg-[var(--pb-surface)] border border-[var(--pb-border)] rounded-lg px-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[var(--pb-green)]"
            />
          </div>
        </div>

        <div className="sm:col-span-2 lg:col-span-5 flex items-center gap-2">
          <button
            type="submit"
            className="h-9 px-4 rounded-lg bg-[var(--pb-green)] hover:bg-[var(--pb-green-hover)] text-white text-sm font-semibold transition-colors"
          >
            Apply filters
          </button>
          {hasFilters && (
            <Link
              href="/admin/audit-logs"
              className="h-9 px-3 inline-flex items-center gap-1.5 rounded-lg border border-[var(--pb-border)] text-[var(--pb-text-muted)] hover:text-white text-sm transition-colors"
            >
              <X className="h-3.5 w-3.5" />
              Clear
            </Link>
          )}
        </div>
      </form>

      {/* Results */}
      {items.length === 0 ? (
        <div className="text-center py-16">
          <Shield className="h-10 w-10 text-[var(--pb-border)] mx-auto mb-3" />
          <p className="text-sm text-[var(--pb-text-muted)]">
            {hasFilters
              ? "No events match these filters."
              : "No audit events recorded yet."}
          </p>
        </div>
      ) : (
        <>
          <div className="bg-[var(--pb-surface-elevated)] border border-[var(--pb-border)] rounded-xl overflow-hidden">
            {items.map((row) => (
              <AuditLogRow key={row.id} row={row} />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-xs text-[var(--pb-text-subtle)]">
                Page {page} of {totalPages}
              </p>
              <div className="flex gap-2">
                {page > 1 && (
                  <Link
                    href={pageHref(page - 1)}
                    className="h-8 px-3 inline-flex items-center rounded-lg border border-[var(--pb-border)] text-sm text-[var(--pb-text-muted)] hover:text-white transition-colors"
                  >
                    Previous
                  </Link>
                )}
                {page < totalPages && (
                  <Link
                    href={pageHref(page + 1)}
                    className="h-8 px-3 inline-flex items-center rounded-lg border border-[var(--pb-border)] text-sm text-[var(--pb-text-muted)] hover:text-white transition-colors"
                  >
                    Next
                  </Link>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
