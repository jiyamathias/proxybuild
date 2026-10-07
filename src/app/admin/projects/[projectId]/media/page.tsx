export const dynamic = "force-dynamic";

import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth/session";
import { isStaff } from "@/lib/permissions";
import { db } from "@/lib/db";
import { projects, projectMedia, milestones, profiles } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { getPresignedDownloadUrl } from "@/lib/r2";
import { UploadMediaForm } from "@/components/admin/project/upload-media-form";
import { ArrowLeft, Image as ImageIcon, Video, Eye, EyeOff } from "lucide-react";

export default async function AdminProjectMediaPage({
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

  const [mediaRows, milestoneRows] = await Promise.all([
    db
      .select({
        media: projectMedia,
        uploaderFirst: profiles.firstName,
        uploaderLast: profiles.lastName,
      })
      .from(projectMedia)
      .leftJoin(profiles, eq(profiles.userId, projectMedia.uploadedById))
      .where(eq(projectMedia.projectId, projectId))
      .orderBy(desc(projectMedia.createdAt)),
    db
      .select({ id: milestones.id, title: milestones.title })
      .from(milestones)
      .where(eq(milestones.projectId, projectId)),
  ]);

  // Generate signed URLs
  const mediaWithUrls = await Promise.all(
    mediaRows.map(async (row) => ({
      ...row,
      url: await getPresignedDownloadUrl(row.media.storageKey),
    }))
  );

  function formatDate(d: Date) {
    return d.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  function formatSize(bytes: number | null) {
    if (!bytes) return "";
    if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  }

  const photos = mediaWithUrls.filter((m) => m.media.mediaType === "photo");
  const videos = mediaWithUrls.filter((m) => m.media.mediaType === "video");

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
          <h1 className="text-xl font-bold text-white">Media</h1>
          <p className="text-sm text-[var(--pb-text-muted)]">{project.title}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upload form */}
        <div className="lg:col-span-1">
          <UploadMediaForm projectId={projectId} milestones={milestoneRows} />
        </div>

        {/* Media gallery */}
        <div className="lg:col-span-2 space-y-6">
          {/* Photos */}
          {photos.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <ImageIcon className="h-4 w-4 text-[var(--pb-text-muted)]" />
                <h2 className="text-sm font-semibold text-white">
                  Photos ({photos.length})
                </h2>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {photos.map(({ media, uploaderFirst, uploaderLast, url }) => (
                  <a
                    key={media.id}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group relative aspect-square rounded-xl overflow-hidden border border-[var(--pb-border)] bg-[var(--pb-surface-elevated)]"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={url}
                      alt={media.caption ?? media.fileName}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="absolute bottom-2 left-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {media.caption && (
                        <p className="text-xs text-white font-medium truncate">
                          {media.caption}
                        </p>
                      )}
                      <p className="text-xs text-white/70">
                        {formatDate(media.createdAt)}
                        {formatSize(media.fileSizeBytes)
                          ? ` · ${formatSize(media.fileSizeBytes)}`
                          : ""}
                      </p>
                    </div>
                    <div className="absolute top-2 right-2">
                      {media.isClientVisible ? (
                        <Eye className="h-3.5 w-3.5 text-white drop-shadow" aria-label="Visible to client" />
                      ) : (
                        <EyeOff className="h-3.5 w-3.5 text-white/60 drop-shadow" aria-label="Hidden from client" />
                      )}
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Videos */}
          {videos.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Video className="h-4 w-4 text-[var(--pb-text-muted)]" />
                <h2 className="text-sm font-semibold text-white">
                  Videos ({videos.length})
                </h2>
              </div>
              <div className="space-y-3">
                {videos.map(({ media, uploaderFirst, uploaderLast, url }) => (
                  <div
                    key={media.id}
                    className="bg-[var(--pb-surface-elevated)] border border-[var(--pb-border)] rounded-xl p-4 flex items-center gap-3"
                  >
                    <div className="h-10 w-10 rounded-lg bg-[var(--pb-surface-raised)] flex items-center justify-center shrink-0">
                      <Video className="h-5 w-5 text-[var(--pb-text-muted)]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-sm font-medium text-white truncate">
                          {media.caption ?? media.fileName}
                        </span>
                        {media.isClientVisible ? (
                          <Eye className="h-3.5 w-3.5 text-[var(--pb-success)] shrink-0" />
                        ) : (
                          <EyeOff className="h-3.5 w-3.5 text-[var(--pb-text-subtle)] shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-[var(--pb-text-subtle)]">
                        {formatDate(media.createdAt)}
                        {formatSize(media.fileSizeBytes)
                          ? ` · ${formatSize(media.fileSizeBytes)}`
                          : ""}
                        {uploaderFirst || uploaderLast
                          ? ` · ${[uploaderFirst, uploaderLast].filter(Boolean).join(" ")}`
                          : ""}
                      </p>
                    </div>
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-[var(--pb-green)] hover:underline shrink-0"
                    >
                      View
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}

          {mediaWithUrls.length === 0 && (
            <div className="bg-[var(--pb-surface-elevated)] border border-[var(--pb-border)] rounded-xl p-12 text-center">
              <ImageIcon className="h-8 w-8 text-[var(--pb-text-subtle)] mx-auto mb-2" />
              <p className="text-[var(--pb-text-muted)] text-sm">
                No media uploaded yet
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
