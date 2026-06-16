"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { COMMUNITY_LINK } from "@/lib/constants";
import { AppStoreButtons } from "./AppStoreButtons";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/contact", label: "Contact" },
];

export function HeaderMenu() {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    if (open) {
      document.addEventListener("keydown", handleEscape);
    }

    return () => document.removeEventListener("keydown", handleEscape);
  }, [open]);

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        aria-label="Open menu"
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
        className="flex h-10 w-10 items-center justify-center rounded-lg border border-anyme-border bg-anyme-card text-anyme-silver-light transition-colors hover:border-anyme-border-light hover:bg-anyme-elevated"
      >
        <ThreeDotsIcon className="h-5 w-5" />
      </button>

      {open && (
        <div className="absolute right-0 top-[calc(100%+0.5rem)] z-50 w-72 rounded-xl border border-anyme-border bg-anyme-card p-4 shadow-[0_16px_48px_rgba(0,0,0,0.5)]">
          <nav className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm text-anyme-silver-mid transition-colors hover:bg-anyme-elevated hover:text-anyme-silver-light"
              >
                {link.label}
              </Link>
            ))}
            <a
              href={COMMUNITY_LINK}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setOpen(false)}
              className="rounded-lg px-3 py-2.5 text-sm text-anyme-silver-mid transition-colors hover:bg-anyme-elevated hover:text-anyme-silver-light"
            >
              Community
            </a>
          </nav>

          <div className="my-4 border-t border-anyme-border" />

          <AppStoreButtons size="sm" />
        </div>
      )}
    </div>
  );
}

function ThreeDotsIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <circle cx="5" cy="12" r="1.75" />
      <circle cx="12" cy="12" r="1.75" />
      <circle cx="19" cy="12" r="1.75" />
    </svg>
  );
}
