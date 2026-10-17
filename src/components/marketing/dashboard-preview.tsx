import Image from "next/image";
import {
  CheckCircle2,
  Circle,
  Clock,
  LayoutDashboard,
  FolderOpen,
  Bell,
  Settings,
  LogOut,
  MapPin,
  LayoutGrid,
  TrendingUp,
  Milestone as MilestoneIcon,
  Image as ImageIcon,
  FileText,
  DollarSign,
  ClipboardList,
  MessageSquare,
  CalendarDays,
} from "lucide-react";

/*
 * A faithful reduction of the real client project view
 * (src/app/dashboard/projects/[projectId]) using the seeded Lekki Residence
 * demo data, so the homepage shows the actual product rather than an
 * idealised impression of it.
 */

const SIDE_NAV = [
  { icon: LayoutDashboard, label: "Overview" },
  { icon: FolderOpen, label: "My Projects", active: true },
  { icon: Bell, label: "Notifications" },
  { icon: Settings, label: "Settings" },
];

const TABS = [
  { label: "Overview", icon: LayoutGrid, active: true },
  { label: "Updates", icon: TrendingUp },
  { label: "Milestones", icon: MilestoneIcon },
  { label: "Media", icon: ImageIcon },
  { label: "Documents", icon: FileText },
  { label: "Payments", icon: DollarSign },
  { label: "Changes", icon: ClipboardList },
  { label: "Messages", icon: MessageSquare },
];

// Mirrors the seeded milestone set
const MILESTONES = [
  { label: "Site Preparation", status: "done" },
  { label: "Foundation", status: "done" },
  { label: "Ground Floor Structure", status: "done" },
  { label: "Upper Floor Structure", status: "done" },
  { label: "Roofing", status: "current" },
  { label: "Electrical Installation", status: "upcoming" },
  { label: "Plumbing", status: "upcoming" },
] as const;

export function DashboardPreview() {
  return (
    <div className="relative rounded-xl border border-[var(--pb-border)] bg-[var(--pb-surface)] overflow-hidden shadow-[0_32px_80px_rgba(0,0,0,0.6)] ring-1 ring-white/5">
      {/* Browser chrome */}
      <div className="flex items-center gap-3 px-4 py-3 bg-[var(--pb-surface-elevated)] border-b border-[var(--pb-border)]">
        <div className="flex gap-1.5 shrink-0">
          <div className="w-3 h-3 rounded-full bg-red-500/70" />
          <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
          <div className="w-3 h-3 rounded-full bg-green-500/70" />
        </div>
        <div className="flex-1 mx-2">
          <div className="flex items-center gap-2 bg-[var(--pb-surface)] border border-[var(--pb-border)] rounded-md px-3 py-1">
            <svg
              className="h-3 w-3 text-[var(--pb-success)] shrink-0"
              viewBox="0 0 12 12"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M6 1a5 5 0 100 10A5 5 0 006 1zm0 1.5a3.5 3.5 0 110 7 3.5 3.5 0 010-7z"
                fill="currentColor"
                opacity=".4"
              />
              <path d="M6 3.5a2.5 2.5 0 100 5 2.5 2.5 0 000-5z" fill="currentColor" />
            </svg>
            <span className="text-[11px] text-[var(--pb-text-subtle)] truncate">
              proxybuild.africa/dashboard/projects/lekki-residence
            </span>
          </div>
        </div>
      </div>

      {/* App shell */}
      <div className="flex" style={{ height: "520px" }}>
        {/* Sidebar — mirrors DashboardSidebar */}
        <div className="w-44 shrink-0 border-r border-[var(--pb-border)] bg-[var(--pb-surface)] flex flex-col">
          <div className="px-4 py-3 border-b border-[var(--pb-border)]">
            <Image
              src="/logo-wordmark.png"
              alt="ProxyBuild"
              width={1566}
              height={522}
              style={{ height: 22, width: "auto" }}
              priority
            />
          </div>

          <nav className="flex-1 px-2 py-3 space-y-0.5">
            {SIDE_NAV.map((item) => (
              <div
                key={item.label}
                className={`flex items-center gap-2 px-2 py-1.5 rounded-md text-[11px] ${
                  item.active
                    ? "bg-[var(--pb-green-muted)] text-[var(--pb-green)] font-medium"
                    : "text-[var(--pb-text-muted)]"
                }`}
              >
                <item.icon className="h-3.5 w-3.5 shrink-0" />
                {item.label}
              </div>
            ))}
          </nav>

          <div className="border-t border-[var(--pb-border)] p-2">
            <div className="flex items-center gap-2 px-1 py-1.5">
              <div className="h-6 w-6 rounded-full bg-[var(--pb-green-muted)] flex items-center justify-center text-[9px] font-bold text-[var(--pb-green)] shrink-0">
                AO
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-medium text-white truncate">
                  Adewale Okonkwo
                </p>
                <p className="text-[9px] text-[var(--pb-text-subtle)] truncate">
                  adewale@example.com
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 px-2 py-1.5 mt-0.5 text-[11px] text-[var(--pb-text-muted)]">
              <LogOut className="h-3.5 w-3.5 shrink-0" />
              Sign Out
            </div>
          </div>
        </div>

        {/* Main. Content runs past the fold, so the base is faded to suggest a
            scrollable page rather than a hard crop. */}
        <div className="relative flex-1 min-w-0 bg-[var(--pb-bg)] p-3 overflow-hidden">
          {/* Project header card */}
          <div className="bg-[var(--pb-surface)] border border-[var(--pb-border)] rounded-lg p-3.5">
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="min-w-0">
                <div className="flex items-center gap-1 text-[10px] text-[var(--pb-text-muted)] mb-0.5">
                  <MapPin className="h-3 w-3 shrink-0" />
                  <span className="truncate">Lekki Phase 1, Lekki, Lagos</span>
                </div>
                <h3 className="text-base font-bold text-white leading-tight">
                  Lekki Residence
                </h3>
              </div>
              <span className="shrink-0 text-[9px] font-medium px-2 py-0.5 rounded-full bg-[var(--pb-green-muted)] text-[var(--pb-green)] border border-[var(--pb-green)]/20">
                On Track
              </span>
            </div>

            {/* Progress */}
            <div className="mb-3">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] text-[var(--pb-text-muted)]">
                  Overall Progress
                </span>
                <span className="text-[10px] font-bold text-[var(--pb-green)]">
                  62%
                </span>
              </div>
              <div className="h-1.5 rounded-full bg-[var(--pb-border)] overflow-hidden">
                <div
                  className="h-full rounded-full bg-[var(--pb-green)]"
                  style={{ width: "62%" }}
                />
              </div>
            </div>

            {/* Stats row — Status / Budget / Est. Completion / Country */}
            <div className="grid grid-cols-4 gap-2">
              {[
                { label: "Status", value: "Active" },
                { label: "Budget", value: "₦40,000,000" },
                { label: "Est. Completion", value: "Mar 2027" },
                { label: "Country", value: "Nigeria" },
              ].map((s) => (
                <div key={s.label} className="min-w-0">
                  <p className="text-[9px] text-[var(--pb-text-subtle)] truncate">
                    {s.label}
                  </p>
                  <p className="text-[10px] font-semibold text-white truncate">
                    {s.value}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Tabs + content card */}
          <div className="bg-[var(--pb-surface)] border border-[var(--pb-border)] border-t-0 rounded-b-lg overflow-hidden -mt-px">
            {/* Tabs. The real view scrolls horizontally, so the overflow is faded
                rather than cut, to read as a scroll edge instead of a broken crop. */}
            <div className="relative border-b border-[var(--pb-border)]">
              <div className="flex min-w-max overflow-hidden">
                {TABS.map((tab) => (
                  <div
                    key={tab.label}
                    className={`flex items-center gap-1 px-2.5 py-2 text-[10px] border-b-2 whitespace-nowrap ${
                      tab.active
                        ? "border-[var(--pb-green)] text-white font-medium"
                        : "border-transparent text-[var(--pb-text-muted)]"
                    }`}
                  >
                    <tab.icon className="h-3 w-3 shrink-0" />
                    {tab.label}
                  </div>
                ))}
              </div>
              <div
                className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-[var(--pb-surface)] to-transparent"
                aria-hidden="true"
              />
            </div>

            <div className="p-3 space-y-3">
              {/* Quick stats */}
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-[var(--pb-surface-elevated)] rounded-lg p-2.5 border border-[var(--pb-border-subtle)]">
                  <p className="text-[9px] text-[var(--pb-text-subtle)] mb-0.5">
                    Milestones Complete
                  </p>
                  <p className="text-base font-bold text-white leading-none">
                    4
                    <span className="text-[10px] font-normal text-[var(--pb-text-muted)] ml-0.5">
                      / 12
                    </span>
                  </p>
                </div>
                <div className="bg-[var(--pb-surface-elevated)] rounded-lg p-2.5 border border-[var(--pb-border-subtle)]">
                  <p className="text-[9px] text-[var(--pb-text-subtle)] mb-0.5">
                    Current Phase
                  </p>
                  <p className="text-[11px] font-bold text-[var(--pb-green)] truncate">
                    Roofing
                  </p>
                </div>
                <div className="bg-[var(--pb-surface-elevated)] rounded-lg p-2.5 border border-[var(--pb-border-subtle)]">
                  <p className="text-[9px] text-[var(--pb-text-subtle)] mb-0.5">
                    Next Milestone
                  </p>
                  <p className="text-[11px] font-bold text-white truncate">
                    Electrical
                  </p>
                  <p className="text-[9px] text-[var(--pb-text-muted)] mt-0.5 flex items-center gap-0.5">
                    <CalendarDays className="h-2.5 w-2.5 shrink-0" />
                    20 December 2025
                  </p>
                </div>
              </div>

              {/* Latest update */}
              <div className="bg-[var(--pb-surface-elevated)] rounded-lg p-2.5 border border-[var(--pb-border-subtle)]">
                <p className="text-[9px] uppercase tracking-wide text-[var(--pb-text-subtle)] mb-1">
                  Latest Update
                </p>
                <p className="text-[11px] font-semibold text-white leading-tight">
                  Roofing Progress — Week 18
                </p>
                <p className="text-[9px] text-[var(--pb-text-muted)] mt-0.5 leading-relaxed line-clamp-2">
                  Roof trusses have been installed and roofing sheets are currently
                  being fitted. The team is making excellent progress and we expect
                  the roof to be fully covered by the end of next week.
                </p>
              </div>

              {/* Milestone timeline */}
              <div>
                <p className="text-[9px] uppercase tracking-wide text-[var(--pb-text-subtle)] mb-1.5">
                  Milestones
                </p>
                <div className="space-y-1">
                  {MILESTONES.map((m) => (
                    <div key={m.label} className="flex items-center gap-1.5">
                      {m.status === "done" ? (
                        <CheckCircle2 className="h-3 w-3 text-[var(--pb-success)] shrink-0" />
                      ) : m.status === "current" ? (
                        <Clock className="h-3 w-3 text-[var(--pb-green)] shrink-0" />
                      ) : (
                        <Circle className="h-3 w-3 text-[var(--pb-border)] shrink-0" />
                      )}
                      <span
                        className={`text-[10px] truncate ${
                          m.status === "done"
                            ? "text-[var(--pb-text-subtle)] line-through"
                            : m.status === "current"
                            ? "text-white font-semibold"
                            : "text-[var(--pb-text-subtle)]"
                        }`}
                      >
                        {m.label}
                      </span>
                      {m.status === "current" && (
                        <span className="ml-auto text-[8px] text-[var(--pb-green)] font-medium shrink-0">
                          In progress
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-[var(--pb-bg)] to-transparent"
            aria-hidden="true"
          />
        </div>
      </div>
    </div>
  );
}
