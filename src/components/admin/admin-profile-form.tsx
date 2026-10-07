"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Save, CheckCircle2 } from "lucide-react";

interface Props {
  userId: string;
  initialData: {
    firstName: string;
    lastName: string;
    phone: string;
  };
}

export function AdminProfileForm({ userId, initialData }: Props) {
  const [fields, setFields] = useState(initialData);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function set(key: keyof typeof fields, value: string) {
    setFields((f) => ({ ...f, [key]: value }));
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/users/${userId}/profile`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(fields),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
      } else {
        const data = await res.json();
        setError(data.error ?? "Failed to save");
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={save} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="pfFirstName">First Name</Label>
          <Input
            id="pfFirstName"
            value={fields.firstName}
            onChange={(e) => set("firstName", e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="pfLastName">Last Name</Label>
          <Input
            id="pfLastName"
            value={fields.lastName}
            onChange={(e) => set("lastName", e.target.value)}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="pfPhone">Phone</Label>
        <Input
          id="pfPhone"
          type="tel"
          placeholder="+234 …"
          value={fields.phone}
          onChange={(e) => set("phone", e.target.value)}
        />
      </div>

      {error && <p className="text-sm text-[var(--pb-danger)]">{error}</p>}

      <Button type="submit" variant="default" size="sm" disabled={saving}>
        {saving ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
        ) : saved ? (
          <CheckCircle2 className="h-3.5 w-3.5 mr-1.5 text-[var(--pb-success)]" />
        ) : (
          <Save className="h-3.5 w-3.5 mr-1.5" />
        )}
        {saved ? "Saved!" : "Save Profile"}
      </Button>
    </form>
  );
}
