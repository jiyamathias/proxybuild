"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Save, UserPlus, FolderPlus, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";

const STATUSES = [
  { value: "NEW",       label: "New",                desc: "Just received, not yet reviewed" },
  { value: "REVIEWING", label: "Under Review",       desc: "Team is reviewing the brief" },
  { value: "CONTACTED", label: "Contacted",          desc: "You have reached out to the client" },
  { value: "SCHEDULED", label: "Meeting Scheduled",  desc: "Consultation call or site visit booked" },
  { value: "COMPLETED", label: "Converted to Client",desc: "Client has agreed to proceed — create their account below" },
  { value: "REJECTED",  label: "Closed",             desc: "Not proceeding" },
];

interface Props {
  consultationId: string;
  currentStatus: string;
  currentNotes: string;
  consultationEmail: string;
  consultationFirstName: string;
  consultationLastName: string;
}

export function ConsultationStatusForm({
  consultationId,
  currentStatus,
  currentNotes,
  consultationEmail,
  consultationFirstName,
  consultationLastName,
}: Props) {
  const router = useRouter();
  const [status, setStatus] = useState(currentStatus);
  const [notes, setNotes] = useState(currentNotes);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Convert to client state
  const [converting, setConverting] = useState(false);
  const [converted, setConverted] = useState(false);
  const [newClientId, setNewClientId] = useState<string | null>(null);
  const [convertError, setConvertError] = useState<string | null>(null);

  async function save() {
    setSaving(true);
    setSaveError(null);
    try {
      const res = await fetch(`/api/admin/consultations/${consultationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, internalNotes: notes }),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
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
      // Mark consultation as COMPLETED
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

  return (
    <div className="space-y-5">
      {/* Status picker */}
      <div>
        <p className="text-xs text-[var(--pb-text-subtle)] mb-2 font-medium">Pipeline Status</p>
        <div className="flex flex-wrap gap-2">
          {STATUSES.map((s) => (
            <button
              key={s.value}
              onClick={() => setStatus(s.value)}
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
        {status && (
          <p className="text-xs text-[var(--pb-text-subtle)] mt-1.5">
            {STATUSES.find(s => s.value === status)?.desc}
          </p>
        )}
      </div>

      {/* Internal notes */}
      <div>
        <p className="text-xs text-[var(--pb-text-subtle)] mb-2 font-medium">Internal Notes</p>
        {currentNotes && (
          <div className="mb-2 p-3 rounded-lg bg-[var(--pb-bg)] border border-[var(--pb-border)] text-sm text-[var(--pb-text-muted)] whitespace-pre-wrap">
            {currentNotes}
          </div>
        )}
        <Textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Add notes about this lead — call summaries, decisions, next steps…"
          rows={3}
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
        <div className={`mt-2 p-4 rounded-xl border ${converted ? "border-[var(--pb-green)]/30 bg-[var(--pb-green-muted)]" : "border-[var(--pb-border)] bg-[var(--pb-bg)]"}`}>
          {converted ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-[var(--pb-green)] shrink-0" />
                <p className="text-sm font-semibold text-white">Client account created</p>
              </div>
              <p className="text-sm text-[var(--pb-text-muted)]">
                Login details have been emailed to <strong className="text-white">{consultationEmail}</strong>. They can now sign in at <span className="text-[var(--pb-green)]">/login</span>.
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
                  Create a client account for <strong className="text-white">{consultationFirstName} {consultationLastName}</strong> ({consultationEmail}). They will receive an email with their login details and can access the client dashboard.
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
    </div>
  );
}
