"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { DeepLinkTarget } from "@/lib/deep-link";

type AppDownloadContextValue = {
  open: (target?: DeepLinkTarget) => void;
  close: () => void;
  isOpen: boolean;
  target: DeepLinkTarget;
};

const AppDownloadContext = createContext<AppDownloadContextValue | null>(null);

export function AppDownloadProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [target, setTarget] = useState<DeepLinkTarget>({});

  const open = useCallback((next: DeepLinkTarget = {}) => {
    setTarget(next);
    setIsOpen(true);
  }, []);

  const close = useCallback(() => setIsOpen(false), []);

  const value = useMemo(
    () => ({ open, close, isOpen, target }),
    [open, close, isOpen, target],
  );

  return (
    <AppDownloadContext.Provider value={value}>
      {children}
    </AppDownloadContext.Provider>
  );
}

export function useAppDownload() {
  const ctx = useContext(AppDownloadContext);
  if (!ctx) {
    throw new Error("useAppDownload must be used within AppDownloadProvider");
  }
  return ctx;
}
