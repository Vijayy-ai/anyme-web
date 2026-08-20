"use client";

import { useSyncExternalStore, type ReactNode } from "react";

function subscribe(query: string, onChange: () => void) {
  const mq = window.matchMedia(query);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

function useMediaQuery(query: string) {
  return useSyncExternalStore(
    (onChange) => subscribe(query, onChange),
    () => window.matchMedia(query).matches,
    () => false,
  );
}

/** Render children only below the `lg` breakpoint (max-width: 1023px). */
export function MobileOnly({ children }: { children: ReactNode }) {
  const show = useMediaQuery("(max-width: 1023px)");
  if (!show) return null;
  return <>{children}</>;
}

/** Render children only at `lg` and up. */
export function DesktopOnly({ children }: { children: ReactNode }) {
  const show = useMediaQuery("(min-width: 1024px)");
  if (!show) return null;
  return <>{children}</>;
}
