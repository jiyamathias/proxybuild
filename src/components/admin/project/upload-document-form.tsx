"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Upload, FileText, CheckCircle2, X } from "lucide-react";

const DOC_CATEGORIES = [
  "ARCHITECTURAL_DRAWING",
  "STRUCTURAL_DRAWING",
  "ELECTRICAL_PLAN",
  "PLUMBING_PLAN",
  "BOQ",
  "CONTRACT",
  "PERMIT",
  "INVOICE",
  "RECEIPT",
  "REPORT",
  "WARRANTY",
  "OTHER",
];

interface Props {
  projectId: string;
  milestones: { id: string; title: string }[];
}

export function UploadDocumentForm({ projectId, milestones }: Props) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  const selectClass =
    "w-full h-9 rounded-lg border border-[var(--pb-border)] bg-[var(--pb-surface)] text-white text-sm px-3 focus:outline-none focus:ring-2 focus:ring-[var(--pb-green)]";

  const [fields, setFields] = useState({
    title: "",
    category: "OTHER",
    description: "",
    isClientVisible: true,
    milestoneId: "",
  });

  function set<K extends keyof typeof fields>(key: K, val: (typeof fields)[K]) {
    setFields((f) => ({ ...f, [key]: val }));
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] ?? null;
    setFile(f);
    if (f && !fields.title) {
      set("title", f.name.replace(/\.[^.]+$/, ""));
    }
    setDone(false);
    setError(null);
  }

  async function upload(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return;
    setUploading(true);
    setError(null);
    setProgress(0);

    try {
      // 1. Get presigned URL
      const presignRes = await fetch("/api/storage/presign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          fileName: file.name,
          mimeType: file.type,
          fileSizeBytes: file.size,
          category: "documents",
        }),
      });
      if (!presignRes.ok) {
        const d = await presignRes.json();
        throw new Error(d.error ?? "Failed to get upload URL");
      }
      const { url, key } = await presignRes.json();

      // 2. Upload to R2
      setProgress(30);
      const uploadRes = await fetch(url, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type },
      });
      if (!uploadRes.ok) throw new Error("Upload to storage failed");
      setProgress(70);

      // 3. Register in DB
      const regRes = await fetch(`/api/admin/projects/${projectId}/documents`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: fields.title || file.name,
          storageKey: key,
          fileName: file.name,
          mimeType: file.type,
          fileSizeBytes: file.size,
          category: fields.category,
          description: fields.description || null,
          isClientVisible: fields.isClientVisible,
          milestoneId: fields.milestoneId || null,
        }),
      });
      if (!regRes.ok) {
        const d = await regRes.json();
        throw new Error(d.error ?? "Failed to register document");
      }
      setProgress(100);
      setDone(true);
      setFile(null);
      setFields({ title: "", category: "OTHER", description: "", isClientVisible: true, milestoneId: "" });
      if (inputRef.current) inputRef.current.value = "";
      router.refresh();
    } catch (err) {
      setError(String(err instanceof Error ? err.message : err));
    } finally {
      setUploading(false);
    }
  }

  return (
    <form
      onSubmit={upload}
      className="bg-[var(--pb-surface-elevated)] border border-[var(--pb-border)] rounded-xl p-6 space-y-5"
    >
      <h2 className="text-sm font-semibold text-white">Upload Document</h2>

      {/* File drop zone */}
      <div>
        <input
          ref={inputRef}
          type="file"
          id="doc-file"
          className="sr-only"
          accept=".pdf,.doc,.docx,.xls,.xlsx"
          onChange={handleFileChange}
        />
        <label
          htmlFor="doc-file"
          className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-[var(--pb-border)] rounded-lg p-8 cursor-pointer hover:border-[var(--pb-green)] transition-colors"
        >
          {file ? (
            <>
              <FileText className="h-8 w-8 text-[var(--pb-green)]" />
              <span className="text-sm text-white font-medium">{file.name}</span>
              <span className="text-xs text-[var(--pb-text-subtle)]">
                {Math.round(file.size / 1024)} KB
              </span>
            </>
          ) : (
            <>
              <Upload className="h-8 w-8 text-[var(--pb-text-subtle)]" />
              <span className="text-sm text-[var(--pb-text-muted)]">
                Click to select a file
              </span>
              <span className="text-xs text-[var(--pb-text-subtle)]">
                PDF, Word, Excel · Max 50MB
              </span>
            </>
          )}
        </label>
      </div>

      {file && (
        <>
          <div>
            <Label htmlFor="docTitle">Document Title</Label>
            <Input
              id="docTitle"
              value={fields.title}
              onChange={(e) => set("title", e.target.value)}
              placeholder={file.name}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="docCategory">Category</Label>
              <select
                id="docCategory"
                value={fields.category}
                onChange={(e) => set("category", e.target.value)}
                className={selectClass}
              >
                {DOC_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c.replace(/_/g, " ")}
                  </option>
                ))}
              </select>
            </div>
            {milestones.length > 0 && (
              <div>
                <Label htmlFor="docMilestone">Link to Milestone</Label>
                <select
                  id="docMilestone"
                  value={fields.milestoneId}
                  onChange={(e) => set("milestoneId", e.target.value)}
                  className={selectClass}
                >
                  <option value="">— None —</option>
                  {milestones.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.title}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={fields.isClientVisible}
                onChange={(e) => set("isClientVisible", e.target.checked)}
                className="accent-[var(--pb-green)] h-4 w-4 rounded"
              />
              <span className="text-sm text-[var(--pb-text-muted)]">
                Visible to client
              </span>
            </label>
          </div>

          {uploading && (
            <div className="h-1.5 bg-[var(--pb-border)] rounded-full overflow-hidden">
              <div
                className="h-full bg-[var(--pb-green)] rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}
        </>
      )}

      {error && <p className="text-sm text-[var(--pb-danger)]">{error}</p>}
      {done && (
        <div className="flex items-center gap-2 text-sm text-[var(--pb-success)]">
          <CheckCircle2 className="h-4 w-4" />
          Document uploaded successfully
        </div>
      )}

      <Button type="submit" disabled={!file || uploading} className="w-full">
        {uploading ? (
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
        ) : (
          <Upload className="h-4 w-4 mr-2" />
        )}
        {uploading ? "Uploading…" : "Upload Document"}
      </Button>
    </form>
  );
}
