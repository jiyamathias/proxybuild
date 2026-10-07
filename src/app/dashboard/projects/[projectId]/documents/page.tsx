export const dynamic = "force-dynamic";

import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import {
  getProjectForUser,
  getProjectDocuments,
} from "@/lib/services/projects";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { FileText, Download, File } from "lucide-react";
import { getPresignedDownloadUrl } from "@/lib/r2";

const categoryLabel: Record<string, string> = {
  CONTRACT: "Contract",
  DRAWING: "Drawing",
  PERMIT: "Permit",
  INVOICE: "Invoice",
  REPORT: "Report",
  SPECIFICATION: "Specification",
  CHANGE_ORDER: "Change Order",
  PHOTO: "Photo",
  OTHER: "Other",
};

function fileIcon(mimeType: string | null) {
  if (!mimeType) return <File className="h-5 w-5 text-[var(--pb-text-muted)]" />;
  if (mimeType.includes("pdf"))
    return <FileText className="h-5 w-5 text-red-400" />;
  if (mimeType.startsWith("image/"))
    return <FileText className="h-5 w-5 text-blue-400" />;
  return <File className="h-5 w-5 text-[var(--pb-text-muted)]" />;
}

export default async function DocumentsPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  const { projectId } = await params;
  const [project, docs] = await Promise.all([
    getProjectForUser(projectId, session),
    getProjectDocuments(projectId, true),
  ]);
  if (!project) notFound();

  const docsWithUrls = await Promise.all(
    docs.map(async ({ doc, uploaderFirstName, uploaderLastName }) => {
      let downloadUrl: string | null = null;
      try {
        downloadUrl = await getPresignedDownloadUrl(doc.storageKey);
      } catch {
        // ignore
      }
      return { doc, uploaderFirstName, uploaderLastName, downloadUrl };
    })
  );

  if (docs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <FileText className="h-10 w-10 text-[var(--pb-border)] mb-4" />
        <h3 className="text-base font-semibold text-white mb-1">
          No documents yet
        </h3>
        <p className="text-sm text-[var(--pb-text-muted)]">
          Contracts, permits, and reports will appear here.
        </p>
      </div>
    );
  }

  // Group by category
  const grouped = docsWithUrls.reduce<Record<string, typeof docsWithUrls>>(
    (acc, item) => {
      const cat = item.doc.category ?? "OTHER";
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(item);
      return acc;
    },
    {}
  );

  return (
    <div className="space-y-6">
      {Object.entries(grouped).map(([category, items]) => (
        <section key={category}>
          <h2 className="text-sm font-semibold text-[var(--pb-text-muted)] uppercase tracking-wide mb-3">
            {categoryLabel[category] ?? category} ({items.length})
          </h2>
          <div className="space-y-2">
            {items.map(
              ({ doc, uploaderFirstName, uploaderLastName, downloadUrl }) => {
                const uploaderName =
                  uploaderFirstName || uploaderLastName
                    ? `${uploaderFirstName ?? ""} ${uploaderLastName ?? ""}`.trim()
                    : "ProxyBuild Team";

                return (
                  <div
                    key={doc.id}
                    className="flex items-center gap-4 bg-[var(--pb-surface-elevated)] border border-[var(--pb-border-subtle)] rounded-xl p-4 hover:border-[var(--pb-border)] transition-colors"
                  >
                    <div className="h-10 w-10 rounded-lg bg-[var(--pb-surface)] border border-[var(--pb-border-subtle)] flex items-center justify-center shrink-0">
                      {fileIcon(doc.mimeType)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">
                        {doc.title}
                      </p>
                      <p className="text-xs text-[var(--pb-text-subtle)] mt-0.5">
                        {uploaderName} · {formatDate(doc.createdAt)}
                        {doc.fileSizeBytes && (
                          <> · {Math.round(doc.fileSizeBytes / 1024)} KB</>
                        )}
                      </p>
                    </div>
                    <Badge variant="secondary" className="shrink-0">
                      {categoryLabel[doc.category ?? "OTHER"] ?? doc.category}
                    </Badge>
                    {downloadUrl && (
                      <a
                        href={downloadUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="h-8 w-8 rounded-lg flex items-center justify-center text-[var(--pb-text-muted)] hover:text-white hover:bg-[var(--pb-surface)] transition-colors shrink-0"
                        title="Download"
                      >
                        <Download className="h-4 w-4" />
                      </a>
                    )}
                  </div>
                );
              }
            )}
          </div>
        </section>
      ))}
    </div>
  );
}
