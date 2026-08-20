"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { COMMUNITY_LINK } from "@/lib/constants";
import { Logo } from "./Logo";

export function Footer() {
  const pathname = usePathname();
  // Mochi-style: no footer on series detail, watch, or admin
  if (
    pathname?.startsWith("/watch") ||
    pathname?.startsWith("/series") ||
    pathname?.startsWith("/snoozeit")
  ) {
    return null;
  }

  return (
    <footer className="mt-8 border-t border-white/8">
      <div className="mx-auto flex max-w-[1600px] flex-col gap-5 px-3 py-8 sm:px-4 lg:px-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <Logo size="sm" href={undefined} />
            <p className="mt-1.5 text-[12px] text-white/45">
              Anime In Microdrama
            </p>
          </div>
          <nav className="flex flex-wrap items-center gap-4">
            <Link
              href="/"
              className="text-xs text-white/45 transition-colors hover:text-white/80"
            >
              Home
            </Link>
            <Link
              href="/contact"
              className="text-xs text-white/45 transition-colors hover:text-white/80"
            >
              Contact
            </Link>
            <a
              href={COMMUNITY_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-white/45 transition-colors hover:text-white/80"
            >
              Community
            </a>
          </nav>
        </div>

        <p className="text-[11px] text-white/30">
          © {new Date().getFullYear()} Snoozeit Entertainment Private Limited.
        </p>
      </div>
    </footer>
  );
}
