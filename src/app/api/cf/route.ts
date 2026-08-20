import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

type Payload = { c: Record<string, string>; b: string };

function decodeToken(token: string): Payload | null {
  try {
    const json = Buffer.from(token, "base64url").toString("utf8");
    return JSON.parse(json) as Payload;
  } catch {
    return null;
  }
}

function cookieHeader(cookies: Record<string, string>) {
  return Object.entries(cookies)
    .map(([k, v]) => `${k}=${v}`)
    .join("; ");
}

function rewritePlaylist(body: string, playlistUrl: string, token: string) {
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

      return line.replace(
        trimmed,
        `/api/cf?u=${encodeURIComponent(absolute)}&t=${token}`,
      );
    })
    .join("\n");
}

export async function GET(req: NextRequest) {
  const target = req.nextUrl.searchParams.get("u");
  const token = req.nextUrl.searchParams.get("t");

  if (!target || !token) {
    return NextResponse.json({ error: "missing_params" }, { status: 400 });
  }

  let url: URL;
  try {
    url = new URL(target);
  } catch {
    return NextResponse.json({ error: "invalid_url" }, { status: 400 });
  }

  if (!url.hostname.endsWith("cloudfront.net")) {
    return NextResponse.json({ error: "forbidden_host" }, { status: 403 });
  }

  const payload = decodeToken(token);
  if (!payload?.c) {
    return NextResponse.json({ error: "invalid_token" }, { status: 400 });
  }

  const range = req.headers.get("range");
  const upstream = await fetch(url.toString(), {
    headers: {
      Cookie: cookieHeader(payload.c),
      Accept: "*/*",
      ...(range ? { Range: range } : {}),
    },
    cache: "no-store",
  });

  if (!upstream.ok && upstream.status !== 206) {
    return new NextResponse(await upstream.text(), {
      status: upstream.status,
      headers: { "Cache-Control": "private, no-store" },
    });
  }

  const contentType = upstream.headers.get("content-type") || "";
  const isPlaylist =
    contentType.includes("mpegurl") ||
    contentType.includes("m3u8") ||
    url.pathname.endsWith(".m3u8");

  if (isPlaylist) {
    const text = await upstream.text();
    const rewritten = rewritePlaylist(text, url.toString(), token);
    return new NextResponse(rewritten, {
      status: 200,
      headers: {
        "Content-Type": contentType || "application/vnd.apple.mpegurl",
        "Cache-Control": "private, no-store",
      },
    });
  }

  const headers = new Headers();
  headers.set(
    "Content-Type",
    contentType ||
      (url.pathname.endsWith(".mp4") ? "video/mp4" : "application/octet-stream"),
  );
  headers.set("Cache-Control", "private, no-store");
  headers.set("Accept-Ranges", "bytes");

  const contentLength = upstream.headers.get("content-length");
  if (contentLength) headers.set("Content-Length", contentLength);
  const contentRange = upstream.headers.get("content-range");
  if (contentRange) headers.set("Content-Range", contentRange);

  return new NextResponse(upstream.body, {
    status: upstream.status,
    headers,
  });
}
