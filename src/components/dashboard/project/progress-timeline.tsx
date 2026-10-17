"use client";

import { useState, useEffect, useCallback } from "react";
import { ImageIcon, Video, X, ChevronLeft, ChevronRight } from "lucide-react";

export type TimelineItem = {
  id: string;
  url: string | null;
  mediaType: string;
  caption: string | null;
  fileName: string;
  milestoneLabel: string | null;
  date: string; // ISO
};

export type TimelineGroup = {
  key: string;
  label: string; // "March 2026"
  milestones: string[];
  items: TimelineItem[];
};

export function ProgressTimeline({ groups }: { groups: TimelineGroup[] }) {
  const flat = groups.flatMap((g) => g.items.filter((i) => i.url));
  const [lightboxId, setLightboxId] = useState<string | null>(null);

  const index = lightboxId ? flat.findIndex((i) => i.id === lightboxId) : -1;
  const current = index >= 0 ? flat[index] : null;

  const close = useCallback(() => setLightboxId(null), []);
  const prev = useCallback(() => {
    if (index > 0) setLightboxId(flat[index - 1].id);
  }, [index, flat]);
  const next = useCallback(() => {
    if (index >= 0 && index < flat.length - 1) setLightboxId(flat[index + 1].id);
  }, [index, flat]);

  useEffect(() => {
    if (!current) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [current, close, prev, next]);

  return (
    <>
      <div className="relative">
        {/* Spine */}
        <div
          className="absolute left-[7px] top-2 bottom-2 w-px bg-[var(--pb-border)]"
          aria-hidden="true"
        />

        <div className="space-y-10">
          {groups.map((group) => (
            <section key={group.key} className="relative pl-8">
              {/* Node */}
              <div
                className="absolute left-0 top-1.5 h-[15px] w-[15px] rounded-full bg-[var(--pb-green)] ring-4 ring-[var(--pb-bg)]"
                aria-hidden="true"
              />

              <header className="mb-4">
                <h2 className="text-base font-semibold text-white">
                  {group.label}
                </h2>
                <p className="text-xs text-[var(--pb-text-subtle)] mt-0.5">
                  {group.items.length}{" "}
                  {group.items.length === 1 ? "item" : "items"}
                  {group.milestones.length > 0 && (
                    <> · {group.milestones.join(" · ")}</>
                  )}
                </p>
              </header>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {group.items.map((item) => {
                  const isVideo = item.mediaType === "VIDEO";

                  if (isVideo) {
                    return (
                      <a
                        key={item.id}
                        href={item.url ?? "#"}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group relative aspect-video rounded-xl overflow-hidden bg-[var(--pb-surface-elevated)] border border-[var(--pb-border-subtle)] hover:border-[var(--pb-green)]/40 transition-colors flex flex-col items-center justify-center gap-2"
                      >
                        <Video className="h-7 w-7 text-[var(--pb-green)]" />
                        <span className="text-xs text-[var(--pb-text-muted)] px-2 text-center truncate max-w-full">
                          {item.caption ?? "Video"}
                        </span>
                      </a>
                    );
                  }

                  return (
                    <button
                      key={item.id}
                      onClick={() => item.url && setLightboxId(item.id)}
                      className="group relative aspect-video rounded-xl overflow-hidden bg-[var(--pb-surface-elevated)] border border-[var(--pb-border-subtle)] hover:border-[var(--pb-green)]/40 transition-colors text-left"
                    >
                      {item.url ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={item.url}
                          alt={item.caption ?? item.fileName}
                          loading="lazy"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <ImageIcon className="h-8 w-8 text-[var(--pb-border)]" />
                        </div>
                      )}
                      {item.caption && (
                        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent px-3 py-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <p className="text-xs text-white truncate">
                            {item.caption}
                          </p>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      {current?.url && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={close}
          role="dialog"
          aria-modal="true"
          aria-label={current.caption ?? "Site photo"}
        >
          <button
            onClick={close}
            className="absolute top-4 right-4 h-10 w-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>

          {index > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                prev();
              }}
              className="absolute left-4 h-10 w-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
              aria-label="Previous"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
          )}

          {index < flat.length - 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                next();
              }}
              className="absolute right-4 h-10 w-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
              aria-label="Next"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          )}

          <figure
            className="max-w-5xl max-h-full flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={current.url}
              alt={current.caption ?? current.fileName}
              className="max-h-[80vh] w-auto rounded-lg object-contain"
            />
            <figcaption className="mt-3 text-center">
              {current.caption && (
                <p className="text-sm text-white">{current.caption}</p>
              )}
              <p className="text-xs text-white/50 mt-0.5">
                {new Date(current.date).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
                {current.milestoneLabel && <> · {current.milestoneLabel}</>}
                {" · "}
                {index + 1} of {flat.length}
              </p>
            </figcaption>
          </figure>
        </div>
      )}
    </>
  );
}
