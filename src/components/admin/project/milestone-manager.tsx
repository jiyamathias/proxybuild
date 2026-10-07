"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Plus,
  Loader2,
  Pencil,
  Trash2,
  ChevronUp,
  ChevronDown,
  CheckCircle2,
  X,
  GripVertical,
} from "lucide-react";

interface Milestone {
  id: string;
  title: string;
  description: string | null;
  sequence: number;
  weightPercent: number;
  status: string;
  approvalStatus: string;
  plannedStartDate: string | null;
  plannedEndDate: string | null;
  budgetAmount: string | null;
  isClientVisible: boolean;
  clientVisibleTitle: string | null;
  notes: string | null;
}

interface Props {
  projectId: string;
  initialMilestones: Milestone[];
}

type FormState = {
  title: string;
  description: string;
  sequence: number;
  weightPercent: number;
  plannedStartDate: string;
  plannedEndDate: string;
  budgetAmount: string;
  isClientVisible: boolean;
  clientVisibleTitle: string;
  notes: string;
};

const STATUS_LABELS: Record<string, string> = {
  NOT_STARTED: "Not Started",
  IN_PROGRESS: "In Progress",
  COMPLETED: "Completed",
  APPROVED: "Approved",
  ON_HOLD: "On Hold",
};

const STATUS_COLORS: Record<string, string> = {
  NOT_STARTED: "text-[var(--pb-text-subtle)] bg-[var(--pb-surface-raised)]",
  IN_PROGRESS: "text-[var(--pb-warning)] bg-[var(--pb-warning-muted)]",
  COMPLETED: "text-[var(--pb-success)] bg-[var(--pb-success-muted)]",
  APPROVED: "text-[var(--pb-green)] bg-[var(--pb-green-muted)]",
  ON_HOLD: "text-[var(--pb-danger)] bg-[var(--pb-danger-muted)]",
};

function emptyForm(sequence: number): FormState {
  return {
    title: "",
    description: "",
    sequence,
    weightPercent: 0,
    plannedStartDate: "",
    plannedEndDate: "",
    budgetAmount: "",
    isClientVisible: true,
    clientVisibleTitle: "",
    notes: "",
  };
}

export function MilestoneManager({ projectId, initialMilestones }: Props) {
  const router = useRouter();
  const [milestones, setMilestones] = useState<Milestone[]>(initialMilestones);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm(milestones.length + 1));
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const inputClass =
    "w-full h-9 rounded-lg border border-[var(--pb-border)] bg-[var(--pb-surface)] text-white text-sm px-3 focus:outline-none focus:ring-2 focus:ring-[var(--pb-green)] placeholder:text-[var(--pb-text-subtle)]";

  function setField<K extends keyof FormState>(key: K, val: FormState[K]) {
    setForm((f) => ({ ...f, [key]: val }));
  }

  function openNew() {
    setEditingId(null);
    setForm(emptyForm(milestones.length + 1));
    setShowForm(true);
    setError(null);
  }

  function openEdit(m: Milestone) {
    setEditingId(m.id);
    setForm({
      title: m.title,
      description: m.description ?? "",
      sequence: m.sequence,
      weightPercent: m.weightPercent,
      plannedStartDate: m.plannedStartDate
        ? new Date(m.plannedStartDate).toISOString().slice(0, 10)
        : "",
      plannedEndDate: m.plannedEndDate
        ? new Date(m.plannedEndDate).toISOString().slice(0, 10)
        : "",
      budgetAmount: m.budgetAmount ?? "",
      isClientVisible: m.isClientVisible,
      clientVisibleTitle: m.clientVisibleTitle ?? "",
      notes: m.notes ?? "",
    });
    setShowForm(true);
    setError(null);
  }

  function cancelForm() {
    setShowForm(false);
    setEditingId(null);
    setError(null);
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) return;
    setSaving(true);
    setError(null);

    const payload = {
      title: form.title.trim(),
      description: form.description || null,
      sequence: form.sequence,
      weightPercent: form.weightPercent,
      plannedStartDate: form.plannedStartDate || null,
      plannedEndDate: form.plannedEndDate || null,
      budgetAmount: form.budgetAmount || null,
      isClientVisible: form.isClientVisible,
      clientVisibleTitle: form.clientVisibleTitle || null,
      notes: form.notes || null,
    };

    try {
      if (editingId) {
        const res = await fetch(
          `/api/admin/projects/${projectId}/milestones/${editingId}`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          }
        );
        if (!res.ok) {
          const d = await res.json();
          throw new Error(d.error ?? "Failed to update milestone");
        }
        const { milestone } = await res.json();
        setMilestones((prev) =>
          prev.map((m) => (m.id === editingId ? milestone : m))
        );
      } else {
        const res = await fetch(
          `/api/admin/projects/${projectId}/milestones`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          }
        );
        if (!res.ok) {
          const d = await res.json();
          throw new Error(d.error ?? "Failed to create milestone");
        }
        const { milestone } = await res.json();
        setMilestones((prev) => [...prev, milestone]);
      }
      cancelForm();
      router.refresh();
    } catch (err) {
      setError(String(err instanceof Error ? err.message : err));
    } finally {
      setSaving(false);
    }
  }

  async function deleteMilestone(id: string) {
    if (!confirm("Delete this milestone? This cannot be undone.")) return;
    setDeleting(id);
    try {
      const res = await fetch(
        `/api/admin/projects/${projectId}/milestones/${id}`,
        { method: "DELETE" }
      );
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error ?? "Failed to delete milestone");
      }
      setMilestones((prev) => prev.filter((m) => m.id !== id));
      router.refresh();
    } catch (err) {
      setError(String(err instanceof Error ? err.message : err));
    } finally {
      setDeleting(null);
    }
  }

  async function reorder(id: string, direction: "up" | "down") {
    const idx = milestones.findIndex((m) => m.id === id);
    if (direction === "up" && idx === 0) return;
    if (direction === "down" && idx === milestones.length - 1) return;

    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    const next = [...milestones];
    const aSeq = next[idx].sequence;
    const bSeq = next[swapIdx].sequence;
    next[idx] = { ...next[idx], sequence: bSeq };
    next[swapIdx] = { ...next[swapIdx], sequence: aSeq };
    [next[idx], next[swapIdx]] = [next[swapIdx], next[idx]];
    setMilestones(next);

    // Persist both sequences
    await Promise.all([
      fetch(`/api/admin/projects/${projectId}/milestones/${next[swapIdx].id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sequence: next[swapIdx].sequence }),
      }),
      fetch(`/api/admin/projects/${projectId}/milestones/${next[idx].id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sequence: next[idx].sequence }),
      }),
    ]);
  }

  const totalWeight = milestones.reduce((s, m) => s + m.weightPercent, 0);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-white">
            Milestones ({milestones.length})
          </h2>
          {milestones.length > 0 && (
            <p
              className={`text-xs mt-0.5 ${
                totalWeight === 100
                  ? "text-[var(--pb-success)]"
                  : "text-[var(--pb-warning)]"
              }`}
            >
              Total weight: {totalWeight}%
              {totalWeight !== 100 && " (should sum to 100%)"}
            </p>
          )}
        </div>
        {!showForm && (
          <Button size="sm" onClick={openNew}>
            <Plus className="h-3.5 w-3.5 mr-1.5" />
            Add Milestone
          </Button>
        )}
      </div>

      {/* Inline form */}
      {showForm && (
        <form
          onSubmit={save}
          className="bg-[var(--pb-surface-elevated)] border border-[var(--pb-green)] rounded-xl p-5 space-y-4"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white">
              {editingId ? "Edit Milestone" : "New Milestone"}
            </h3>
            <button
              type="button"
              onClick={cancelForm}
              className="text-[var(--pb-text-subtle)] hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <Label htmlFor="msTitle">Title *</Label>
              <Input
                id="msTitle"
                value={form.title}
                onChange={(e) => setField("title", e.target.value)}
                placeholder="e.g. Foundation & Groundwork"
                required
              />
            </div>

            <div className="sm:col-span-2">
              <Label htmlFor="msDesc">Description</Label>
              <textarea
                id="msDesc"
                value={form.description}
                onChange={(e) => setField("description", e.target.value)}
                rows={2}
                placeholder="What this milestone covers…"
                className="w-full rounded-lg border border-[var(--pb-border)] bg-[var(--pb-surface)] text-white text-sm px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-[var(--pb-green)] placeholder:text-[var(--pb-text-subtle)]"
              />
            </div>

            <div>
              <Label htmlFor="msSeq">Sequence #</Label>
              <input
                id="msSeq"
                type="number"
                min={1}
                value={form.sequence}
                onChange={(e) => setField("sequence", Number(e.target.value))}
                className={inputClass}
              />
            </div>

            <div>
              <Label htmlFor="msWeight">Weight (%)</Label>
              <input
                id="msWeight"
                type="number"
                min={0}
                max={100}
                value={form.weightPercent}
                onChange={(e) =>
                  setField("weightPercent", Number(e.target.value))
                }
                className={inputClass}
              />
            </div>

            <div>
              <Label htmlFor="msStart">Planned Start</Label>
              <input
                id="msStart"
                type="date"
                value={form.plannedStartDate}
                onChange={(e) => setField("plannedStartDate", e.target.value)}
                className={inputClass}
              />
            </div>

            <div>
              <Label htmlFor="msEnd">Planned End</Label>
              <input
                id="msEnd"
                type="date"
                value={form.plannedEndDate}
                onChange={(e) => setField("plannedEndDate", e.target.value)}
                className={inputClass}
              />
            </div>

            <div>
              <Label htmlFor="msBudget">Budget Amount</Label>
              <input
                id="msBudget"
                type="number"
                min={0}
                step="0.01"
                value={form.budgetAmount}
                onChange={(e) => setField("budgetAmount", e.target.value)}
                placeholder="0.00"
                className={inputClass}
              />
            </div>

            <div>
              <Label htmlFor="msClientTitle">Client-Visible Title</Label>
              <input
                id="msClientTitle"
                type="text"
                value={form.clientVisibleTitle}
                onChange={(e) => setField("clientVisibleTitle", e.target.value)}
                placeholder="Optional simplified title for client"
                className={inputClass}
              />
            </div>

            <div className="sm:col-span-2">
              <Label htmlFor="msNotes">Internal Notes</Label>
              <textarea
                id="msNotes"
                value={form.notes}
                onChange={(e) => setField("notes", e.target.value)}
                rows={2}
                placeholder="Internal notes…"
                className="w-full rounded-lg border border-[var(--pb-border)] bg-[var(--pb-surface)] text-white text-sm px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-[var(--pb-green)] placeholder:text-[var(--pb-text-subtle)]"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.isClientVisible}
                  onChange={(e) => setField("isClientVisible", e.target.checked)}
                  className="accent-[var(--pb-green)] h-4 w-4 rounded"
                />
                <span className="text-sm text-[var(--pb-text-muted)]">
                  Visible to client
                </span>
              </label>
            </div>
          </div>

          {error && (
            <p className="text-sm text-[var(--pb-danger)]">{error}</p>
          )}

          <div className="flex gap-3">
            <Button type="submit" disabled={saving}>
              {saving && <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />}
              {editingId ? "Save Changes" : "Create Milestone"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={cancelForm}
              disabled={saving}
            >
              Cancel
            </Button>
          </div>
        </form>
      )}

      {/* Milestone list */}
      {milestones.length === 0 && !showForm ? (
        <div className="bg-[var(--pb-surface-elevated)] border border-[var(--pb-border)] rounded-xl p-10 text-center">
          <GripVertical className="h-7 w-7 text-[var(--pb-text-subtle)] mx-auto mb-2" />
          <p className="text-[var(--pb-text-muted)] text-sm">
            No milestones yet. Add the first one above.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {milestones.map((m, idx) => (
            <div
              key={m.id}
              className={`bg-[var(--pb-surface-elevated)] border rounded-xl p-4 flex gap-3 transition-colors ${
                editingId === m.id
                  ? "border-[var(--pb-green)]"
                  : "border-[var(--pb-border)]"
              }`}
            >
              {/* Sequence badge */}
              <div className="flex flex-col items-center gap-1 shrink-0">
                <div className="h-7 w-7 rounded-full bg-[var(--pb-surface-raised)] flex items-center justify-center text-xs font-bold text-white">
                  {m.sequence}
                </div>
                <button
                  onClick={() => reorder(m.id, "up")}
                  disabled={idx === 0}
                  className="p-0.5 text-[var(--pb-text-subtle)] hover:text-white disabled:opacity-30"
                >
                  <ChevronUp className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => reorder(m.id, "down")}
                  disabled={idx === milestones.length - 1}
                  className="p-0.5 text-[var(--pb-text-subtle)] hover:text-white disabled:opacity-30"
                >
                  <ChevronDown className="h-3.5 w-3.5" />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 flex-wrap">
                  <div>
                    <span className="text-sm font-semibold text-white">
                      {m.title}
                    </span>
                    {m.clientVisibleTitle && m.clientVisibleTitle !== m.title && (
                      <span className="ml-2 text-xs text-[var(--pb-text-subtle)]">
                        ({m.clientVisibleTitle})
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        STATUS_COLORS[m.status] ?? ""
                      }`}
                    >
                      {STATUS_LABELS[m.status] ?? m.status}
                    </span>
                  </div>
                </div>

                {m.description && (
                  <p className="text-xs text-[var(--pb-text-muted)] mt-1 line-clamp-2">
                    {m.description}
                  </p>
                )}

                <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-[var(--pb-text-subtle)]">
                  {m.weightPercent > 0 && (
                    <span>{m.weightPercent}% weight</span>
                  )}
                  {m.plannedStartDate && (
                    <span>
                      Start:{" "}
                      {new Date(m.plannedStartDate).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  )}
                  {m.plannedEndDate && (
                    <span>
                      End:{" "}
                      {new Date(m.plannedEndDate).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  )}
                  {m.budgetAmount && <span>Budget: {m.budgetAmount}</span>}
                  {!m.isClientVisible && (
                    <span className="text-[var(--pb-text-subtle)]">
                      Internal only
                    </span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-start gap-1 shrink-0">
                <button
                  onClick={() => openEdit(m)}
                  className="h-7 w-7 flex items-center justify-center rounded-lg text-[var(--pb-text-muted)] hover:text-white hover:bg-[var(--pb-surface-raised)] transition-colors"
                  title="Edit"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => deleteMilestone(m.id)}
                  disabled={deleting === m.id}
                  className="h-7 w-7 flex items-center justify-center rounded-lg text-[var(--pb-text-subtle)] hover:text-[var(--pb-danger)] hover:bg-[var(--pb-danger-muted)] transition-colors disabled:opacity-50"
                  title="Delete"
                >
                  {deleting === m.id ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Trash2 className="h-3.5 w-3.5" />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
