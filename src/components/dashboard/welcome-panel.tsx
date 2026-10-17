"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ListChecks,
  CheckCircle2,
  CreditCard,
  Camera,
  X,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const STEPS = [
  {
    icon: ListChecks,
    title: "Your build, broken into milestones",
    body: "Every project is split into clear stages — foundation, structure, roofing and so on — each with its own scope and cost.",
  },
  {
    icon: CheckCircle2,
    title: "Nothing moves without your approval",
    body: "When a milestone is finished we send it to you for review. Work on the next stage only begins once you've approved it.",
  },
  {
    icon: CreditCard,
    title: "Pay securely, stage by stage",
    body: "You pay as the build progresses rather than everything upfront. Every payment is receipted and visible in your statement.",
  },
  {
    icon: Camera,
    title: "See it as it happens",
    body: "Site photos, written updates and direct messages with your team — so you always know what's happening on the ground.",
  },
];

export function WelcomePanel({ firstName }: { firstName: string }) {
  const router = useRouter();
  const [dismissing, setDismissing] = useState(false);

  async function dismiss() {
    setDismissing(true);
    try {
      await fetch("/api/dashboard/onboarding", { method: "POST" });
      router.refresh();
    } catch {
      // If the call fails the panel simply shows again next visit
      setDismissing(false);
    }
  }

  return (
    <section className="relative bg-[var(--pb-surface-elevated)] border border-[var(--pb-green)]/25 rounded-2xl p-6 sm:p-8">
      <button
        onClick={dismiss}
        disabled={dismissing}
        aria-label="Dismiss welcome"
        className="absolute top-4 right-4 text-[var(--pb-text-subtle)] hover:text-white transition-colors"
      >
        <X className="h-4 w-4" />
      </button>

      <div className="mb-6 pr-8">
        <p className="text-xs uppercase tracking-wide text-[var(--pb-green)] font-semibold mb-1.5">
          Welcome to ProxyBuild
        </p>
        <h2 className="text-xl font-bold text-white mb-1.5">
          Good to have you, {firstName}.
        </h2>
        <p className="text-sm text-[var(--pb-text-muted)] leading-relaxed max-w-xl">
          You&apos;re building from a distance, so we&apos;ve designed everything here
          around one thing: you always knowing exactly where your money and your
          project stand. Here&apos;s how it works.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        {STEPS.map((step, i) => (
          <div key={step.title} className="flex gap-3">
            <div className="h-9 w-9 rounded-xl bg-[var(--pb-green-muted)] border border-[var(--pb-green)]/20 flex items-center justify-center shrink-0">
              <step.icon className="h-4 w-4 text-[var(--pb-green)]" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white mb-0.5">
                {i + 1}. {step.title}
              </p>
              <p className="text-xs text-[var(--pb-text-muted)] leading-relaxed">
                {step.body}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <Button size="sm" onClick={dismiss} disabled={dismissing}>
          Got it, let&apos;s go
          <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
        </Button>
        <span className="text-xs text-[var(--pb-text-subtle)]">
          You can always reach your team from the Messages tab on any project.
        </span>
      </div>
    </section>
  );
}
