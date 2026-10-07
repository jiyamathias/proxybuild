export const dynamic = "force-dynamic";

import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth/session";
import { isStaff } from "@/lib/permissions";
import { db } from "@/lib/db";
import { projects, documents, milestones, profiles } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { getPresignedDownloadUrl } from "@/lib/r2";
import { UploadDocumentForm } from "@/components/admin/project/upload-document-form";
import {
  FileText,
  Download,
  ExternalLink,
  ArrowLeft,
  Eye,
  EyeOff,
} from "lucide-react";

export default async function AdminProjectDocumentsPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const session = await getSession();
  if (!session || !isStaff(session)) redirect("/login");

  const { projectId } = await params;

  const [project] = await db
    .select({ id: projects.id, title: projects.title })
    .from(projects)
    .where(eq(projects.id, projectId))
    .limit(1);
  if (!project) notFound();

  const [docRows, milestoneRows] = await Promise.all([
    db
      .select({
        doc: documents,
        uploaderFirst: profiles.firstName,
        uploaderLast: profiles.lastName,
      })
      .from(documents)
      .leftJoin(profiles, eq(profiles.userId, documents.uploadedById))
      .where(eq(documents.projectId, projectId))
      .orderBy(desc(documents.createdAt)),
    db
      .select({ id: milestones.id, title: milestones.title })
      .from(milestones)
      .where(eq(milestones.projectId, projectId)),
  ]);

  // Generate download URLs
  const docsWithUrls = await Promise.all(
    docRows.map(async (row) => ({
      ...row,
      downloadUrl: await getPresignedDownloadUrl(row.doc.storageKey),
    }))
  );

  function formatSize(bytes: number | null) {
    if (!bytes) return "";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  }

  function formatDate(d: Date) {
    return d.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href={`/admin/projects/${projectId}`}
          className="text-[var(--pb-text-muted)] hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-white">Documents</h1>
          <p className="text-sm text-[var(--pb-text-muted)]">{project.title}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upload form */}
        <div className="lg:col-span-1">
          <UploadDocumentForm
            projectId={projectId}
            milestones={milestoneRows}
          />
        </div>

        {/* Document list */}
        <div className="lg:col-span-2 space-y-3">
          {docsWithUrls.length === 0 ? (
            <div className="bg-[var(--pb-surface-elevated)] border border-[var(--pb-border)] rounded-xl p-12 text-center">
              <FileText className="h-8 w-8 text-[var(--pb-text-subtle)] mx-auto mb-2" />
              <p className="text-[var(--pb-text-muted)] text-sm">
                No documents uploaded yet
              </p>
            </div>
          ) : (
            docsWithUrls.map(({ doc, uploaderFirst, uploaderLast, downloadUrl }) => (
              <div
                key={doc.id}
                className="bg-[var(--pb-surface-elevated)] border border-[var(--pb-border)] rounded-xl p-4 flex items-center gap-3"
              >
                <div className="h-10 w-10 rounded-lg bg-[var(--pb-surface-raised)] flex items-center justify-center shrink-0">
                  <FileText className="h-5 w-5 text-[var(--pb-text-muted)]" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-sm font-medium text-white truncate">
                      {doc.title}
                    </span>
                    {doc.isClientVisible ? (
                      <Eye className="h-3.5 w-3.5 text-[var(--pb-success)] shrink-0" aria-label="Visible to client" />
                    ) : (
                      <EyeOff className="h-3.5 w-3.5 text-[var(--pb-text-subtle)] shrink-0" aria-label="Hidden from client" />
                    )}
                  </div>
                  <p className="text-xs text-[var(--pb-text-subtle)]">
                    {doc.category.replace(/_/g, " ")}
                    {doc.fileSizeBytes ? ` · ${formatSize(doc.fileSizeBytes)}` : ""}
                    {` · ${formatDate(doc.createdAt)}`}
                    {uploaderFirst || uploaderLast
                      ? ` · ${[uploaderFirst, uploaderLast].filter(Boolean).join(" ")}`
                      : ""}
                  </p>
                </div>

                <a
                  href={downloadUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-8 w-8 flex items-center justify-center rounded-lg text-[var(--pb-text-muted)] hover:text-white hover:bg-[var(--pb-surface-raised)] transition-colors shrink-0"
                  title="Download"
                >
                  <Download className="h-4 w-4" />
                </a>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
