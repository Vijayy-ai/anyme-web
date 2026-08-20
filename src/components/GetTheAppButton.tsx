"use client";

import { track } from "@/lib/analytics";
import { openAppOrStore } from "@/lib/deep-link";
import { useAppDownload } from "./AppDownloadProvider";

export function GetTheAppButton({
  className = "",
  size = "md",
  source = "button",
  seriesId,
  episodeId,
  /** When true, open app/store directly — no second bottom sheet. */
  direct = false,
}: {
  className?: string;
  size?: "sm" | "md";
  source?: string;
  seriesId?: string;
  episodeId?: string;
  direct?: boolean;
}) {
  const { open } = useAppDownload();
  const sizes =
    size === "sm"
      ? "h-9 px-3.5 text-xs"
      : "h-10 px-4 text-sm sm:h-11 sm:px-5";

  return (
    <button
      type="button"
      onClick={() => {
        track({
          type: "get_app_click",
          label: source,
          seriesId,
          episodeId,
        });
        if (direct) {
          openAppOrStore({ seriesId, episodeId });
          return;
        }
        open({ seriesId, episodeId });
      }}
      className={`inline-flex items-center justify-center rounded-lg border border-white/25 bg-transparent font-semibold tracking-wide text-white transition-colors hover:border-white/50 hover:bg-white/5 ${sizes} ${className}`}
    >
      GET THE APP
    </button>
  );
}
