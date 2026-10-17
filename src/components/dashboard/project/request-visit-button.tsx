"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Eye, CheckCircle2, X } from "lucide-react";

const VISIT_TYPES = [
  {
    value: "VIDEO_WALKTHROUGH",
    label: "Video walkthrough",
    hint: "A member of the team walks the site on a live call with you",
  },
  {
    value: "IN_PERSON",
    label: "I'll visit in person",
    hint: "Let us know when you're travelling so we can meet you on site",
  },
  {
    value: "THIRD_PARTY_INSPECTION",
    label: "Independent inspection",
    hint: "Send your own surveyor or engineer to inspect the work",
  },
];

export function RequestVisitButton({ projectId }: { projectId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [visitType, setVisitType] = useState("VIDEO_WALKTHROUGH");
  const [preferredDate, setPreferredDate] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/projects/${projectId}/site-visits`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          visitType,
          preferredDate: preferredDate || undefined,
          notes: notes.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not send your request.");
        return;
      }
      setDone(true);
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="flex items-center gap-2 text-sm text-[var(--pb-green)]">
        <CheckCircle2 className="h-4 w-4 shrink-0" />
        Request sent — your team will be in touch to arrange it.
      </div>
    );
  }

  if (!open) {
    return (
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        <Eye className="h-3.5 w-3.5 mr-1.5" />
        Request a Site Visit
      </Button>
    );
  }

  return (
    <div className="bg-[var(--pb-surface)] border border-[var(--pb-border)] rounded-xl p-5 space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-sm font-semibold text-white">
            Request a site visit
          </h3>
          <p className="text-xs text-[var(--pb-text-muted)] mt-0.5">
            See the work for yourself, however suits you best.
          </p>
        </div>
        <button
          onClick={() => setOpen(false)}
          className="text-[var(--pb-text-subtle)] hover:text-white shrink-0"
          aria-label="Cancel"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="space-y-2">
        {VISIT_TYPES.map((t) => (
          <label
            key={t.value}
            className={`flex items-start gap-2.5 p-3 rounded-lg border cursor-pointer transition-colors ${
              visitType === t.value
                ? "border-[var(--pb-green)]/40 bg-[var(--pb-green-muted)]"
                : "border-[var(--pb-border-subtle)] hover:border-[var(--pb-border)]"
            }`}
          >
            <input
              type="radio"
              name="visitType"
              value={t.value}
              checked={visitType === t.value}
              onChange={(e) => setVisitType(e.target.value)}
              className="mt-0.5 accent-[var(--pb-green)] shrink-0"
            />
            <span className="min-w-0">
              <span className="block text-sm text-white">{t.label}</span>
              <span className="block text-xs text-[var(--pb-text-subtle)] mt-0.5">
                {t.hint}
              </span>
            </span>
          </label>
        ))}
      </div>

      <div>
        <label
          htmlFor="visit-date"
          className="block text-xs text-[var(--pb-text-subtle)] mb-1.5"
        >
          Preferred date (optional)
        </label>
        <Input
          id="visit-date"
          type="date"
          value={preferredDate}
          min={new Date().toISOString().slice(0, 10)}
          onChange={(e) => setPreferredDate(e.target.value)}
        />
      </div>

      <div>
        <label
          htmlFor="visit-notes"
          className="block text-xs text-[var(--pb-text-subtle)] mb-1.5"
        >
          Anything specific you&apos;d like to see? (optional)
        </label>
        <Textarea
          id="visit-notes"
          rows={3}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="e.g. I'd like to see the roofing and the window fittings up close"
        />
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <Button size="sm" onClick={submit} disabled={loading}>
        {loading ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
        ) : (
          <Eye className="h-3.5 w-3.5 mr-1.5" />
        )}
        Send Request
      </Button>
    </div>
  );
}
