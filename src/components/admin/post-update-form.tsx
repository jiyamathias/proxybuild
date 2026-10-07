"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Send } from "lucide-react";

interface Props {
  projectId: string;
  currentProgress: number;
  milestones: { id: string; title: string }[];
}

export function PostUpdateForm({ projectId, currentProgress, milestones }: Props) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [fields, setFields] = useState({
    title: "",
    body: "",
    phase: "",
    progressDelta: "0",
    milestoneId: "",
    isClientVisible: true,
    isPublished: true,
  });

  function set<K extends keyof typeof fields>(key: K, value: (typeof fields)[K]) {
    setFields((f) => ({ ...f, [key]: value }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!fields.title || !fields.body) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/projects/${projectId}/updates`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...fields,
          progressDelta: parseInt(fields.progressDelta, 10) || 0,
          milestoneId: fields.milestoneId || null,
        }),
      });
      if (res.ok) {
        router.refresh();
        setFields({
          title: "",
          body: "",
          phase: "",
          progressDelta: "0",
          milestoneId: "",
          isClientVisible: true,
          isPublished: true,
        });
      } else {
        const data = await res.json();
        setError(data.error ?? "Failed to post update");
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      onSubmit={submit}
      className="bg-[var(--pb-surface-elevated)] border border-[var(--pb-border)] rounded-xl p-6 space-y-5"
    >
      <div>
        <Label htmlFor="title">Update Title *</Label>
        <Input
          id="title"
          placeholder="e.g. Foundation work complete"
          value={fields.title}
          onChange={(e) => set("title", e.target.value)}
          required
        />
      </div>

      <div>
        <Label htmlFor="body">Update Body *</Label>
        <Textarea
          id="body"
          placeholder="Describe what was accomplished, current status, and any issues…"
          value={fields.body}
          onChange={(e) => set("body", e.target.value)}
          rows={5}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="phase">Phase / Stage</Label>
          <Input
            id="phase"
            placeholder="e.g. Structural"
            value={fields.phase}
            onChange={(e) => set("phase", e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="progressDelta">Progress Increase (%)</Label>
          <Input
            id="progressDelta"
            type="number"
            min="0"
            max={100 - currentProgress}
            value={fields.progressDelta}
            onChange={(e) => set("progressDelta", e.target.value)}
          />
          <p className="text-xs text-[var(--pb-text-subtle)] mt-0.5">
            Current: {currentProgress}%
          </p>
        </div>
      </div>

      {milestones.length > 0 && (
        <div>
          <Label htmlFor="milestoneUpdate">Link to Milestone</Label>
          <select
            id="milestoneUpdate"
            value={fields.milestoneId}
            onChange={(e) => set("milestoneId", e.target.value)}
            className="w-full h-9 rounded-lg border border-[var(--pb-border)] bg-[var(--pb-surface)] text-white text-sm px-3 focus:outline-none focus:ring-2 focus:ring-[var(--pb-orange)]"
          >
            <option value="">— Not linked —</option>
            {milestones.map((m) => (
              <option key={m.id} value={m.id}>
                {m.title}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="flex items-center gap-6">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={fields.isClientVisible}
            onChange={(e) => set("isClientVisible", e.target.checked)}
            className="accent-[var(--pb-orange)] h-4 w-4 rounded"
          />
          <span className="text-sm text-[var(--pb-text-muted)]">
            Visible to client
          </span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={fields.isPublished}
            onChange={(e) => set("isPublished", e.target.checked)}
            className="accent-[var(--pb-orange)] h-4 w-4 rounded"
          />
          <span className="text-sm text-[var(--pb-text-muted)]">
            Publish now
          </span>
        </label>
      </div>

      {error && (
        <p className="text-sm text-[var(--pb-danger)]">{error}</p>
      )}

      <Button
        type="submit"
        disabled={saving || !fields.title || !fields.body}
        className="w-full"
      >
        {saving ? (
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
        ) : (
          <Send className="h-4 w-4 mr-2" />
        )}
        Post Update
      </Button>
    </form>
  );
}
