"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { seriesHeroImage } from "@/lib/content";
import { track } from "@/lib/analytics";
import type { SeriesCardData } from "@/lib/types";

export function HeroCarousel({ items }: { items: SeriesCardData[] }) {
  const slides = items.slice(0, 16);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (slides.length <= 1) return;
    const id = window.setInterval(() => {
      setIndex((prev) => (prev + 1) % slides.length);
    }, 6500);
    return () => window.clearInterval(id);
  }, [slides.length]);

  if (!slides.length) {
    return (
      <div className="flex h-[420px] items-center justify-center">
        <p className="text-anyme-silver-mid">No featured series yet.</p>
      </div>
    );
  }

  const current = slides[index];
  const prev = slides[(index - 1 + slides.length) % slides.length];
  const next = slides[(index + 1) % slides.length];

  function go(dir: -1 | 1) {
    setIndex((i) => (i + dir + slides.length) % slides.length);
  }

  return (
    <section className="relative pb-10 pt-4 sm:pb-12 sm:pt-5 md:pb-14">
      <div className="w-full px-3 sm:px-4 lg:px-5">
        <div className="relative flex items-end justify-center gap-2 sm:gap-2.5 lg:gap-3">
          {slides.length > 1 && (
            <PeekCard series={prev} side="left" onClick={() => go(-1)} />
          )}

          {/* Whole center card opens series (not only Watch now) */}
          <Link
            href={`/series/${current.id}`}
            className="relative z-20 block h-[340px] w-full min-w-0 flex-[2.35] overflow-hidden rounded-xl shadow-[0_28px_80px_rgba(0,0,0,0.5)] ring-1 ring-white/12 transition hover:ring-white/25 sm:h-[420px] sm:flex-[2.55] sm:rounded-2xl md:h-[480px] lg:h-[540px]"
            onClick={() =>
              track({
                type: "series_click",
                seriesId: current.id,
                seriesTitle: current.title,
                label: "hero",
              })
            }
          >
            {seriesHeroImage(current) ? (
              <Image
                src={seriesHeroImage(current)!}
                alt={current.title}
                fill
                priority
                sizes="(max-width: 768px) 100vw, 70vw"
                className="object-cover object-[center_16%]"
              />
            ) : (
              <div className="h-full w-full bg-anyme-elevated" />
            )}

            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/45 via-transparent to-transparent" />

            <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-4 sm:gap-4 sm:p-5 md:p-7">
              <div className="min-w-0 max-w-lg">
                <span className="mb-1.5 inline-flex rounded bg-black/50 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.16em] text-white">
                  AnyMe Original
                </span>
                <h1
                  className="text-lg font-bold uppercase leading-[1.08] tracking-tight text-white sm:text-xl md:text-2xl lg:text-[1.85rem]"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {current.title}
                </h1>
                {current.description && (
                  <p className="mt-1.5 line-clamp-2 max-w-md text-xs leading-relaxed text-white/70 sm:text-[13px]">
                    {current.description}
                  </p>
                )}
                <span className="mt-3 inline-flex h-9 items-center gap-2 rounded-md bg-white px-4 text-xs font-bold text-black sm:mt-3.5 sm:h-10 sm:text-sm">
                  <PlayIcon className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                  Watch now
                </span>
              </div>

              <p className="shrink-0 rounded-full bg-black/40 px-2.5 py-1 text-[11px] font-medium tabular-nums text-white/70">
                {index + 1} / {slides.length}
              </p>
            </div>
          </Link>

          {slides.length > 1 && (
            <PeekCard series={next} side="right" onClick={() => go(1)} />
          )}
        </div>
      </div>
    </section>
  );
}

function PeekCard({
  series,
  side,
  onClick,
}: {
  series: SeriesCardData;
  side: "left" | "right";
  onClick: () => void;
}) {
  const src = seriesHeroImage(series);

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={side === "left" ? "Previous" : "Next"}
      className="group relative z-10 hidden h-[330px] min-w-0 flex-1 overflow-hidden rounded-xl opacity-80 transition duration-300 hover:opacity-100 sm:h-[410px] sm:rounded-2xl md:block md:h-[470px] lg:h-[530px]"
    >
      {src ? (
        <Image
          src={src}
          alt=""
          fill
          sizes="280px"
          className="object-cover object-[center_16%] transition duration-300 group-hover:scale-[1.02]"
        />
      ) : (
        <div className="h-full w-full bg-anyme-elevated" />
      )}
      <div className="absolute inset-0 bg-black/25 transition group-hover:bg-black/15" />

      <span
        className={`absolute bottom-4 flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-black/50 text-lg text-white backdrop-blur-[2px] transition group-hover:bg-black/70 sm:bottom-5 sm:h-10 sm:w-10 sm:text-xl ${
          side === "left" ? "left-4 sm:left-5" : "right-4 sm:right-5"
        }`}
      >
        {side === "left" ? "‹" : "›"}
      </span>
    </button>
  );
}

function PlayIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}
