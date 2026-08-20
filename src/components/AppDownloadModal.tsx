"use client";

import { useEffect } from "react";
import { track } from "@/lib/analytics";
import { openAppOrStore } from "@/lib/deep-link";
import { useAppDownload } from "./AppDownloadProvider";
import { AppStoreButtons } from "./AppStoreButtons";

export function AppDownloadModal() {
  const { isOpen, close, target } = useAppDownload();

  useEffect(() => {
    if (!isOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") close();
    }
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [isOpen, close]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center">
      <button
        type="button"
        aria-label="Close"
        className="absolute inset-0 bg-black/75 backdrop-blur-sm"
        onClick={close}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="app-download-title"
        className="relative z-10 w-full max-w-md animate-modal-in rounded-t-2xl border border-white/10 bg-[#141414] p-6 shadow-2xl sm:rounded-2xl sm:p-8"
      >
        <button
          type="button"
          onClick={close}
          className="absolute right-3 top-3 rounded-lg p-2 text-white/45 transition-colors hover:bg-white/5 hover:text-white/80"
          aria-label="Close dialog"
        >
          <CloseIcon className="h-5 w-5" />
        </button>

        <h2
          id="app-download-title"
          className="pr-8 text-2xl font-bold text-white"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Get the App
        </h2>
        <p className="mt-2 text-[15px] leading-snug text-white/55">
          To watch the full episode, get the AnyMe app.
        </p>

        <button
          type="button"
          onClick={() => {
            track({
              type: "get_app_click",
              label: "modal_open_in_app",
              seriesId: target.seriesId,
              episodeId: target.episodeId,
            });
            openAppOrStore(target);
          }}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-4 text-base font-semibold text-black transition-opacity hover:opacity-90"
        >
          Open in App
        </button>

        <div className="mt-5">
          <p className="mb-2.5 text-center text-xs text-white/40">
            Or get the app
          </p>
          <AppStoreButtons size="md" className="w-full" equal />
        </div>
      </div>
    </div>
  );
}

function CloseIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden
    >
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}
