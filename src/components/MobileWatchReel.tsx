"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { canPlayOnWeb } from "@/lib/content";
import type { Episode } from "@/lib/types";
import { ExpandableText } from "./ExpandableText";

import { GetTheAppButton } from "./GetTheAppButton";
import { PremiumEpisodeGate } from "./PremiumEpisodeGate";
import { VideoPlayer } from "./VideoPlayer";

export type ReelEpisode = Pick<
  Episode,
  | "id"
  | "title"
  | "description"
  | "episode_number"
  | "thumbnail_url"
  | "series_thumbnail_url"
  | "video_url"
  | "is_premium"
>;

export function MobileWatchReel({
  seriesId,
  seriesTitle,
  seriesDescription,
  poster,
  episodes,
  initialEpisodeId,
}: {
  seriesId: string;
  seriesTitle: string;
  seriesDescription?: string | null;
  poster?: string | null;
  episodes: ReelEpisode[];
  initialEpisodeId: string;
}) {
  const router = useRouter();
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [activeId, setActiveId] = useState(initialEpisodeId);

  useEffect(() => {
    const root = scrollerRef.current;
    if (!root) return;
    const el = root.querySelector<HTMLElement>(
      `[data-episode-id="${initialEpisodeId}"]`,
    );
    if (el) el.scrollIntoView({ block: "start" });
  }, [initialEpisodeId]);

  useEffect(() => {
    const root = scrollerRef.current;
    if (!root) return;

    const nodes = Array.from(
      root.querySelectorAll<HTMLElement>("[data-episode-id]"),
    );
    if (!nodes.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (!visible) return;
        const id = (visible.target as HTMLElement).dataset.episodeId;
        if (!id) return;
        setActiveId((prev) => {
          if (prev === id) return prev;
          return id;
        });
      },
      { root, threshold: [0.55, 0.7, 0.85] },
    );

    nodes.forEach((n) => observer.observe(n));
    return () => observer.disconnect();
  }, [episodes, seriesId]);

  useEffect(() => {
    const path = `/watch/${seriesId}/${activeId}`;
    if (window.location.pathname === path) return;
    router.replace(path, { scroll: false });
  }, [activeId, router, seriesId]);

  return (
    <div className="lg:hidden">
      <div
        ref={scrollerRef}
        className="scrollbar-none h-[calc(100dvh-4rem)] snap-y snap-mandatory overflow-y-auto overscroll-y-contain bg-black"
      >
        {episodes.map((ep, index) => {
          const playable = canPlayOnWeb(ep);
          const isActive = ep.id === activeId;
          const thumb =
            ep.thumbnail_url || ep.series_thumbnail_url || poster || null;
          const next = episodes[index + 1];
          const nextPlayable = next && canPlayOnWeb(next) ? next : null;
          const nextHref = nextPlayable
            ? `/watch/${seriesId}/${nextPlayable.id}`
            : null;
          const nextLockedEpisodeId =
            next && !nextPlayable ? next.id : null;
          const blurb = ep.description || seriesDescription || "";

          return (
            <section
              key={ep.id}
              data-episode-id={ep.id}
              className="relative flex h-[calc(100dvh-4rem)] w-full snap-start snap-always flex-col"
            >
              <div className="relative min-h-0 flex-1 overflow-hidden bg-black">
                {playable && ep.video_url && isActive ? (
                  <VideoPlayer
                    videoKey={ep.video_url}
                    poster={thumb}
                    title={ep.title}
                    seriesId={seriesId}
                    episodeId={ep.id}
                    nextHref={nextHref}
                    nextLockedEpisodeId={nextLockedEpisodeId}
                  />
                ) : playable && ep.video_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={thumb || undefined}
                    alt=""
                    className="h-full w-full object-cover opacity-80"
                  />
                ) : (
                  <PremiumEpisodeGate
                    seriesId={seriesId}
                    episodeId={ep.id}
                    poster={thumb}
                  />
                )}

                {/* Free eps only — premium shows the centered Get the App card alone */}
                {playable ? (
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-black/90 via-black/45 to-transparent px-3 pb-4 pt-16">
                    <div className="pointer-events-auto flex items-end justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/55">
                          EP {ep.episode_number}
                        </p>
                        <p className="mt-0.5 truncate text-sm font-semibold text-white">
                          {seriesTitle}
                        </p>
                        {blurb ? (
                          <ExpandableText
                            text={blurb}
                            className="mt-1.5 max-w-[85%]"
                            lines={2}
                          />
                        ) : null}
                        <Link
                          href={`/series/${seriesId}`}
                          className="mt-2 inline-block text-[11px] text-white/50 hover:text-white"
                        >
                          ← All episodes
                        </Link>
                      </div>
                      <GetTheAppButton
                        size="sm"
                        source="mobile_reel"
                        seriesId={seriesId}
                        episodeId={ep.id}
                        className="shrink-0"
                      />
                    </div>
                  </div>
                ) : null}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
