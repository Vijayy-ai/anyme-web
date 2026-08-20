import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { EpisodeList } from "@/components/EpisodeList";
import { ExpandableText } from "@/components/ExpandableText";
import { GetTheAppButton } from "@/components/GetTheAppButton";
import { SetNowPlaying } from "@/components/NowPlayingPill";
import {
  canPlayOnWeb,
  formatViews,
  getSeriesDetails,
  getSeriesEpisodes,
  seriesHeroImage,
  seriesPoster,
  seriesViews,
} from "@/lib/content";

export const revalidate = 60;

type PageProps = {
  params: Promise<{ seriesId: string }>;
};

export async function generateMetadata({ params }: PageProps) {
  const { seriesId } = await params;
  try {
    const series = await getSeriesDetails(seriesId);
    return {
      title: `${series.title} | AnyMe`,
      description: series.description?.slice(0, 160) || undefined,
    };
  } catch {
    return { title: "Series | AnyMe" };
  }
}

export default async function SeriesPage({ params }: PageProps) {
  const { seriesId } = await params;

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

  const poster = seriesPoster(series);
  const hero = seriesHeroImage(series);
  const bgImage = poster || hero;
  const firstFree = episodes.find(canPlayOnWeb);
  const views = seriesViews(series);
  const epCount =
    typeof series.episodes_count === "number"
      ? series.episodes_count
      : episodes.length;

  return (
    <div className="relative min-h-[calc(100vh-4rem)] bg-[#0e1012] pb-16">
      <div className="pointer-events-none absolute inset-0 page-grid opacity-40" />

      {firstFree && (
        <SetNowPlaying
          seriesId={seriesId}
          episodeId={firstFree.id}
          title={series.title}
          episodeNumber={firstFree.episode_number}
          poster={poster}
        />
      )}

      <div className="relative w-full px-3 sm:px-4 lg:px-5">
        {/* Hero — Mochi-style blurred artwork plate */}
        <div className="relative overflow-hidden rounded-md bg-[#15171a] ring-1 ring-white/[0.06]">
          {bgImage && (
            <Image
              src={bgImage}
              alt=""
              fill
              priority
              sizes="100vw"
              aria-hidden
              className="scale-125 object-cover opacity-40 blur-2xl"
            />
          )}
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to bottom, rgba(14,16,18,0.2), rgba(14,16,18,0.88) 85%)",
            }}
          />
          <div
            className="pointer-events-none absolute inset-0 opacity-60"
            style={{
              background:
                "radial-gradient(ellipse 80% 70% at 20% 40%, rgba(255,255,255,0.06), transparent 55%)",
            }}
          />

          <div className="relative flex flex-col gap-6 p-4 sm:flex-row sm:items-stretch sm:gap-7 sm:p-6 lg:gap-8">
            <div className="relative mx-auto aspect-[3/4] w-48 shrink-0 overflow-hidden rounded-md bg-[#191c1e] ring-1 ring-white/10 sm:mx-0 sm:w-56 sm:self-start">
              {poster ? (
                <Image
                  src={poster}
                  alt={series.title}
                  fill
                  priority
                  sizes="224px"
                  className="object-cover"
                />
              ) : hero ? (
                <Image
                  src={hero}
                  alt={series.title}
                  fill
                  priority
                  sizes="224px"
                  className="object-cover"
                />
              ) : null}
            </div>

            <div className="flex min-w-0 flex-1 flex-col items-center justify-center gap-3 text-center sm:items-start sm:text-left">
              <span className="inline-flex w-fit rounded bg-white/90 px-[7px] py-1 text-[9.5px] font-bold uppercase tracking-[0.18em] text-black">
                AnyMe Original
              </span>

              <h1
                className="text-3xl font-bold uppercase leading-[1.05] tracking-tight text-white sm:text-4xl lg:text-[2.75rem]"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {series.title}
              </h1>

              <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-sm text-white/70 sm:justify-start">
                {views > 0 && (
                  <span className="inline-flex items-center gap-1.5">
                    <PlayMini className="h-3.5 w-3.5" />
                    {formatViews(views)} views
                  </span>
                )}
              </div>

              {epCount > 0 && (
                <p className="text-[13px] text-white/50">
                  {epCount} episodes
                </p>
              )}

              <div className="flex flex-wrap items-center justify-center gap-3 pt-1 sm:justify-start">
                {firstFree ? (
                  <Link
                    href={`/watch/${seriesId}/${firstFree.id}`}
                    className="inline-flex h-11 items-center gap-2 rounded-md bg-white px-5 text-sm font-bold uppercase tracking-wide text-black transition hover:bg-white/90"
                  >
                    <PlayMini className="h-3.5 w-3.5" />
                    Start EP {firstFree.episode_number}
                  </Link>
                ) : (
                  <GetTheAppButton />
                )}
                {firstFree ? <GetTheAppButton /> : null}
              </div>

              {series.description && (
                <ExpandableText
                  text={series.description}
                  className="mt-1 max-w-3xl"
                  lines={2}
                />
              )}
            </div>
          </div>
        </div>

        <section className="mt-8">
          <div className="mb-3 flex items-end justify-between gap-3">
            <h2
              className="text-xs font-bold uppercase tracking-[0.16em] text-white"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Episodes
            </h2>
            <p className="text-[11px] text-white/40">
              Locked episodes unlock in the app.
            </p>
          </div>
          <EpisodeList seriesId={seriesId} episodes={episodes} />
        </section>
      </div>
    </div>
  );
}

function PlayMini({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}
