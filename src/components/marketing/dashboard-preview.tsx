import Image from "next/image";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  Circle,
  Clock,
  LayoutDashboard,
  FolderOpen,
  DollarSign,
  MessageSquare,
  BarChart3,
  MapPin,
  TrendingUp,
  FileText,
  Bell,
  Image as ImageIcon,
} from "lucide-react";

const milestones = [
  { label: "Site Preparation", status: "done" },
  { label: "Foundation", status: "done" },
  { label: "Structural Work", status: "done" },
  { label: "Roofing", status: "current" },
  { label: "Electrical", status: "upcoming" },
  { label: "Plumbing", status: "upcoming" },
  { label: "Finishing", status: "upcoming" },
];

const sideNavItems = [
  { icon: LayoutDashboard, label: "Overview" },
  { icon: FolderOpen, label: "My Projects", active: true },
  { icon: DollarSign, label: "Payments" },
  { icon: ImageIcon, label: "Media" },
  { icon: FileText, label: "Documents" },
  { icon: MessageSquare, label: "Messages" },
  { icon: BarChart3, label: "Updates" },
];

export function DashboardPreview() {
  return (
    /* Browser chrome wrapper */
    <div className="relative rounded-xl border border-[var(--pb-border)] bg-[var(--pb-surface)] overflow-hidden shadow-[0_32px_80px_rgba(0,0,0,0.6)] ring-1 ring-white/5">

      {/* Browser top bar */}
      <div className="flex items-center gap-3 px-4 py-3 bg-[var(--pb-surface-elevated)] border-b border-[var(--pb-border)]">
        <div className="flex gap-1.5 shrink-0">
          <div className="w-3 h-3 rounded-full bg-red-500/70" />
          <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
          <div className="w-3 h-3 rounded-full bg-green-500/70" />
        </div>
        {/* Address bar */}
        <div className="flex-1 mx-2">
          <div className="flex items-center gap-2 bg-[var(--pb-surface)] border border-[var(--pb-border)] rounded-md px-3 py-1">
            <svg className="h-3 w-3 text-[var(--pb-success)] shrink-0" viewBox="0 0 12 12" fill="none">
              <path d="M6 1a5 5 0 100 10A5 5 0 006 1zm0 1.5a3.5 3.5 0 110 7 3.5 3.5 0 010-7z" fill="currentColor" opacity=".4"/>
              <path d="M6 3.5a2.5 2.5 0 100 5 2.5 2.5 0 000-5z" fill="currentColor"/>
            </svg>
            <span className="text-[11px] text-[var(--pb-text-subtle)] truncate">
              proxybuild.africa/dashboard/projects/lekki-residence
            </span>
          </div>
        </div>
        {/* Bell */}
        <Bell className="h-3.5 w-3.5 text-[var(--pb-text-subtle)] shrink-0" />
      </div>

      {/* App shell: sidebar + content */}
      <div className="flex" style={{ height: "520px" }}>

        {/* Sidebar */}
        <div className="w-44 shrink-0 border-r border-[var(--pb-border)] bg-[var(--pb-surface)] flex flex-col">
          {/* Sidebar logo */}
          <div className="px-4 py-3 border-b border-[var(--pb-border)]">
            <Image
              src="/logo-wordmark.png"
              alt="ProxyBuild"
              width={1566}
              height={522}
              style={{ height: 24, width: "auto" }}
              priority
            />
          </div>

          {/* Nav items */}
          <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-hidden">
            {sideNavItems.map((item) => (
              <div
                key={item.label}
                className={`flex items-center gap-2 px-2 py-1.5 rounded-md text-[11px] ${
                  item.active
                    ? "bg-[var(--pb-green-muted)] text-[var(--pb-green)] font-medium"
                    : "text-[var(--pb-text-subtle)]"
                }`}
              >
                <item.icon className="h-3.5 w-3.5 shrink-0" />
                {item.label}
              </div>
            ))}
          </nav>

          {/* User row */}
          <div className="px-3 py-3 border-t border-[var(--pb-border)]">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-full bg-[var(--pb-green-muted)] flex items-center justify-center text-[9px] font-bold text-[var(--pb-green)] shrink-0">
                AO
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-medium text-white truncate">Adewale O.</p>
                <p className="text-[9px] text-[var(--pb-text-subtle)] truncate">Client</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 overflow-hidden flex flex-col bg-[var(--pb-bg)]">

          {/* Top bar */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-[var(--pb-border)] bg-[var(--pb-surface)] shrink-0">
            <div>
              <div className="flex items-center gap-1.5 text-[10px] text-[var(--pb-text-subtle)] mb-0.5">
                <span>Projects</span>
                <span>/</span>
                <span className="text-white">Lekki Residence</span>
              </div>
            </div>
            <Badge variant="success" className="text-[10px] py-0 px-2">On Track</Badge>
          </div>

          {/* Scrollable content */}
          <div className="flex-1 overflow-hidden px-5 py-4 space-y-4">

            {/* Project title + location */}
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-sm font-bold text-white leading-tight">Lekki Residence</h3>
                <div className="flex items-center gap-1 mt-0.5">
                  <MapPin className="h-3 w-3 text-[var(--pb-text-subtle)]" />
                  <span className="text-[11px] text-[var(--pb-text-subtle)]">Lekki, Lagos · Nigeria</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-[var(--pb-text-subtle)]">Est. completion</p>
                <p className="text-[11px] font-semibold text-white">Mar 2027</p>
              </div>
            </div>

            {/* Progress */}
            <div className="bg-[var(--pb-surface)] rounded-lg p-3 border border-[var(--pb-border)]">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] text-[var(--pb-text-muted)]">Overall Progress</span>
                <span className="text-[11px] font-bold text-[var(--pb-green)]">62%</span>
              </div>
              <Progress value={62} className="h-1.5" />
              <p className="text-[10px] text-[var(--pb-text-subtle)] mt-1">Current phase: Roofing</p>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-[var(--pb-surface)] rounded-lg p-2.5 border border-[var(--pb-border)]">
                <p className="text-[9px] text-[var(--pb-text-subtle)] mb-0.5">Total Budget</p>
                <p className="text-[11px] font-bold text-white">₦40,000,000</p>
              </div>
              <div className="bg-[var(--pb-surface)] rounded-lg p-2.5 border border-[var(--pb-border)]">
                <p className="text-[9px] text-[var(--pb-text-subtle)] mb-0.5">Amount Paid</p>
                <p className="text-[11px] font-bold text-[var(--pb-green)]">₦24,500,000</p>
              </div>
              <div className="bg-[var(--pb-surface)] rounded-lg p-2.5 border border-[var(--pb-border)]">
                <p className="text-[9px] text-[var(--pb-text-subtle)] mb-0.5">Next Milestone</p>
                <p className="text-[10px] font-semibold text-white">Electrical</p>
              </div>
            </div>

            {/* Milestones + updates split */}
            <div className="grid grid-cols-2 gap-3">

              {/* Milestones */}
              <div className="bg-[var(--pb-surface)] rounded-lg p-3 border border-[var(--pb-border)]">
                <p className="text-[10px] font-semibold text-[var(--pb-text-muted)] uppercase tracking-wide mb-2">
                  Milestones
                </p>
                <div className="space-y-1.5">
                  {milestones.map((m) => (
                    <div key={m.label} className="flex items-center gap-1.5">
                      {m.status === "done" ? (
                        <CheckCircle2 className="h-3 w-3 text-[var(--pb-success)] shrink-0" />
                      ) : m.status === "current" ? (
                        <Clock className="h-3 w-3 text-[var(--pb-green)] shrink-0" />
                      ) : (
                        <Circle className="h-3 w-3 text-[var(--pb-border)] shrink-0" />
                      )}
                      <span className={`text-[10px] truncate ${
                        m.status === "done"
                          ? "text-[var(--pb-text-subtle)] line-through"
                          : m.status === "current"
                          ? "text-white font-semibold"
                          : "text-[var(--pb-text-subtle)]"
                      }`}>
                        {m.label}
                      </span>
                      {m.status === "current" && (
                        <span className="ml-auto text-[9px] text-[var(--pb-green)] font-medium shrink-0">●</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent updates */}
              <div className="bg-[var(--pb-surface)] rounded-lg p-3 border border-[var(--pb-border)]">
                <p className="text-[10px] font-semibold text-[var(--pb-text-muted)] uppercase tracking-wide mb-2">
                  Recent Updates
                </p>
                <div className="space-y-2.5">
                  {[
                    { title: "Roofing structure completed", date: "2 days ago", dot: "var(--pb-success)" },
                    { title: "Structural inspection passed", date: "1 week ago", dot: "var(--pb-green)" },
                    { title: "Foundation approved by client", date: "3 weeks ago", dot: "var(--pb-text-subtle)" },
                  ].map((u, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <div className="mt-1 h-1.5 w-1.5 rounded-full shrink-0" style={{ backgroundColor: `var(${u.dot})` }} />
                      <div>
                        <p className="text-[10px] text-white leading-tight">{u.title}</p>
                        <p className="text-[9px] text-[var(--pb-text-subtle)]">{u.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-3 pt-2 border-t border-[var(--pb-border)]">
                  <div className="flex gap-1.5">
                    {[
                      { icon: TrendingUp, label: "Updates" },
                      { icon: FileText, label: "Docs" },
                      { icon: MessageSquare, label: "Messages" },
                    ].map(({ icon: Icon, label }) => (
                      <button key={label} className="flex-1 flex items-center justify-center gap-1 text-[9px] text-[var(--pb-text-muted)] bg-[var(--pb-surface-elevated)] border border-[var(--pb-border)] rounded py-1.5 truncate">
                        <Icon className="h-2.5 w-2.5 shrink-0" />
                        <span className="truncate">{label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
