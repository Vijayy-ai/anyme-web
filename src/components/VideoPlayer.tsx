"use client";

import { useEffect, useRef, useState, type MouseEvent } from "react";
import { useRouter } from "next/navigation";
import Hls from "hls.js";
import { resolvePlayback } from "@/lib/playback-client";
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

function lowestLevelIndex(
  levels: Array<{ bitrate?: number; height?: number; width?: number }>,
) {
  if (!levels.length) return 0;
  let best = 0;
  let score = Number.POSITIVE_INFINITY;
  levels.forEach((level, i) => {
    const s =
      (level.bitrate && level.bitrate > 0 ? level.bitrate : 0) ||
      (level.height || 0) * 1000 ||
      (level.width || 0);
    if (s < score) {
      score = s;
      best = i;
    }
  });
  return best;
}

const SOUND_PREF_KEY = "anyme-wants-sound";

function readWantsSound() {
  try {
    return sessionStorage.getItem(SOUND_PREF_KEY) === "1";
  } catch {
    return false;
  }
}

function writeWantsSound() {
  try {
    sessionStorage.setItem(SOUND_PREF_KEY, "1");
  } catch {
    /* ignore */
  }
}

function applyUnmuted(video: HTMLVideoElement) {
  video.muted = false;
  video.volume = 1;
  writeWantsSound();
}

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
  const unlockTapRef = useRef(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(() => !readWantsSound());
  const [progress, setProgress] = useState(0);
  const { open } = useAppDownload();
  const router = useRouter();

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !videoKey) return;

    let hls: Hls | null = null;
    let cancelled = false;
    let abrReleaseTimer: number | undefined;
    const preferSound = readWantsSound();

    setLoading(true);
    setError(null);
    setProgress(0);
    setPlaying(false);
    setMuted(!preferSound);
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

    async function startPlayback() {
      if (!video || cancelled) return;
      video.volume = 1;

      // If user already unlocked sound this session, try unmuted play first.
      if (preferSound) {
        video.muted = false;
        if (!cancelled) setMuted(false);
        try {
          await video.play();
          if (!cancelled) {
            setPlaying(true);
            clearLoading();
          }
          return;
        } catch {
          /* browser blocked — fall back to muted */
        }
      }

      video.muted = true;
      if (!cancelled) setMuted(true);
      try {
        await video.play();
        if (cancelled) return;
        setPlaying(true);
        clearLoading();
        if (preferSound) {
          applyUnmuted(video);
          setMuted(!video.muted ? false : true);
        }
      } catch {
        clearLoading();
      }
    }

    function attachNative(url: string) {
      if (!video) return;
      video.src = url;
      video.muted = !preferSound;
      video.volume = 1;
      video.addEventListener("loadeddata", clearLoading, { once: true });
      video.addEventListener("canplay", clearLoading, { once: true });
      video.addEventListener(
        "error",
        () => fail("Playback failed. Open this episode in the AnyMe app."),
        { once: true },
      );
      void startPlayback();
    }

    function attachHls(url: string) {
      if (!video) return;

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        attachNative(url);
        return;
      }

      if (!Hls.isSupported()) {
        fail("HLS playback is not supported in this browser.");
        return;
      }

      hls = new Hls({
        enableWorker: true,
        lowLatencyMode: false,
        autoStartLoad: false,
        startLevel: 0,
        abrEwmaDefaultEstimate: 200_000,
        maxBufferLength: 6,
        maxMaxBufferLength: 14,
        maxBufferSize: 8 * 1000 * 1000,
        maxBufferHole: 0.5,
        startFragPrefetch: true,
        testBandwidth: false,
        progressive: true,
      });
      hls.loadSource(url);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, (_evt, data) => {
        const lowest = lowestLevelIndex(data.levels || []);
        hls!.startLevel = lowest;
        hls!.loadLevel = lowest;
        hls!.nextLoadLevel = lowest;
        hls!.currentLevel = lowest;
        hls!.autoLevelCapping = Math.min(
          lowest + 1,
          Math.max(0, (data.levels?.length || 1) - 1),
        );
        hls!.startLoad(0);
        void startPlayback();
        abrReleaseTimer = window.setTimeout(() => {
          if (cancelled || !hls) return;
          hls.autoLevelCapping = -1;
        }, 8_000);
      });
      hls.on(Hls.Events.FRAG_BUFFERED, clearLoading);
      hls.on(Hls.Events.ERROR, (_event, data) => {
        if (!data.fatal || cancelled) return;
        fail(
          "Stream error. Open this episode in the AnyMe app if it keeps failing.",
        );
        hls?.destroy();
      });
    }

    async function setup() {
      try {
        const body = await resolvePlayback(videoKey);
        if (cancelled) return;
        if (body.type === "mp4") {
          attachNative(body.url);
          return;
        }
        attachHls(body.url);
      } catch (e) {
        const err = e as Error & { appRequired?: boolean };
        if (err.appRequired) {
          fail("This episode is available only in the AnyMe app.");
          return;
        }
        fail(err.message || "Could not load this video.");
      }
    }

    void setup();

    return () => {
      cancelled = true;
      if (abrReleaseTimer) window.clearTimeout(abrReleaseTimer);
      hls?.destroy();
      if (video) {
        video.removeAttribute("src");
        video.load();
      }
    };
  }, [videoKey]);

  useEffect(() => {
    if (!muted) return;
    const video = videoRef.current;
    if (!video) return;

    function unmuteOnGesture() {
      if (!video) return;
      unlockTapRef.current = true;
      applyUnmuted(video);
      setMuted(false);
      void video.play().catch(() => undefined);
    }

    // Capture so scroll/overlay taps still unlock sound on mobile
    window.addEventListener("pointerdown", unmuteOnGesture, {
      once: true,
      capture: true,
    });
    window.addEventListener("touchstart", unmuteOnGesture, {
      once: true,
      capture: true,
      passive: true,
    });
    window.addEventListener("keydown", unmuteOnGesture, { once: true });
    return () => {
      window.removeEventListener("pointerdown", unmuteOnGesture, true);
      window.removeEventListener("touchstart", unmuteOnGesture, true);
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
  }, [
    nextHref,
    nextLockedEpisodeId,
    videoKey,
    router,
    open,
    seriesId,
    episodeId,
    title,
  ]);

  function togglePlay() {
    const video = videoRef.current;
    if (!video || error) return;
    if (unlockTapRef.current) {
      unlockTapRef.current = false;
      return;
    }
    if (muted) {
      applyUnmuted(video);
      setMuted(false);
      if (video.paused) void video.play().catch(() => undefined);
      return;
    }
    if (video.paused) void video.play().catch(() => undefined);
    else video.pause();
  }

  function unmute() {
    const video = videoRef.current;
    if (!video) return;
    applyUnmuted(video);
    setMuted(false);
    void video.play().catch(() => undefined);
  }

  function unlockSound() {
    unlockTapRef.current = true;
    unmute();
  }

  function seek(e: MouseEvent<HTMLDivElement>) {
    const video = videoRef.current;
    if (!video || !video.duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = Math.min(
      1,
      Math.max(0, (e.clientX - rect.left) / rect.width),
    );
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
        preload="auto"
        poster={poster || undefined}
        title={title}
      />
      <button
        type="button"
        aria-label={muted ? "Unmute" : playing ? "Pause" : "Play"}
        onPointerDown={() => {
          if (muted) unlockSound();
        }}
        onClick={togglePlay}
        className="absolute inset-0 z-[1]"
      />

      {muted && !loading && !error && (
        <button
          type="button"
          onPointerDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
            unlockSound();
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
        <div className="absolute inset-0 z-[2] flex items-center justify-center bg-black/35 text-sm text-white/80">
          Loading…
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
