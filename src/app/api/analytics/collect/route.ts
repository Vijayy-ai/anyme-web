import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { deviceFromUa, getClientIp, resolveGeo } from "@/lib/geo";

export const runtime = "nodejs";

type Body = {
  type?: string;
  path?: string;
  referrer?: string;
  seriesId?: string;
  seriesTitle?: string;
  episodeId?: string;
  episodeNumber?: number;
  label?: string;
  visitorId?: string;
  sessionId?: string;
  meta?: Record<string, unknown>;
};

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json().catch(() => ({}))) as Body;
    const type = (body.type || "").trim().slice(0, 64);
    if (!type) {
      return NextResponse.json({ ok: false, error: "type_required" }, { status: 400 });
    }

    const ip = getClientIp(req.headers);
    const ua = req.headers.get("user-agent");
    const { device, browser } = deviceFromUa(ua);
    const geo = await resolveGeo(req.headers, ip);

    await prisma.analyticsEvent.create({
      data: {
        type,
        path: body.path?.slice(0, 500) || null,
        referrer: body.referrer?.slice(0, 500) || null,
        seriesId: body.seriesId?.slice(0, 80) || null,
        seriesTitle: body.seriesTitle?.slice(0, 200) || null,
        episodeId: body.episodeId?.slice(0, 80) || null,
        episodeNumber:
          typeof body.episodeNumber === "number" ? body.episodeNumber : null,
        label: body.label?.slice(0, 200) || null,
        sessionId: body.sessionId?.slice(0, 80) || null,
        visitorId: body.visitorId?.slice(0, 80) || null,
        ip: geo.ip,
        country: geo.country,
        countryCode: geo.countryCode,
        city: geo.city,
        region: geo.region,
        userAgent: ua?.slice(0, 500) || null,
        device,
        browser,
        meta: body.meta ? JSON.stringify(body.meta).slice(0, 2000) : null,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[analytics/collect]", e);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
