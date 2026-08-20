"use client";

import { FormEvent, useEffect, useState, type ReactNode } from "react";

type Stats = {
  range: string;
  summary: {
    events: number;
    visitors: number;
    todayEvents: number;
    todayVisitors: number;
    weekEvents: number;
    weekVisitors: number;
    monthEvents: number;
    monthVisitors: number;
    getAppClicks: number;
    watchStarts: number;
    seriesClicks: number;
    conversionRate: number;
  };
  daily: { date: string; events: number; visitors: number }[];
  countries: { country: string | null; code: string | null; count: number }[];
  cities: { city: string | null; country: string | null; count: number }[];
  series: { seriesId: string | null; title: string | null; count: number }[];
  types: { type: string; count: number }[];
  paths: { path: string | null; count: number }[];
  devices: { device: string; count: number }[];
  recent: {
    id: string;
    createdAt: string;
    type: string;
    path: string | null;
    seriesTitle: string | null;
    episodeNumber: number | null;
    ip: string | null;
    country: string | null;
    city: string | null;
    device: string | null;
    browser: string | null;
    label: string | null;
  }[];
};

export function AdminDashboard() {
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [adminId, setAdminId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [range, setRange] = useState("7d");
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(false);
  const [loggingIn, setLoggingIn] = useState(false);

  async function loadStats(nextRange = range) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/stats?range=${nextRange}`, {
        cache: "no-store",
      });
      if (res.status === 401) {
        setAuthed(false);
        setStats(null);
        return;
      }
      if (!res.ok) throw new Error("Failed to load stats");
      const data = (await res.json()) as Stats;
      setStats(data);
      setAuthed(true);
    } catch {
      setError("Could not load stats");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function onLogin(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoggingIn(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: adminId.trim(), password }),
      });
      if (!res.ok) {
        setError("Wrong ID or password");
        return;
      }
      setPassword("");
      await loadStats();
    } finally {
      setLoggingIn(false);
    }
  }

  async function onLogout() {
    await fetch("/api/admin/login", { method: "DELETE" });
    setAuthed(false);
    setStats(null);
  }

  if (authed === null) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0b0c0e] text-white/45">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/15 border-t-white/70" />
          <p className="text-sm">Loading…</p>
        </div>
      </div>
    );
  }

  if (!authed) {
    return (
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#0b0c0e] px-4">
        <div className="pointer-events-none absolute inset-0 page-grid opacity-30" />
        <form
          onSubmit={onLogin}
          className="relative w-full max-w-[400px] rounded-2xl border border-white/10 bg-[#12151a]/95 p-7 shadow-[0_24px_80px_rgba(0,0,0,0.55)] backdrop-blur"
        >
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/35">
            Snoozeit
          </p>
          <h1
            className="mt-1.5 text-2xl font-bold text-white"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Admin Console
          </h1>
          <p className="mt-1.5 text-sm text-white/45">
            AnyMe website analytics & activity
          </p>

          <label className="mt-6 block text-[11px] font-medium uppercase tracking-wide text-white/40">
            Admin ID
          </label>
          <input
            type="text"
            value={adminId}
            onChange={(e) => setAdminId(e.target.value)}
            placeholder="Enter admin ID"
            autoComplete="username"
            className="mt-1.5 w-full rounded-xl border border-white/12 bg-black/35 px-3.5 py-3 text-sm text-white outline-none transition focus:border-white/35"
            autoFocus
          />

          <label className="mt-4 block text-[11px] font-medium uppercase tracking-wide text-white/40">
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
            autoComplete="current-password"
            className="mt-1.5 w-full rounded-xl border border-white/12 bg-black/35 px-3.5 py-3 text-sm text-white outline-none transition focus:border-white/35"
          />

          {error && (
            <p className="mt-3 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-300">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loggingIn || !adminId || !password}
            className="mt-5 w-full rounded-xl bg-white py-3 text-sm font-semibold text-black transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {loggingIn ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    );
  }

  const s = stats?.summary;

  return (
    <div className="min-h-screen bg-[#0b0c0e] text-white">
      <div className="pointer-events-none fixed inset-0 page-grid opacity-20" />

      <header className="sticky top-0 z-10 border-b border-white/8 bg-[#0b0c0e]/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3.5 sm:px-5">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/35">
              Snoozeit · AnyMe
            </p>
            <h1
              className="text-lg font-bold sm:text-xl"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Analytics
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex rounded-lg border border-white/10 bg-white/[0.03] p-0.5">
              {(["1d", "7d", "30d", "90d"] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => {
                    setRange(r);
                    void loadStats(r);
                  }}
                  className={`rounded-md px-2.5 py-1.5 text-xs font-medium transition ${
                    range === r
                      ? "bg-white text-black"
                      : "text-white/55 hover:text-white"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => void loadStats()}
              disabled={loading}
              className="rounded-lg border border-white/12 bg-white/[0.04] px-3 py-1.5 text-xs text-white/70 transition hover:bg-white/10 disabled:opacity-50"
            >
              {loading ? "…" : "Refresh"}
            </button>
            <button
              type="button"
              onClick={() => void onLogout()}
              className="rounded-lg border border-white/12 px-3 py-1.5 text-xs text-white/60 transition hover:border-white/25 hover:text-white"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="relative mx-auto max-w-7xl space-y-5 px-4 py-6 sm:px-5">
        {error && (
          <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-300">
            {error}
          </p>
        )}

        {s && (
          <section className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
            <Stat label="Today visitors" value={s.todayVisitors} />
            <Stat label="Today events" value={s.todayEvents} />
            <Stat label="7d visitors" value={s.weekVisitors} />
            <Stat label="30d visitors" value={s.monthVisitors} />
            <Stat label="Watch starts" value={s.watchStarts} />
            <Stat
              label="Get App · conv"
              value={`${s.getAppClicks} · ${s.conversionRate}%`}
            />
          </section>
        )}

        <div className="grid gap-4 lg:grid-cols-2">
          <Panel title="Daily trend">
            <div className="space-y-2">
              {(stats?.daily || []).map((d) => {
                const max = Math.max(
                  ...(stats?.daily || []).map((x) => x.visitors),
                  1,
                );
                return (
                  <div key={d.date} className="flex items-center gap-2.5 text-xs">
                    <span className="w-[4.5rem] shrink-0 tabular-nums text-white/40">
                      {d.date.slice(5)}
                    </span>
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/[0.06]">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-white/35 to-white/70"
                        style={{ width: `${(d.visitors / max) * 100}%` }}
                      />
                    </div>
                    <span className="w-[4.75rem] text-right tabular-nums text-white/65">
                      {d.visitors}v · {d.events}e
                    </span>
                  </div>
                );
              })}
              {!stats?.daily?.length && (
                <Empty>No daily data yet.</Empty>
              )}
            </div>
          </Panel>

          <Panel title="Top series">
            <RankList
              items={(stats?.series || []).map((row) => ({
                label: row.title || row.seriesId || "—",
                count: row.count,
              }))}
            />
          </Panel>

          <Panel title="Countries">
            <RankList
              items={(stats?.countries || []).map((c) => ({
                label: c.country || c.code || "—",
                count: c.count,
              }))}
            />
          </Panel>

          <Panel title="Cities">
            <RankList
              items={(stats?.cities || []).map((c) => ({
                label: [c.city, c.country].filter(Boolean).join(", ") || "—",
                count: c.count,
              }))}
            />
          </Panel>

          <Panel title="Screens / paths">
            <RankList
              items={(stats?.paths || []).map((p) => ({
                label: p.path || "—",
                count: p.count,
              }))}
            />
          </Panel>

          <Panel title="Events & devices">
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <p className="mb-2 text-[10px] uppercase tracking-wide text-white/35">
                  Events
                </p>
                <RankList
                  items={(stats?.types || []).map((t) => ({
                    label: t.type,
                    count: t.count,
                  }))}
                />
              </div>
              <div>
                <p className="mb-2 text-[10px] uppercase tracking-wide text-white/35">
                  Devices
                </p>
                <RankList
                  items={(stats?.devices || []).map((d) => ({
                    label: d.device,
                    count: d.count,
                  }))}
                />
              </div>
            </div>
          </Panel>
        </div>

        <Panel title="Live activity">
          <div className="overflow-x-auto rounded-lg border border-white/[0.06]">
            <table className="w-full min-w-[920px] text-left text-xs">
              <thead>
                <tr className="border-b border-white/10 bg-white/[0.03] text-[10px] uppercase tracking-wide text-white/40">
                  <th className="px-3 py-2.5 font-medium">Time</th>
                  <th className="px-3 py-2.5 font-medium">Event</th>
                  <th className="px-3 py-2.5 font-medium">Path / series</th>
                  <th className="px-3 py-2.5 font-medium">Location</th>
                  <th className="px-3 py-2.5 font-medium">IP</th>
                  <th className="px-3 py-2.5 font-medium">Device</th>
                </tr>
              </thead>
              <tbody>
                {(stats?.recent || []).map((row) => (
                  <tr
                    key={row.id}
                    className="border-b border-white/[0.04] transition hover:bg-white/[0.02]"
                  >
                    <td className="whitespace-nowrap px-3 py-2.5 text-white/45">
                      {new Date(row.createdAt).toLocaleString()}
                    </td>
                    <td className="px-3 py-2.5">
                      <span className="rounded-md bg-white/10 px-1.5 py-0.5 font-medium text-white/85">
                        {row.type}
                      </span>
                    </td>
                    <td className="max-w-[220px] truncate px-3 py-2.5 text-white/70">
                      {row.seriesTitle
                        ? `${row.seriesTitle}${row.episodeNumber ? ` EP ${row.episodeNumber}` : ""}`
                        : row.path || "—"}
                    </td>
                    <td className="px-3 py-2.5 text-white/55">
                      {[row.city, row.country].filter(Boolean).join(", ") || "—"}
                    </td>
                    <td className="px-3 py-2.5 font-mono text-[11px] text-white/45">
                      {row.ip || "—"}
                    </td>
                    <td className="px-3 py-2.5 capitalize text-white/50">
                      {row.device}/{row.browser}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!stats?.recent?.length && (
              <div className="p-4">
                <Empty>No events yet — browse the site first.</Empty>
              </div>
            )}
          </div>
        </Panel>
      </main>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-white/[0.08] bg-[#12151a] p-3.5">
      <p className="text-[10px] font-medium uppercase tracking-wide text-white/40">
        {label}
      </p>
      <p className="mt-1.5 text-xl font-semibold tracking-tight text-white">
        {value}
      </p>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-xl border border-white/[0.08] bg-[#12151a] p-4 sm:p-5">
      <h2 className="mb-3.5 text-sm font-semibold text-white">{title}</h2>
      {children}
    </section>
  );
}

function Empty({ children }: { children: ReactNode }) {
  return <p className="text-sm text-white/40">{children}</p>;
}

function RankList({ items }: { items: { label: string; count: number }[] }) {
  if (!items.length) return <Empty>No data yet.</Empty>;
  const max = Math.max(...items.map((i) => i.count), 1);
  return (
    <ul className="space-y-2.5">
      {items.map((item) => (
        <li key={item.label} className="text-xs">
          <div className="mb-1 flex justify-between gap-2">
            <span className="truncate text-white/75">{item.label}</span>
            <span className="shrink-0 tabular-nums text-white/40">
              {item.count}
            </span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
            <div
              className="h-full rounded-full bg-white/45"
              style={{ width: `${(item.count / max) * 100}%` }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}
