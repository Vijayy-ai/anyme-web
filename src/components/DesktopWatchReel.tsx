"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { canPlayOnWeb } from "@/lib/content";
import type { ReelEpisode } from "./MobileWatchReel";
import { PremiumEpisodeGate } from "./PremiumEpisodeGate";
import { VideoPlayer } from "./VideoPlayer";

/**
 * Desktop player column: vertical snap-scroll through episodes
 * (same reel feel as phone, inside the 9:16 frame).
 */
export function DesktopWatchReel({
  seriesId,
  poster,
  episodes,
  initialEpisodeId,
}: {
  seriesId: string;
  poster?: string | null;
  episodes: ReelEpisode[];
  initialEpisodeId: string;
}) {
  const router = useRouter();
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [activeId, setActiveId] = useState(initialEpisodeId);
  const lockRef = useRef(false);

  useEffect(() => {
    const root = scrollerRef.current;
    if (!root) return;
    const el = root.querySelector<HTMLElement>(
      `[data-episode-id="${initialEpisodeId}"]`,
    );
    if (el) el.scrollIntoView({ block: "start" });
    setActiveId(initialEpisodeId);
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
      { root, threshold: [0.6, 0.75, 0.9] },
    );

    nodes.forEach((n) => observer.observe(n));
    return () => observer.disconnect();
  }, [episodes, seriesId]);

  useEffect(() => {
    const path = `/watch/${seriesId}/${activeId}`;
    if (window.location.pathname === path) return;
    router.replace(path, { scroll: false });
  }, [activeId, router, seriesId]);

  // Wheel / trackpad: snap one episode at a time
  useEffect(() => {
    const root = scrollerRef.current;
    if (!root) return;

    function onWheel(e: WheelEvent) {
      if (!root || Math.abs(e.deltaY) < 8) return;
      e.preventDefault();
      if (lockRef.current) return;
      lockRef.current = true;

      const idx = episodes.findIndex((ep) => ep.id === activeId);
      const nextIdx =
        e.deltaY > 0
          ? Math.min(episodes.length - 1, idx + 1)
          : Math.max(0, idx - 1);
      const target = episodes[nextIdx];
      if (target && target.id !== activeId) {
        const el = root.querySelector<HTMLElement>(
          `[data-episode-id="${target.id}"]`,
        );
        el?.scrollIntoView({ behavior: "smooth", block: "start" });
        setActiveId(target.id);
      }

      window.setTimeout(() => {
        lockRef.current = false;
      }, 520);
    }

    root.addEventListener("wheel", onWheel, { passive: false });
    return () => root.removeEventListener("wheel", onWheel);
  }, [activeId, episodes, seriesId]);

  return (
    <div
      ref={scrollerRef}
      className="scrollbar-none h-full w-full snap-y snap-mandatory overflow-y-auto overscroll-contain"
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
        const nextLockedEpisodeId = next && !nextPlayable ? next.id : null;

        return (
          <section
            key={ep.id}
            data-episode-id={ep.id}
            className="relative h-full w-full shrink-0 snap-start snap-always"
          >
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
          </section>
        );
      })}
    </div>
  );
}
