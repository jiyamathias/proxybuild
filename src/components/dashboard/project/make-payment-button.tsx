"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, CreditCard, Lock, X } from "lucide-react";

interface Props {
  projectId: string;
  currency: string;
  /** Remaining balance, used as the default amount */
  suggestedAmount: number;
}

function formatPreview(raw: string, currency: string) {
  const n = Number(raw);
  if (!raw || Number.isNaN(n) || n <= 0) return null;
  try {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(n);
  } catch {
    return `${currency} ${n.toLocaleString()}`;
  }
}

export function MakePaymentButton({
  projectId,
  currency,
  suggestedAmount,
}: Props) {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState(
    suggestedAmount > 0 ? String(Math.round(suggestedAmount)) : ""
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const preview = formatPreview(amount, currency);
  const valid = Number(amount) > 0;

  async function pay() {
    if (!valid) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/projects/${projectId}/payments/initiate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: Number(amount) }),
      });
      const data = await res.json();
      if (!res.ok || !data.link) {
        setError(data.error ?? "Could not start payment. Please try again.");
        return;
      }
      // Hand off to Flutterwave's hosted checkout
      window.location.href = data.link;
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  if (!open) {
    return (
      <Button onClick={() => setOpen(true)} className="w-full sm:w-auto">
        <CreditCard className="h-4 w-4 mr-1.5" />
        Make a Payment
      </Button>
    );
  }

  return (
    <div className="bg-[var(--pb-surface)] border border-[var(--pb-green)]/30 rounded-xl p-5 space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-sm font-semibold text-white">Make a Payment</h3>
          <p className="text-xs text-[var(--pb-text-muted)] mt-0.5">
            You&apos;ll be taken to our secure payment provider to complete this.
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

      <div>
        <label
          htmlFor="pay-amount"
          className="block text-xs text-[var(--pb-text-subtle)] mb-1.5"
        >
          Amount ({currency})
        </label>
        <Input
          id="pay-amount"
          inputMode="numeric"
          value={amount}
          onChange={(e) => setAmount(e.target.value.replace(/[^0-9]/g, ""))}
          placeholder="0"
          autoFocus
        />
        {preview && (
          <p className="text-sm text-[var(--pb-green)] font-semibold mt-1.5">
            {preview}
          </p>
        )}
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <div className="flex items-center gap-3">
        <Button onClick={pay} disabled={!valid || loading}>
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
          ) : (
            <CreditCard className="h-4 w-4 mr-1.5" />
          )}
          Continue to Payment
        </Button>
        <span className="text-xs text-[var(--pb-text-subtle)] flex items-center gap-1">
          <Lock className="h-3 w-3" />
          Secured by Flutterwave
        </span>
      </div>
    </div>
  );
}
