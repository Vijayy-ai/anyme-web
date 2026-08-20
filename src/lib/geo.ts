import { createHash, timingSafeEqual } from "crypto";

export type GeoInfo = {
  ip: string | null;
  country: string | null;
  countryCode: string | null;
  city: string | null;
  region: string | null;
};

export function getClientIp(headers: Headers): string | null {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  return (
    headers.get("x-real-ip") ||
    headers.get("cf-connecting-ip") ||
    headers.get("true-client-ip") ||
    null
  );
}

export function deviceFromUa(ua: string | null): {
  device: string;
  browser: string;
} {
  if (!ua) return { device: "unknown", browser: "unknown" };
  const device = /Mobile|Android|iPhone|iPad/i.test(ua)
    ? /iPad|Tablet/i.test(ua)
      ? "tablet"
      : "mobile"
    : "desktop";
  let browser = "other";
  if (/Edg\//i.test(ua)) browser = "edge";
  else if (/Chrome\//i.test(ua) && !/Chromium/i.test(ua)) browser = "chrome";
  else if (/Safari\//i.test(ua) && !/Chrome/i.test(ua)) browser = "safari";
  else if (/Firefox\//i.test(ua)) browser = "firefox";
  return { device, browser };
}

/** Prefer CDN headers, then free ip-api.com (no key, rate-limited). */
export async function resolveGeo(
  headers: Headers,
  ip: string | null,
): Promise<GeoInfo> {
  const headerCountry =
    headers.get("x-vercel-ip-country") ||
    headers.get("cf-ipcountry") ||
    headers.get("cloudfront-viewer-country");
  const headerCity =
    headers.get("x-vercel-ip-city") ||
    headers.get("cf-ipcity");
  const headerRegion =
    headers.get("x-vercel-ip-country-region") ||
    headers.get("cf-region");

  if (headerCountry && headerCountry !== "XX") {
    return {
      ip,
      country: countryName(headerCountry),
      countryCode: headerCountry.toUpperCase(),
      city: headerCity ? decodeURIComponent(headerCity) : null,
      region: headerRegion,
    };
  }

  if (!ip || isPrivateIp(ip)) {
    return {
      ip,
      country: null,
      countryCode: null,
      city: null,
      region: null,
    };
  }

  try {
    const res = await fetch(
      `http://ip-api.com/json/${encodeURIComponent(ip)}?fields=status,country,countryCode,regionName,city`,
      { next: { revalidate: 86400 } },
    );
    if (!res.ok) throw new Error("geo failed");
    const data = (await res.json()) as {
      status?: string;
      country?: string;
      countryCode?: string;
      regionName?: string;
      city?: string;
    };
    if (data.status !== "success") {
      return { ip, country: null, countryCode: null, city: null, region: null };
    }
    return {
      ip,
      country: data.country ?? null,
      countryCode: data.countryCode ?? null,
      city: data.city ?? null,
      region: data.regionName ?? null,
    };
  } catch {
    return { ip, country: null, countryCode: null, city: null, region: null };
  }
}

function isPrivateIp(ip: string) {
  return (
    ip === "::1" ||
    ip.startsWith("127.") ||
    ip.startsWith("10.") ||
    ip.startsWith("192.168.") ||
    ip.startsWith("172.16.") ||
    ip.startsWith("fc") ||
    ip.startsWith("fd")
  );
}

function countryName(code: string) {
  try {
    return (
      new Intl.DisplayNames(["en"], { type: "region" }).of(code.toUpperCase()) ||
      code
    );
  } catch {
    return code;
  }
}

export function hashToken(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

export function safeEqual(a: string, b: string) {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ba.length !== bb.length) return false;
  return timingSafeEqual(ba, bb);
}
