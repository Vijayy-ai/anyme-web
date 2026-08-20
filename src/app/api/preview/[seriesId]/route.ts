import { NextRequest, NextResponse } from "next/server";
import { API_BASE } from "@/lib/constants";
import { canPlayOnWeb } from "@/lib/content";
import type { ApiEnvelope, Episode } from "@/lib/types";

export const runtime = "nodejs";

export async function GET(
  _req: NextRequest,
  ctx: { params: Promise<{ seriesId: string }> },
) {
  const { seriesId } = await ctx.params;
  if (!seriesId) {
    return NextResponse.json({ error: "missing_series" }, { status: 400 });
  }

  try {
    const url = new URL(
      `/api/v1/content/optimized/series/${seriesId}/episodes-ultra/`,
      API_BASE,
    );
    url.searchParams.set("page", "1");
    url.searchParams.set("page_size", "10");

    const res = await fetch(url.toString(), {
      headers: { Accept: "application/json" },
      next: { revalidate: 120 },
    });

    const body = (await res.json().catch(() => ({}))) as ApiEnvelope<{
      data: Episode[];
    }>;

    if (!res.ok) {
      return NextResponse.json(
        { error: "episodes_failed" },
        { status: res.status },
      );
    }

    const episodes = body.data?.data ?? [];
    const free = episodes.find(canPlayOnWeb);

    if (!free?.video_url) {
      return NextResponse.json(
        { error: "no_preview", app_required: true },
        { status: 404 },
      );
    }

    return NextResponse.json({
      episodeId: free.id,
      title: free.title,
      episodeNumber: free.episode_number,
      playbackUrl: `/api/playback?key=${encodeURIComponent(free.video_url)}`,
    });
  } catch {
    return NextResponse.json({ error: "preview_failed" }, { status: 500 });
  }
}
