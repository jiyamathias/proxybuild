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
  milestones: { id: string; title: string }[];
}

export function RecordPaymentForm({ projectId, currency, milestones }: Props) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [fields, setFields] = useState({
    amount: "",
    milestoneId: "",
    description: "",
    provider: "",
    providerReference: "",
    paidAt: new Date().toISOString().split("T")[0],
    status: "SUCCESSFUL",
  });

  function set(key: keyof typeof fields, value: string) {
    setFields((f) => ({ ...f, [key]: value }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!fields.amount) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/finance/${projectId}/payments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...fields,
          amount: parseFloat(fields.amount),
          currency,
          milestoneId: fields.milestoneId || null,
          paidAt: fields.paidAt ? new Date(fields.paidAt).toISOString() : null,
        }),
      });
      if (res.ok) {
        router.push(`/admin/finance/${projectId}`);
        router.refresh();
      } else {
        const data = await res.json();
        setError(data.error ?? "Failed to record payment");
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
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="amount">Amount ({currency}) *</Label>
          <Input
            id="amount"
            type="number"
            step="0.01"
            min="0"
            placeholder="0.00"
            value={fields.amount}
            onChange={(e) => set("amount", e.target.value)}
            required
          />
        </div>
        <div>
          <Label htmlFor="paidAt">Payment Date</Label>
          <Input
            id="paidAt"
            type="date"
            value={fields.paidAt}
            onChange={(e) => set("paidAt", e.target.value)}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="status">Status</Label>
        <select
          id="status"
          value={fields.status}
          onChange={(e) => set("status", e.target.value)}
          className="w-full h-9 rounded-lg border border-[var(--pb-border)] bg-[var(--pb-surface)] text-white text-sm px-3 focus:outline-none focus:ring-2 focus:ring-[var(--pb-orange)]"
        >
          <option value="SUCCESSFUL">Successful</option>
          <option value="PENDING">Pending</option>
          <option value="PROCESSING">Processing</option>
          <option value="FAILED">Failed</option>
        </select>
      </div>

      {milestones.length > 0 && (
        <div>
          <Label htmlFor="milestone">Link to Milestone (optional)</Label>
          <select
            id="milestone"
            value={fields.milestoneId}
            onChange={(e) => set("milestoneId", e.target.value)}
            className="w-full h-9 rounded-lg border border-[var(--pb-border)] bg-[var(--pb-surface)] text-white text-sm px-3 focus:outline-none focus:ring-2 focus:ring-[var(--pb-orange)]"
          >
            <option value="">— Not linked —</option>
            {milestones.map((m) => (
              <option key={m.id} value={m.id}>
                {m.title}
              </option>
            ))}
          </select>
        </div>
      )}

      <div>
        <Label htmlFor="description">Description</Label>
        <Input
          id="description"
          placeholder="e.g. Foundation stage payment"
          value={fields.description}
          onChange={(e) => set("description", e.target.value)}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="provider">Payment Method</Label>
          <Input
            id="provider"
            placeholder="e.g. Bank Transfer, Wise"
            value={fields.provider}
            onChange={(e) => set("provider", e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="ref">Reference / Receipt No.</Label>
          <Input
            id="ref"
            placeholder="e.g. TXN123456"
            value={fields.providerReference}
            onChange={(e) => set("providerReference", e.target.value)}
          />
        </div>
      </div>

      {error && (
        <p className="text-sm text-[var(--pb-danger)]">{error}</p>
      )}

      <Button type="submit" disabled={saving || !fields.amount} className="w-full">
        {saving ? (
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
        ) : (
          <Save className="h-4 w-4 mr-2" />
        )}
        Record Payment
      </Button>
    </form>
  );
}
