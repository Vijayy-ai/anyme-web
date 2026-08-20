"use client";

import Script from "next/script";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";
import { track } from "@/lib/analytics";

const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

function PageViewTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!pathname) return;
    // Skip admin itself
    if (pathname.startsWith("/snoozeit")) return;

    const qs = searchParams?.toString();
    const path = qs ? `${pathname}?${qs}` : pathname;

    // Extract series/episode from path for richer events
    const watchMatch = pathname.match(/^\/watch\/([^/]+)\/([^/]+)/);
    const seriesMatch = pathname.match(/^\/series\/([^/]+)/);

    track({
      type: "page_view",
      path,
      seriesId: watchMatch?.[1] || seriesMatch?.[1],
      episodeId: watchMatch?.[2],
      label: watchMatch ? "watch" : seriesMatch ? "series" : pathname,
    });

    if (GA_ID && typeof window.gtag === "function") {
      window.gtag("config", GA_ID, { page_path: path });
    }
  }, [pathname, searchParams]);

  return null;
}

export function AnalyticsProvider() {
  return (
    <>
      {GA_ID ? (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
            strategy="afterInteractive"
          />
          <Script id="ga4-init" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              window.gtag = gtag;
              gtag('js', new Date());
              gtag('config', '${GA_ID}', { send_page_view: false });
            `}
          </Script>
        </>
      ) : null}
      <Suspense fallback={null}>
        <PageViewTracker />
      </Suspense>
    </>
  );
}
