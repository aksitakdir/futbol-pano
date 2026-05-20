"use client";

import { useState, useCallback } from "react";
import AdminLayout from "../components/admin-layout";
import { supabase } from "@/lib/supabase";

type ApiStatus = { name: string; status: "checking" | "active" | "error" | "idle"; message: string; details?: string; lastChecked?: string; };

const INITIAL: ApiStatus[] = [
  { name: "API-Football", status: "idle", message: "Not checked yet" },
  { name: "YouTube API", status: "idle", message: "Not checked yet" },
  { name: "Supabase", status: "idle", message: "Not checked yet" },
  { name: "Google News RSS", status: "idle", message: "Not checked yet" },
];

const STATUS_STYLE: Record<string, { dot: string; text: string; label: string }> = {
  active: { dot: "bg-emerald-400", text: "text-emerald-300", label: "Active" },
  error: { dot: "bg-rose-400", text: "text-rose-300", label: "Error" },
  checking: { dot: "bg-amber-400 animate-pulse", text: "text-amber-300", label: "Checking..." },
  idle: { dot: "bg-slate-500", text: "text-slate-400", label: "Idle" },
};

export default function ApiStatusPage() {
  const [apis, setApis] = useState<ApiStatus[]>(INITIAL);

  const updateApi = useCallback((name: string, update: Partial<ApiStatus>) => {
    setApis((prev) => prev.map((a) => (a.name === name ? { ...a, ...update } : a)));
  }, []);

  async function checkFootball() {
    updateApi("API-Football", { status: "checking", message: "Checking..." });
    try {
      const res = await fetch("/api/players");
      const data = await res.json();
      if (res.ok && data.players) {
        updateApi("API-Football", { status: "active", message: `${data.count} players fetched successfully`, details: `League: ${data.league} · Season: ${data.season} · Daily limit: 100 requests`, lastChecked: new Date().toLocaleTimeString("en-US") });
      } else {
        updateApi("API-Football", { status: "error", message: data.error || "Connection error", details: data.details, lastChecked: new Date().toLocaleTimeString("en-US") });
      }
    } catch { updateApi("API-Football", { status: "error", message: "Network error — server unreachable", lastChecked: new Date().toLocaleTimeString("en-US") }); }
  }

  async function checkYouTube() {
    updateApi("YouTube API", { status: "checking", message: "Checking..." });
    try {
      const res = await fetch("/api/youtube?query=football+highlights");
      const data = await res.json();
      if (res.ok && Array.isArray(data) && data.length > 0) {
        updateApi("YouTube API", { status: "active", message: `Test query successful — ${data.length} videos returned`, details: "Daily quota: 10,000 units", lastChecked: new Date().toLocaleTimeString("en-US") });
      } else {
        updateApi("YouTube API", { status: "error", message: data.error || "No videos found", details: data.details, lastChecked: new Date().toLocaleTimeString("en-US") });
      }
    } catch { updateApi("YouTube API", { status: "error", message: "Network error", lastChecked: new Date().toLocaleTimeString("en-US") }); }
  }

  async function checkSupabase() {
    updateApi("Supabase", { status: "checking", message: "Checking..." });
    try {
      const { count, error } = await supabase.from("contents").select("*", { count: "exact", head: true });
      if (error) {
        updateApi("Supabase", { status: "error", message: error.message, lastChecked: new Date().toLocaleTimeString("en-US") });
      } else {
        updateApi("Supabase", { status: "active", message: `Connected — ${count ?? 0} records`, details: "contents table accessible", lastChecked: new Date().toLocaleTimeString("en-US") });
      }
    } catch { updateApi("Supabase", { status: "error", message: "Connection failed", lastChecked: new Date().toLocaleTimeString("en-US") }); }
  }

  async function checkNews() {
    updateApi("Google News RSS", { status: "checking", message: "Checking..." });
    try {
      const res = await fetch("/api/news?query=football");
      const data = await res.json();
      if (res.ok && Array.isArray(data) && data.length > 0) {
        updateApi("Google News RSS", { status: "active", message: `Test query successful — ${data.length} articles returned`, details: "RSS feed accessible", lastChecked: new Date().toLocaleTimeString("en-US") });
      } else {
        updateApi("Google News RSS", { status: "error", message: data.error || "No articles found", lastChecked: new Date().toLocaleTimeString("en-US") });
      }
    } catch { updateApi("Google News RSS", { status: "error", message: "Network error", lastChecked: new Date().toLocaleTimeString("en-US") }); }
  }

  const checkers: Record<string, () => Promise<void>> = {
    "API-Football": checkFootball, "YouTube API": checkYouTube, Supabase: checkSupabase, "Google News RSS": checkNews,
  };

  return (
    <AdminLayout>
      <div className="mx-auto max-w-3xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">API Status</h1>
            <p className="text-xs text-slate-400">Check connection status of external services</p>
          </div>
          <button onClick={() => Promise.allSettled([checkFootball(), checkYouTube(), checkSupabase(), checkNews()])}
            className="rounded-lg bg-emerald-500 px-4 py-2 text-xs font-semibold text-slate-950 transition hover:bg-emerald-400">
            Check All
          </button>
        </div>

        <div className="space-y-3">
          {apis.map((api) => {
            const s = STATUS_STYLE[api.status];
            return (
              <div key={api.name} className="rounded-xl border border-slate-800/60 bg-slate-900/30 p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2.5">
                      <span className={`h-2.5 w-2.5 rounded-full ${s.dot}`} />
                      <h3 className="text-sm font-semibold">{api.name}</h3>
                      <span className={`text-[11px] font-medium ${s.text}`}>{s.label}</span>
                    </div>
                    <p className="mt-1.5 text-xs text-slate-400">{api.message}</p>
                    {api.details && <p className="mt-1 text-[11px] text-slate-500">{api.details}</p>}
                    {api.lastChecked && <p className="mt-1 text-[10px] text-slate-600">Last checked: {api.lastChecked}</p>}
                  </div>
                  <button onClick={() => checkers[api.name]?.()} disabled={api.status === "checking"}
                    className="shrink-0 rounded-lg border border-slate-700/60 px-3 py-1.5 text-[11px] font-medium text-slate-400 transition hover:border-slate-600 hover:text-slate-200 disabled:opacity-50">
                    {api.status === "checking" ? (
                      <span className="flex items-center gap-1.5"><span className="h-3 w-3 animate-spin rounded-full border-2 border-amber-400 border-t-transparent" />Checking</span>
                    ) : "Refresh"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 rounded-xl border border-slate-800/60 bg-slate-900/30 p-5">
          <h3 className="mb-3 text-sm font-semibold">API Limits Summary</h3>
          <div className="space-y-2 text-xs text-slate-400">
            <div className="flex items-center justify-between"><span>API-Football</span><span className="text-slate-500">100 req/day (free plan)</span></div>
            <div className="flex items-center justify-between"><span>YouTube Data API v3</span><span className="text-slate-500">10,000 units/day</span></div>
            <div className="flex items-center justify-between"><span>Supabase</span><span className="text-slate-500">Unlimited (within free plan bandwidth)</span></div>
            <div className="flex items-center justify-between"><span>Google News RSS</span><span className="text-slate-500">Unlimited (public RSS feed)</span></div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
