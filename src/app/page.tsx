import { HeroCarousel } from "@/components/HeroCarousel";
import { SeriesRow } from "@/components/SeriesRow";
import {
  dedupeSeries,
  fillSection,
  getHeroCurated,
  getHomeSections,
  getNewForYou,
  getTopPicks,
  getTrendingRotating,
  toCardList,
} from "@/lib/content";
import type { HomeSections, SeriesSummary } from "@/lib/types";

export const revalidate = 60;

export default async function HomePage() {
  const [hero, topPicks, home, rotating, fresh] = await Promise.all([
    getHeroCurated().catch(() => [] as SeriesSummary[]),
    getTopPicks().catch(() => [] as SeriesSummary[]),
    getHomeSections().catch((): HomeSections => ({})),
    getTrendingRotating().catch(() => [] as SeriesSummary[]),
    getNewForYou().catch(() => [] as SeriesSummary[]),
  ]);

  const trending = home.trending ?? [];
  const dailyPick = home.daily_pick ?? [];

  const pool = dedupeSeries(topPicks, trending, rotating, fresh, hero);
  const used = new Set<string>();

  const topSection = fillSection(topPicks, pool, used);
  const trendingSection = fillSection(trending, pool, used);
  const newHotSection = fillSection(rotating, pool, used);
  const popularSection = fillSection(fresh, pool, used);
  // Daily pick often returns 1 from API — fill the row to 6
  const dailySection = fillSection(dailyPick, pool, used);

  // Extra browse row if we still have unused titles
  const moreSection = fillSection([], pool, used);

  const sections = [
    { title: "Top 10 today", series: toCardList(topSection), ranked: true },
    { title: "Trending now", series: toCardList(trendingSection) },
    { title: "New & hot", series: toCardList(newHotSection) },
    { title: "Popular searches", series: toCardList(popularSection) },
    { title: "Daily pick", series: toCardList(dailySection) },
    { title: "More to watch", series: toCardList(moreSection) },
  ].filter((s) => s.series.length >= 4); // hide half-empty rows

  const heroItems = toCardList(
    hero.length > 0 ? hero : dedupeSeries(topPicks, trending, rotating).slice(0, 12),
  );

  return (
    <div className="relative pb-16">
      <div className="pointer-events-none absolute inset-0 page-grid opacity-70" />

      <HeroCarousel items={heroItems} />

      <div className="relative z-10 w-full space-y-9 px-3 pt-2 sm:space-y-11 sm:px-4 md:pt-4 lg:px-5">
        {sections.map((section) => (
          <SeriesRow
            key={section.title}
            title={section.title}
            series={section.series}
            ranked={section.ranked}
          />
        ))}
      </div>
    </div>
  );
}
