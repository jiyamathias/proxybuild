export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { isStaff } from "@/lib/permissions";
import { db } from "@/lib/db";
import {
  projects,
  payments,
  consultations,
  ledgerEntries,
  milestones,
  users,
} from "@/db/schema";
import { eq, count, sql, inArray } from "drizzle-orm";
import {
  BarChart3,
  TrendingUp,
  Users,
  DollarSign,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowUpRight,
  Building2,
} from "lucide-react";

function fmt(n: number) {
  if (n >= 1_000_000) return `₦${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `₦${(n / 1_000).toFixed(0)}K`;
  return `₦${n.toFixed(0)}`;
}

function pct(a: number, b: number) {
  if (b === 0) return 0;
  return Math.round((a / b) * 100);
}

export default async function AnalyticsPage() {
  const session = await getSession();
  if (!session || !isStaff(session)) redirect("/login");

  // Project stats
  const [projectCounts] = await db
    .select({
      total: count(),
      active: sql<number>`count(*) filter (where status = 'ACTIVE')`,
      completed: sql<number>`count(*) filter (where status = 'COMPLETED')`,
      planning: sql<number>`count(*) filter (where status = 'PLANNING')`,
      onHold: sql<number>`count(*) filter (where status = 'ON_HOLD')`,
    })
    .from(projects);

  // Health breakdown
  const [healthCounts] = await db
    .select({
      onTrack: sql<number>`count(*) filter (where health = 'ON_TRACK')`,
      atRisk: sql<number>`count(*) filter (where health = 'AT_RISK')`,
      delayed: sql<number>`count(*) filter (where health = 'DELAYED')`,
    })
    .from(projects)
    .where(eq(projects.status, "ACTIVE"));

  // Revenue stats — successful payments in NGN only for simplicity
  const [revStats] = await db
    .select({
      totalReceived: sql<number>`coalesce(sum(amount::numeric), 0)`,
      paymentCount: count(),
    })
    .from(payments)
    .where(eq(payments.status, "SUCCESSFUL"));

  // Total expenses from ledger
  const [expStats] = await db
    .select({
      totalExpenses: sql<number>`coalesce(sum(amount::numeric), 0)`,
    })
    .from(ledgerEntries)
    .where(
      inArray(ledgerEntries.entryType, [
        "MATERIAL_COST",
        "LABOUR_COST",
        "CONTRACTOR_COST",
        "PROFESSIONAL_FEE",
        "LOGISTICS",
        "OTHER_EXPENSE",
      ])
    );

  // Consultations
  const [consultStats] = await db
    .select({
      total: count(),
      newCount: sql<number>`count(*) filter (where status = 'NEW')`,
      completed: sql<number>`count(*) filter (where status = 'COMPLETED')`,
      rejected: sql<number>`count(*) filter (where status = 'REJECTED')`,
    })
    .from(consultations);

  // Clients
  const [clientCount] = await db
    .select({ total: count() })
    .from(users)
    .where(eq(users.role, "CLIENT"));

  // Milestones awaiting client approval
  const [pendingMilestones] = await db
    .select({ pending: count() })
    .from(milestones)
    .where(eq(milestones.approvalStatus, "AWAITING_CLIENT"));

  // Recent 6-month revenue trend (monthly)
  const monthlyRevenue = await db.execute(sql`
    SELECT
      to_char(paid_at, 'Mon YY') as month,
      to_char(paid_at, 'YYYY-MM') as sort_key,
      coalesce(sum(amount::numeric), 0) as total
    FROM payments
    WHERE status = 'SUCCESSFUL'
      AND paid_at >= now() - interval '6 months'
    GROUP BY 1, 2
    ORDER BY 2 ASC
  `);

  const revenueRows = monthlyRevenue.rows as {
    month: string;
    total: number;
  }[];
  const maxRev = Math.max(...revenueRows.map((r) => Number(r.total)), 1);

  // Project list with progress for completion rate chart
  const activeProjects = await db
    .select({
      id: projects.id,
      title: projects.title,
      progress: projects.progressPercent,
      health: projects.health,
      status: projects.status,
    })
    .from(projects)
    .where(eq(projects.status, "ACTIVE"))
    .limit(8);

  const revenue = Number(revStats.totalReceived ?? 0);
  const expenses = Number(expStats.totalExpenses ?? 0);
  const margin = revenue - expenses;

  const totalProjects = Number(projectCounts.total ?? 0);
  const completedProjects = Number(projectCounts.completed ?? 0);
  const completionRate = pct(completedProjects, totalProjects);
  const conversionRate = pct(
    Number(consultStats.completed ?? 0),
    Number(consultStats.total ?? 0)
  );

  const healthColors: Record<string, string> = {
    ON_TRACK: "var(--pb-success)",
    AT_RISK: "var(--pb-warning)",
    DELAYED: "var(--pb-danger)",
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <BarChart3 className="h-6 w-6 text-[var(--pb-text-muted)]" />
          Analytics
        </h1>
        <p className="text-sm text-[var(--pb-text-muted)] mt-0.5">
          Platform-wide performance snapshot
        </p>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            icon: Building2,
            label: "Active Projects",
            value: String(projectCounts.active ?? 0),
            sub: `${totalProjects} total`,
            color: "text-[var(--pb-green)]",
          },
          {
            icon: DollarSign,
            label: "Revenue Received",
            value: fmt(revenue),
            sub: `${revStats.paymentCount} payments`,
            color: "text-[var(--pb-green)]",
          },
          {
            icon: Users,
            label: "Clients",
            value: String(clientCount.total ?? 0),
            sub: `${consultStats.total} enquiries`,
            color: "text-[var(--pb-info)]",
          },
          {
            icon: TrendingUp,
            label: "Completion Rate",
            value: `${completionRate}%`,
            sub: `${completedProjects} completed`,
            color: "text-[var(--pb-warning)]",
          },
        ].map((kpi) => (
          <div
            key={kpi.label}
            className="bg-[var(--pb-surface-elevated)] border border-[var(--pb-border)] rounded-xl p-5"
          >
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs text-[var(--pb-text-subtle)] font-medium uppercase tracking-wider">
                {kpi.label}
              </p>
              <kpi.icon className={`h-4 w-4 ${kpi.color}`} />
            </div>
            <p className={`text-2xl font-bold ${kpi.color}`}>{kpi.value}</p>
            <p className="text-xs text-[var(--pb-text-subtle)] mt-0.5">
              {kpi.sub}
            </p>
          </div>
        ))}
      </div>

      {/* Revenue + P&L */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* P&L summary */}
        <div className="bg-[var(--pb-surface-elevated)] border border-[var(--pb-border)] rounded-xl p-6">
          <h2 className="text-sm font-semibold text-white mb-5">
            P&amp;L Summary
          </h2>
          <div className="space-y-4">
            {[
              { label: "Revenue", value: revenue, positive: true },
              { label: "Expenses", value: expenses, positive: false },
              { label: "Gross Margin", value: margin, positive: margin >= 0 },
            ].map((row) => (
              <div key={row.label} className="flex items-center justify-between">
                <span className="text-sm text-[var(--pb-text-muted)]">
                  {row.label}
                </span>
                <span
                  className={`text-sm font-semibold ${
                    row.positive
                      ? "text-[var(--pb-success)]"
                      : "text-[var(--pb-danger)]"
                  }`}
                >
                  {row.positive ? "+" : "-"}
                  {fmt(Math.abs(row.value))}
                </span>
              </div>
            ))}
            <div className="pt-3 border-t border-[var(--pb-border)]">
              <div className="flex items-center justify-between">
                <span className="text-xs text-[var(--pb-text-subtle)]">
                  Margin %
                </span>
                <span className="text-xs font-bold text-white">
                  {revenue > 0 ? `${pct(margin, revenue)}%` : "—"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Monthly revenue bar chart */}
        <div className="lg:col-span-2 bg-[var(--pb-surface-elevated)] border border-[var(--pb-border)] rounded-xl p-6">
          <h2 className="text-sm font-semibold text-white mb-5">
            Revenue — Last 6 Months
          </h2>
          {revenueRows.length === 0 ? (
            <div className="flex items-center justify-center h-32 text-[var(--pb-text-subtle)] text-sm">
              No payment data yet
            </div>
          ) : (
            <div className="flex items-end gap-3 h-32">
              {revenueRows.map((row) => {
                const heightPct = pct(Number(row.total), maxRev);
                return (
                  <div
                    key={row.month}
                    className="flex-1 flex flex-col items-center gap-1.5"
                  >
                    <span className="text-[10px] text-[var(--pb-text-subtle)]">
                      {fmt(Number(row.total))}
                    </span>
                    <div
                      className="w-full rounded-t-md bg-[var(--pb-green)] opacity-80 transition-all"
                      style={{ height: `${Math.max(heightPct, 4)}%`, minHeight: 4 }}
                    />
                    <span className="text-[10px] text-[var(--pb-text-subtle)]">
                      {row.month}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Projects + Consultations row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Project health breakdown */}
        <div className="bg-[var(--pb-surface-elevated)] border border-[var(--pb-border)] rounded-xl p-6">
          <h2 className="text-sm font-semibold text-white mb-5">
            Active Project Health
          </h2>
          <div className="space-y-3">
            {[
              {
                label: "On Track",
                value: Number(healthCounts.onTrack ?? 0),
                color: "var(--pb-success)",
                icon: CheckCircle2,
              },
              {
                label: "At Risk",
                value: Number(healthCounts.atRisk ?? 0),
                color: "var(--pb-warning)",
                icon: Clock,
              },
              {
                label: "Delayed",
                value: Number(healthCounts.delayed ?? 0),
                color: "var(--pb-danger)",
                icon: AlertTriangle,
              },
            ].map((row) => {
              const activeCount = Number(projectCounts.active ?? 0);
              const barWidth = activeCount > 0 ? pct(row.value, activeCount) : 0;
              return (
                <div key={row.label}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1.5 text-xs text-[var(--pb-text-muted)]">
                      <row.icon className="h-3.5 w-3.5" style={{ color: row.color }} />
                      {row.label}
                    </div>
                    <span className="text-xs font-medium text-white">
                      {row.value}
                    </span>
                  </div>
                  <div className="h-1.5 bg-[var(--pb-border)] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${barWidth}%`,
                        backgroundColor: row.color,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-5 pt-4 border-t border-[var(--pb-border)] flex items-center gap-2">
            <Clock className="h-3.5 w-3.5 text-[var(--pb-warning)]" />
            <span className="text-xs text-[var(--pb-text-muted)]">
              {pendingMilestones.pending ?? 0} milestone
              {Number(pendingMilestones.pending) !== 1 ? "s" : ""} awaiting
              client approval
            </span>
          </div>
        </div>

        {/* Consultation funnel */}
        <div className="bg-[var(--pb-surface-elevated)] border border-[var(--pb-border)] rounded-xl p-6">
          <h2 className="text-sm font-semibold text-white mb-5">
            Consultation Funnel
          </h2>
          <div className="space-y-3">
            {[
              {
                label: "Total Enquiries",
                value: Number(consultStats.total ?? 0),
                color: "var(--pb-info)",
              },
              {
                label: "New / Unreviewed",
                value: Number(consultStats.newCount ?? 0),
                color: "var(--pb-warning)",
              },
              {
                label: "Converted",
                value: Number(consultStats.completed ?? 0),
                color: "var(--pb-success)",
              },
              {
                label: "Rejected",
                value: Number(consultStats.rejected ?? 0),
                color: "var(--pb-danger)",
              },
            ].map((row) => {
              const total = Number(consultStats.total ?? 0);
              const barW = pct(row.value, total);
              return (
                <div key={row.label}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-[var(--pb-text-muted)]">
                      {row.label}
                    </span>
                    <span className="text-xs font-medium text-white">
                      {row.value}
                    </span>
                  </div>
                  <div className="h-1.5 bg-[var(--pb-border)] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${barW}%`,
                        backgroundColor: row.color,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-5 pt-4 border-t border-[var(--pb-border)] flex items-center justify-between">
            <span className="text-xs text-[var(--pb-text-muted)]">
              Conversion rate
            </span>
            <span className="text-sm font-bold text-[var(--pb-green)]">
              {conversionRate}%
            </span>
          </div>
        </div>
      </div>

      {/* Active project progress list */}
      {activeProjects.length > 0 && (
        <div className="bg-[var(--pb-surface-elevated)] border border-[var(--pb-border)] rounded-xl p-6">
          <h2 className="text-sm font-semibold text-white mb-5">
            Active Project Progress
          </h2>
          <div className="space-y-4">
            {activeProjects.map((p) => (
              <div key={p.id}>
                <div className="flex items-center justify-between mb-1.5">
                  <a
                    href={`/admin/projects/${p.id}`}
                    className="text-sm text-white hover:text-[var(--pb-green)] transition-colors flex items-center gap-1"
                  >
                    {p.title}
                    <ArrowUpRight className="h-3 w-3" />
                  </a>
                  <div className="flex items-center gap-2">
                    <span
                      className="text-[10px] font-medium px-1.5 py-0.5 rounded"
                      style={{
                        backgroundColor: `${healthColors[p.health] ?? "var(--pb-border)"}22`,
                        color: healthColors[p.health] ?? "var(--pb-text-muted)",
                      }}
                    >
                      {p.health.replace(/_/g, " ")}
                    </span>
                    <span className="text-xs font-semibold text-white">
                      {p.progress}%
                    </span>
                  </div>
                </div>
                <div className="h-1.5 bg-[var(--pb-border)] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[var(--pb-green)] transition-all"
                    style={{ width: `${p.progress}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
