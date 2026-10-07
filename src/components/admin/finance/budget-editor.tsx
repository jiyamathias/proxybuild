"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Plus, Trash2, Save } from "lucide-react";

type BudgetItem = {
  id?: string;
  category: string;
  description: string;
  amount: string;
  quantity: string;
  unitCost: string;
};

interface ExistingBudget {
  id: string;
  totalAmount: string;
  notes: string | null;
  currency: string;
}

interface ExistingItem {
  id: string;
  category: string;
  description: string;
  amount: string;
  quantity: string | null;
  unitCost: string | null;
}

interface Props {
  projectId: string;
  existing: ExistingBudget | null;
  existingItems: ExistingItem[];
}

const CATEGORIES = [
  "MATERIAL",
  "LABOUR",
  "CONTRACTOR",
  "PROFESSIONAL_FEES",
  "LOGISTICS",
  "PROXYBUILD_FEE",
  "CONTINGENCY",
  "OTHER",
];

const CURRENCIES = ["NGN", "USD", "GBP", "CAD", "EUR", "AUD"];

const selectClass =
  "w-full h-9 rounded-lg border border-[var(--pb-border)] bg-[var(--pb-surface)] text-white text-sm px-3 focus:outline-none focus:ring-2 focus:ring-[var(--pb-green)]";

function emptyItem(): BudgetItem {
  return { category: "MATERIAL", description: "", amount: "", quantity: "", unitCost: "" };
}

export function BudgetEditor({ projectId, existing, existingItems }: Props) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currency, setCurrency] = useState(existing?.currency ?? "NGN");
  const [totalAmount, setTotalAmount] = useState(existing?.totalAmount ?? "");
  const [notes, setNotes] = useState(existing?.notes ?? "");
  const [items, setItems] = useState<BudgetItem[]>(
    existingItems.length > 0
      ? existingItems.map((i) => ({
          id: i.id,
          category: i.category,
          description: i.description,
          amount: i.amount,
          quantity: i.quantity ?? "",
          unitCost: i.unitCost ?? "",
        }))
      : [emptyItem()]
  );

  function updateItem(idx: number, key: keyof BudgetItem, val: string) {
    setItems((prev) =>
      prev.map((item, i) => (i === idx ? { ...item, [key]: val } : item))
    );
  }

  function addItem() {
    setItems((prev) => [...prev, emptyItem()]);
  }

  function removeItem(idx: number) {
    setItems((prev) => prev.filter((_, i) => i !== idx));
  }

  const computedTotal = items
    .reduce((acc, item) => acc + parseFloat(item.amount || "0"), 0)
    .toFixed(2);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/finance/${projectId}/budget`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currency,
          totalAmount: totalAmount || computedTotal,
          notes: notes || null,
          items: items.filter((i) => i.description && i.amount),
        }),
      });
      if (res.ok) {
        router.push(`/admin/finance/${projectId}`);
        router.refresh();
      } else {
        const d = await res.json();
        setError(d.error ?? "Failed to save budget");
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={save} className="space-y-6">
      {/* Budget header */}
      <div className="bg-[var(--pb-surface-elevated)] border border-[var(--pb-border)] rounded-xl p-6 space-y-4">
        <h2 className="text-sm font-semibold text-white">Budget Summary</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="currency">Currency</Label>
            <select
              id="currency"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className={selectClass}
            >
              {CURRENCIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <Label htmlFor="totalAmount">
              Total Budget Amount
              <span className="text-[var(--pb-text-subtle)] ml-1 text-xs">
                (or leave blank to sum line items)
              </span>
            </Label>
            <Input
              id="totalAmount"
              type="number"
              min="0"
              step="0.01"
              placeholder={computedTotal}
              value={totalAmount}
              onChange={(e) => setTotalAmount(e.target.value)}
            />
          </div>
        </div>
        <div>
          <Label htmlFor="notes">Budget Notes</Label>
          <Input
            id="notes"
            placeholder="Any notes or assumptions…"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>
      </div>

      {/* Line items */}
      <div className="bg-[var(--pb-surface-elevated)] border border-[var(--pb-border)] rounded-xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-white">Line Items</h2>
          <span className="text-xs text-[var(--pb-text-muted)]">
            Subtotal: {currency} {computedTotal}
          </span>
        </div>

        <div className="space-y-3">
          {items.map((item, idx) => (
            <div
              key={idx}
              className="grid grid-cols-12 gap-2 items-start p-3 rounded-lg bg-[var(--pb-surface)] border border-[var(--pb-border)]"
            >
              <div className="col-span-3">
                {idx === 0 && (
                  <Label className="text-xs mb-1 block">Category</Label>
                )}
                <select
                  value={item.category}
                  onChange={(e) => updateItem(idx, "category", e.target.value)}
                  className={selectClass}
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c.replace(/_/g, " ")}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-span-4">
                {idx === 0 && (
                  <Label className="text-xs mb-1 block">Description *</Label>
                )}
                <Input
                  placeholder="Item description"
                  value={item.description}
                  onChange={(e) => updateItem(idx, "description", e.target.value)}
                  required
                />
              </div>

              <div className="col-span-2">
                {idx === 0 && (
                  <Label className="text-xs mb-1 block">Qty</Label>
                )}
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="1"
                  value={item.quantity}
                  onChange={(e) => updateItem(idx, "quantity", e.target.value)}
                />
              </div>

              <div className="col-span-2">
                {idx === 0 && (
                  <Label className="text-xs mb-1 block">Amount *</Label>
                )}
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={item.amount}
                  onChange={(e) => updateItem(idx, "amount", e.target.value)}
                  required
                />
              </div>

              <div className="col-span-1 flex items-end justify-end">
                {idx === 0 && <div className="h-5 mb-1" />}
                {items.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeItem(idx)}
                    className="h-9 w-9 flex items-center justify-center rounded-lg text-[var(--pb-danger)] hover:bg-[var(--pb-danger)]/10 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={addItem}
          className="flex items-center gap-1.5 text-sm text-[var(--pb-green)] hover:text-[var(--pb-green-hover)] transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add line item
        </button>
      </div>

      {error && <p className="text-sm text-[var(--pb-danger)]">{error}</p>}

      <div className="flex gap-3">
        <Button type="submit" disabled={saving} className="flex-1">
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          Save Budget
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
