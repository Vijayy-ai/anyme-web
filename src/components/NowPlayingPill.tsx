"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

export type NowPlayingData = {
  seriesId: string;
  episodeId: string;
  title: string;
  episodeNumber: number;
  poster?: string | null;
};

const STORAGE_KEY = "anyme:now-playing";
const EVENT = "anyme:now-playing";

export function setNowPlaying(data: NowPlayingData) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    window.dispatchEvent(new Event(EVENT));
  } catch {
    // ignore
  }
}

export function SetNowPlaying(props: NowPlayingData) {
  useEffect(() => {
    setNowPlaying(props);
  }, [
    props.seriesId,
    props.episodeId,
    props.title,
    props.episodeNumber,
    props.poster,
  ]);
  return null;
}

export function NowPlayingPill() {
  const [data, setData] = useState<NowPlayingData | null>(null);

  useEffect(() => {
    function read() {
      try {
        const raw = sessionStorage.getItem(STORAGE_KEY);
        if (!raw) {
          setData(null);
          return;
        }
        setData(JSON.parse(raw) as NowPlayingData);
      } catch {
        setData(null);
      }
    }
    read();
    window.addEventListener(EVENT, read);
    window.addEventListener("storage", read);
    return () => {
      window.removeEventListener(EVENT, read);
      window.removeEventListener("storage", read);
    };
  }, []);

  if (!data) return null;

  return (
    <Link
      href={`/watch/${data.seriesId}/${data.episodeId}`}
      className="group hidden h-9 items-center gap-2.5 rounded-md bg-[#191c1e] pl-1.5 pr-3 transition-colors hover:bg-[#1e2224] lg:flex"
    >
      <span className="relative h-[26px] w-[18px] shrink-0 overflow-hidden rounded-[3px] bg-white/10">
        {data.poster ? (
          <Image
            src={data.poster}
            alt=""
            fill
            sizes="18px"
            className="object-cover"
          />
        ) : null}
      </span>
      <span className="max-w-[130px] truncate text-[12px] font-medium text-white/85">
        {data.title}{" "}
        <span className="text-white/45">EP {data.episodeNumber}</span>
      </span>
      <PlayIcon className="h-3 w-3 shrink-0 text-white/55 transition group-hover:text-white" />
    </Link>
  );
}

function PlayIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}
