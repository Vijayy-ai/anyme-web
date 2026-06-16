import Link from "next/link";
import { APP_LINKS } from "@/lib/constants";

type Size = "sm" | "md" | "lg";

const sizeClasses: Record<Size, string> = {
  sm: "h-9 gap-2 px-3 text-xs",
  md: "h-11 gap-2.5 px-4 text-sm",
  lg: "h-14 gap-3 px-5 text-base",
};

const iconSizes: Record<Size, string> = {
  sm: "h-4 w-4",
  md: "h-5 w-5",
  lg: "h-6 w-6",
};

export function AppStoreButtons({
  size = "md",
  className = "",
}: {
  size?: Size;
  className?: string;
}) {
  const base =
    "store-btn-shine inline-flex items-center justify-center font-medium text-anyme-silver-light";

  return (
    <div
      className={`flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center ${className}`}
    >
      <span className="store-btn-shine-wrap">
        <Link
          href={APP_LINKS.android}
          target="_blank"
          rel="noopener noreferrer"
          className={`${base} w-full sm:w-auto ${sizeClasses[size]}`}
        >
          <PlayStoreIcon className={iconSizes[size]} />
          <span>
            <span className="block text-[10px] leading-none text-anyme-silver-mid">
              GET IT ON
            </span>
            Google Play
          </span>
        </Link>
      </span>
      <span className="store-btn-shine-wrap">
        <Link
          href={APP_LINKS.ios}
          target="_blank"
          rel="noopener noreferrer"
          className={`${base} w-full sm:w-auto ${sizeClasses[size]}`}
        >
          <AppleIcon className={iconSizes[size]} />
          <span>
            <span className="block text-[10px] leading-none text-anyme-silver-mid">
              Download on the
            </span>
            App Store
          </span>
        </Link>
      </span>
    </div>
  );
}

function PlayStoreIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M3.609 1.814L13.792 12 3.61 22.186a1.003 1.003 0 0 1-.527-.92V2.734a1 1 0 0 1 .526-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-3.198l2.807 1.626a1 1 0 0 1 0 1.73l-2.808 1.626L15.206 12l2.492-2.491zM5.864 2.658L16.802 8.99l-2.303 2.303-8.635-8.635z" />
    </svg>
  );
}

function AppleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
    </svg>
  );
}
