"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod/v4";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle2, Loader2 } from "lucide-react";

const schema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Enter a valid email address"),
  phone: z.string().optional(),
  countryOfResidence: z.string().min(1, "Country of residence is required"),
  preferredContact: z.string().optional(),
  projectLocation: z.string().min(1, "Project location is required"),
  projectState: z.string().optional(),
  projectType: z.string().min(1, "Project type is required"),
  landStatus: z.string().optional(),
  estimatedBudget: z.string().optional(),
  desiredTimeline: z.string().optional(),
  description: z.string().min(20, "Please provide at least 20 characters describing your project"),
});

type FormData = z.infer<typeof schema>;

function formatNaira(raw: string): string | null {
  const num = parseFloat(raw.replace(/,/g, ""));
  if (isNaN(num) || num <= 0) return null;
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);
}

const MONTHS = [
  { label: "January", value: "01" }, { label: "February", value: "02" },
  { label: "March", value: "03" },   { label: "April", value: "04" },
  { label: "May", value: "05" },     { label: "June", value: "06" },
  { label: "July", value: "07" },    { label: "August", value: "08" },
  { label: "September", value: "09" },{ label: "October", value: "10" },
  { label: "November", value: "11" },{ label: "December", value: "12" },
];

const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 6 }, (_, i) => currentYear + i);

export function ConsultationForm() {
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [budgetRaw, setBudgetRaw] = useState("");
  const [tlMonth, setTlMonth] = useState("");
  const [tlYear, setTlYear] = useState("");

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  async function onSubmit(data: FormData) {
    setServerError(null);
    try {
      const res = await fetch("/api/consultations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) {
        setServerError(json.error ?? "Something went wrong. Please try again.");
        return;
      }
      setSubmitted(true);
    } catch {
      setServerError("Something went wrong. Please try again.");
    }
  }

  if (submitted) {
    return (
      <div className="bg-[var(--pb-surface)] border border-[var(--pb-border)] rounded-2xl p-10 text-center">
        <div className="h-16 w-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="h-8 w-8 text-green-400" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-3">
          We&apos;ve got your request!
        </h2>
        <p className="text-[var(--pb-text-muted)] max-w-sm mx-auto">
          One of our project advisors will review your brief and be in touch
          within 1–2 business days to discuss your build.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="bg-[var(--pb-surface)] border border-[var(--pb-border)] rounded-2xl p-6 sm:p-8 space-y-6"
    >
      {/* Name */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="firstName">First Name *</Label>
          <Input
            id="firstName"
            placeholder="John"
            {...register("firstName")}
          />
          {errors.firstName && (
            <p className="text-xs text-red-400">{errors.firstName.message}</p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="lastName">Last Name *</Label>
          <Input id="lastName" placeholder="Adeyemi" {...register("lastName")} />
          {errors.lastName && (
            <p className="text-xs text-red-400">{errors.lastName.message}</p>
          )}
        </div>
      </div>

      {/* Email and Phone */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="email">Email Address *</Label>
          <Input
            id="email"
            type="email"
            placeholder="john@example.com"
            {...register("email")}
          />
          {errors.email && (
            <p className="text-xs text-red-400">{errors.email.message}</p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="phone">Phone / WhatsApp</Label>
          <Input
            id="phone"
            type="tel"
            placeholder="+44 7700 900000"
            {...register("phone")}
          />
        </div>
      </div>

      {/* Country and Contact Preference */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="countryOfResidence">Country of Residence *</Label>
          <Input
            id="countryOfResidence"
            placeholder="United Kingdom"
            {...register("countryOfResidence")}
          />
          {errors.countryOfResidence && (
            <p className="text-xs text-red-400">
              {errors.countryOfResidence.message}
            </p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="preferredContact">Preferred Contact Method</Label>
          <select
            id="preferredContact"
            {...register("preferredContact")}
            className="flex h-10 w-full rounded-lg border border-[var(--pb-border)] bg-[var(--pb-surface-elevated)] px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[var(--pb-green)] focus:border-[var(--pb-green)]"
          >
            <option value="">Select…</option>
            <option value="email">Email</option>
            <option value="phone">Phone call</option>
            <option value="whatsapp">WhatsApp</option>
          </select>
        </div>
      </div>

      <hr className="border-[var(--pb-border)]" />

      {/* Project Location */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="projectLocation">Project Location *</Label>
          <Input
            id="projectLocation"
            placeholder="Lekki, Lagos"
            {...register("projectLocation")}
          />
          {errors.projectLocation && (
            <p className="text-xs text-red-400">
              {errors.projectLocation.message}
            </p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="projectState">State</Label>
          <Input
            id="projectState"
            placeholder="Lagos"
            {...register("projectState")}
          />
        </div>
      </div>

      {/* Project Type and Land Status */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="projectType">Project Type *</Label>
          <select
            id="projectType"
            {...register("projectType")}
            className="flex h-10 w-full rounded-lg border border-[var(--pb-border)] bg-[var(--pb-surface-elevated)] px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[var(--pb-green)] focus:border-[var(--pb-green)]"
          >
            <option value="">Select…</option>
            <option value="RESIDENTIAL_NEW_BUILD">Residential — New Build</option>
            <option value="RESIDENTIAL_RENOVATION">Residential — Renovation</option>
            <option value="RESIDENTIAL_FINISHING">Residential — Finishing</option>
            <option value="COMMERCIAL_NEW_BUILD">Commercial — New Build</option>
            <option value="COMMERCIAL_RENOVATION">Commercial — Renovation</option>
            <option value="SITE_PREPARATION">Site Preparation</option>
            <option value="MAINTENANCE">Property Maintenance</option>
            <option value="OTHER">Other</option>
          </select>
          {errors.projectType && (
            <p className="text-xs text-red-400">{errors.projectType.message}</p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="landStatus">Land Status</Label>
          <select
            id="landStatus"
            {...register("landStatus")}
            className="flex h-10 w-full rounded-lg border border-[var(--pb-border)] bg-[var(--pb-surface-elevated)] px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[var(--pb-green)] focus:border-[var(--pb-green)]"
          >
            <option value="">Select…</option>
            <option value="OWNED_WITH_TITLE">Owned — with C of O / title</option>
            <option value="OWNED_WITHOUT_TITLE">Owned — no title yet</option>
            <option value="FAMILY_LAND">Family land</option>
            <option value="NOT_YET_ACQUIRED">Not yet acquired</option>
            <option value="OTHER">Other</option>
          </select>
        </div>
      </div>

      {/* Budget and Timeline */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="estimatedBudget">Estimated Budget (₦)</Label>
          <Input
            id="estimatedBudget"
            inputMode="numeric"
            placeholder="e.g. 25000000"
            value={budgetRaw}
            onChange={(e) => {
              const val = e.target.value.replace(/[^0-9]/g, "");
              setBudgetRaw(val);
              setValue("estimatedBudget", val);
            }}
          />
          {budgetRaw && formatNaira(budgetRaw) && (
            <p className="text-sm font-medium text-[var(--pb-green)]">
              {formatNaira(budgetRaw)}
            </p>
          )}
        </div>

        {/* Target Completion Date */}
        <div className="space-y-1.5">
          <Label>Target Completion Date</Label>
          <div className="grid grid-cols-2 gap-2">
            <select
              value={tlMonth}
              onChange={(e) => {
                setTlMonth(e.target.value);
                const val = e.target.value && tlYear ? `${tlYear}-${e.target.value}` : "";
                setValue("desiredTimeline", val);
              }}
              className="flex h-10 w-full rounded-lg border border-[var(--pb-border)] bg-[var(--pb-surface-elevated)] px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[var(--pb-green)] focus:border-[var(--pb-green)]"
            >
              <option value="">Month</option>
              {MONTHS.map((m) => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
            <select
              value={tlYear}
              onChange={(e) => {
                setTlYear(e.target.value);
                const val = tlMonth && e.target.value ? `${e.target.value}-${tlMonth}` : "";
                setValue("desiredTimeline", val);
              }}
              className="flex h-10 w-full rounded-lg border border-[var(--pb-border)] bg-[var(--pb-surface-elevated)] px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[var(--pb-green)] focus:border-[var(--pb-green)]"
            >
              <option value="">Year</option>
              {YEARS.map((y) => (
                <option key={y} value={String(y)}>{y}</option>
              ))}
            </select>
          </div>
          {tlMonth && tlYear && (
            <p className="text-xs font-medium text-[var(--pb-green)]">
              Target: {MONTHS.find((m) => m.value === tlMonth)?.label} {tlYear}
            </p>
          )}
        </div>
      </div>

      {/* Description */}
      <div className="space-y-1.5">
        <Label htmlFor="description">
          Describe Your Project *
        </Label>
        <Textarea
          id="description"
          rows={5}
          placeholder="Tell us about what you want to build. Include details such as number of bedrooms, storeys, any specific requirements, existing structures on site, etc."
          {...register("description")}
        />
        {errors.description && (
          <p className="text-xs text-red-400">{errors.description.message}</p>
        )}
      </div>

      {serverError && (
        <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">
          {serverError}
        </p>
      )}

      <Button
        type="submit"
        size="lg"
        className="w-full"
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Submitting…
          </>
        ) : (
          "Submit Consultation Request"
        )}
      </Button>

      <p className="text-xs text-[var(--pb-text-subtle)] text-center">
        By submitting you agree to be contacted by ProxyBuild Africa regarding your project. We do not share your information with third parties.
      </p>
    </form>
  );
}
