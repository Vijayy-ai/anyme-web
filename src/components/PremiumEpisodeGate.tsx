"use client";

import { AppStoreButtons } from "./AppStoreButtons";
import { GetTheAppButton } from "./GetTheAppButton";

/**
 * Premium / locked episode gate — one centered card with
 * Get the App + Play Store / App Store (phone + player).
 */
export function PremiumEpisodeGate({
  seriesId,
  episodeId,
  poster,
}: {
  seriesId: string;
  episodeId: string;
  poster?: string | null;
}) {
  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden bg-black px-4">
      {poster ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={poster}
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-30"
        />
      ) : (
        <div className="absolute inset-0 bg-[#121212]" />
      )}
      <div className="absolute inset-0 bg-black/55" />

      <div className="relative z-10 w-full max-w-[320px] rounded-2xl border border-white/10 bg-[#161616]/96 px-5 py-6 text-center shadow-[0_24px_60px_rgba(0,0,0,0.55)] backdrop-blur-md">
        <span className="inline-flex rounded-full border border-white/15 bg-white/5 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/55">
          App only
        </span>
        <h3
          className="mt-3 text-lg font-bold text-white"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Watch in the AnyMe app
        </h3>
        <p className="mt-1.5 text-[13px] leading-snug text-white/50">
          This episode is locked on web.
        </p>

        <GetTheAppButton
          source="premium_center_card"
          seriesId={seriesId}
          episodeId={episodeId}
          direct
          className="mt-4 w-full !border-transparent !bg-white !text-black hover:!bg-white/90"
        />

        <div className="mt-4 border-t border-white/10 pt-4">
          <AppStoreButtons size="sm" equal className="w-full" />
        </div>
      </div>
    </div>
  );
}
