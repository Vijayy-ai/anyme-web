"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Suspense,
  useEffect,
  useState,
  useTransition,
  type FormEvent,
} from "react";
import {
  BROWSE_TAGS,
  formatViews,
  searchSeries,
  seriesPoster,
  seriesViews,
  toCardList,
} from "@/lib/content";
import type { SeriesCardData } from "@/lib/types";

function SearchPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQ = searchParams.get("q") ?? "";
  const [query, setQuery] = useState(initialQ);
  const [results, setResults] = useState<SeriesCardData[]>([]);
  const [top, setTop] = useState<SeriesCardData[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [searched, setSearched] = useState(Boolean(initialQ));
  const [activeTag, setActiveTag] = useState<string | null>(null);

  useEffect(() => {
    startTransition(async () => {
      try {
        const data = await searchSeries("a");
        // Lightweight bootstrap for top list — prefer empty query fallback via trending
        setTop(toCardList(data).slice(0, 10));
      } catch {
        setTop([]);
      }
    });
  }, []);

  useEffect(() => {
    if (!initialQ.trim()) return;
    startTransition(async () => {
      try {
        const data = await searchSeries(initialQ.trim());
        setResults(toCardList(data));
        setError(null);
      } catch {
        setError("Search failed. Try again.");
        setResults([]);
      }
    });
  }, [initialQ]);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const q = query.trim();
    setSearched(true);
    router.replace(q ? `/search?q=${encodeURIComponent(q)}` : "/search");
    if (!q) {
      setResults([]);
      return;
    }
    startTransition(async () => {
      try {
        const data = await searchSeries(q);
        setResults(toCardList(data));
        setError(null);
      } catch {
        setError("Search failed. Try again.");
        setResults([]);
      }
    });
  }

  const showResults = searched && query.trim().length > 0;
  const topList = activeTag
    ? top.filter(
        (s) =>
          s.mood?.toLowerCase().includes(activeTag.toLowerCase()) ||
          s.title.toLowerCase().includes(activeTag.toLowerCase()),
      )
    : top;

  return (
    <div className="mx-auto w-full max-w-[900px] px-4 pb-20 pt-24 sm:px-6">
      <form onSubmit={onSubmit} className="flex items-center gap-3">
        <Link
          href="/"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-white/15 text-white transition hover:bg-white/5"
          aria-label="Back"
        >
          ‹
        </Link>
        <div className="flex h-11 flex-1 items-center gap-2 rounded-lg border border-white/15 bg-white/5 px-3">
          <span className="text-white/40">⌕</span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search series, tags"
            className="h-full w-full bg-transparent text-sm text-white outline-none placeholder:text-white/40"
          />
        </div>
      </form>

      <div className="mt-8">
        {!showResults && (
          <>
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.14em] text-white">
              Browse tags
            </p>
            <div className="mb-8 flex flex-wrap gap-2">
              {BROWSE_TAGS.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() =>
                    setActiveTag((prev) => (prev === tag ? null : tag))
                  }
                  className={`rounded-md px-3 py-1.5 text-xs font-medium transition ${
                    activeTag === tag
                      ? "bg-white text-black"
                      : "bg-white/10 text-white hover:bg-white/15"
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>

            <p className="mb-3 text-xs font-bold uppercase tracking-[0.14em] text-white">
              Top 10 today
            </p>
            <div className="overflow-hidden rounded-xl border border-white/10 bg-white/[0.03]">
              {topList.map((series, i) => {
                const poster = seriesPoster(series);
                return (
                  <Link
                    key={series.id}
                    href={`/series/${series.id}`}
                    className="flex items-center gap-3 border-b border-white/5 px-3 py-2.5 transition hover:bg-white/5 last:border-b-0"
                  >
                    <span className="w-6 text-center text-lg font-bold text-white/35">
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
            </div>
          </>
        )}

        {showResults && (
          <div>
            {pending && (
              <p className="text-sm text-anyme-silver-mid">Searching…</p>
            )}
            {error && <p className="text-sm text-red-300">{error}</p>}
            {!pending && !error && results.length === 0 && (
              <p className="text-sm text-anyme-silver-mid">No series found.</p>
            )}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
              {results.map((series) => {
                const poster = seriesPoster(series);
                return (
                  <Link key={series.id} href={`/series/${series.id}`} className="group">
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
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-[900px] px-4 pt-24 text-sm text-anyme-silver-mid">
          Loading search…
        </div>
      }
    >
      <SearchPageInner />
    </Suspense>
  );
}
