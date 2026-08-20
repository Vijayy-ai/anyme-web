import { apiGet, apiGetClient } from "./api";
import type {
  ApiEnvelope,
  Episode,
  HomeSections,
  Pagination,
  PlaybackSuccess,
  SeriesCardData,
  SeriesDetails,
  SeriesSummary,
} from "./types";

export const SECTION_SIZE = 6;

export function toCardSeries(series: SeriesSummary): SeriesCardData {
  return {
    id: series.id,
    title: series.title,
    description: series.description ?? null,
    thumbnail_url: series.thumbnail_url ?? null,
    hero_thumbnail_url: series.hero_thumbnail_url ?? null,
    display_thumbnail: series.display_thumbnail ?? null,
    episodes_count: series.episodes_count ?? null,
    views_count: series.views_count ?? null,
    total_views: series.total_views ?? null,
    mood: series.mood ?? null,
  };
}

export function toCardList(list: SeriesSummary[]) {
  return list.map(toCardSeries);
}

/** Prefer `preferred`, then fill from `pool` until we have `size` unique items. */
export function fillSection(
  preferred: SeriesSummary[],
  pool: SeriesSummary[],
  used: Set<string>,
  size = SECTION_SIZE,
): SeriesSummary[] {
  const out: SeriesSummary[] = [];

  for (const item of preferred) {
    if (out.length >= size) break;
    if (used.has(item.id)) continue;
    out.push(item);
    used.add(item.id);
  }

  for (const item of pool) {
    if (out.length >= size) break;
    if (used.has(item.id)) continue;
    out.push(item);
    used.add(item.id);
  }

  return out;
}

export async function getHeroCurated(): Promise<SeriesSummary[]> {
  const res = await apiGet<ApiEnvelope<SeriesSummary[]>>(
    "/api/v1/content/hero/curated/",
  );
  return Array.isArray(res.data) ? res.data : [];
}

export async function getTopPicks(): Promise<SeriesSummary[]> {
  const res = await apiGet<ApiEnvelope<SeriesSummary[]>>(
    "/api/v1/content/top-picks/",
  );
  return Array.isArray(res.data) ? res.data : [];
}

export async function getHomeSections(): Promise<HomeSections> {
  const res = await apiGet<ApiEnvelope<HomeSections>>(
    "/api/v1/content/series/home_optimized/",
    { sections: "trending,daily_pick", page_size: 18 },
  );
  return {
    trending: res.data?.trending ?? [],
    daily_pick: res.data?.daily_pick ?? [],
    timestamp: res.data?.timestamp,
  };
}

export async function getTrendingRotating(): Promise<SeriesSummary[]> {
  const res = await apiGet<ApiEnvelope<SeriesSummary[]>>(
    "/api/v1/content/optimized/series/trending-rotating/",
    { page_size: 18 },
  );
  return Array.isArray(res.data) ? res.data : [];
}

export async function getNewForYou(): Promise<SeriesSummary[]> {
  const res = await apiGet<
    ApiEnvelope<{
      results?: SeriesSummary[];
      data?: SeriesSummary[];
    }>
  >("/api/v1/content/optimized/series/trending-for-search/", {
    page: 1,
    page_size: 18,
  });

  const list = res.data?.results ?? res.data?.data ?? [];
  return Array.isArray(list) ? list : [];
}

export async function getSeriesDetails(
  seriesId: string,
): Promise<SeriesDetails> {
  const res = await apiGet<ApiEnvelope<SeriesDetails>>(
    `/api/v1/content/optimized/series/${seriesId}/details-ultra/`,
  );
  return res.data;
}

export async function getSeriesEpisodes(
  seriesId: string,
  page = 1,
  pageSize = 50,
): Promise<{ episodes: Episode[]; pagination: Pagination | null }> {
  const res = await apiGet<
    ApiEnvelope<{ data: Episode[]; pagination: Pagination }>
  >(`/api/v1/content/optimized/series/${seriesId}/episodes-ultra/`, {
    page,
    page_size: pageSize,
  });

  return {
    episodes: res.data?.data ?? [],
    pagination: res.data?.pagination ?? null,
  };
}

function parseSearchResults(body: unknown): SeriesSummary[] {
  if (!body || typeof body !== "object") return [];
  const data = (body as { data?: unknown }).data;
  if (Array.isArray(data)) return data as SeriesSummary[];
  if (data && typeof data === "object") {
    const nested = data as { results?: unknown; data?: unknown };
    if (Array.isArray(nested.results)) return nested.results as SeriesSummary[];
    if (Array.isArray(nested.data)) return nested.data as SeriesSummary[];
  }
  return [];
}

export async function searchSeries(
  query: string,
  page = 1,
  pageSize = 20,
): Promise<SeriesSummary[]> {
  // Browser cannot call API_BASE (CORS). Use same-origin proxy.
  if (typeof window !== "undefined") {
    const url = new URL("/api/search", window.location.origin);
    url.searchParams.set("q", query);
    url.searchParams.set("page", String(page));
    url.searchParams.set("page_size", String(pageSize));
    const res = await fetch(url.toString(), {
      method: "GET",
      headers: { Accept: "application/json" },
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) return [];
    return parseSearchResults(body);
  }

  const res = await apiGetClient<
    ApiEnvelope<
      SeriesSummary[] | { data: SeriesSummary[]; results?: SeriesSummary[] }
    >
  >("/api/v1/content/optimized/series/search/", {
    q: query,
    page,
    page_size: pageSize,
  });

  return parseSearchResults(res);
}

export async function getPlaybackUrl(key: string): Promise<PlaybackSuccess> {
  return apiGetClient<PlaybackSuccess>("/api/v1/video-service/get-url/", {
    key,
    use_cloudfront: true,
  });
}

export function canPlayOnWeb(
  episode: Pick<Episode, "is_premium" | "video_url">,
) {
  return (
    episode.is_premium === false &&
    typeof episode.video_url === "string" &&
    episode.video_url.length > 0
  );
}

export function seriesPoster(series: SeriesSummary | SeriesCardData) {
  const s = series as SeriesSummary & {
    thumbnail?: string | null;
    hero_thumbnail?: string | null;
  };
  return (
    s.thumbnail_url ||
    s.thumbnail ||
    s.display_thumbnail ||
    s.hero_thumbnail_url ||
    s.hero_thumbnail ||
    null
  );
}

export function seriesHeroImage(series: SeriesSummary | SeriesCardData) {
  const s = series as SeriesSummary & {
    thumbnail?: string | null;
    hero_thumbnail?: string | null;
  };
  return (
    s.hero_thumbnail_url ||
    s.hero_thumbnail ||
    s.display_thumbnail ||
    s.thumbnail_url ||
    s.thumbnail ||
    null
  );
}

export function seriesViews(series: SeriesSummary | SeriesCardData) {
  return series.views_count ?? series.total_views ?? 0;
}

export function formatViews(count: number) {
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}M`;
  if (count >= 1_000) return `${(count / 1_000).toFixed(1)}K`;
  return String(count);
}

export function dedupeSeries(
  primary: SeriesSummary[],
  ...others: SeriesSummary[][]
) {
  const seen = new Set(primary.map((s) => s.id));
  const result = [...primary];
  for (const list of others) {
    for (const item of list) {
      if (seen.has(item.id)) continue;
      seen.add(item.id);
      result.push(item);
    }
  }
  return result;
}

export const BROWSE_TAGS = [
  "Action",
  "Romance",
  "Fantasy",
  "Revenge",
  "Thriller",
  "Comedy",
  "Drama",
] as const;
