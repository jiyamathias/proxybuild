"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserPlus, X, Loader2, CheckCircle2 } from "lucide-react";

const ROLES = [
  { value: "CLIENT", label: "Client" },
  { value: "PROJECT_MANAGER", label: "Project Manager" },
  { value: "SITE_SUPERVISOR", label: "Site Supervisor" },
  { value: "FINANCE", label: "Finance" },
  { value: "ADMIN", label: "Admin" },
];

export function InviteUserButton() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fields, setFields] = useState({
    email: "",
    firstName: "",
    lastName: "",
    role: "CLIENT",
  });

  function set(key: keyof typeof fields, value: string) {
    setFields((f) => ({ ...f, [key]: value }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!fields.email || !fields.firstName) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/users/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(fields),
      });
      const data = await res.json();
      if (res.ok) {
        setDone(true);
        setTimeout(() => {
          setOpen(false);
          setDone(false);
          setFields({ email: "", firstName: "", lastName: "", role: "CLIENT" });
          window.location.reload();
        }, 1500);
      } else {
        setError(data.error ?? "Failed to invite user");
      }
    } finally {
      setLoading(false);
    }
  }

  if (!open) {
    return (
      <Button variant="default" size="sm" onClick={() => setOpen(true)}>
        <UserPlus className="h-3.5 w-3.5 mr-1.5" />
        Invite User
      </Button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-[var(--pb-surface)] border border-[var(--pb-border)] rounded-2xl w-full max-w-md p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-white">Invite User</h2>
          <button
            onClick={() => setOpen(false)}
            className="h-8 w-8 flex items-center justify-center rounded-lg text-[var(--pb-text-muted)] hover:text-white hover:bg-[var(--pb-surface-elevated)] transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {done ? (
          <div className="flex flex-col items-center py-6 text-center">
            <CheckCircle2 className="h-10 w-10 text-[var(--pb-success)] mb-3" />
            <p className="text-white font-semibold">Invitation sent!</p>
            <p className="text-sm text-[var(--pb-text-muted)] mt-1">
              {fields.firstName} will receive an email to set up their account.
            </p>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  value={fields.firstName}
                  onChange={(e) => set("firstName", e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={fields.lastName}
                  onChange={(e) => set("lastName", e.target.value)}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="inviteEmail">Email *</Label>
              <Input
                id="inviteEmail"
                type="email"
                value={fields.email}
                onChange={(e) => set("email", e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor="role">Role</Label>
              <select
                id="role"
                value={fields.role}
                onChange={(e) => set("role", e.target.value)}
                className="w-full h-9 rounded-lg border border-[var(--pb-border)] bg-[var(--pb-surface)] text-white text-sm px-3 focus:outline-none focus:ring-2 focus:ring-[var(--pb-orange)]"
              >
                {ROLES.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>

            {error && (
              <p className="text-sm text-[var(--pb-danger)]">{error}</p>
            )}

            <div className="flex gap-3 pt-1">
              <Button
                type="button"
                variant="ghost"
                className="flex-1"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading || !fields.email || !fields.firstName}
                className="flex-1"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <UserPlus className="h-4 w-4 mr-2" />
                )}
                Send Invite
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
