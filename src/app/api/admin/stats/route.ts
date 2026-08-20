import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthed } from "@/lib/admin-auth";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";

function startOfDay(d = new Date()) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function daysAgo(n: number) {
  const x = startOfDay();
  x.setDate(x.getDate() - n);
  return x;
}

export async function GET(req: NextRequest) {
  if (!(await isAdminAuthed())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const range = req.nextUrl.searchParams.get("range") || "7d";
  const since =
    range === "1d"
      ? daysAgo(0)
      : range === "30d"
        ? daysAgo(29)
        : range === "90d"
          ? daysAgo(89)
          : daysAgo(6);

  const today = startOfDay();
  const week = daysAgo(6);
  const month = daysAgo(29);

  const [
    totalEvents,
    todayEvents,
    weekEvents,
    monthEvents,
    uniqueVisitors,
    todayVisitors,
    weekVisitors,
    monthVisitors,
    byCountry,
    byCity,
    bySeries,
    byType,
    byPath,
    byDevice,
    recent,
    dailyRaw,
  ] = await Promise.all([
    prisma.analyticsEvent.count({ where: { createdAt: { gte: since } } }),
    prisma.analyticsEvent.count({ where: { createdAt: { gte: today } } }),
    prisma.analyticsEvent.count({ where: { createdAt: { gte: week } } }),
    prisma.analyticsEvent.count({ where: { createdAt: { gte: month } } }),
    prisma.analyticsEvent.groupBy({
      by: ["visitorId"],
      where: { createdAt: { gte: since }, visitorId: { not: null } },
    }),
    prisma.analyticsEvent.groupBy({
      by: ["visitorId"],
      where: { createdAt: { gte: today }, visitorId: { not: null } },
    }),
    prisma.analyticsEvent.groupBy({
      by: ["visitorId"],
      where: { createdAt: { gte: week }, visitorId: { not: null } },
    }),
    prisma.analyticsEvent.groupBy({
      by: ["visitorId"],
      where: { createdAt: { gte: month }, visitorId: { not: null } },
    }),
    prisma.analyticsEvent.groupBy({
      by: ["country", "countryCode"],
      where: { createdAt: { gte: since }, countryCode: { not: null } },
      _count: { _all: true },
      orderBy: { _count: { countryCode: "desc" } },
      take: 20,
    }),
    prisma.analyticsEvent.groupBy({
      by: ["city", "country"],
      where: { createdAt: { gte: since }, city: { not: null } },
      _count: { _all: true },
      orderBy: { _count: { city: "desc" } },
      take: 20,
    }),
    prisma.analyticsEvent.groupBy({
      by: ["seriesId", "seriesTitle"],
      where: {
        createdAt: { gte: since },
        seriesId: { not: null },
        type: { in: ["series_click", "watch_start", "page_view"] },
      },
      _count: { _all: true },
      orderBy: { _count: { seriesId: "desc" } },
      take: 25,
    }),
    prisma.analyticsEvent.groupBy({
      by: ["type"],
      where: { createdAt: { gte: since } },
      _count: { _all: true },
      orderBy: { _count: { type: "desc" } },
    }),
    prisma.analyticsEvent.groupBy({
      by: ["path"],
      where: { createdAt: { gte: since }, path: { not: null } },
      _count: { _all: true },
      orderBy: { _count: { path: "desc" } },
      take: 20,
    }),
    prisma.analyticsEvent.groupBy({
      by: ["device"],
      where: { createdAt: { gte: since } },
      _count: { _all: true },
      orderBy: { _count: { device: "desc" } },
    }),
    prisma.analyticsEvent.findMany({
      where: { createdAt: { gte: since } },
      orderBy: { createdAt: "desc" },
      take: 80,
      select: {
        id: true,
        createdAt: true,
        type: true,
        path: true,
        seriesTitle: true,
        seriesId: true,
        episodeNumber: true,
        ip: true,
        country: true,
        city: true,
        device: true,
        browser: true,
        label: true,
      },
    }),
    prisma.analyticsEvent.findMany({
      where: { createdAt: { gte: since } },
      select: { createdAt: true, visitorId: true },
    }),
  ]);

  // Daily buckets
  const dailyMap = new Map<string, { events: number; visitors: Set<string> }>();
  for (const row of dailyRaw) {
    const key = row.createdAt.toISOString().slice(0, 10);
    let bucket = dailyMap.get(key);
    if (!bucket) {
      bucket = { events: 0, visitors: new Set() };
      dailyMap.set(key, bucket);
    }
    bucket.events += 1;
    if (row.visitorId) bucket.visitors.add(row.visitorId);
  }
  const daily = [...dailyMap.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, v]) => ({
      date,
      events: v.events,
      visitors: v.visitors.size,
    }));

  const getApp = byType.find((t) => t.type === "get_app_click")?._count._all ?? 0;
  const watchStarts =
    byType.find((t) => t.type === "watch_start")?._count._all ?? 0;
  const seriesClicks =
    byType.find((t) => t.type === "series_click")?._count._all ?? 0;

  return NextResponse.json({
    range,
    since: since.toISOString(),
    summary: {
      events: totalEvents,
      visitors: uniqueVisitors.length,
      todayEvents,
      todayVisitors: todayVisitors.length,
      weekEvents,
      weekVisitors: weekVisitors.length,
      monthEvents,
      monthVisitors: monthVisitors.length,
      getAppClicks: getApp,
      watchStarts,
      seriesClicks,
      conversionRate:
        uniqueVisitors.length > 0
          ? Math.round((getApp / uniqueVisitors.length) * 1000) / 10
          : 0,
    },
    daily,
    countries: byCountry.map((c) => ({
      country: c.country || c.countryCode,
      code: c.countryCode,
      count: c._count._all,
    })),
    cities: byCity.map((c) => ({
      city: c.city,
      country: c.country,
      count: c._count._all,
    })),
    series: bySeries.map((s) => ({
      seriesId: s.seriesId,
      title: s.seriesTitle || s.seriesId,
      count: s._count._all,
    })),
    types: byType.map((t) => ({ type: t.type, count: t._count._all })),
    paths: byPath.map((p) => ({ path: p.path, count: p._count._all })),
    devices: byDevice.map((d) => ({
      device: d.device || "unknown",
      count: d._count._all,
    })),
    recent,
  });
}
