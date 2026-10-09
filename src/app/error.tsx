"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw, ArrowLeft, AlertTriangle } from "lucide-react";
import { ProxyBuildLogo } from "@/components/ui/logo";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log to console in dev; swap for a real error service in prod
    console.error("[ProxyBuild Error]", error);
  }, [error]);

  const router = useRouter();

  return (
    <div className="min-h-screen bg-[var(--pb-bg)] flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md text-center">
        {/* Logo */}
        <div className="flex justify-center mb-10">
          <ProxyBuildLogo size={36} wordmark />
        </div>

        {/* Icon */}
        <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="h-7 w-7 text-red-400" />
        </div>

        {/* Message */}
        <h1 className="text-2xl font-bold text-white mb-2">Something went wrong</h1>
        <p className="text-[var(--pb-text-muted)] text-sm leading-relaxed mb-8">
          We ran into an unexpected problem loading this page. This has been noted and our team will look into it.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={reset}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[var(--pb-green)] hover:bg-[var(--pb-green-hover)] text-white text-sm font-semibold rounded-xl transition-colors w-full sm:w-auto justify-center"
          >
            <RefreshCw className="h-4 w-4" />
            Try Again
          </button>
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[var(--pb-surface-elevated)] hover:bg-[var(--pb-surface-raised)] border border-[var(--pb-border)] text-white text-sm font-semibold rounded-xl transition-colors w-full sm:w-auto justify-center"
          >
            <ArrowLeft className="h-4 w-4" />
            Go Back
          </button>
        </div>

        {/* Digest for support reference */}
        {error.digest && (
          <p className="mt-8 text-[11px] text-[var(--pb-text-subtle)] font-mono">
            Error ref: {error.digest}
          </p>
        )}
      </div>
    </div>
  );
}
