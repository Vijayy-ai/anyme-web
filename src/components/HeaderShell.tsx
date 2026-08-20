"use client";

import { usePathname } from "next/navigation";

export function HeaderShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname?.startsWith("/snoozeit")) return null;
  return <>{children}</>;
}
