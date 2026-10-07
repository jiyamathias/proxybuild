"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Save } from "lucide-react";

const STATUSES = [
  { value: "NEW", label: "New" },
  { value: "CONTACTED", label: "Contacted" },
  { value: "QUALIFIED", label: "Qualified" },
  { value: "PROPOSAL_SENT", label: "Proposal Sent" },
  { value: "CONVERTED", label: "Converted" },
  { value: "CLOSED", label: "Closed" },
];

interface Props {
  consultationId: string;
  currentStatus: string;
  currentNotes: string;
}

export function ConsultationStatusForm({
  consultationId,
  currentStatus,
  currentNotes,
}: Props) {
  const [status, setStatus] = useState(currentStatus);
  const [notes, setNotes] = useState(currentNotes);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function save() {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/consultations/${consultationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, internalNotes: notes }),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="text-xs text-[var(--pb-text-subtle)] mb-2 block">
          Status
        </label>
        <div className="flex flex-wrap gap-2">
          {STATUSES.map((s) => (
            <button
              key={s.value}
              onClick={() => setStatus(s.value)}
              className={`text-sm px-3 py-1.5 rounded-lg border transition-colors ${
                status === s.value
                  ? "bg-[var(--pb-orange)] border-[var(--pb-orange)] text-white"
                  : "bg-transparent border-[var(--pb-border)] text-[var(--pb-text-muted)] hover:border-[var(--pb-orange)]/40 hover:text-white"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="text-xs text-[var(--pb-text-subtle)] mb-2 block">
          Internal Notes
        </label>
        <Textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Add internal notes about this lead…"
          rows={4}
        />
      </div>

      <Button
        variant="default"
        size="sm"
        onClick={save}
        disabled={saving}
      >
        {saving ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
        ) : (
          <Save className="h-3.5 w-3.5 mr-1.5" />
        )}
        {saved ? "Saved!" : "Save Changes"}
      </Button>
    </div>
  );
}
