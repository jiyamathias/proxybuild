"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, PenLine, ShieldCheck, X } from "lucide-react";

const AGREEMENT_STATEMENT =
  "I confirm that I have read and understood this document, and I agree to be bound by its terms. I understand that typing my full name below constitutes my legally binding electronic signature.";

interface Props {
  projectId: string;
  documentId: string;
  documentTitle: string;
  expectedName: string;
  downloadUrl?: string | null;
}

export function SignDocumentButton({
  projectId,
  documentId,
  documentTitle,
  expectedName,
  downloadUrl,
}: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const nameOk = name.trim().length >= 2;
  const canSign = nameOk && agreed && !loading;

  async function sign() {
    if (!canSign) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/projects/${projectId}/documents/${documentId}/sign`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ signerName: name.trim(), agreed: true }),
        }
      );
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not record your signature.");
        return;
      }
      setOpen(false);
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (!open) {
    return (
      <Button size="sm" onClick={() => setOpen(true)}>
        <PenLine className="h-3.5 w-3.5 mr-1.5" />
        Review &amp; Sign
      </Button>
    );
  }

  return (
    <div className="mt-3 bg-[var(--pb-surface)] border border-[var(--pb-green)]/30 rounded-xl p-5 space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h4 className="text-sm font-semibold text-white">
            Sign &ldquo;{documentTitle}&rdquo;
          </h4>
          <p className="text-xs text-[var(--pb-text-muted)] mt-0.5">
            Please read the document in full before signing.
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

      {downloadUrl && (
        <a
          href={downloadUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex text-sm text-[var(--pb-green)] hover:underline"
        >
          Open the document to read it →
        </a>
      )}

      <div className="bg-[var(--pb-bg)] border border-[var(--pb-border-subtle)] rounded-lg p-3">
        <p className="text-xs text-[var(--pb-text-muted)] leading-relaxed">
          {AGREEMENT_STATEMENT}
        </p>
      </div>

      <label className="flex items-start gap-2.5 cursor-pointer">
        <input
          type="checkbox"
          checked={agreed}
          onChange={(e) => setAgreed(e.target.checked)}
          className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--pb-green)]"
        />
        <span className="text-sm text-[var(--pb-text-muted)]">
          I have read and agree to the terms of this document.
        </span>
      </label>

      <div>
        <label
          htmlFor="signer-name"
          className="block text-xs text-[var(--pb-text-subtle)] mb-1.5"
        >
          Type your full name to sign
        </label>
        <Input
          id="signer-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={expectedName}
          autoComplete="off"
        />
        {name.trim().length > 0 && (
          <p
            className="mt-2 text-xl text-white"
            style={{ fontFamily: "Georgia, 'Times New Roman', serif", fontStyle: "italic" }}
          >
            {name.trim()}
          </p>
        )}
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <div className="flex items-center gap-3 flex-wrap">
        <Button size="sm" onClick={sign} disabled={!canSign}>
          {loading ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
          ) : (
            <PenLine className="h-3.5 w-3.5 mr-1.5" />
          )}
          Sign Document
        </Button>
        <span className="text-xs text-[var(--pb-text-subtle)] flex items-center gap-1">
          <ShieldCheck className="h-3 w-3" />
          Your name, the time and your IP address are recorded
        </span>
      </div>
    </div>
  );
}
