"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Eye, EyeOff, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";

export function ChangePasswordForm({ role }: { role: string }) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const strong = password.length >= 8;
  const matches = password === confirm && confirm.length > 0;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!strong) { setError("Password must be at least 8 characters"); return; }
    if (!matches) { setError("Passwords do not match"); return; }

    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newPassword: password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to update password");
        return;
      }
      setDone(true);
      setTimeout(() => {
        router.replace(role === "CLIENT" ? "/dashboard" : "/admin");
      }, 1500);
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="flex flex-col items-center gap-3 py-4">
        <CheckCircle2 className="h-10 w-10 text-[var(--pb-green)]" />
        <p className="text-white font-semibold">Password set!</p>
        <p className="text-sm text-[var(--pb-text-muted)]">Taking you to your dashboard…</p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <label className="block text-sm text-[var(--pb-text-muted)] mb-1.5">New password</label>
        <div className="relative">
          <Input
            type={showPw ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Minimum 8 characters"
            required
            autoFocus
          />
          <button
            type="button"
            onClick={() => setShowPw(!showPw)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--pb-text-subtle)] hover:text-white"
          >
            {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>

      <div>
        <label className="block text-sm text-[var(--pb-text-muted)] mb-1.5">Confirm password</label>
        <Input
          type={showPw ? "text" : "password"}
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          placeholder="Re-enter your new password"
          required
        />
        {confirm.length > 0 && !matches && (
          <p className="text-xs text-red-400 mt-1">Passwords do not match</p>
        )}
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <Button type="submit" className="w-full" disabled={loading || !strong || !matches}>
        {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
        Set Password &amp; Continue
      </Button>
    </form>
  );
}
