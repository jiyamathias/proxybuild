"use client";

import { useState } from "react";
import { ChevronRight, Globe, Monitor } from "lucide-react";

export type AuditRow = {
  id: string;
  action: string;
  entityType: string;
  entityId: string | null;
  projectId: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  before: unknown;
  after: unknown;
  metadata: unknown;
  createdAt: Date | string;
  actorName: string;
  actorEmail: string | null;
};

function actionColor(action: string) {
  if (action.startsWith("user.")) return "text-blue-400";
  if (action.startsWith("project.")) return "text-purple-400";
  if (action.startsWith("milestone.")) return "text-[var(--pb-green)]";
  if (action.startsWith("payment.") || action.startsWith("ledger_entry."))
    return "text-[var(--pb-success)]";
  if (action.startsWith("document.")) return "text-yellow-400";
  if (action.startsWith("change_order.")) return "text-pink-400";
  if (action.startsWith("consultation.")) return "text-cyan-400";
  return "text-[var(--pb-text-muted)]";
}

function hasData(v: unknown) {
  return v != null && Object.keys(v as object).length > 0;
}

function JsonBlock({ label, value }: { label: string; value: unknown }) {
  if (!hasData(value)) return null;
  return (
    <div>
      <p className="text-[10px] uppercase tracking-wide text-[var(--pb-text-subtle)] mb-1">
        {label}
      </p>
      <pre className="text-xs text-[var(--pb-text-muted)] bg-[var(--pb-bg)] border border-[var(--pb-border-subtle)] rounded-lg p-2.5 overflow-x-auto">
        {JSON.stringify(value, null, 2)}
      </pre>
    </div>
  );
}

export function AuditLogRow({ row }: { row: AuditRow }) {
  const [open, setOpen] = useState(false);

  const expandable =
    hasData(row.before) ||
    hasData(row.after) ||
    hasData(row.metadata) ||
    !!row.ipAddress ||
    !!row.userAgent;

  const timestamp = new Date(row.createdAt).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  return (
    <div className="border-b border-[var(--pb-border-subtle)] last:border-b-0">
      <button
        onClick={() => expandable && setOpen(!open)}
        disabled={!expandable}
        className={`w-full flex items-start gap-3 px-4 py-3 text-left transition-colors ${
          expandable ? "hover:bg-[var(--pb-surface-elevated)]" : "cursor-default"
        }`}
      >
        <ChevronRight
          className={`h-3.5 w-3.5 mt-1 shrink-0 transition-transform ${
            open ? "rotate-90" : ""
          } ${expandable ? "text-[var(--pb-text-subtle)]" : "opacity-0"}`}
        />

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium text-white">
              {row.actorName}
            </span>
            <span className={`text-xs font-mono ${actionColor(row.action)}`}>
              {row.action}
            </span>
            <span className="text-xs text-[var(--pb-text-subtle)]">
              {row.entityType}
              {row.entityId && (
                <span className="font-mono opacity-60">
                  {" "}
                  {row.entityId.slice(0, 8)}…
                </span>
              )}
            </span>
          </div>
          {row.actorEmail && (
            <p className="text-xs text-[var(--pb-text-subtle)] mt-0.5 truncate">
              {row.actorEmail}
            </p>
          )}
        </div>

        <span className="text-xs text-[var(--pb-text-subtle)] shrink-0 whitespace-nowrap font-mono">
          {timestamp}
        </span>
      </button>

      {open && (
        <div className="px-4 pb-4 pl-10 space-y-3">
          {(row.ipAddress || row.userAgent) && (
            <div className="flex flex-col gap-1.5">
              {row.ipAddress && (
                <p className="text-xs text-[var(--pb-text-muted)] flex items-center gap-1.5">
                  <Globe className="h-3 w-3 shrink-0" />
                  <span className="font-mono">{row.ipAddress}</span>
                </p>
              )}
              {row.userAgent && (
                <p className="text-xs text-[var(--pb-text-muted)] flex items-start gap-1.5">
                  <Monitor className="h-3 w-3 shrink-0 mt-0.5" />
                  <span className="break-all">{row.userAgent}</span>
                </p>
              )}
            </div>
          )}
          <JsonBlock label="Before" value={row.before} />
          <JsonBlock label="After" value={row.after} />
          <JsonBlock label="Metadata" value={row.metadata} />
        </div>
      )}
    </div>
  );
}
