"use client";

import Image from "next/image";
import Link from "next/link";
import { canPlayOnWeb } from "@/lib/content";
import type { Episode } from "@/lib/types";
import { useAppDownload } from "./AppDownloadProvider";

export function WatchEpisodeGrid({
  seriesId,
  episodes,
  activeId,
  poster,
  fillHeight = false,
}: {
  seriesId: string;
  episodes: Episode[];
  activeId: string;
  poster?: string | null;
  fillHeight?: boolean;
}) {
  const { open } = useAppDownload();

  if (!episodes.length) {
    return (
      <p className="text-sm text-white/45">No episodes available yet.</p>
    );
  }

  return (
    <div
      className={
        fillHeight
          ? "grid grid-cols-5 gap-2 content-start"
          : "grid max-h-[min(58vh,520px)] grid-cols-5 gap-2 content-start overflow-y-auto overscroll-contain pr-1"
      }
    >
      {episodes.map((ep) => {
        const playable = canPlayOnWeb(ep);
        const active = ep.id === activeId;
        const thumb =
          ep.thumbnail_url || ep.series_thumbnail_url || poster || null;

        // Mochi watch grid: portrait tiles (~3:4), 5 across
        const inner = (
          <div
            className={`relative aspect-[3/4] overflow-hidden rounded-md bg-[#2a2a2a] ${
              active ? "ring-2 ring-white" : ""
            }`}
          >
            {thumb ? (
              <Image
                src={thumb}
                alt=""
                fill
                sizes="100px"
                className={`object-cover ${!playable ? "brightness-[0.45]" : ""}`}
              />
            ) : (
              <div className="flex h-full items-center justify-center text-[10px] text-white/35">
                EP {ep.episode_number}
              </div>
            )}

            {!playable && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/35">
                <LockIcon className="h-[18px] w-[18px] text-white" />
              </div>
            )}

            <span className="absolute left-1.5 top-1.5 text-[10px] font-bold leading-none text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
              EP {ep.episode_number}
            </span>
          </div>
        );

        if (!playable) {
          return (
            <button
              key={ep.id}
              type="button"
              onClick={() => open({ seriesId, episodeId: ep.id })}
              className="block w-full text-left"
            >
              {inner}
            </button>
          );
        }

        return (
          <Link
            key={ep.id}
            href={`/watch/${seriesId}/${ep.id}`}
            className="block"
          >
            {inner}
          </Link>
        );
      })}
    </div>
  );
}

function LockIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.25"
      aria-hidden
    >
      <rect x="5" y="11" width="14" height="10" rx="2" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
    </svg>
  );
}
