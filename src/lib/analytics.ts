export type AnalyticsEventType =
  | "page_view"
  | "series_click"
  | "watch_start"
  | "get_app_click"
  | "premium_gate"
  | "search";

export type TrackPayload = {
  type: AnalyticsEventType | string;
  path?: string;
  referrer?: string;
  seriesId?: string;
  seriesTitle?: string;
  episodeId?: string;
  episodeNumber?: number;
  label?: string;
  meta?: Record<string, unknown>;
};

const VISITOR_KEY = "anyme_vid";
const SESSION_KEY = "anyme_sid";

function randomId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `id_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

function getOrCreate(key: string, ttlMs?: number) {
  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      const parsed = JSON.parse(raw) as { id: string; exp?: number };
      if (!parsed.exp || parsed.exp > Date.now()) return parsed.id;
    }
    const id = randomId();
    const exp = ttlMs ? Date.now() + ttlMs : undefined;
    localStorage.setItem(key, JSON.stringify({ id, exp }));
    return id;
  } catch {
    return randomId();
  }
}

export function getAnalyticsIds() {
  const visitorId = getOrCreate(VISITOR_KEY);
  // Session expires after 30 minutes of idle (refreshed on each track)
  const sessionId = getOrCreate(SESSION_KEY, 30 * 60 * 1000);
  try {
    localStorage.setItem(
      SESSION_KEY,
      JSON.stringify({ id: sessionId, exp: Date.now() + 30 * 60 * 1000 }),
    );
  } catch {
    // ignore
  }
  return { visitorId, sessionId };
}

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

export function gtagEvent(
  name: string,
  params?: Record<string, string | number | boolean | undefined>,
) {
  if (typeof window === "undefined" || typeof window.gtag !== "function") return;
  window.gtag("event", name, params);
}

/** Fire GA4 + our own collect endpoint (non-blocking). */
export function track(payload: TrackPayload) {
  if (typeof window === "undefined") return;

  const { visitorId, sessionId } = getAnalyticsIds();
  const body = {
    ...payload,
    path: payload.path || window.location.pathname,
    referrer: payload.referrer || document.referrer || undefined,
    visitorId,
    sessionId,
  };

  // GA4
  gtagEvent(payload.type, {
    page_path: body.path,
    series_id: payload.seriesId,
    series_title: payload.seriesTitle,
    episode_id: payload.episodeId,
    episode_number: payload.episodeNumber,
    label: payload.label,
  });

  const json = JSON.stringify(body);
  try {
    if (navigator.sendBeacon) {
      const blob = new Blob([json], { type: "application/json" });
      navigator.sendBeacon("/api/analytics/collect", blob);
      return;
    }
  } catch {
    // fall through
  }

  void fetch("/api/analytics/collect", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: json,
    keepalive: true,
  }).catch(() => undefined);
}
