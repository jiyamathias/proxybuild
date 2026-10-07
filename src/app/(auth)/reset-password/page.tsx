"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { Suspense } from "react";

function ResetPasswordForm() {
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get("token") ?? "";

  const [fields, setFields] = useState({ password: "", confirm: "" });
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) setError("Invalid or missing reset token.");
  }, [token]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (fields.password !== fields.confirm) {
      setError("Passwords do not match");
      return;
    }
    if (fields.password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password: fields.password }),
      });
      if (res.ok) {
        setDone(true);
        setTimeout(() => router.push("/login"), 2500);
      } else {
        const d = await res.json();
        setError(d.error ?? "Reset failed");
      }
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="w-full max-w-sm space-y-4 text-center">
        <CheckCircle2 className="h-12 w-12 text-[var(--pb-success)] mx-auto" />
        <h1 className="text-2xl font-bold text-white">Password updated!</h1>
        <p className="text-sm text-[var(--pb-text-muted)]">
          Redirecting you to sign in…
        </p>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="w-full max-w-sm space-y-4 text-center">
        <AlertCircle className="h-12 w-12 text-[var(--pb-danger)] mx-auto" />
        <h1 className="text-2xl font-bold text-white">Invalid link</h1>
        <p className="text-sm text-[var(--pb-text-muted)]">
          This reset link is invalid or has expired.
        </p>
        <Link href="/forgot-password" className="text-[var(--pb-green)] hover:underline text-sm">
          Request a new link
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white mb-1">Set new password</h1>
        <p className="text-sm text-[var(--pb-text-muted)]">
          Choose a strong password for your account.
        </p>
      </div>

      <form onSubmit={submit} className="space-y-4">
        <div>
          <Label htmlFor="rp-password">New Password</Label>
          <Input
            id="rp-password"
            type="password"
            placeholder="Min. 8 characters"
            value={fields.password}
            onChange={(e) => setFields((f) => ({ ...f, password: e.target.value }))}
            required
          />
        </div>
        <div>
          <Label htmlFor="rp-confirm">Confirm Password</Label>
          <Input
            id="rp-confirm"
            type="password"
            value={fields.confirm}
            onChange={(e) => setFields((f) => ({ ...f, confirm: e.target.value }))}
            required
          />
        </div>

        {error && <p className="text-sm text-[var(--pb-danger)]">{error}</p>}

        <Button type="submit" className="w-full" disabled={loading}>
          {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
          Update password
        </Button>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  );
}
