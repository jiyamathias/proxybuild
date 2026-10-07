export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { isStaff } from "@/lib/permissions";
import { db } from "@/lib/db";
import { consultations } from "@/db/schema";
import { desc } from "drizzle-orm";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { formatRelativeDate } from "@/lib/utils";
import { Phone, Mail, MapPin, MessageSquare } from "lucide-react";

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

export default async function AdminConsultationsPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!isStaff(session)) redirect("/dashboard");

  const rows = await db
    .select()
    .from(consultations)
    .orderBy(desc(consultations.createdAt));

  const newCount = rows.filter((r) => r.status === "NEW").length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Consultations</h1>
        <p className="text-sm text-[var(--pb-text-muted)] mt-0.5">
          {rows.length} total · {newCount} new
        </p>
      </div>

      {rows.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <MessageSquare className="h-12 w-12 text-[var(--pb-border)] mb-4" />
          <h3 className="text-base font-semibold text-white mb-1">
            No consultation requests yet
          </h3>
        </div>
      ) : (
        <div className="space-y-2">
          {rows.map((c) => {
            const sv = statusVariant[c.status] ?? "secondary";
            const sl = statusLabel[c.status] ?? c.status;
            return (
              <Link
                key={c.id}
                href={`/admin/consultations/${c.id}`}
                className="flex items-center gap-4 bg-[var(--pb-surface-elevated)] border border-[var(--pb-border-subtle)] rounded-xl p-4 hover:border-[var(--pb-border)] transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="text-sm font-semibold text-white">
                      {c.firstName} {c.lastName}
                    </p>
                    {c.status === "NEW" && (
                      <span className="h-2 w-2 rounded-full bg-[var(--pb-orange)] shrink-0" />
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5">
                    <span className="text-xs text-[var(--pb-text-muted)] flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      {c.email}
                    </span>
                    <span className="text-xs text-[var(--pb-text-muted)] flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {c.projectLocation}, {c.projectCountry}
                    </span>
                    <span className="text-xs text-[var(--pb-text-subtle)]">
                      {c.projectType}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-xs text-[var(--pb-text-subtle)]">
                    {formatRelativeDate(c.createdAt)}
                  </span>
                  <Badge variant={sv}>{sl}</Badge>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
