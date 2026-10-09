"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Save, UserPlus, FolderPlus, CheckCircle2, Clock } from "lucide-react";
import { useRouter } from "next/navigation";

const STATUSES = [
  { value: "NEW",       label: "New",                 desc: "Just received, not yet reviewed" },
  { value: "REVIEWING", label: "Under Review",        desc: "Team is reviewing the brief" },
  { value: "CONTACTED", label: "Contacted",           desc: "You have reached out to the client" },
  { value: "SCHEDULED", label: "Meeting Scheduled",   desc: "Consultation call or site visit booked" },
  { value: "COMPLETED", label: "Converted to Client", desc: "Client agreed to proceed — create their account below" },
  { value: "REJECTED",  label: "Closed",              desc: "Not proceeding" },
];

const STATUS_DEFAULT_NOTE: Record<string, string> = {
  NEW:       "New consultation received. Brief reviewed — key details: ...",
  REVIEWING: "Reviewing the project brief. Estimated budget and timeline look [reasonable / needs discussion]. Next step: ...",
  CONTACTED: "Reached out to client via [email / phone / WhatsApp]. They were [responsive / unavailable]. Discussed: ... Next step: ...",
  SCHEDULED: "Meeting scheduled for [date/time]. Format: [site visit / video call]. Agenda: site assessment and project scope discussion.",
  COMPLETED: "Consultation complete. Client confirmed they want to proceed with ProxyBuild. Key agreements: budget range, timeline, project scope. Account creation initiated.",
  REJECTED:  "Closing this consultation. Reason: [client not ready / budget mismatch / not a fit]. Follow up in [timeframe] if applicable.",
};

const STATUS_COLORS: Record<string, string> = {
  NEW:       "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  REVIEWING: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  CONTACTED: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  SCHEDULED: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
  COMPLETED: "bg-green-500/10 text-green-400 border-green-500/20",
  REJECTED:  "bg-[var(--pb-border)] text-[var(--pb-text-subtle)] border-transparent",
};

export type NoteRow = {
  id: string;
  body: string;
  statusAtTime: string;
  createdAt: Date | string;
  authorFirstName: string | null;
  authorLastName: string | null;
};

interface Props {
  consultationId: string;
  currentStatus: string;
  notes: NoteRow[];
  consultationEmail: string;
  consultationFirstName: string;
  consultationLastName: string;
}

function timeAgo(d: Date | string) {
  const diff = Date.now() - new Date(d).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export function ConsultationStatusForm({
  consultationId,
  currentStatus,
  notes,
  consultationEmail,
  consultationFirstName,
  consultationLastName,
}: Props) {
  const router = useRouter();
  const [status, setStatus] = useState(currentStatus);
  const [noteBody, setNoteBody] = useState(STATUS_DEFAULT_NOTE[currentStatus] ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Convert to client state
  const [converting, setConverting] = useState(false);
  const [converted, setConverted] = useState(false);
  const [newClientId, setNewClientId] = useState<string | null>(null);
  const [convertError, setConvertError] = useState<string | null>(null);

  function handleStatusClick(value: string) {
    setStatus(value);
    setNoteBody(STATUS_DEFAULT_NOTE[value] ?? "");
  }

  async function save() {
    setSaving(true);
    setSaveError(null);
    try {
      const res = await fetch(`/api/admin/consultations/${consultationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, noteBody }),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
        setNoteBody(STATUS_DEFAULT_NOTE[status] ?? "");
        router.refresh();
      } else {
        const d = await res.json();
        setSaveError(d.error ?? "Failed to save");
      }
    } finally {
      setSaving(false);
    }
  }

  async function convertToClient() {
    setConverting(true);
    setConvertError(null);
    try {
      const res = await fetch("/api/admin/users/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: consultationEmail,
          firstName: consultationFirstName,
          lastName: consultationLastName,
          role: "CLIENT",
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setConvertError(data.error ?? "Failed to create account");
        return;
      }
      setNewClientId(data.userId);
      setConverted(true);
      setStatus("COMPLETED");
      await fetch(`/api/admin/consultations/${consultationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "COMPLETED" }),
      });
      router.refresh();
    } finally {
      setConverting(false);
    }
  }

  const showConvertButton =
    !converted &&
    status === "COMPLETED" &&
    currentStatus !== "COMPLETED";

  const statusLabel = STATUSES.find(s => s.value === status)?.label ?? status;

  return (
    <div className="space-y-6">
      {/* Status picker */}
      <div>
        <p className="text-xs text-[var(--pb-text-subtle)] mb-2 font-medium uppercase tracking-wide">Pipeline Status</p>
        <div className="flex flex-wrap gap-2">
          {STATUSES.map((s) => (
            <button
              key={s.value}
              onClick={() => handleStatusClick(s.value)}
              title={s.desc}
              className={`text-sm px-3 py-1.5 rounded-lg border transition-colors ${
                status === s.value
                  ? "bg-[var(--pb-green)] border-[var(--pb-green)] text-white"
                  : "bg-transparent border-[var(--pb-border)] text-[var(--pb-text-muted)] hover:border-[var(--pb-green)]/40 hover:text-white"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
        <p className="text-xs text-[var(--pb-text-subtle)] mt-1.5">
          {STATUSES.find(s => s.value === status)?.desc}
        </p>
      </div>

      {/* Note entry */}
      <div>
        <p className="text-xs text-[var(--pb-text-subtle)] mb-2 font-medium uppercase tracking-wide">
          Add a Note
          <span className="ml-1.5 normal-case font-normal text-[var(--pb-text-subtle)]/60">— pre-filled for <em>{statusLabel}</em>, edit as needed</span>
        </p>
        <Textarea
          value={noteBody}
          onChange={(e) => setNoteBody(e.target.value)}
          rows={4}
          className="text-sm"
        />
      </div>

      <div className="flex items-center gap-3">
        <Button variant="default" size="sm" onClick={save} disabled={saving}>
          {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" /> : <Save className="h-3.5 w-3.5 mr-1.5" />}
          {saved ? "Saved!" : "Save Changes"}
        </Button>
        {saveError && <p className="text-xs text-red-400">{saveError}</p>}
      </div>

      {/* Convert to client section */}
      {(showConvertButton || converted) && (
        <div className={`p-4 rounded-xl border ${converted ? "border-green-500/20 bg-green-500/5" : "border-[var(--pb-border)] bg-[var(--pb-bg)]"}`}>
          {converted ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-[var(--pb-green)] shrink-0" />
                <p className="text-sm font-semibold text-white">Client account created</p>
              </div>
              <p className="text-sm text-[var(--pb-text-muted)]">
                Login details emailed to <strong className="text-white">{consultationEmail}</strong>.
              </p>
              <a
                href={`/admin/projects/new?clientId=${newClientId}`}
                className="inline-flex items-center gap-2 text-sm font-semibold bg-[var(--pb-green)] text-white px-4 py-2 rounded-lg hover:bg-[var(--pb-green-hover)] transition-colors"
              >
                <FolderPlus className="h-4 w-4" />
                Create Project for this Client
              </a>
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <p className="text-sm font-semibold text-white mb-0.5">Ready to proceed?</p>
                <p className="text-sm text-[var(--pb-text-muted)]">
                  Create a client account for <strong className="text-white">{consultationFirstName} {consultationLastName}</strong> ({consultationEmail}). They will receive their login details by email.
                </p>
              </div>
              {convertError && <p className="text-xs text-red-400">{convertError}</p>}
              <Button size="sm" onClick={convertToClient} disabled={converting}>
                {converting ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" /> : <UserPlus className="h-3.5 w-3.5 mr-1.5" />}
                Create Client Account &amp; Send Login Details
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Note history */}
      {notes.length > 0 && (
        <div>
          <p className="text-xs text-[var(--pb-text-subtle)] mb-3 font-medium uppercase tracking-wide flex items-center gap-1.5">
            <Clock className="h-3 w-3" />
            Note History ({notes.length})
          </p>
          <div className="space-y-3">
            {notes.map((note) => {
              const authorName = note.authorFirstName
                ? `${note.authorFirstName}${note.authorLastName ? ` ${note.authorLastName}` : ""}`
                : "Staff";
              const statusDot = STATUS_COLORS[note.statusAtTime] ?? STATUS_COLORS.NEW;
              const statusLbl = STATUSES.find(s => s.value === note.statusAtTime)?.label ?? note.statusAtTime;
              return (
                <div key={note.id} className="flex gap-3">
                  {/* Timeline line */}
                  <div className="flex flex-col items-center">
                    <div className="w-2 h-2 rounded-full bg-[var(--pb-border)] mt-1.5 shrink-0" />
                    <div className="w-px flex-1 bg-[var(--pb-border-subtle)] mt-1" />
                  </div>
                  <div className="flex-1 pb-3 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${statusDot}`}>
                        {statusLbl}
                      </span>
                      <span className="text-xs text-[var(--pb-text-muted)]">{authorName}</span>
                      <span className="text-[10px] text-[var(--pb-text-subtle)]">{timeAgo(note.createdAt)}</span>
                    </div>
                    <p className="text-sm text-[var(--pb-text-muted)] whitespace-pre-wrap leading-relaxed">
                      {note.body}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
