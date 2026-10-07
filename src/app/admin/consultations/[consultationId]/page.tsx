export const dynamic = "force-dynamic";

import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { isStaff } from "@/lib/permissions";
import { db } from "@/lib/db";
import { consultations } from "@/db/schema";
import { eq } from "drizzle-orm";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import {
  User,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Building2,
  FileText,
} from "lucide-react";
import Link from "next/link";
import { ConsultationStatusForm } from "@/components/admin/consultation-status-form";

const statusVariant: Record<string, "success" | "warning" | "danger" | "secondary" | "default"> = {
  NEW: "warning",
  CONTACTED: "default",
  QUALIFIED: "success",
  PROPOSAL_SENT: "default",
  CONVERTED: "success",
  CLOSED: "secondary",
};

const statusLabel: Record<string, string> = {
  NEW: "New",
  CONTACTED: "Contacted",
  QUALIFIED: "Qualified",
  PROPOSAL_SENT: "Proposal Sent",
  CONVERTED: "Converted",
  CLOSED: "Closed",
};

function Field({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div>
      <p className="text-xs text-[var(--pb-text-subtle)] mb-0.5">{label}</p>
      <p className="text-sm text-white">{value}</p>
    </div>
  );
}

export default async function ConsultationDetailPage({
  params,
}: {
  params: Promise<{ consultationId: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!isStaff(session)) redirect("/dashboard");

  const { consultationId } = await params;

  const [consultation] = await db
    .select()
    .from(consultations)
    .where(eq(consultations.id, consultationId))
    .limit(1);

  if (!consultation) notFound();

  const sv = statusVariant[consultation.status] ?? "secondary";
  const sl = statusLabel[consultation.status] ?? consultation.status;

  return (
    <div className="max-w-3xl space-y-6">
      {/* Breadcrumb + title */}
      <div>
        <div className="flex items-center gap-2 mb-2 text-sm">
          <Link
            href="/admin/consultations"
            className="text-[var(--pb-text-muted)] hover:text-white transition-colors"
          >
            Consultations
          </Link>
          <span className="text-[var(--pb-border)]">/</span>
          <span className="text-white">
            {consultation.firstName} {consultation.lastName}
          </span>
        </div>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">
              {consultation.firstName} {consultation.lastName}
            </h1>
            <p className="text-sm text-[var(--pb-text-muted)] mt-0.5">
              Received {formatDate(consultation.createdAt)}
            </p>
          </div>
          <Badge variant={sv}>{sl}</Badge>
        </div>
      </div>

      {/* Contact info */}
      <div className="bg-[var(--pb-surface-elevated)] border border-[var(--pb-border)] rounded-xl p-5">
        <h2 className="text-sm font-semibold text-[var(--pb-text-muted)] uppercase tracking-wide mb-4">
          Contact Information
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex items-center gap-2.5">
            <Mail className="h-4 w-4 text-[var(--pb-text-subtle)] shrink-0" />
            <div>
              <p className="text-xs text-[var(--pb-text-subtle)]">Email</p>
              <a
                href={`mailto:${consultation.email}`}
                className="text-sm text-[var(--pb-orange)] hover:underline"
              >
                {consultation.email}
              </a>
            </div>
          </div>
          {consultation.phone && (
            <div className="flex items-center gap-2.5">
              <Phone className="h-4 w-4 text-[var(--pb-text-subtle)] shrink-0" />
              <div>
                <p className="text-xs text-[var(--pb-text-subtle)]">Phone</p>
                <p className="text-sm text-white">{consultation.phone}</p>
              </div>
            </div>
          )}
          <div className="flex items-center gap-2.5">
            <User className="h-4 w-4 text-[var(--pb-text-subtle)] shrink-0" />
            <div>
              <p className="text-xs text-[var(--pb-text-subtle)]">
                Country of Residence
              </p>
              <p className="text-sm text-white">
                {consultation.countryOfResidence}
              </p>
            </div>
          </div>
          {consultation.preferredContact && (
            <div className="flex items-center gap-2.5">
              <Mail className="h-4 w-4 text-[var(--pb-text-subtle)] shrink-0" />
              <div>
                <p className="text-xs text-[var(--pb-text-subtle)]">
                  Preferred Contact
                </p>
                <p className="text-sm text-white capitalize">
                  {consultation.preferredContact}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Project details */}
      <div className="bg-[var(--pb-surface-elevated)] border border-[var(--pb-border)] rounded-xl p-5">
        <h2 className="text-sm font-semibold text-[var(--pb-text-muted)] uppercase tracking-wide mb-4">
          Project Details
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex items-start gap-2.5">
            <MapPin className="h-4 w-4 text-[var(--pb-text-subtle)] shrink-0 mt-0.5" />
            <div>
              <p className="text-xs text-[var(--pb-text-subtle)]">Location</p>
              <p className="text-sm text-white">
                {consultation.projectLocation}
                {consultation.projectState ? `, ${consultation.projectState}` : ""}
                , {consultation.projectCountry}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-2.5">
            <Building2 className="h-4 w-4 text-[var(--pb-text-subtle)] shrink-0 mt-0.5" />
            <div>
              <p className="text-xs text-[var(--pb-text-subtle)]">Project Type</p>
              <p className="text-sm text-white">{consultation.projectType}</p>
            </div>
          </div>
          {consultation.landStatus && (
            <Field
              label="Land Status"
              value={consultation.landStatus.replace(/_/g, " ")}
            />
          )}
          {consultation.estimatedBudget && (
            <Field label="Estimated Budget" value={consultation.estimatedBudget} />
          )}
          {consultation.desiredTimeline && (
            <Field label="Desired Timeline" value={consultation.desiredTimeline} />
          )}
        </div>
        <div className="mt-4 pt-4 border-t border-[var(--pb-border-subtle)]">
          <p className="text-xs text-[var(--pb-text-subtle)] mb-1">Description</p>
          <p className="text-sm text-[var(--pb-text-muted)] leading-relaxed whitespace-pre-wrap">
            {consultation.description}
          </p>
        </div>
      </div>

      {/* Status management */}
      <div className="bg-[var(--pb-surface-elevated)] border border-[var(--pb-border)] rounded-xl p-5">
        <h2 className="text-sm font-semibold text-[var(--pb-text-muted)] uppercase tracking-wide mb-4">
          Status &amp; Notes
        </h2>
        <ConsultationStatusForm
          consultationId={consultationId}
          currentStatus={consultation.status}
          currentNotes={consultation.internalNotes ?? ""}
        />
      </div>
    </div>
  );
}
