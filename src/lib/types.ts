export type SeriesSummary = {
  id: string;
  title: string;
  description?: string | null;
  slug?: string | null;
  thumbnail_url?: string | null;
  hero_thumbnail_url?: string | null;
  display_thumbnail?: string | null;
  episodes_count?: number | null;
  views_count?: number | null;
  total_views?: number | null;
  likes_count?: number | null;
  avg_rating?: number | null;
  mood?: string | null;
  creator_display_name?: string | null;
  creator_username?: string | null;
  creator?:
    | string
    | {
        id?: string;
        username?: string;
        display_name?: string;
        handle?: string;
      }
    | null;
};

/** UI-safe series shape — no creator/studio fields */
export type SeriesCardData = {
  id: string;
  title: string;
  description?: string | null;
  thumbnail_url?: string | null;
  hero_thumbnail_url?: string | null;
  display_thumbnail?: string | null;
  episodes_count?: number | null;
  views_count?: number | null;
  total_views?: number | null;
  mood?: string | null;
};

export type SeriesDetails = SeriesSummary & {
  is_public?: boolean;
  rating_count?: number | null;
  created_at?: string;
  updated_at?: string;
};

export type Episode = {
  id: string;
  title: string;
  description?: string | null;
  episode_number: number;
  thumbnail_url?: string | null;
  series_thumbnail_url?: string | null;
  duration?: number | null;
  video_url?: string | null;
  is_premium: boolean;
  premium_price?: number | null;
  views_count?: number | null;
  likes_count?: number | null;
  is_purchased?: boolean;
};

export type Pagination = {
  page: number;
  page_size: number;
  total_count: number;
  total_pages: number;
  has_next: boolean;
  current_page?: number;
};

export type ApiEnvelope<T> = {
  success?: boolean;
  message?: string;
  data: T;
};

export type HomeSections = {
  trending?: SeriesSummary[];
  daily_pick?: SeriesSummary[];
  timestamp?: string;
};

export type PlaybackSuccess = {
  url: string;
  type?: string;
  requires_cookies?: boolean;
  cloudfront_cookies?: Record<string, string>;
  is_premium?: boolean;
  expires_in?: number;
};

export type PlaybackPremiumError = {
  error: "premium_content" | string;
  reason?: string;
  message?: string;
  app_required?: boolean;
  play_store_url?: string;
  app_store_url?: string;
};
