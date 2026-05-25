"use client";

import { useEffect, useState } from "react";
import AdminLayout from "../components/admin-layout";
import { supabase } from "@/lib/supabase";
import {
  DEFAULT_HERO_SLIDER,
  HERO_SLIDER_TOGGLES,
  normalizeHeroSlider,
  normalizeRecentCount,
  normalizeCustomSlides,
  type HeroSliderSettings,
  type CustomHeroSlide,
} from "@/lib/site-settings";

type FeaturedPlayer = { name: string; club: string };

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const [player, setPlayer] = useState<FeaturedPlayer>({ name: "", club: "" });
  const [slider, setSlider] = useState<HeroSliderSettings>({ ...DEFAULT_HERO_SLIDER });
  const [recentCount, setRecentCount] = useState<number>(6);
  const [customSlides, setCustomSlides] = useState<CustomHeroSlide[]>([]);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase.from("site_settings").select("key, value");
      if (error) {
        console.error("Settings fetch error:", error);
        setLoading(false);
        return;
      }
      for (const row of data ?? []) {
        if (row.key === "featured_player") {
          const parsed = typeof row.value === "string" ? (() => { try { return JSON.parse(row.value); } catch { return null; } })() : row.value;
          if (parsed && typeof parsed === "object" && "name" in parsed) setPlayer(parsed as FeaturedPlayer);
        }
        if (row.key === "hero_slider") setSlider(normalizeHeroSlider(row.value));
        if (row.key === "recent_count") setRecentCount(normalizeRecentCount(row.value));
        if (row.key === "hero_custom_slides") setCustomSlides(normalizeCustomSlides(row.value));
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
        supabase.from("site_settings").upsert({ key: "hero_custom_slides", value: customSlides, updated_at: new Date().toISOString() }),
      ]);
      const hasError = results.some((r) => r.error);
      setMessage(hasError ? "Some settings could not be saved." : "Settings saved successfully.");
      results.forEach((r) => r.error && console.error(r.error));
    } catch {
      setMessage("Unexpected error occurred.");
    }
    setSaving(false);
    setTimeout(() => setMessage(""), 4000);
  }

  const promoSlides = (slider.wcPromo ? 1 : 0) + (slider.arena ? 1 : 0);

  return (
    <AdminLayout>
      <div className="mx-auto max-w-2xl">
        <div className="mb-6">
          <h1 className="text-xl font-bold">Site Settings</h1>
          <p className="text-xs text-slate-400">Homepage and general site settings</p>
        </div>

        {loading ? (
          <div className="flex items-center gap-2 py-20 text-sm text-slate-400 justify-center">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-emerald-400 border-t-transparent" />
            Loading...
          </div>
        ) : (
          <div className="space-y-6">
            <section className="rounded-xl border border-slate-800/60 bg-slate-900/30 p-5">
              <h2 className="mb-1 text-sm font-semibold">Featured Player</h2>
              <p className="mb-4 text-[11px] text-slate-500">Player shown on the homepage</p>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-[11px] font-medium text-slate-400">Player Name</label>
                  <input
                    type="text"
                    value={player.name}
                    onChange={(e) => setPlayer({ ...player, name: e.target.value })}
                    placeholder="e.g: Lamine Yamal"
                    className="w-full rounded-lg border border-slate-700/80 bg-slate-800/70 px-3 py-2 text-sm text-slate-100 placeholder-slate-600 outline-none transition focus:border-emerald-500/60"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-[11px] font-medium text-slate-400">Club</label>
                  <input
                    type="text"
                    value={player.club}
                    onChange={(e) => setPlayer({ ...player, club: e.target.value })}
                    placeholder="e.g: FC Barcelona"
                    className="w-full rounded-lg border border-slate-700/80 bg-slate-800/70 px-3 py-2 text-sm text-slate-100 placeholder-slate-600 outline-none transition focus:border-emerald-500/60"
                  />
                </div>
              </div>
            </section>

            <section className="rounded-xl border border-slate-800/60 bg-slate-900/30 p-5">
              <h2 className="mb-1 text-sm font-semibold">Hero Slider</h2>
              <p className="mb-4 text-[11px] text-slate-500">
                Choose which article categories and promo slides appear in the homepage hero.
              </p>
              <div className="flex flex-wrap gap-3">
                {HERO_SLIDER_TOGGLES.map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => setSlider({ ...slider, [item.key]: !slider[item.key] })}
                    className={[
                      "flex items-center gap-2 rounded-lg border px-4 py-2.5 text-xs font-medium transition",
                      slider[item.key]
                        ? "border-emerald-500/40 bg-emerald-500/15 text-emerald-300"
                        : "border-slate-700/60 bg-slate-800/40 text-slate-500",
                    ].join(" ")}
                  >
                    <span className={`h-2 w-2 rounded-full ${slider[item.key] ? "bg-emerald-400" : "bg-slate-600"}`} />
                    {item.label}
                  </button>
                ))}
              </div>
              <p className="mt-3 text-[11px] text-slate-500">
                Hero total ≈ {recentCount} article slide{recentCount === 1 ? "" : "s"}
                {promoSlides > 0 ? ` + ${promoSlides} promo slide${promoSlides === 1 ? "" : "s"}` : ""}
                {promoSlides > 0 ? ` (up to ${recentCount + promoSlides} dots)` : ""}.
              </p>
            </section>

            <section className="rounded-xl border border-slate-800/60 bg-slate-900/30 p-5">
              <h2 className="mb-1 text-sm font-semibold">Hero Banner — Article Slide Count</h2>
              <p className="mb-4 text-[11px] text-slate-500">
                How many <strong>article</strong> slides to show in the big hero banner at the top (does not include promo or custom slides).
              </p>
              <div className="flex gap-2">
                {[3, 5, 7, 9].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setSlider({ ...slider, sliderCount: n })}
                    className={[
                      "rounded-lg border px-5 py-2.5 text-sm font-semibold transition",
                      (slider.sliderCount ?? 5) === n
                        ? "border-emerald-500/40 bg-emerald-500/15 text-emerald-300"
                        : "border-slate-700/60 bg-slate-800/40 text-slate-500 hover:text-slate-300",
                    ].join(" ")}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </section>

            <section className="rounded-xl border border-amber-800/40 bg-slate-900/30 p-5">
              <h2 className="mb-1 text-sm font-semibold text-amber-300">Custom Hero Slides</h2>
              <p className="mb-4 text-[11px] text-slate-500">
                Add custom promotional slides to the homepage hero (e.g. WC Schedule, special pages).
              </p>
              {customSlides.map((slide, idx) => (
                <div key={slide.id} className="mb-4 rounded-lg border border-slate-700/50 bg-slate-800/40 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold text-slate-300">Slide {idx + 1}</span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setCustomSlides(customSlides.map((s, i) => i === idx ? { ...s, enabled: !s.enabled } : s))}
                        className={`text-[10px] rounded px-2 py-1 border ${slide.enabled ? "border-emerald-500/40 bg-emerald-500/15 text-emerald-300" : "border-slate-700 bg-slate-800 text-slate-500"}`}
                      >
                        {slide.enabled ? "ON" : "OFF"}
                      </button>
                      <button
                        type="button"
                        onClick={() => setCustomSlides(customSlides.filter((_, i) => i !== idx))}
                        className="text-[10px] text-rose-400 hover:text-rose-300"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    <div>
                      <label className="mb-1 block text-[10px] font-medium text-slate-500">Title <span className="text-rose-400">*</span></label>
                      <input
                        type="text"
                        value={slide.title}
                        onChange={(e) => setCustomSlides(customSlides.map((s, i) => i === idx ? { ...s, title: e.target.value } : s))}
                        placeholder="World Cup 2026 Match Schedule"
                        className="w-full rounded border border-slate-700/80 bg-slate-800/70 px-2.5 py-1.5 text-xs text-slate-100 placeholder-slate-600 outline-none focus:border-amber-500/60"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-[10px] font-medium text-slate-500">Eyebrow label</label>
                      <input
                        type="text"
                        value={slide.eyebrow}
                        onChange={(e) => setCustomSlides(customSlides.map((s, i) => i === idx ? { ...s, eyebrow: e.target.value } : s))}
                        placeholder="MATCH SCHEDULE"
                        className="w-full rounded border border-slate-700/80 bg-slate-800/70 px-2.5 py-1.5 text-xs text-slate-100 placeholder-slate-600 outline-none focus:border-amber-500/60"
                      />
                    </div>
                  </div>
                  <div className="mb-2">
                    <label className="mb-1 block text-[10px] font-medium text-slate-500">Short description</label>
                    <input
                      type="text"
                      value={slide.teaser}
                      onChange={(e) => setCustomSlides(customSlides.map((s, i) => i === idx ? { ...s, teaser: e.target.value } : s))}
                      placeholder="One sentence about the slide"
                      className="w-full rounded border border-slate-700/80 bg-slate-800/70 px-2.5 py-1.5 text-xs text-slate-100 placeholder-slate-600 outline-none focus:border-amber-500/60"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="mb-1 block text-[10px] font-medium text-slate-500">Page link <span className="text-rose-400">*</span></label>
                      <input
                        type="text"
                        value={slide.href}
                        onChange={(e) => setCustomSlides(customSlides.map((s, i) => i === idx ? { ...s, href: e.target.value } : s))}
                        placeholder="/world-cup-2026/schedule"
                        className={`w-full rounded border px-2.5 py-1.5 text-xs text-slate-100 placeholder-slate-600 outline-none focus:border-amber-500/60 ${slide.href && !slide.href.startsWith("/") ? "border-rose-500/60 bg-rose-900/20" : "border-slate-700/80 bg-slate-800/70"}`}
                      />
                      {slide.href && !slide.href.startsWith("/") && (
                        <p className="mt-1 text-[9px] text-rose-400">Must start with /</p>
                      )}
                    </div>
                    <div>
                      <label className="mb-1 block text-[10px] font-medium text-slate-500">Background image URL</label>
                      <input
                        type="text"
                        value={slide.image ?? ""}
                        onChange={(e) => setCustomSlides(customSlides.map((s, i) => i === idx ? { ...s, image: e.target.value } : s))}
                        placeholder="https://... (optional)"
                        className="w-full rounded border border-slate-700/80 bg-slate-800/70 px-2.5 py-1.5 text-xs text-slate-100 placeholder-slate-600 outline-none focus:border-amber-500/60"
                      />
                    </div>
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={() => setCustomSlides([...customSlides, { id: `custom-${Date.now()}`, title: "", teaser: "", href: "", eyebrow: "", enabled: true }])}
                className="rounded-lg border border-dashed border-amber-500/30 px-4 py-2 text-xs text-amber-400 hover:bg-amber-500/10 transition w-full"
              >
                + Add Custom Slide
              </button>
            </section>

            <section className="rounded-xl border border-slate-800/60 bg-slate-900/30 p-5">
              <h2 className="mb-1 text-sm font-semibold">Below Hero — Latest Content Carousel</h2>
              <p className="mb-4 text-[11px] text-slate-500">
                How many articles to show in the horizontal carousel <strong>below</strong> the hero banner.
              </p>
              <div className="flex gap-2">
                {[3, 6, 9].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setRecentCount(n)}
                    className={[
                      "rounded-lg border px-5 py-2.5 text-sm font-semibold transition",
                      recentCount === n
                        ? "border-emerald-500/40 bg-emerald-500/15 text-emerald-300"
                        : "border-slate-700/60 bg-slate-800/40 text-slate-500 hover:text-slate-300",
                    ].join(" ")}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </section>

            <div className="flex items-center gap-3">
              <button
                onClick={handleSave}
                disabled={saving}
                className="rounded-lg bg-emerald-500 px-6 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:opacity-60"
              >
                {saving ? "Saving..." : "Save Settings"}
              </button>
              {message && (
                <span className={`text-xs ${message.includes("successfully") ? "text-emerald-400" : "text-rose-400"}`}>
                  {message}
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
