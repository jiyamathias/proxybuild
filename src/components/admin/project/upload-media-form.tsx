"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Loader2,
  Upload,
  Image as ImageIcon,
  Video,
  CheckCircle2,
} from "lucide-react";

interface Props {
  projectId: string;
  milestones: { id: string; title: string }[];
}

const ACCEPTED = "image/jpeg,image/png,image/webp,image/heic,video/mp4,video/quicktime,video/webm";

export function UploadMediaForm({ projectId, milestones }: Props) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  const selectClass =
    "w-full h-9 rounded-lg border border-[var(--pb-border)] bg-[var(--pb-surface)] text-white text-sm px-3 focus:outline-none focus:ring-2 focus:ring-[var(--pb-green)]";

  const [fields, setFields] = useState({
    caption: "",
    isClientVisible: true,
    milestoneId: "",
  });

  function set<K extends keyof typeof fields>(key: K, val: (typeof fields)[K]) {
    setFields((f) => ({ ...f, [key]: val }));
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(e.target.files ?? []);
    setFiles(selected);
    setDone(false);
    setError(null);
  }

  async function upload(e: React.FormEvent) {
    e.preventDefault();
    if (files.length === 0) return;
    setUploading(true);
    setError(null);
    setProgress(0);

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        // 1. Presign
        const presignRes = await fetch("/api/storage/presign", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            projectId,
            fileName: file.name,
            mimeType: file.type,
            fileSizeBytes: file.size,
            category: "media",
          }),
        });
        if (!presignRes.ok) {
          const d = await presignRes.json();
          throw new Error(d.error ?? "Failed to get upload URL");
        }
        const { url, key } = await presignRes.json();

        // 2. Upload to R2
        const uploadRes = await fetch(url, {
          method: "PUT",
          body: file,
          headers: { "Content-Type": file.type },
        });
        if (!uploadRes.ok) throw new Error(`Upload failed for ${file.name}`);

        // 3. Register in DB
        const regRes = await fetch(`/api/admin/projects/${projectId}/media`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            storageKey: key,
            fileName: file.name,
            mimeType: file.type,
            fileSizeBytes: file.size,
            caption: fields.caption || null,
            isClientVisible: fields.isClientVisible,
            milestoneId: fields.milestoneId || null,
          }),
        });
        if (!regRes.ok) {
          const d = await regRes.json();
          throw new Error(d.error ?? "Failed to register media");
        }

        setProgress(Math.round(((i + 1) / files.length) * 100));
      }

      setDone(true);
      setFiles([]);
      setFields({ caption: "", isClientVisible: true, milestoneId: "" });
      if (inputRef.current) inputRef.current.value = "";
      router.refresh();
    } catch (err) {
      setError(String(err instanceof Error ? err.message : err));
    } finally {
      setUploading(false);
    }
  }

  const totalSize = files.reduce((sum, f) => sum + f.size, 0);
  const hasVideo = files.some((f) => f.type.startsWith("video/"));

  return (
    <form
      onSubmit={upload}
      className="bg-[var(--pb-surface-elevated)] border border-[var(--pb-border)] rounded-xl p-6 space-y-5"
    >
      <h2 className="text-sm font-semibold text-white">Upload Photos / Videos</h2>

      {/* Drop zone */}
      <div>
        <input
          ref={inputRef}
          type="file"
          id="media-file"
          className="sr-only"
          accept={ACCEPTED}
          multiple
          onChange={handleFileChange}
        />
        <label
          htmlFor="media-file"
          className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-[var(--pb-border)] rounded-lg p-8 cursor-pointer hover:border-[var(--pb-green)] transition-colors"
        >
          {files.length > 0 ? (
            <>
              <div className="flex gap-2">
                {hasVideo ? (
                  <Video className="h-8 w-8 text-[var(--pb-green)]" />
                ) : (
                  <ImageIcon className="h-8 w-8 text-[var(--pb-green)]" />
                )}
              </div>
              <span className="text-sm text-white font-medium">
                {files.length} file{files.length !== 1 ? "s" : ""} selected
              </span>
              <span className="text-xs text-[var(--pb-text-subtle)]">
                {(totalSize / 1024 / 1024).toFixed(1)} MB total
              </span>
              <span className="text-xs text-[var(--pb-green)] underline">
                Click to change
              </span>
            </>
          ) : (
            <>
              <div className="flex gap-3">
                <ImageIcon className="h-7 w-7 text-[var(--pb-text-subtle)]" />
                <Video className="h-7 w-7 text-[var(--pb-text-subtle)]" />
              </div>
              <span className="text-sm text-[var(--pb-text-muted)]">
                Click to select photos or videos
              </span>
              <span className="text-xs text-[var(--pb-text-subtle)]">
                JPG, PNG, WebP, HEIC · Max 20MB · MP4, MOV, WebM · Max 500MB
              </span>
            </>
          )}
        </label>
      </div>

      {files.length > 0 && (
        <>
          {/* File list preview */}
          <div className="space-y-1.5 max-h-40 overflow-y-auto">
            {files.map((f, i) => (
              <div
                key={i}
                className="flex items-center gap-2 text-xs text-[var(--pb-text-muted)] bg-[var(--pb-surface)] rounded-lg px-3 py-2"
              >
                {f.type.startsWith("video/") ? (
                  <Video className="h-3.5 w-3.5 shrink-0 text-[var(--pb-text-subtle)]" />
                ) : (
                  <ImageIcon className="h-3.5 w-3.5 shrink-0 text-[var(--pb-text-subtle)]" />
                )}
                <span className="truncate flex-1">{f.name}</span>
                <span className="shrink-0 text-[var(--pb-text-subtle)]">
                  {(f.size / 1024 / 1024).toFixed(1)} MB
                </span>
              </div>
            ))}
          </div>

          <div>
            <Label htmlFor="mediaCaption">Caption (optional)</Label>
            <input
              id="mediaCaption"
              type="text"
              value={fields.caption}
              onChange={(e) => set("caption", e.target.value)}
              placeholder="e.g. Foundation work completed"
              className="w-full h-9 rounded-lg border border-[var(--pb-border)] bg-[var(--pb-surface)] text-white text-sm px-3 placeholder:text-[var(--pb-text-subtle)] focus:outline-none focus:ring-2 focus:ring-[var(--pb-green)]"
            />
          </div>

          {milestones.length > 0 && (
            <div>
              <Label htmlFor="mediaMilestone">Link to Milestone</Label>
              <select
                id="mediaMilestone"
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
            <div className="space-y-1">
              <div className="h-1.5 bg-[var(--pb-border)] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[var(--pb-green)] rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-xs text-[var(--pb-text-subtle)] text-right">
                {progress}%
              </p>
            </div>
          )}
        </>
      )}

      {error && <p className="text-sm text-[var(--pb-danger)]">{error}</p>}
      {done && (
        <div className="flex items-center gap-2 text-sm text-[var(--pb-success)]">
          <CheckCircle2 className="h-4 w-4" />
          Media uploaded successfully
        </div>
      )}

      <Button
        type="submit"
        disabled={files.length === 0 || uploading}
        className="w-full"
      >
        {uploading ? (
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
        ) : (
          <Upload className="h-4 w-4 mr-2" />
        )}
        {uploading
          ? `Uploading ${files.length} file${files.length !== 1 ? "s" : ""}…`
          : `Upload ${files.length > 0 ? files.length + " " : ""}File${files.length !== 1 ? "s" : ""}`}
      </Button>
    </form>
  );
}
