import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  Circle,
  Clock,
  MapPin,
  TrendingUp,
  FileText,
  MessageSquare,
} from "lucide-react";

const milestones = [
  { label: "Project Initiated", status: "done" },
  { label: "Site Preparation", status: "done" },
  { label: "Foundation", status: "done" },
  { label: "Structural Work", status: "done" },
  { label: "Roofing", status: "current" },
  { label: "Electrical", status: "upcoming" },
  { label: "Plumbing", status: "upcoming" },
  { label: "Finishing", status: "upcoming" },
  { label: "Handover", status: "upcoming" },
];

export function DashboardPreview() {
  return (
    <div className="relative rounded-2xl border border-[var(--pb-border)] bg-[var(--pb-surface)] overflow-hidden shadow-2xl">
      {/* Dashboard header */}
      <div className="border-b border-[var(--pb-border)] bg-[var(--pb-surface-elevated)] px-5 py-3 flex items-center gap-2">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-500/60" />
          <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
          <div className="w-3 h-3 rounded-full bg-green-500/60" />
        </div>
        <span className="text-xs text-[var(--pb-text-subtle)] ml-2">
          proxybuild.africa/dashboard/projects/lekki-residence
        </span>
      </div>

      <div className="p-5">
        {/* Project title row */}
        <div className="flex items-start justify-between mb-5">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <MapPin className="h-3.5 w-3.5 text-[var(--pb-text-subtle)]" />
              <span className="text-xs text-[var(--pb-text-subtle)]">
                Lekki, Lagos · Nigeria
              </span>
            </div>
            <h3 className="text-lg font-bold text-white">Lekki Residence</h3>
          </div>
          <Badge variant="success" className="shrink-0">
            On Track
          </Badge>
        </div>

        {/* Progress bar */}
        <div className="mb-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-[var(--pb-text-muted)]">
              Overall Progress
            </span>
            <span className="text-sm font-bold text-[var(--pb-green)]">
              62%
            </span>
          </div>
          <Progress value={62} className="h-2.5" />
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-[var(--pb-text-subtle)]">
              Current: Roofing
            </span>
            <span className="text-xs text-[var(--pb-text-subtle)]">
              Est. Completion: Mar 2027
            </span>
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <div className="bg-[var(--pb-surface-elevated)] rounded-lg p-3 border border-[var(--pb-border-subtle)]">
            <p className="text-xs text-[var(--pb-text-subtle)] mb-1">
              Total Budget
            </p>
            <p className="text-base font-bold text-white">₦40,000,000</p>
          </div>
          <div className="bg-[var(--pb-surface-elevated)] rounded-lg p-3 border border-[var(--pb-border-subtle)]">
            <p className="text-xs text-[var(--pb-text-subtle)] mb-1">
              Amount Paid
            </p>
            <p className="text-base font-bold text-[var(--pb-green)]">
              ₦24,500,000
            </p>
          </div>
          <div className="bg-[var(--pb-surface-elevated)] rounded-lg p-3 border border-[var(--pb-border-subtle)]">
            <p className="text-xs text-[var(--pb-text-subtle)] mb-1">
              Next Milestone
            </p>
            <p className="text-sm font-semibold text-white">
              Electrical Installation
            </p>
          </div>
          <div className="bg-[var(--pb-surface-elevated)] rounded-lg p-3 border border-[var(--pb-border-subtle)]">
            <p className="text-xs text-[var(--pb-text-subtle)] mb-1">
              Recent Update
            </p>
            <p className="text-xs text-[var(--pb-text-muted)] leading-relaxed">
              Roofing structure completed
            </p>
          </div>
        </div>

        {/* Timeline */}
        <div className="mb-5">
          <p className="text-xs font-semibold text-[var(--pb-text-muted)] uppercase tracking-wider mb-3">
            Project Timeline
          </p>
          <div className="space-y-2">
            {milestones.map((m) => (
              <div key={m.label} className="flex items-center gap-2.5">
                {m.status === "done" ? (
                  <CheckCircle2 className="h-4 w-4 text-[var(--pb-success)] shrink-0" />
                ) : m.status === "current" ? (
                  <Clock className="h-4 w-4 text-[var(--pb-green)] shrink-0" />
                ) : (
                  <Circle className="h-4 w-4 text-[var(--pb-border)] shrink-0" />
                )}
                <span
                  className={`text-xs ${
                    m.status === "done"
                      ? "text-[var(--pb-text-muted)] line-through decoration-[var(--pb-border)]"
                      : m.status === "current"
                      ? "text-white font-semibold"
                      : "text-[var(--pb-text-subtle)]"
                  }`}
                >
                  {m.label}
                </span>
                {m.status === "current" && (
                  <Badge variant="default" className="text-[10px] py-0 ml-auto">
                    In Progress
                  </Badge>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Quick actions */}
        <div className="flex gap-2">
          <button className="flex-1 flex items-center justify-center gap-1.5 text-xs text-[var(--pb-text-muted)] hover:text-white bg-[var(--pb-surface-elevated)] hover:bg-[var(--pb-surface-raised)] border border-[var(--pb-border)] rounded-lg py-2 transition-colors">
            <TrendingUp className="h-3.5 w-3.5" />
            Updates
          </button>
          <button className="flex-1 flex items-center justify-center gap-1.5 text-xs text-[var(--pb-text-muted)] hover:text-white bg-[var(--pb-surface-elevated)] hover:bg-[var(--pb-surface-raised)] border border-[var(--pb-border)] rounded-lg py-2 transition-colors">
            <FileText className="h-3.5 w-3.5" />
            Documents
          </button>
          <button className="flex-1 flex items-center justify-center gap-1.5 text-xs text-[var(--pb-text-muted)] hover:text-white bg-[var(--pb-surface-elevated)] hover:bg-[var(--pb-surface-raised)] border border-[var(--pb-border)] rounded-lg py-2 transition-colors">
            <MessageSquare className="h-3.5 w-3.5" />
            Messages
          </button>
        </div>
      </div>
    </div>
  );
}
