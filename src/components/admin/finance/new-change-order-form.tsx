"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Save } from "lucide-react";

interface Props {
  projectId: string;
  currency: string;
}

export function NewChangeOrderForm({ projectId, currency }: Props) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [fields, setFields] = useState({
    title: "",
    description: "",
    reason: "",
    costImpact: "",
    timelineImpactDays: "",
    status: "DRAFT",
  });

  function set(key: keyof typeof fields, value: string) {
    setFields((f) => ({ ...f, [key]: value }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!fields.title || !fields.description) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/finance/${projectId}/change-orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...fields,
          costImpact: fields.costImpact ? parseFloat(fields.costImpact) : null,
          timelineImpactDays: fields.timelineImpactDays
            ? parseInt(fields.timelineImpactDays, 10)
            : null,
        }),
      });
      if (res.ok) {
        router.push(`/admin/finance/${projectId}`);
        router.refresh();
      } else {
        const data = await res.json();
        setError(data.error ?? "Failed to create change order");
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      onSubmit={submit}
      className="bg-[var(--pb-surface-elevated)] border border-[var(--pb-border)] rounded-xl p-6 space-y-5"
    >
      <div>
        <Label htmlFor="title">Title *</Label>
        <Input
          id="title"
          placeholder="e.g. Foundation depth change"
          value={fields.title}
          onChange={(e) => set("title", e.target.value)}
          required
        />
      </div>

      <div>
        <Label htmlFor="description">Description *</Label>
        <Textarea
          id="description"
          placeholder="Describe the change in detail…"
          value={fields.description}
          onChange={(e) => set("description", e.target.value)}
          rows={4}
          required
        />
      </div>

      <div>
        <Label htmlFor="reason">Reason for Change</Label>
        <Textarea
          id="reason"
          placeholder="Why is this change needed?"
          value={fields.reason}
          onChange={(e) => set("reason", e.target.value)}
          rows={2}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="cost">Cost Impact ({currency})</Label>
          <Input
            id="cost"
            type="number"
            step="0.01"
            placeholder="0.00"
            value={fields.costImpact}
            onChange={(e) => set("costImpact", e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="days">Timeline Impact (days)</Label>
          <Input
            id="days"
            type="number"
            placeholder="0"
            value={fields.timelineImpactDays}
            onChange={(e) => set("timelineImpactDays", e.target.value)}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="status">Initial Status</Label>
        <select
          id="status"
          value={fields.status}
          onChange={(e) => set("status", e.target.value)}
          className="w-full h-9 rounded-lg border border-[var(--pb-border)] bg-[var(--pb-surface)] text-white text-sm px-3 focus:outline-none focus:ring-2 focus:ring-[var(--pb-green)]"
        >
          <option value="DRAFT">Draft</option>
          <option value="SUBMITTED">Submitted (send to client)</option>
          <option value="UNDER_REVIEW">Under Review</option>
        </select>
      </div>

      {error && (
        <p className="text-sm text-[var(--pb-danger)]">{error}</p>
      )}

      <Button
        type="submit"
        disabled={saving || !fields.title || !fields.description}
        className="w-full"
      >
        {saving ? (
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
        ) : (
          <Save className="h-4 w-4 mr-2" />
        )}
        Create Change Order
      </Button>
    </form>
  );
}
