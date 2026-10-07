"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, FolderPlus } from "lucide-react";

type Client = { id: string; firstName: string; lastName: string; email: string };
type Staff = { id: string; firstName: string; lastName: string; role: string };

interface Props {
  clients: Client[];
  staff: Staff[];
}

const PROJECT_TYPES = [
  { value: "RESIDENTIAL_NEW_BUILD", label: "Residential New Build" },
  { value: "RESIDENTIAL_RENOVATION", label: "Residential Renovation" },
  { value: "RESIDENTIAL_FINISHING", label: "Residential Finishing" },
  { value: "COMMERCIAL_NEW_BUILD", label: "Commercial New Build" },
  { value: "COMMERCIAL_RENOVATION", label: "Commercial Renovation" },
  { value: "SITE_PREPARATION", label: "Site Preparation" },
  { value: "MAINTENANCE", label: "Maintenance" },
  { value: "OTHER", label: "Other" },
];

const CURRENCIES = ["NGN", "USD", "GBP", "CAD", "EUR", "AUD"];

export function CreateProjectForm({ clients, staff }: Props) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [fields, setFields] = useState({
    clientId: "",
    title: "",
    description: "",
    projectType: "RESIDENTIAL_NEW_BUILD",
    status: "PLANNING",
    currency: "NGN",
    budgetAmount: "",
    contractValue: "",
    state: "",
    city: "",
    area: "",
    address: "",
    plannedStartDate: "",
    plannedEndDate: "",
    projectManagerId: "",
    internalNotes: "",
  });

  function set<K extends keyof typeof fields>(key: K, val: (typeof fields)[K]) {
    setFields((f) => ({ ...f, [key]: val }));
  }

  const selectClass =
    "w-full h-9 rounded-lg border border-[var(--pb-border)] bg-[var(--pb-surface)] text-white text-sm px-3 focus:outline-none focus:ring-2 focus:ring-[var(--pb-green)]";

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!fields.clientId || !fields.title || !fields.projectType) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...fields,
          budgetAmount: fields.budgetAmount || null,
          contractValue: fields.contractValue || null,
          plannedStartDate: fields.plannedStartDate || null,
          plannedEndDate: fields.plannedEndDate || null,
          projectManagerId: fields.projectManagerId || null,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        router.push(`/admin/projects/${data.project.id}`);
      } else {
        setError(data.error ?? "Failed to create project");
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-6">
      {/* Client */}
      <div className="bg-[var(--pb-surface-elevated)] border border-[var(--pb-border)] rounded-xl p-6 space-y-4">
        <h2 className="text-sm font-semibold text-white">Client</h2>
        <div>
          <Label htmlFor="clientId">Client *</Label>
          <select
            id="clientId"
            required
            value={fields.clientId}
            onChange={(e) => set("clientId", e.target.value)}
            className={selectClass}
          >
            <option value="">— Select client —</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.firstName} {c.lastName} ({c.email})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Project details */}
      <div className="bg-[var(--pb-surface-elevated)] border border-[var(--pb-border)] rounded-xl p-6 space-y-4">
        <h2 className="text-sm font-semibold text-white">Project Details</h2>

        <div>
          <Label htmlFor="title">Project Title *</Label>
          <Input
            id="title"
            required
            placeholder="e.g. Lekki Residence — Phase 1"
            value={fields.title}
            onChange={(e) => set("title", e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="projectType">Project Type *</Label>
            <select
              id="projectType"
              value={fields.projectType}
              onChange={(e) => set("projectType", e.target.value)}
              className={selectClass}
            >
              {PROJECT_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label htmlFor="status">Initial Status</Label>
            <select
              id="status"
              value={fields.status}
              onChange={(e) => set("status", e.target.value)}
              className={selectClass}
            >
              <option value="ENQUIRY">Enquiry</option>
              <option value="PLANNING">Planning</option>
              <option value="PROPOSAL">Proposal</option>
              <option value="CONTRACT">Contract</option>
              <option value="ACTIVE">Active</option>
            </select>
          </div>
        </div>

        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            rows={3}
            placeholder="Brief overview of what will be built…"
            value={fields.description}
            onChange={(e) => set("description", e.target.value)}
          />
        </div>
      </div>

      {/* Location */}
      <div className="bg-[var(--pb-surface-elevated)] border border-[var(--pb-border)] rounded-xl p-6 space-y-4">
        <h2 className="text-sm font-semibold text-white">Location</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="state">State</Label>
            <Input
              id="state"
              placeholder="e.g. Lagos"
              value={fields.state}
              onChange={(e) => set("state", e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="city">City</Label>
            <Input
              id="city"
              placeholder="e.g. Lagos"
              value={fields.city}
              onChange={(e) => set("city", e.target.value)}
            />
          </div>
        </div>
        <div>
          <Label htmlFor="area">Area / Estate</Label>
          <Input
            id="area"
            placeholder="e.g. Lekki Phase 1"
            value={fields.area}
            onChange={(e) => set("area", e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="address">Full Address</Label>
          <Input
            id="address"
            placeholder="Street address"
            value={fields.address}
            onChange={(e) => set("address", e.target.value)}
          />
        </div>
      </div>

      {/* Financials */}
      <div className="bg-[var(--pb-surface-elevated)] border border-[var(--pb-border)] rounded-xl p-6 space-y-4">
        <h2 className="text-sm font-semibold text-white">Financials</h2>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label htmlFor="currency">Currency</Label>
            <select
              id="currency"
              value={fields.currency}
              onChange={(e) => set("currency", e.target.value)}
              className={selectClass}
            >
              {CURRENCIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <Label htmlFor="budgetAmount">Client Budget</Label>
            <Input
              id="budgetAmount"
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              value={fields.budgetAmount}
              onChange={(e) => set("budgetAmount", e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="contractValue">Contract Value</Label>
            <Input
              id="contractValue"
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              value={fields.contractValue}
              onChange={(e) => set("contractValue", e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Timeline + Team */}
      <div className="bg-[var(--pb-surface-elevated)] border border-[var(--pb-border)] rounded-xl p-6 space-y-4">
        <h2 className="text-sm font-semibold text-white">Timeline &amp; Team</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="plannedStartDate">Planned Start</Label>
            <Input
              id="plannedStartDate"
              type="date"
              value={fields.plannedStartDate}
              onChange={(e) => set("plannedStartDate", e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="plannedEndDate">Planned End</Label>
            <Input
              id="plannedEndDate"
              type="date"
              value={fields.plannedEndDate}
              onChange={(e) => set("plannedEndDate", e.target.value)}
            />
          </div>
        </div>
        <div>
          <Label htmlFor="projectManagerId">Assign Project Manager</Label>
          <select
            id="projectManagerId"
            value={fields.projectManagerId}
            onChange={(e) => set("projectManagerId", e.target.value)}
            className={selectClass}
          >
            <option value="">— Assign later —</option>
            {staff.map((s) => (
              <option key={s.id} value={s.id}>
                {s.firstName} {s.lastName} ({s.role.replace(/_/g, " ")})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Internal notes */}
      <div className="bg-[var(--pb-surface-elevated)] border border-[var(--pb-border)] rounded-xl p-6">
        <Label htmlFor="internalNotes">Internal Notes</Label>
        <Textarea
          id="internalNotes"
          rows={3}
          placeholder="Notes visible only to staff…"
          value={fields.internalNotes}
          onChange={(e) => set("internalNotes", e.target.value)}
        />
      </div>

      {error && (
        <p className="text-sm text-[var(--pb-danger)]">{error}</p>
      )}

      <div className="flex gap-3">
        <Button type="submit" disabled={saving} className="flex-1">
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <FolderPlus className="h-4 w-4 mr-2" />
          )}
          Create Project
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
