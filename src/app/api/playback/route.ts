import { NextRequest, NextResponse } from "next/server";
import { API_BASE } from "@/lib/constants";
import type { PlaybackSuccess } from "@/lib/types";

export const runtime = "nodejs";

type CookieMap = Record<string, string>;

const signCache = new Map<string, { at: number; payload: PlaybackSuccess }>();
const SIGN_TTL_MS = 40_000;

function encodePayload(cookies: CookieMap, baseUrl: string) {
  const json = JSON.stringify({ c: cookies, b: baseUrl });
  return Buffer.from(json, "utf8").toString("base64url");
}

function rewritePlaylist(
  body: string,
  playlistUrl: string,
  token: string | null,
): string {
  if (!token) return body;

  const base = new URL(playlistUrl);
  return body
    .split("\n")
    .map((line) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) return line;

      let absolute: string;
      try {
        absolute = new URL(trimmed, base).toString();
      } catch {
        return line;
      }

      const proxied = `/api/cf?u=${encodeURIComponent(absolute)}&t=${token}`;
      return line.replace(trimmed, proxied);
    })
    .join("\n");
}

function looksLikeMp4(key: string, url: string) {
  return /\.mp4(\?|$)/i.test(key) || /\.mp4(\?|$)/i.test(url);
}

function looksLikeHls(key: string, url: string) {
  return /\.m3u8(\?|$)/i.test(key) || /\.m3u8(\?|$)/i.test(url) || /\/hls\//i.test(key);
}

export async function GET(req: NextRequest) {
  const key = req.nextUrl.searchParams.get("key");
  if (!key) {
    return NextResponse.json({ error: "missing_key" }, { status: 400 });
  }

  const cached = signCache.get(key);
  let signed: PlaybackSuccess;
  if (cached && Date.now() - cached.at < SIGN_TTL_MS && cached.payload.url) {
    signed = cached.payload;
  } else {
    const upstream = new URL("/api/v1/video-service/get-url/", API_BASE);
    upstream.searchParams.set("key", key);
    upstream.searchParams.set("use_cloudfront", "true");

    const signRes = await fetch(upstream.toString(), {
      headers: { Accept: "application/json" },
      cache: "no-store",
    });

    const payload = await signRes.json().catch(() => ({}));

    if (!signRes.ok) {
      return NextResponse.json(payload, { status: signRes.status });
    }

    signed = payload as PlaybackSuccess;
    if (!signed.url) {
      return NextResponse.json(
        { error: "missing_playback_url" },
        { status: 502 },
      );
    }
    signCache.set(key, { at: Date.now(), payload: signed });
  }

  const cookies = signed.cloudfront_cookies ?? {};
  const needsProxy =
    Boolean(signed.requires_cookies) && Object.keys(cookies).length > 0;
  const token = needsProxy ? encodePayload(cookies, signed.url) : null;

  // Progressive MP4 — never treat as HLS playlist text
  if (looksLikeMp4(key, signed.url) && !looksLikeHls(key, signed.url)) {
    const playUrl =
      needsProxy && token
        ? `/api/cf?u=${encodeURIComponent(signed.url)}&t=${token}`
        : signed.url;

    return NextResponse.json(
      { type: "mp4", url: playUrl },
      {
        status: 200,
        headers: { "Cache-Control": "private, no-store" },
      },
    );
  }

  // HLS: return a playable URL — let /api/cf rewrite playlists.
  // Avoids an extra CloudFront fetch on this hop (faster start).
  if (looksLikeHls(key, signed.url) || needsProxy) {
    const playUrl =
      needsProxy && token
        ? `/api/cf?u=${encodeURIComponent(signed.url)}&t=${token}`
        : signed.url;

    return NextResponse.json(
      { type: "hls", url: playUrl },
      {
        status: 200,
        headers: { "Cache-Control": "private, no-store" },
      },
    );
  }

  // Rare: unsigned non-cookie HLS URL — still rewrite if we can fetch it
  const playlistRes = await fetch(signed.url, {
    headers: { Accept: "*/*" },
    cache: "no-store",
  });

  if (!playlistRes.ok) {
    return NextResponse.json(
      {
        error: "playlist_fetch_failed",
        status: playlistRes.status,
        message:
          "Could not load stream. Try again or open this episode in the AnyMe app.",
        app_required: true,
      },
      { status: 502 },
    );
  }

  const contentType = playlistRes.headers.get("content-type") || "";
  if (contentType.includes("video/") || contentType.includes("mp4")) {
    return NextResponse.json(
      { type: "mp4", url: signed.url },
      {
        status: 200,
        headers: { "Cache-Control": "private, no-store" },
      },
    );
  }

  const raw = await playlistRes.text();
  const rewritten = rewritePlaylist(raw, signed.url, token);

  return new NextResponse(rewritten, {
    status: 200,
    headers: {
      "Content-Type": contentType || "application/vnd.apple.mpegurl",
      "Cache-Control": "private, no-store",
    },
  });
}
