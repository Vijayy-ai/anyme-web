"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  BROWSE_TAGS,
  formatViews,
  searchSeries,
  seriesPoster,
  seriesViews,
  toCardList,
} from "@/lib/content";
import type { SeriesCardData } from "@/lib/types";

type SearchOverlayProps = {
  open: boolean;
  onClose: () => void;
  topSeries: SeriesCardData[];
};

export function SearchOverlay({ open, onClose, topSeries }: SearchOverlayProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [mounted, setMounted] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SeriesCardData[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTag, setActiveTag] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const t = window.setTimeout(() => inputRef.current?.focus(), 50);
    return () => {
      document.body.style.overflow = prev;
      window.clearTimeout(t);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) {
      setQuery("");
      setResults([]);
      setActiveTag(null);
      setLoading(false);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const trimmed = query.trim();
    if (!trimmed) {
      setResults([]);
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    const handle = window.setTimeout(() => {
      setLoading(true);
      void searchSeries(trimmed)
        .then((data) => {
          if (controller.signal.aborted) return;
          setResults(toCardList(data).slice(0, 20));
        })
        .catch(() => {
          if (!controller.signal.aborted) setResults([]);
        })
        .finally(() => {
          if (!controller.signal.aborted) setLoading(false);
        });
    }, 280);

    return () => {
      controller.abort();
      window.clearTimeout(handle);
    };
  }, [query, open]);

  const top10 = useMemo(() => topSeries.slice(0, 10), [topSeries]);

  const filteredTop = useMemo(() => {
    if (!activeTag) return top10;
    const tag = activeTag.toLowerCase();
    return top10.filter(
      (s) =>
        s.mood?.toLowerCase().includes(tag) ||
        s.title.toLowerCase().includes(tag) ||
        s.description?.toLowerCase().includes(tag),
    );
  }, [activeTag, top10]);

  if (!open || !mounted) return null;

  const showResults = query.trim().length > 0;

  // Full-viewport scroll root so wheel works on left/right empty margins too.
  return createPortal(
    <div
      className="scrollbar-hide fixed inset-0 z-[100] overflow-y-auto overscroll-contain bg-[#1a1a1a]"
      role="dialog"
      aria-modal="true"
      aria-label="Search"
    >
      <div className="mx-auto w-full max-w-[1100px] px-4 pb-16 pt-4 sm:px-6 sm:pt-6">
        <div className="sticky top-0 z-10 -mx-4 bg-[#1a1a1a] px-4 pb-4 pt-0 sm:-mx-6 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              aria-label="Close search"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-white/15 text-white transition hover:bg-white/5"
            >
              ‹
            </button>
            <div className="flex h-11 flex-1 items-center gap-2 rounded-lg border border-white/15 bg-white/5 px-3">
              <SearchIcon className="h-4 w-4 shrink-0 text-white/50" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search series, tags"
                className="h-full w-full bg-transparent text-sm text-white outline-none placeholder:text-white/40"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="text-xs text-white/50 hover:text-white"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="mt-2">
          {!showResults && (
            <>
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.14em] text-white">
                Browse tags
              </p>
              <div className="mb-8 flex flex-wrap gap-2">
                {BROWSE_TAGS.map((tag) => {
                  const active = activeTag === tag;
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() =>
                        setActiveTag((prev) => (prev === tag ? null : tag))
                      }
                      className={`rounded-md px-3 py-1.5 text-xs font-medium transition ${
                        active
                          ? "bg-white text-black"
                          : "bg-white/10 text-white hover:bg-white/15"
                      }`}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>

              <p className="mb-3 text-xs font-bold uppercase tracking-[0.14em] text-white">
                Top 10 today
              </p>
              <div className="overflow-hidden rounded-xl border border-white/10 bg-white/[0.03]">
                {filteredTop.map((series, i) => {
                  const poster = seriesPoster(series);
                  return (
                    <Link
                      key={series.id}
                      href={`/series/${series.id}`}
                      onClick={onClose}
                      className="flex items-center gap-3 border-b border-white/5 px-3 py-2.5 transition hover:bg-white/5 last:border-b-0"
                    >
                      <span className="w-6 text-center text-lg font-bold tabular-nums text-white/35">
                        {i + 1}
                      </span>
                      <span className="relative h-12 w-9 shrink-0 overflow-hidden rounded bg-anyme-elevated">
                        {poster && (
                          <Image
                            src={poster}
                            alt=""
                            fill
                            sizes="36px"
                            className="object-cover"
                          />
                        )}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium text-white">
                          {series.title}
                        </span>
                        {seriesViews(series) > 0 && (
                          <span className="text-xs text-white/45">
                            {formatViews(seriesViews(series))} views
                          </span>
                        )}
                      </span>
                    </Link>
                  );
                })}
                {!filteredTop.length && (
                  <p className="px-4 py-6 text-sm text-white/45">
                    {activeTag
                      ? "No series for this tag."
                      : "No series available right now."}
                  </p>
                )}
              </div>
            </>
          )}

          {showResults && (
            <div>
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.14em] text-white">
                {loading ? "Searching…" : `Results for “${query.trim()}”`}
              </p>
              {!loading && results.length === 0 && (
                <p className="text-sm text-white/45">No series found.</p>
              )}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                {results.map((series) => {
                  const poster = seriesPoster(series);
                  return (
                    <Link
                      key={series.id}
                      href={`/series/${series.id}`}
                      onClick={onClose}
                      className="group"
                    >
                      <div className="relative aspect-[2/3] overflow-hidden rounded-lg bg-anyme-elevated">
                        {poster && (
                          <Image
                            src={poster}
                            alt={series.title}
                            fill
                            sizes="160px"
                            className="object-cover transition group-hover:scale-105"
                          />
                        )}
                      </div>
                      <p className="mt-2 line-clamp-2 text-sm font-medium text-white">
                        {series.title}
                      </p>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden
    >
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-3.5-3.5" />
    </svg>
  );
}
