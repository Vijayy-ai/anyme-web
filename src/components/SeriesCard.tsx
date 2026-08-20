"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import Hls from "hls.js";
import { track } from "@/lib/analytics";
import { formatViews, seriesPoster, seriesViews } from "@/lib/content";
import type { SeriesCardData } from "@/lib/types";

type Props = {
  series: SeriesCardData;
  rank?: number;
};

export function SeriesCard({ series, rank }: Props) {
  const poster = seriesPoster(series);
  const views = seriesViews(series);
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [hovering, setHovering] = useState(false);
  const [previewReady, setPreviewReady] = useState(false);

  useEffect(() => {
    if (!hovering) {
      hlsRef.current?.destroy();
      hlsRef.current = null;
      const video = videoRef.current;
      if (video) {
        video.pause();
        video.removeAttribute("src");
        video.load();
      }
      setPreviewReady(false);
      return;
    }

    // Touch / coarse pointers: no hover preview
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(hover: none)").matches
    ) {
      return;
    }

    let cancelled = false;
    const video = videoRef.current;
    if (!video) return;

    const markReady = () => {
      if (!cancelled) setPreviewReady(true);
    };

    async function playMuted() {
      if (!video || cancelled) return;
      video.muted = true;
      video.playsInline = true;
      try {
        await video.play();
      } catch {
        // Keep poster until media actually plays
      }
    }

    function attachMp4(url: string) {
      if (!video || cancelled) return;
      video.src = url;
      video.addEventListener("loadeddata", markReady, { once: true });
      video.addEventListener("playing", markReady, { once: true });
      void playMuted();
    }

    function attachHls(url: string) {
      if (!video || cancelled) return;

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = url;
        video.addEventListener("loadeddata", markReady, { once: true });
        video.addEventListener("playing", markReady, { once: true });
        void playMuted();
        return;
      }

      if (!Hls.isSupported()) return;

      const hls = new Hls({
        enableWorker: true,
        maxBufferLength: 8,
        maxMaxBufferLength: 12,
      });
      hlsRef.current = hls;
      hls.loadSource(url);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        void playMuted();
      });
      hls.on(Hls.Events.ERROR, (_evt, data) => {
        if (!data.fatal) return;
        hls.destroy();
        if (hlsRef.current === hls) hlsRef.current = null;
      });
      video.addEventListener("loadeddata", markReady, { once: true });
      video.addEventListener("playing", markReady, { once: true });
    }

    async function startPreview() {
      try {
        const previewRes = await fetch(`/api/preview/${series.id}`, {
          cache: "force-cache",
        });
        if (!previewRes.ok || cancelled) return;

        const preview = (await previewRes.json()) as {
          playbackUrl?: string;
        };
        if (!preview.playbackUrl || cancelled) return;

        // Same resolution path as VideoPlayer:
        // MP4 keys return JSON { type: "mp4", url }; HLS returns m3u8 text.
        const playbackRes = await fetch(preview.playbackUrl, {
          cache: "no-store",
          headers: { Accept: "*/*" },
        });
        if (!playbackRes.ok || cancelled) return;

        const contentType = playbackRes.headers.get("content-type") || "";

        if (contentType.includes("application/json")) {
          const body = (await playbackRes.json()) as {
            type?: string;
            url?: string;
          };
          if (body.type === "mp4" && body.url) {
            attachMp4(body.url);
          }
          return;
        }

        attachHls(preview.playbackUrl);
      } catch {
        // Preview is best-effort — keep the poster
      }
    }

    const timer = window.setTimeout(() => {
      void startPreview();
    }, 220);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
      hlsRef.current?.destroy();
      hlsRef.current = null;
    };
  }, [hovering, series.id]);

  return (
    <Link
      href={`/series/${series.id}`}
      className="group relative block"
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      onFocus={() => setHovering(true)}
      onBlur={() => setHovering(false)}
      onClick={() =>
        track({
          type: "series_click",
          seriesId: series.id,
          seriesTitle: series.title,
          label: typeof rank === "number" ? `rank_${rank}` : "card",
        })
      }
    >
      {typeof rank === "number" && (
        <span
          className="pointer-events-none absolute -left-1 bottom-8 z-0 select-none text-7xl font-black leading-none text-white/[0.07] sm:text-8xl"
          aria-hidden
        >
          {rank}
        </span>
      )}

      <div className="relative z-10 aspect-[2/3] overflow-hidden rounded-lg bg-[#1a1a1a] ring-1 ring-white/10 transition duration-300 group-hover:ring-white/25 group-hover:shadow-[0_16px_40px_rgba(0,0,0,0.45)]">
        {poster ? (
          <Image
            src={poster}
            alt={series.title}
            fill
            sizes="(max-width: 640px) 40vw, (max-width: 1024px) 20vw, 180px"
            className={`object-cover transition-opacity duration-300 ${
              previewReady ? "opacity-0" : "opacity-100"
            }`}
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-[#222] text-xs text-white/30">
            No poster
          </div>
        )}

        <video
          ref={videoRef}
          muted
          playsInline
          loop
          preload="none"
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-300 ${
            previewReady ? "opacity-100" : "opacity-0"
          }`}
        />

        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/70 to-transparent" />

        {views > 0 && (
          <span className="absolute bottom-2 left-2 z-10 inline-flex items-center gap-1 rounded bg-black/55 px-1.5 py-0.5 text-[10px] font-medium text-white/90 backdrop-blur-sm">
            <PlayIcon className="h-2.5 w-2.5" />
            {formatViews(views)}
          </span>
        )}

        {previewReady && (
          <span className="absolute right-2 top-2 z-10 rounded bg-black/55 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-white/90 backdrop-blur-sm">
            Preview
          </span>
        )}
      </div>

      <h3 className="relative z-10 mt-2 line-clamp-2 text-xs font-medium leading-snug text-white/90 transition-colors group-hover:text-white sm:text-[13px]">
        {series.title}
      </h3>
    </Link>
  );
}

function PlayIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}
