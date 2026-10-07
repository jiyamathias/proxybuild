"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Save } from "lucide-react";

const EXPENSE_TYPES = [
  { value: "MATERIAL_COST", label: "Material Cost" },
  { value: "LABOUR_COST", label: "Labour Cost" },
  { value: "CONTRACTOR_COST", label: "Contractor Cost" },
  { value: "PROFESSIONAL_FEE", label: "Professional Fee" },
  { value: "LOGISTICS", label: "Logistics" },
  { value: "PROXYBUILD_FEE", label: "ProxyBuild Fee" },
  { value: "OTHER_EXPENSE", label: "Other Expense" },
  { value: "ADJUSTMENT", label: "Adjustment" },
];

interface Props {
  projectId: string;
  currency: string;
  milestones: { id: string; title: string }[];
}

export function AddExpenseForm({ projectId, currency, milestones }: Props) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [fields, setFields] = useState({
    amount: "",
    entryType: "MATERIAL_COST",
    description: "",
    milestoneId: "",
    entryDate: new Date().toISOString().split("T")[0],
  });

  function set(key: keyof typeof fields, value: string) {
    setFields((f) => ({ ...f, [key]: value }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!fields.amount || !fields.description) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/finance/${projectId}/ledger`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...fields,
          amount: parseFloat(fields.amount),
          currency,
          milestoneId: fields.milestoneId || null,
          entryDate: new Date(fields.entryDate).toISOString(),
        }),
      });
      if (res.ok) {
        router.push(`/admin/finance/${projectId}`);
        router.refresh();
      } else {
        const data = await res.json();
        setError(data.error ?? "Failed to log expense");
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
          <Label htmlFor="entryDate">Date</Label>
          <Input
            id="entryDate"
            type="date"
            value={fields.entryDate}
            onChange={(e) => set("entryDate", e.target.value)}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="entryType">Expense Type *</Label>
        <select
          id="entryType"
          value={fields.entryType}
          onChange={(e) => set("entryType", e.target.value)}
          className="w-full h-9 rounded-lg border border-[var(--pb-border)] bg-[var(--pb-surface)] text-white text-sm px-3 focus:outline-none focus:ring-2 focus:ring-[var(--pb-green)]"
        >
          {EXPENSE_TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <Label htmlFor="description">Description *</Label>
        <Input
          id="description"
          placeholder="e.g. Sand and gravel for foundation"
          value={fields.description}
          onChange={(e) => set("description", e.target.value)}
          required
        />
      </div>

      {milestones.length > 0 && (
        <div>
          <Label htmlFor="milestone">Link to Milestone (optional)</Label>
          <select
            id="milestone"
            value={fields.milestoneId}
            onChange={(e) => set("milestoneId", e.target.value)}
            className="w-full h-9 rounded-lg border border-[var(--pb-border)] bg-[var(--pb-surface)] text-white text-sm px-3 focus:outline-none focus:ring-2 focus:ring-[var(--pb-green)]"
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

      {error && (
        <p className="text-sm text-[var(--pb-danger)]">{error}</p>
      )}

      <Button
        type="submit"
        disabled={saving || !fields.amount || !fields.description}
        className="w-full"
      >
        {saving ? (
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
        ) : (
          <Save className="h-4 w-4 mr-2" />
        )}
        Log Expense
      </Button>
    </form>
  );
}
