export const dynamic = "force-dynamic";

import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { getProjectForUser, getProjectMedia } from "@/lib/services/projects";
import { db } from "@/lib/db";
import { milestones } from "@/db/schema";
import { eq } from "drizzle-orm";
import { ImageIcon } from "lucide-react";
import { getPresignedDownloadUrl } from "@/lib/r2";
import {
  ProgressTimeline,
  type TimelineGroup,
  type TimelineItem,
} from "@/components/dashboard/project/progress-timeline";

export default async function MediaPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  const { projectId } = await params;
  const [project, mediaItems, projectMilestones] = await Promise.all([
    getProjectForUser(projectId, session),
    getProjectMedia(projectId, true),
    db
      .select({
        id: milestones.id,
        title: milestones.title,
        clientVisibleTitle: milestones.clientVisibleTitle,
      })
      .from(milestones)
      .where(eq(milestones.projectId, projectId)),
  ]);
  if (!project) notFound();

  if (mediaItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <ImageIcon className="h-10 w-10 text-[var(--pb-border)] mb-4" />
        <h3 className="text-base font-semibold text-white mb-1">
          No photos yet
        </h3>
        <p className="text-sm text-[var(--pb-text-muted)] max-w-sm">
          As work progresses on site, your team will post photos here and you&apos;ll
          be able to follow the build week by week.
        </p>
      </div>
    );
  }

  const milestoneLabel = new Map(
    projectMilestones.map((m) => [m.id, m.clientVisibleTitle ?? m.title])
  );

  const withUrls = await Promise.all(
    mediaItems.map(async (item) => {
      let url: string | null = null;
      try {
        url = await getPresignedDownloadUrl(item.storageKey);
      } catch {
        // A missing object shouldn't blank the whole timeline
      }
      return { item, url };
    })
  );

  // Newest first, using capture date where the team supplied one
  const sorted = withUrls
    .map(({ item, url }) => ({
      item,
      url,
      date: item.takenAt ?? item.createdAt,
    }))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Group into calendar months
  const groupMap = new Map<string, TimelineGroup>();

  for (const { item, url, date } of sorted) {
    const d = new Date(date);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const label = d.toLocaleDateString("en-GB", {
      month: "long",
      year: "numeric",
    });

    const mLabel = item.milestoneId
      ? milestoneLabel.get(item.milestoneId) ?? null
      : null;

    const entry: TimelineItem = {
      id: item.id,
      url,
      mediaType: item.mediaType,
      caption: item.caption,
      fileName: item.fileName,
      milestoneLabel: mLabel,
      date: new Date(date).toISOString(),
    };

    const group = groupMap.get(key) ?? {
      key,
      label,
      milestones: [],
      items: [],
    };
    group.items.push(entry);
    if (mLabel && !group.milestones.includes(mLabel)) {
      group.milestones.push(mLabel);
    }
    groupMap.set(key, group);
  }

  const groups = [...groupMap.values()];
  const photoCount = sorted.filter(
    ({ item }) => item.mediaType !== "VIDEO"
  ).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-semibold text-white">Progress Timeline</h1>
        <p className="text-sm text-[var(--pb-text-muted)] mt-0.5">
          {photoCount} photo{photoCount === 1 ? "" : "s"} from site, newest first
        </p>
      </div>

      <ProgressTimeline groups={groups} />
    </div>
  );
}
