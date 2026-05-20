"use client";

import { useEffect, useState } from "react";
import AdminLayout from "../components/admin-layout";
import { supabase } from "@/lib/supabase";

type FeaturedPlayer = { name: string; club: string };
type HeroSlider = { radar: boolean; listeler: boolean; "taktik-lab": boolean };
type RecentCount = { count: number };

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const [player, setPlayer] = useState<FeaturedPlayer>({ name: "", club: "" });
  const [slider, setSlider] = useState<HeroSlider>({ radar: true, listeler: true, "taktik-lab": true });
  const [recentCount, setRecentCount] = useState<number>(6);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase.from("site_settings").select("key, value");
      if (error) { console.error("Settings fetch error:", error); setLoading(false); return; }
      for (const row of data ?? []) {
        if (row.key === "featured_player") setPlayer(row.value as FeaturedPlayer);
        if (row.key === "hero_slider") setSlider(row.value as HeroSlider);
        if (row.key === "recent_count") setRecentCount((row.value as RecentCount).count ?? 6);
      }
      setLoading(false);
    })();
  }, []);

  async function handleSave() {
    setSaving(true);
    setMessage("");
    try {
      const results = await Promise.all([
        supabase.from("site_settings").upsert({ key: "featured_player", value: player, updated_at: new Date().toISOString() }),
        supabase.from("site_settings").upsert({ key: "hero_slider", value: slider, updated_at: new Date().toISOString() }),
        supabase.from("site_settings").upsert({ key: "recent_count", value: { count: recentCount }, updated_at: new Date().toISOString() }),
      ]);
      const hasError = results.some((r) => r.error);
      setMessage(hasError ? "Some settings could not be saved." : "Settings saved successfully.");
      results.forEach((r) => r.error && console.error(r.error));
    } catch { setMessage("Unexpected error occurred."); }
    setSaving(false);
    setTimeout(() => setMessage(""), 4000);
  }

  const SLIDER_ITEMS: { key: keyof HeroSlider; label: string }[] = [
    { key: "radar", label: "Radar" },
    { key: "listeler", label: "Lists" },
    { key: "taktik-lab", label: "Tactics Lab" },
  ];

  return (
    <AdminLayout>
      <div className="mx-auto max-w-2xl">
        <div className="mb-6">
          <h1 className="text-xl font-bold">Site Settings</h1>
          <p className="text-xs text-slate-400">Homepage and general site settings</p>
        </div>

        {loading ? (
          <div className="flex items-center gap-2 py-20 text-sm text-slate-400 justify-center">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-emerald-400 border-t-transparent" />Loading...
          </div>
        ) : (
          <div className="space-y-6">
            <section className="rounded-xl border border-slate-800/60 bg-slate-900/30 p-5">
              <h2 className="mb-1 text-sm font-semibold">Featured Player</h2>
              <p className="mb-4 text-[11px] text-slate-500">Player shown on the homepage</p>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-[11px] font-medium text-slate-400">Player Name</label>
                  <input type="text" value={player.name} onChange={(e) => setPlayer({ ...player, name: e.target.value })}
                    placeholder="e.g: Lamine Yamal"
                    className="w-full rounded-lg border border-slate-700/80 bg-slate-800/70 px-3 py-2 text-sm text-slate-100 placeholder-slate-600 outline-none transition focus:border-emerald-500/60" />
                </div>
                <div>
                  <label className="mb-1 block text-[11px] font-medium text-slate-400">Club</label>
                  <input type="text" value={player.club} onChange={(e) => setPlayer({ ...player, club: e.target.value })}
                    placeholder="e.g: FC Barcelona"
                    className="w-full rounded-lg border border-slate-700/80 bg-slate-800/70 px-3 py-2 text-sm text-slate-100 placeholder-slate-600 outline-none transition focus:border-emerald-500/60" />
                </div>
              </div>
            </section>

            <section className="rounded-xl border border-slate-800/60 bg-slate-900/30 p-5">
              <h2 className="mb-1 text-sm font-semibold">Hero Slider Categories</h2>
              <p className="mb-4 text-[11px] text-slate-500">Which categories appear in the homepage slider</p>
              <div className="flex flex-wrap gap-3">
                {SLIDER_ITEMS.map((item) => (
                  <button key={item.key} onClick={() => setSlider({ ...slider, [item.key]: !slider[item.key] })}
                    className={["flex items-center gap-2 rounded-lg border px-4 py-2.5 text-xs font-medium transition",
                      slider[item.key] ? "border-emerald-500/40 bg-emerald-500/15 text-emerald-300" : "border-slate-700/60 bg-slate-800/40 text-slate-500"].join(" ")}>
                    <span className={`h-2 w-2 rounded-full ${slider[item.key] ? "bg-emerald-400" : "bg-slate-600"}`} />
                    {item.label}
                  </button>
                ))}
              </div>
            </section>

            <section className="rounded-xl border border-slate-800/60 bg-slate-900/30 p-5">
              <h2 className="mb-1 text-sm font-semibold">Recent Articles Count</h2>
              <p className="mb-4 text-[11px] text-slate-500">How many recent articles to show on homepage</p>
              <div className="flex gap-2">
                {[3, 6, 9].map((n) => (
                  <button key={n} onClick={() => setRecentCount(n)}
                    className={["rounded-lg border px-5 py-2.5 text-sm font-semibold transition",
                      recentCount === n ? "border-emerald-500/40 bg-emerald-500/15 text-emerald-300" : "border-slate-700/60 bg-slate-800/40 text-slate-500 hover:text-slate-300"].join(" ")}>
                    {n}
                  </button>
                ))}
              </div>
            </section>

            <div className="flex items-center gap-3">
              <button onClick={handleSave} disabled={saving}
                className="rounded-lg bg-emerald-500 px-6 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:opacity-60">
                {saving ? "Saving..." : "Save Settings"}
              </button>
              {message && <span className={`text-xs ${message.includes("successfully") ? "text-emerald-400" : "text-rose-400"}`}>{message}</span>}
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
