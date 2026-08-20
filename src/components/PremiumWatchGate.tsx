"use client";

import { PremiumEpisodeGate } from "./PremiumEpisodeGate";

/** Desktop / embedded premium gate — same half Get the App panel as mobile. */
export function PremiumWatchGate({
  seriesId,
  episodeId,
  poster,
}: {
  seriesId: string;
  episodeId: string;
  poster?: string | null;
}) {
  return (
    <div className="h-full min-h-[420px] w-full overflow-hidden">
      <PremiumEpisodeGate
        seriesId={seriesId}
        episodeId={episodeId}
        poster={poster}
      />
    </div>
  );
}
