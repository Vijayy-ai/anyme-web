import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { GetTheAppButton } from "@/components/GetTheAppButton";
import { DesktopOnly, MobileOnly } from "@/components/Breakpoint";
import { DesktopWatchReel } from "@/components/DesktopWatchReel";
import { MobileWatchReel } from "@/components/MobileWatchReel";
import { SetNowPlaying } from "@/components/NowPlayingPill";
import { WatchEpisodeGrid } from "@/components/WatchEpisodeGrid";
import { WatchSideActions } from "@/components/WatchSideActions";
import {
  getSeriesDetails,
  getSeriesEpisodes,
  seriesPoster,
} from "@/lib/content";

export const revalidate = 60;

type PageProps = {
  params: Promise<{ seriesId: string; episodeId: string }>;
};

export async function generateMetadata({ params }: PageProps) {
  const { seriesId, episodeId } = await params;
  try {
    const [{ episodes }, series] = await Promise.all([
      getSeriesEpisodes(seriesId, 1, 50),
      getSeriesDetails(seriesId),
    ]);
    const episode = episodes.find((e) => e.id === episodeId);
    return {
      title: episode
        ? `${series.title} EP ${episode.episode_number} | AnyMe`
        : `Watch | AnyMe`,
    };
  } catch {
    return { title: "Watch | AnyMe" };
  }
}

export default async function WatchPage({ params }: PageProps) {
  const { seriesId, episodeId } = await params;

  let series;
  let episodes;
  try {
    [series, { episodes }] = await Promise.all([
      getSeriesDetails(seriesId),
      getSeriesEpisodes(seriesId, 1, 50),
    ]);
  } catch {
    notFound();
  }

  const episode = episodes.find((e) => e.id === episodeId);
  if (!episode) notFound();

  const poster = seriesPoster(series);
  const prev = episodes.find(
    (e) => e.episode_number === episode.episode_number - 1,
  );
  const next = episodes.find(
    (e) => e.episode_number === episode.episode_number + 1,
  );
  const prevEp = prev ?? null;
  const nextEp = next ?? null;
  const reelEpisodes = episodes.map((ep) => ({
    id: ep.id,
    title: ep.title,
    description: ep.description,
    episode_number: ep.episode_number,
    thumbnail_url: ep.thumbnail_url,
    series_thumbnail_url: ep.series_thumbnail_url,
    video_url: ep.video_url,
    is_premium: ep.is_premium,
  }));
  const epCount =
    typeof series.episodes_count === "number"
      ? series.episodes_count
      : episodes.length;
  const metaLine = epCount > 0 ? `${epCount} episodes` : "";

  return (
    <div className="relative bg-[#0e1012] lg:h-[calc(100vh-4rem)] lg:overflow-hidden">
      <div className="pointer-events-none absolute inset-0 page-grid opacity-40" />

      <SetNowPlaying
        seriesId={seriesId}
        episodeId={episodeId}
        title={series.title}
        episodeNumber={episode.episode_number}
        poster={poster}
      />

      <MobileOnly>
        <MobileWatchReel
          seriesId={seriesId}
          seriesTitle={series.title}
          seriesDescription={series.description}
          poster={poster}
          initialEpisodeId={episodeId}
          episodes={reelEpisodes}
        />
      </MobileOnly>

      {/* Mochi stage: player + rail + dual plates, full height under header */}
      <DesktopOnly>
      <div className="relative flex min-h-[70vh] w-full items-stretch px-3 py-3 sm:px-4 lg:h-full lg:min-h-0 lg:px-4 lg:py-4">
        <div className="mx-auto flex w-full max-w-[1600px] items-center gap-4 lg:h-full lg:min-h-0 lg:gap-6">
          {/* Back */}
          <Link
            href={`/series/${seriesId}`}
            aria-label="Back to series"
            className="mt-1 hidden h-10 w-10 shrink-0 items-center justify-center self-start rounded-md bg-[#2a2a2a] text-xl leading-none text-white transition hover:bg-[#333] lg:flex"
          >
            ‹
          </Link>

          {/* Player column + action rail */}
          <div className="flex h-full min-h-0 min-w-0 flex-1 items-center justify-center gap-4 lg:gap-5">
            <div className="mx-auto flex h-full min-h-0 w-fit max-w-full flex-col lg:mx-0">
              <div className="relative h-full max-h-full aspect-[9/16] max-w-[min(100%,440px)] overflow-hidden rounded-md bg-black shadow-[0_24px_80px_rgba(0,0,0,0.55)] lg:max-w-none">
                <DesktopWatchReel
                  seriesId={seriesId}
                  poster={poster}
                  initialEpisodeId={episodeId}
                  episodes={reelEpisodes}
                />
              </div>

              <div className="mt-3 flex items-center justify-between gap-3 lg:hidden">
                <Link
                  href={`/series/${seriesId}`}
                  className="text-xs text-white/50 transition hover:text-white"
                >
                  ← All episodes
                </Link>
                <GetTheAppButton size="sm" />
              </div>
            </div>

            {/* Action rail — Mochi style */}
            <div className="hidden w-12 shrink-0 flex-col items-center gap-5 self-center lg:flex">
              <Link
                href={`/series/${seriesId}`}
                className="relative h-11 w-11 overflow-hidden rounded-full bg-white/10 ring-1 ring-white/20"
                aria-label="Series"
              >
                {poster && (
                  <Image
                    src={poster}
                    alt=""
                    fill
                    sizes="44px"
                    className="object-cover"
                  />
                )}
              </Link>

              <div className="flex flex-col items-center gap-2">
                {prevEp ? (
                  <Link
                    href={`/watch/${seriesId}/${prevEp.id}`}
                    aria-label="Previous episode"
                    className="flex h-10 w-10 items-center justify-center rounded-md text-white/80 transition hover:bg-white/10 hover:text-white"
                  >
                    <ChevronUpIcon className="h-5 w-5" />
                  </Link>
                ) : (
                  <span className="flex h-10 w-10 items-center justify-center text-white/20">
                    <ChevronUpIcon className="h-5 w-5" />
                  </span>
                )}
                {nextEp ? (
                  <Link
                    href={`/watch/${seriesId}/${nextEp.id}`}
                    aria-label="Next episode"
                    className="flex h-10 w-10 items-center justify-center rounded-md text-white/80 transition hover:bg-white/10 hover:text-white"
                  >
                    <ChevronDownIcon className="h-5 w-5" />
                  </Link>
                ) : (
                  <span className="flex h-10 w-10 items-center justify-center text-white/20">
                    <ChevronDownIcon className="h-5 w-5" />
                  </span>
                )}
              </div>

              <WatchSideActions seriesId={seriesId} episodeId={episodeId} />
            </div>
          </div>

          {/* Right dock: two separate plates (info + episodes) */}
          <aside className="hidden h-full min-h-0 w-[420px] shrink-0 flex-col gap-4 xl:w-[470px] lg:flex">
            <section className="shrink-0 rounded-md bg-[#191c1e] p-4">
              <span className="mb-2.5 inline-flex items-center rounded bg-white px-1.5 py-[3px] text-[8.5px] font-bold uppercase tracking-[0.15em] text-black">
                AnyMe Original
              </span>

              <div className="flex items-start gap-3">
                <Link
                  href={`/series/${seriesId}`}
                  className="relative h-[75px] w-[56px] shrink-0 overflow-hidden rounded-md border border-white/10 bg-[#2a2a2a]"
                >
                  {poster && (
                    <Image
                      src={poster}
                      alt=""
                      fill
                      sizes="56px"
                      className="object-cover"
                    />
                  )}
                </Link>
                <div className="min-w-0 flex-1 pt-0.5">
                  <h1
                    className="text-[22px] font-bold uppercase leading-none tracking-wide text-white"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    {series.title}
                  </h1>
                  {metaLine && (
                    <p className="mt-1.5 text-[12px] text-white/50">
                      {metaLine}
                    </p>
                  )}
                </div>
              </div>

              {(episode.description || series.description) && (
                <p className="mt-3 line-clamp-3 text-[13px] leading-relaxed text-white/55">
                  {episode.description || series.description}
                </p>
              )}
            </section>

            <section className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-md bg-[#191c1e]">
              <div className="flex shrink-0 items-center justify-between gap-2 px-4 pb-2 pt-4">
                <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-white">
                  Episodes
                </p>
                <p className="text-[11px] text-white/45">
                  EP {episode.episode_number}
                  {epCount > 0 ? ` / ${epCount}` : ""}
                </p>
              </div>
              <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-4">
                <WatchEpisodeGrid
                  seriesId={seriesId}
                  episodes={episodes}
                  activeId={episodeId}
                  poster={poster}
                  fillHeight
                />
              </div>
            </section>
          </aside>
        </div>
      </div>
      </DesktopOnly>

      {/* Mobile episodes */}
      <div className="relative z-10 hidden w-full bg-[#0e1012] px-3 pb-8 pt-2">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-white/55">
            Episodes
          </p>
          <p className="text-[11px] text-white/40">
            EP {episode.episode_number}
            {epCount > 0 ? ` / ${epCount}` : ""}
          </p>
        </div>
        <WatchEpisodeGrid
          seriesId={seriesId}
          episodes={episodes}
          activeId={episodeId}
          poster={poster}
        />
      </div>
    </div>
  );
}

function ChevronUpIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.25"
      aria-hidden
    >
      <path d="M6 15l6-6 6 6" />
    </svg>
  );
}

function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.25"
      aria-hidden
    >
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}
