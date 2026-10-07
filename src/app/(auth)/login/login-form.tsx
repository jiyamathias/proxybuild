"use client";

import { useActionState } from "react";
import Link from "next/link";
import { loginAction } from "@/lib/auth/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

export function LoginForm() {
  const [state, action, isPending] = useActionState(loginAction, {});

  return (
    <form action={action} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="email">Email Address</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="john@example.com"
        />
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label htmlFor="password">Password</Label>
          <Link
            href="/forgot-password"
            className="text-xs text-[var(--pb-text-muted)] hover:text-[var(--pb-orange)] transition-colors"
          >
            Forgot password?
          </Link>
        </div>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          placeholder="••••••••"
        />
      </div>

      {state.error && (
        <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">
          {state.error}
        </p>
      )}

      <Button type="submit" className="w-full" size="lg" disabled={isPending}>
        {isPending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Signing in…
          </>
        ) : (
          "Sign In"
        )}
      </Button>

      <p className="text-xs text-center text-[var(--pb-text-subtle)]">
        Don&apos;t have an account?{" "}
        <Link
          href="/book-consultation"
          className="text-[var(--pb-orange)] hover:underline"
        >
          Book a consultation
        </Link>{" "}
        to get started.
      </p>
    </form>
  );
}
