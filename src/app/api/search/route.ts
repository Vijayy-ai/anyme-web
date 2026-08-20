import { NextRequest, NextResponse } from "next/server";
import { API_BASE } from "@/lib/constants";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim() ?? "";
  if (!q) {
    return NextResponse.json({ success: true, data: [] }, { status: 200 });
  }

  const page = req.nextUrl.searchParams.get("page") ?? "1";
  const pageSize =
    req.nextUrl.searchParams.get("page_size") ??
    req.nextUrl.searchParams.get("pageSize") ??
    "20";

  const upstream = new URL(
    "/api/v1/content/optimized/series/search/",
    API_BASE,
  );
  upstream.searchParams.set("q", q);
  upstream.searchParams.set("page", page);
  upstream.searchParams.set("page_size", pageSize);

  try {
    const res = await fetch(upstream.toString(), {
      headers: { Accept: "application/json" },
      cache: "no-store",
    });
    const body = (await res.json().catch(() => ({}))) as {
      data?:
        | unknown[]
        | { results?: unknown[]; data?: unknown[] };
    };

    const raw = body.data;
    const results = Array.isArray(raw)
      ? raw
      : (raw?.results ?? raw?.data ?? []);

    // Normalize so the browser always gets a flat array under `data`
    return NextResponse.json(
      { success: res.ok, data: results },
      { status: res.status },
    );
  } catch {
    return NextResponse.json(
      { success: false, message: "Search unavailable", data: [] },
      { status: 502 },
    );
  }
}
