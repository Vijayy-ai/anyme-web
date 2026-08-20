"use client";

import { APP_LINKS, episodeDeepLink, seriesDeepLink } from "./constants";

export type DeepLinkTarget = {
  seriesId?: string;
  episodeId?: string;
};

export type ClientPlatform = "ios" | "android" | "mac" | "windows" | "other";

/** Detect phone OS + desktop OS (Mac / Windows). */
export function detectPlatform(): ClientPlatform {
  if (typeof navigator === "undefined") return "other";
  const ua = navigator.userAgent || "";
  const plat = navigator.platform || "";

  if (/iPad|iPhone|iPod/i.test(ua)) return "ios";
  if (/Android/i.test(ua)) return "android";
  // iPadOS 13+ can report as Mac — treat touch Macs carefully
  if (/Macintosh/i.test(ua) && navigator.maxTouchPoints > 1) return "ios";
  if (/Mac/i.test(plat) || /Macintosh/i.test(ua)) return "mac";
  if (/Win/i.test(plat) || /Windows/i.test(ua)) return "windows";
  return "other";
}

export function getPreferredStoreUrl() {
  const platform = detectPlatform();
  // Apple devices → App Store; Android / Windows / other → Play Store
  if (platform === "ios" || platform === "mac") return APP_LINKS.ios;
  return APP_LINKS.android;
}

export function buildDeepLink({ seriesId, episodeId }: DeepLinkTarget) {
  if (seriesId && episodeId) return episodeDeepLink(seriesId, episodeId);
  if (seriesId) return seriesDeepLink(seriesId);
  return "anyme://";
}

/** Try deep link on phones; on Mac/Windows open the matching store. */
export function openAppOrStore(target: DeepLinkTarget = {}) {
  const deepLink = buildDeepLink(target);
  const storeUrl = getPreferredStoreUrl();
  const platform = detectPlatform();

  // Desktop: no reliable app deep-link — open correct store tab
  if (platform === "mac" || platform === "windows" || platform === "other") {
    window.open(storeUrl, "_blank", "noopener,noreferrer");
    return;
  }

  const started = Date.now();
  window.location.href = deepLink;

  window.setTimeout(() => {
    if (document.hidden) return;
    if (Date.now() - started < 2800) {
      window.location.href = storeUrl;
    }
  }, 1600);
}
