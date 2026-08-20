"use client";

import { useEffect, useRef, useState, type MouseEvent } from "react";
import { useRouter } from "next/navigation";
import Hls from "hls.js";
import { useAppDownload } from "./AppDownloadProvider";
import { track } from "@/lib/analytics";

type VideoPlayerProps = {
  videoKey: string;
  poster?: string | null;
  title?: string;
  seriesId?: string;
  episodeId?: string;
  nextHref?: string | null;
  nextLockedEpisodeId?: string | null;
};

export function VideoPlayer({
  videoKey,
  poster,
  title,
  seriesId,
  episodeId,
  nextHref = null,
  nextLockedEpisodeId = null,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const trackedStartRef = useRef(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const { open } = useAppDownload();
  const router = useRouter();

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !videoKey) return;

    let hls: Hls | null = null;
    let cancelled = false;
    const src = `/api/playback?key=${encodeURIComponent(videoKey)}`;

    setLoading(true);
    setError(null);
    setProgress(0);
    setPlaying(false);
    setMuted(false);
    trackedStartRef.current = false;

    function clearLoading() {
      if (!cancelled) setLoading(false);
    }

    function fail(message: string) {
      if (!cancelled) {
        setError(message);
        setLoading(false);
      }
    }

    /** Prefer unmuted playback; fall back to muted only if browser blocks it. */
    async function startPlayback() {
      if (!video || cancelled) return;
      video.muted = false;
      try {
        await video.play();
        if (!cancelled) {
          setMuted(false);
          setPlaying(true);
        }
      } catch {
        // Autoplay-with-sound blocked — play muted, unmute on next gesture
        video.muted = true;
        if (!cancelled) setMuted(true);
        try {
          await video.play();
          if (!cancelled) setPlaying(true);
        } catch {
          clearLoading();
        }
      }
    }

    function attachNative(url: string) {
      if (!video) return;
      video.src = url;
      video.muted = false;
      video.addEventListener("loadeddata", clearLoading, { once: true });
      video.addEventListener("canplay", clearLoading, { once: true });
      video.addEventListener(
        "error",
        () => fail("Playback failed. Open this episode in the AnyMe app."),
        { once: true },
      );
      void startPlayback();
    }

    async function setup() {
      try {
        const probe = await fetch(src, {
          cache: "no-store",
          headers: { Accept: "*/*" },
        });
        const contentType = probe.headers.get("content-type") || "";

        if (!probe.ok) {
          const body = await probe.json().catch(() => ({}));
          if (
            (body as { error?: string }).error === "premium_content" ||
            (body as { app_required?: boolean }).app_required
          ) {
            fail("This episode is available only in the AnyMe app.");
            return;
          }
          throw new Error(
            (body as { message?: string }).message ||
              "Could not load this video.",
          );
        }

        if (contentType.includes("application/json")) {
          const body = (await probe.json()) as {
            type?: string;
            url?: string;
            message?: string;
          };
          if (body.type === "mp4" && body.url) {
            attachNative(body.url);
            return;
          }
          fail(
            body.message ||
              "Playback is unavailable in the browser. Open in the app.",
          );
          return;
        }

        if (cancelled || !video) return;

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          attachNative(src);
          return;
        }

        if (Hls.isSupported()) {
          hls = new Hls({ enableWorker: true, lowLatencyMode: false });
          hls.loadSource(src);
          hls.attachMedia(video);
          hls.on(Hls.Events.MANIFEST_PARSED, () => {
            clearLoading();
            void startPlayback();
          });
          hls.on(Hls.Events.ERROR, (_event, data) => {
            if (!data.fatal || cancelled) return;
            fail(
              "Stream error. Open this episode in the AnyMe app if it keeps failing.",
            );
            hls?.destroy();
          });
          return;
        }

        fail("HLS playback is not supported in this browser.");
      } catch (e) {
        fail(e instanceof Error ? e.message : "Could not load this video.");
      }
    }

    void setup();

    return () => {
      cancelled = true;
      hls?.destroy();
      if (video) {
        video.removeAttribute("src");
        video.load();
      }
    };
  }, [videoKey]);

  // If browser forced mute, unmute on first user gesture anywhere on the page
  useEffect(() => {
    if (!muted) return;
    const video = videoRef.current;
    if (!video) return;

    function unmuteOnGesture() {
      if (!video) return;
      video.muted = false;
      setMuted(false);
      void video.play().catch(() => undefined);
    }

    window.addEventListener("pointerdown", unmuteOnGesture, { once: true });
    window.addEventListener("keydown", unmuteOnGesture, { once: true });
    return () => {
      window.removeEventListener("pointerdown", unmuteOnGesture);
      window.removeEventListener("keydown", unmuteOnGesture);
    };
  }, [muted]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    function onTime() {
      if (!video || !video.duration) return;
      setProgress(video.currentTime / video.duration);
    }
    function onPlay() {
      setPlaying(true);
      if (!trackedStartRef.current) {
        trackedStartRef.current = true;
        track({
          type: "watch_start",
          seriesId,
          episodeId,
          label: title,
        });
      }
    }
    function onPause() {
      setPlaying(false);
    }
    function onEnded() {
      if (nextHref) {
        router.push(nextHref);
        return;
      }
      if (nextLockedEpisodeId) {
        open({ seriesId, episodeId: nextLockedEpisodeId });
      }
    }

    video.addEventListener("timeupdate", onTime);
    video.addEventListener("play", onPlay);
    video.addEventListener("pause", onPause);
    video.addEventListener("ended", onEnded);
    return () => {
      video.removeEventListener("timeupdate", onTime);
      video.removeEventListener("play", onPlay);
      video.removeEventListener("pause", onPause);
      video.removeEventListener("ended", onEnded);
    };
  }, [nextHref, nextLockedEpisodeId, videoKey, router, open, seriesId]);

  function togglePlay() {
    const video = videoRef.current;
    if (!video || error) return;
    if (video.paused) {
      video.muted = false;
      setMuted(false);
      void video.play();
    } else {
      video.pause();
    }
  }

  function unmute() {
    const video = videoRef.current;
    if (!video) return;
    video.muted = false;
    setMuted(false);
    void video.play();
  }

  function seek(e: MouseEvent<HTMLDivElement>) {
    const video = videoRef.current;
    if (!video || !video.duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
    video.currentTime = ratio * video.duration;
    setProgress(ratio);
  }

  return (
    <div className="relative h-full w-full overflow-hidden bg-black">
      <video
        ref={videoRef}
        className="h-full w-full bg-black object-cover"
        playsInline
        muted={muted}
        poster={poster || undefined}
        title={title}
        onClick={togglePlay}
      />

      {/* Tap anywhere to play/pause — no native browser controls */}
      <button
        type="button"
        aria-label={playing ? "Pause" : "Play"}
        onClick={togglePlay}
        className="absolute inset-0 z-[1]"
      />

      {muted && !loading && !error && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            unmute();
          }}
          className="absolute left-1/2 top-4 z-[3] flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-black/55 px-3 py-1.5 text-[11px] font-medium text-white backdrop-blur-sm"
        >
          <SpeakerIcon className="h-3.5 w-3.5" />
          Tap for sound
        </button>
      )}

      {!playing && !loading && !error && (
        <div className="pointer-events-none absolute inset-0 z-[2] flex items-center justify-center">
          <PlayIcon className="h-16 w-16 text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.45)] sm:h-20 sm:w-20" />
        </div>
      )}

      {/* Thin Mochi-style progress bar */}
      <div
        role="slider"
        aria-label="Seek"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(progress * 100)}
        tabIndex={0}
        onClick={(e) => {
          e.stopPropagation();
          seek(e);
        }}
        className="absolute inset-x-0 bottom-0 z-[3] h-3 cursor-pointer"
      >
        <div className="absolute inset-x-0 bottom-0 h-[3px] bg-white/25">
          <div
            className="h-full bg-white transition-[width] duration-100 ease-linear"
            style={{ width: `${progress * 100}%` }}
          />
        </div>
      </div>

      {loading && !error && (
        <div className="absolute inset-0 z-[2] flex items-center justify-center bg-black/45 text-sm text-white/80">
          Loading stream…
        </div>
      )}

      {error && (
        <div className="absolute inset-0 z-[4] flex flex-col items-center justify-center gap-4 bg-black/85 px-6 text-center">
          <p className="max-w-sm text-sm text-white/60">{error}</p>
          <button
            type="button"
            onClick={() => open({ seriesId, episodeId })}
            className="rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-black"
          >
            Open in App
          </button>
        </div>
      )}
    </div>
  );
}

function PlayIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}

function SpeakerIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden
    >
      <path d="M11 5L6 9H2v6h4l5 4V5z" />
      <path d="M15.5 8.5a5 5 0 0 1 0 7" />
    </svg>
  );
}
