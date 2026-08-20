type PlaybackPayload = {
  type: "mp4" | "hls";
  url: string;
  message?: string;
};

const cache = new Map<
  string,
  { at: number; promise: Promise<PlaybackPayload> }
>();

const TTL_MS = 45_000;

/** Deduped playback resolve — concurrent callers share one network hop. */
export function resolvePlayback(videoKey: string): Promise<PlaybackPayload> {
  const key = videoKey;
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < TTL_MS) return hit.promise;

  const promise = (async () => {
    const src = `/api/playback?key=${encodeURIComponent(key)}`;
    const res = await fetch(src, {
      cache: "no-store",
      headers: { Accept: "application/json" },
    });
    const body = (await res.json().catch(() => ({}))) as PlaybackPayload & {
      error?: string;
      app_required?: boolean;
      message?: string;
    };

    if (!res.ok) {
      const err = new Error(
        body.message || body.error || "Could not load this video.",
      ) as Error & { status?: number; appRequired?: boolean };
      err.status = res.status;
      err.appRequired = Boolean(body.app_required || body.error === "premium_content");
      throw err;
    }

    if ((body.type === "mp4" || body.type === "hls") && body.url) {
      return { type: body.type, url: body.url };
    }

    throw new Error(
      body.message || "Playback is unavailable in the browser. Open in the app.",
    );
  })();

  cache.set(key, { at: Date.now(), promise });
  promise.catch(() => {
    cache.delete(key);
  });
  return promise;
}
