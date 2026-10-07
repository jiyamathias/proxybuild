export const dynamic = "force-dynamic";

import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { getProjectForUser, getProjectMedia } from "@/lib/services/projects";
import { formatRelativeDate } from "@/lib/utils";
import { ImageIcon, Video } from "lucide-react";
import { getPresignedDownloadUrl } from "@/lib/r2";

export default async function MediaPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  const { projectId } = await params;
  const [project, mediaItems] = await Promise.all([
    getProjectForUser(projectId, session),
    getProjectMedia(projectId, true),
  ]);
  if (!project) notFound();

  // Generate presigned URLs for media items (images only for inline display)
  const mediaWithUrls = await Promise.all(
    mediaItems.map(async (item) => {
      let url: string | null = null;
      try {
        url = await getPresignedDownloadUrl(item.storageKey);
      } catch {
        // ignore
      }
      return { item, url };
    })
  );

  if (mediaItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <ImageIcon className="h-10 w-10 text-[var(--pb-border)] mb-4" />
        <h3 className="text-base font-semibold text-white mb-1">No media yet</h3>
        <p className="text-sm text-[var(--pb-text-muted)]">
          Site photos and progress videos will appear here.
        </p>
      </div>
    );
  }

  const photos = mediaWithUrls.filter(({ item }) => item.mediaType === "IMAGE");
  const videos = mediaWithUrls.filter(({ item }) => item.mediaType === "VIDEO");

  return (
    <div className="space-y-8">
      {photos.length > 0 && (
        <section>
          <h2 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
            <ImageIcon className="h-4 w-4 text-[var(--pb-text-muted)]" />
            Photos ({photos.length})
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {photos.map(({ item, url }) => (
              <a
                key={item.id}
                href={url ?? "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative aspect-video rounded-xl overflow-hidden bg-[var(--pb-surface-elevated)] border border-[var(--pb-border-subtle)] hover:border-[var(--pb-orange)]/40 transition-colors"
              >
                {url ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={url}
                    alt={item.caption ?? item.fileName}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <ImageIcon className="h-8 w-8 text-[var(--pb-border)]" />
                  </div>
                )}
                {item.caption && (
                  <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent px-3 py-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="text-xs text-white truncate">{item.caption}</p>
                  </div>
                )}
              </a>
            ))}
          </div>
        </section>
      )}

      {videos.length > 0 && (
        <section>
          <h2 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
            <Video className="h-4 w-4 text-[var(--pb-text-muted)]" />
            Videos ({videos.length})
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {videos.map(({ item, url }) => (
              <div
                key={item.id}
                className="bg-[var(--pb-surface-elevated)] border border-[var(--pb-border-subtle)] rounded-xl p-4"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-[var(--pb-orange)]/10 flex items-center justify-center shrink-0">
                    <Video className="h-5 w-5 text-[var(--pb-orange)]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">
                      {item.caption ?? item.fileName}
                    </p>
                    <p className="text-xs text-[var(--pb-text-subtle)]">
                      {formatRelativeDate(item.createdAt)}
                    </p>
                  </div>
                  {url && (
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-[var(--pb-orange)] hover:underline shrink-0"
                    >
                      Watch
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
