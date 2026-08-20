"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { track } from "@/lib/analytics";
import { COMMUNITY_LINK } from "@/lib/constants";
import type { SeriesCardData } from "@/lib/types";
import { AppStoreButtons } from "./AppStoreButtons";
import { useAppDownload } from "./AppDownloadProvider";
import { NowPlayingPill } from "./NowPlayingPill";
import { SearchOverlay } from "./SearchOverlay";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/contact", label: "Contact" },
];

export function HeaderMenu({ topSeries = [] }: { topSeries?: SeriesCardData[] }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { open } = useAppDownload();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setMenuOpen(false);
    }
    if (menuOpen) document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [menuOpen]);

  return (
    <>
      <div className="flex items-center gap-2.5">
        <NowPlayingPill />

        <button
          type="button"
          onClick={() => setSearchOpen(true)}
          className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-[#2c3034] bg-[#101214] text-white/70 transition-colors hover:text-white"
          aria-label="Search"
        >
          <SearchIcon className="h-[18px] w-[18px]" />
        </button>

        <button
          type="button"
          onClick={() => {
            track({ type: "get_app_click", label: "header" });
            open();
          }}
          className="hidden h-9 items-center justify-center rounded-md border border-white/50 bg-white/[0.14] px-4 text-[11px] font-semibold tracking-wide text-white transition-colors hover:bg-white/20 sm:inline-flex"
        >
          GET THE APP
        </button>

        <div className="relative sm:hidden" ref={menuRef}>
          <button
            type="button"
            aria-label="Open menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((prev) => !prev)}
            className="flex h-9 w-9 items-center justify-center rounded-md border border-[#2c3034] bg-[#101214] text-white transition-colors hover:text-white"
          >
            <MenuIcon className="h-5 w-5" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-[calc(100%+0.5rem)] z-50 w-72 rounded-xl border border-anyme-border bg-anyme-card p-4 shadow-[0_16px_48px_rgba(0,0,0,0.5)]">
              <nav className="flex flex-col gap-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMenuOpen(false)}
                    className="rounded-lg px-3 py-2.5 text-sm text-anyme-silver-mid transition-colors hover:bg-anyme-elevated hover:text-anyme-silver-light"
                  >
                    {link.label}
                  </Link>
                ))}
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    setSearchOpen(true);
                  }}
                  className="rounded-lg px-3 py-2.5 text-left text-sm text-anyme-silver-mid transition-colors hover:bg-anyme-elevated hover:text-anyme-silver-light"
                >
                  Search
                </button>
                <a
                  href={COMMUNITY_LINK}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setMenuOpen(false)}
                  className="rounded-lg px-3 py-2.5 text-sm text-anyme-silver-mid transition-colors hover:bg-anyme-elevated hover:text-anyme-silver-light"
                >
                  Community
                </a>
              </nav>

              <div className="my-4 border-t border-anyme-border" />
              <div className="mb-3">
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    open();
                  }}
                  className="inline-flex h-10 w-full items-center justify-center rounded-lg border border-white/50 bg-white/[0.14] text-sm font-semibold tracking-wide text-white transition-colors hover:bg-white/20"
                >
                  GET THE APP
                </button>
              </div>
              <AppStoreButtons size="sm" />
            </div>
          )}
        </div>
      </div>

      <SearchOverlay
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        topSeries={topSeries}
      />
    </>
  );
}

function MenuIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden
    >
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
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
