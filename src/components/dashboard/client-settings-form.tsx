"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Save, CheckCircle2, KeyRound } from "lucide-react";

interface ProfileProps {
  userId: string;
  initialData: {
    firstName: string;
    lastName: string;
    phone: string;
    countryOfResidence: string;
    timezone: string;
  };
}

export function ClientProfileForm({ userId, initialData }: ProfileProps) {
  const [fields, setFields] = useState(initialData);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function set(key: keyof typeof fields, val: string) {
    setFields((f) => ({ ...f, [key]: val }));
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/dashboard/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(fields),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
      } else {
        const d = await res.json();
        setError(d.error ?? "Failed to save");
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={save} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="sfFirst">First Name</Label>
          <Input
            id="sfFirst"
            value={fields.firstName}
            onChange={(e) => set("firstName", e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="sfLast">Last Name</Label>
          <Input
            id="sfLast"
            value={fields.lastName}
            onChange={(e) => set("lastName", e.target.value)}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="sfPhone">Phone</Label>
        <Input
          id="sfPhone"
          type="tel"
          placeholder="+44 7…"
          value={fields.phone}
          onChange={(e) => set("phone", e.target.value)}
        />
      </div>

      <div>
        <Label htmlFor="sfCountry">Country of Residence</Label>
        <Input
          id="sfCountry"
          placeholder="e.g. United Kingdom"
          value={fields.countryOfResidence}
          onChange={(e) => set("countryOfResidence", e.target.value)}
        />
      </div>

      <div>
        <Label htmlFor="sfTimezone">Timezone</Label>
        <Input
          id="sfTimezone"
          placeholder="e.g. Europe/London"
          value={fields.timezone}
          onChange={(e) => set("timezone", e.target.value)}
        />
      </div>

      {error && <p className="text-sm text-[var(--pb-danger)]">{error}</p>}

      <Button type="submit" size="sm" disabled={saving}>
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

export function ChangePasswordForm() {
  const [fields, setFields] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function set(key: keyof typeof fields, val: string) {
    setFields((f) => ({ ...f, [key]: val }));
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (fields.newPassword !== fields.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (fields.newPassword.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/dashboard/settings/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: fields.currentPassword,
          newPassword: fields.newPassword,
        }),
      });
      if (res.ok) {
        setSaved(true);
        setFields({ currentPassword: "", newPassword: "", confirmPassword: "" });
        setTimeout(() => setSaved(false), 3000);
      } else {
        const d = await res.json();
        setError(d.error ?? "Failed to change password");
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={save} className="space-y-4">
      <div>
        <Label htmlFor="cpCurrent">Current Password</Label>
        <Input
          id="cpCurrent"
          type="password"
          value={fields.currentPassword}
          onChange={(e) => set("currentPassword", e.target.value)}
          required
        />
      </div>
      <div>
        <Label htmlFor="cpNew">New Password</Label>
        <Input
          id="cpNew"
          type="password"
          placeholder="Min. 8 characters"
          value={fields.newPassword}
          onChange={(e) => set("newPassword", e.target.value)}
          required
        />
      </div>
      <div>
        <Label htmlFor="cpConfirm">Confirm New Password</Label>
        <Input
          id="cpConfirm"
          type="password"
          value={fields.confirmPassword}
          onChange={(e) => set("confirmPassword", e.target.value)}
          required
        />
      </div>

      {error && <p className="text-sm text-[var(--pb-danger)]">{error}</p>}
      {saved && (
        <p className="text-sm text-[var(--pb-success)]">
          Password changed successfully.
        </p>
      )}

      <Button type="submit" size="sm" variant="outline" disabled={saving}>
        {saving ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
        ) : (
          <KeyRound className="h-3.5 w-3.5 mr-1.5" />
        )}
        Change Password
      </Button>
    </form>
  );
}
