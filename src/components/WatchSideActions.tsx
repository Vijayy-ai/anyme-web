"use client";

import { useAppDownload } from "./AppDownloadProvider";

export function WatchSideActions({
  seriesId,
  episodeId,
}: {
  seriesId: string;
  episodeId: string;
}) {
  const { open } = useAppDownload();

  return (
    <>
      <button
        type="button"
        onClick={() => open({ seriesId, episodeId })}
        className="flex flex-col items-center gap-1 text-[10px] font-medium text-white/80 transition hover:text-white"
      >
        <BookmarkIcon className="h-6 w-6" />
        Save
      </button>
      <button
        type="button"
        onClick={() => open({ seriesId, episodeId })}
        className="flex flex-col items-center gap-1 text-[10px] font-medium text-white/80 transition hover:text-white"
      >
        <CommentIcon className="h-6 w-6" />
        Comment
      </button>
      <button
        type="button"
        onClick={() => open({ seriesId, episodeId })}
        className="flex flex-col items-center gap-1 text-[10px] font-medium text-white/80 transition hover:text-white"
      >
        <ShareIcon className="h-6 w-6" />
        Share
      </button>
    </>
  );
}

function BookmarkIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden
    >
      <path d="M7 3h10a1 1 0 0 1 1 1v17l-6-3.5L6 21V4a1 1 0 0 1 1-1z" />
    </svg>
  );
}

function CommentIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden
    >
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function ShareIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden
    >
      <path d="M22 2L11 13" />
      <path d="M22 2l-7 20-4-9-9-4 20-7z" />
    </svg>
  );
}
