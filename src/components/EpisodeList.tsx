"use client";

import Image from "next/image";
import Link from "next/link";
import { canPlayOnWeb } from "@/lib/content";
import type { Episode } from "@/lib/types";
import { useAppDownload } from "./AppDownloadProvider";

export function EpisodeList({
  seriesId,
  episodes,
}: {
  seriesId: string;
  episodes: Episode[];
}) {
  const { open } = useAppDownload();

  if (!episodes.length) {
    return (
      <p className="text-sm text-anyme-silver-mid">No episodes available yet.</p>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-4 sm:gap-3 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 2xl:grid-cols-8">
      {episodes.map((ep) => {
        const playable = canPlayOnWeb(ep);
        const thumb = ep.thumbnail_url || ep.series_thumbnail_url || null;

        const card = (
          <div className="relative aspect-[2/3] overflow-hidden rounded-lg bg-anyme-elevated">
            {thumb ? (
              <Image
                src={thumb}
                alt=""
                fill
                sizes="180px"
                className="object-cover transition duration-300 group-hover:scale-105"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-white/30">
                EP {ep.episode_number}
              </div>
            )}

            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

            {!playable && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                <span className="flex h-9 w-9 items-center justify-center rounded-full border border-white/25 bg-black/55">
                  <LockIcon className="h-4 w-4 text-white" />
                </span>
              </div>
            )}

            <span className="absolute left-1.5 top-1.5 rounded bg-black/70 px-1.5 py-0.5 text-[10px] font-bold text-white">
              EP {ep.episode_number}
            </span>
          </div>
        );

        if (playable) {
          return (
            <Link
              key={ep.id}
              href={`/watch/${seriesId}/${ep.id}`}
              className="group block"
            >
              {card}
            </Link>
          );
        }

        return (
          <button
            key={ep.id}
            type="button"
            onClick={() => open({ seriesId, episodeId: ep.id })}
            className="group block w-full text-left"
          >
            {card}
          </button>
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
      strokeWidth="2"
      aria-hidden
    >
      <rect x="5" y="11" width="14" height="10" rx="2" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
    </svg>
  );
}
