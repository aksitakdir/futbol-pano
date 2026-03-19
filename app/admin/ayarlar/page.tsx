"use client";

import { useEffect, useState } from "react";
import AdminLayout from "../components/admin-layout";
import { supabase } from "@/lib/supabase";

type FeaturedPlayer = { name: string; club: string };
type HeroSlider = { radar: boolean; listeler: boolean; "taktik-lab": boolean };
type RecentCount = { count: number };

export default function AyarlarPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const [player, setPlayer] = useState<FeaturedPlayer>({ name: "", club: "" });
  const [slider, setSlider] = useState<HeroSlider>({ radar: true, listeler: true, "taktik-lab": true });
  const [recentCount, setRecentCount] = useState<number>(6);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase.from("site_settings").select("key, value");
      if (error) {
        console.error("Settings fetch error:", error);
        setLoading(false);
        return;
      }
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
      const updates = [
        supabase.from("site_settings").upsert({ key: "featured_player", value: player, updated_at: new Date().toISOString() }),
        supabase.from("site_settings").upsert({ key: "hero_slider", value: slider, updated_at: new Date().toISOString() }),
        supabase.from("site_settings").upsert({ key: "recent_count", value: { count: recentCount }, updated_at: new Date().toISOString() }),
      ];
      const results = await Promise.all(updates);
      const hasError = results.some((r) => r.error);
      if (hasError) {
        setMessage("Bazı ayarlar kaydedilemedi. Konsolu kontrol edin.");
        results.forEach((r) => r.error && console.error(r.error));
      } else {
        setMessage("Tüm ayarlar başarıyla kaydedildi.");
      }
    } catch {
      setMessage("Beklenmeyen bir hata oluştu.");
    }
    setSaving(false);
    setTimeout(() => setMessage(""), 4000);
  }

  const SLIDER_ITEMS: { key: keyof HeroSlider; label: string }[] = [
    { key: "radar", label: "Radar" },
    { key: "listeler", label: "Listeler" },
    { key: "taktik-lab", label: "Taktik Lab" },
  ];

  const RECENT_OPTIONS = [3, 6, 9];

  return (
    <AdminLayout>
      <div className="mx-auto max-w-2xl">
        <div className="mb-6">
          <h1 className="text-xl font-bold">Site Ayarları</h1>
          <p className="text-xs text-slate-400">Ana sayfa ve genel site ayarlarını düzenle</p>
        </div>

        {loading ? (
          <div className="flex items-center gap-2 py-20 text-sm text-slate-400 justify-center">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-emerald-400 border-t-transparent" />
            Yükleniyor...
          </div>
        ) : (
          <div className="space-y-6">
            {/* Featured Player */}
            <section className="rounded-xl border border-slate-800/60 bg-slate-900/30 p-5">
              <h2 className="mb-1 text-sm font-semibold">Öne Çıkan Oyuncu</h2>
              <p className="mb-4 text-[11px] text-slate-500">Ana sayfada gösterilecek oyuncunun bilgileri</p>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-[11px] font-medium text-slate-400">Oyuncu Adı</label>
                  <input
                    type="text"
                    value={player.name}
                    onChange={(e) => setPlayer({ ...player, name: e.target.value })}
                    placeholder="Ör: Lamine Yamal"
                    className="w-full rounded-lg border border-slate-700/80 bg-slate-800/70 px-3 py-2 text-sm text-slate-100 placeholder-slate-600 outline-none transition focus:border-emerald-500/60"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-[11px] font-medium text-slate-400">Kulüp</label>
                  <input
                    type="text"
                    value={player.club}
                    onChange={(e) => setPlayer({ ...player, club: e.target.value })}
                    placeholder="Ör: FC Barcelona"
                    className="w-full rounded-lg border border-slate-700/80 bg-slate-800/70 px-3 py-2 text-sm text-slate-100 placeholder-slate-600 outline-none transition focus:border-emerald-500/60"
                  />
                </div>
              </div>
            </section>

            {/* Hero Slider */}
            <section className="rounded-xl border border-slate-800/60 bg-slate-900/30 p-5">
              <h2 className="mb-1 text-sm font-semibold">Hero Slider Kategorileri</h2>
              <p className="mb-4 text-[11px] text-slate-500">Ana sayfadaki slider&apos;da hangi kategoriler görünsün</p>
              <div className="flex flex-wrap gap-3">
                {SLIDER_ITEMS.map((item) => (
                  <button
                    key={item.key}
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
            </section>

            {/* Recent Count */}
            <section className="rounded-xl border border-slate-800/60 bg-slate-900/30 p-5">
              <h2 className="mb-1 text-sm font-semibold">Son Eklenenler Sayısı</h2>
              <p className="mb-4 text-[11px] text-slate-500">Ana sayfada kaç içerik gösterilsin</p>
              <div className="flex gap-2">
                {RECENT_OPTIONS.map((n) => (
                  <button
                    key={n}
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

            {/* Save */}
            <div className="flex items-center gap-3">
              <button
                onClick={handleSave}
                disabled={saving}
                className="rounded-lg bg-emerald-500 px-6 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:opacity-60"
              >
                {saving ? "Kaydediliyor..." : "Ayarları Kaydet"}
              </button>
              {message && (
                <span className={`text-xs ${message.includes("başarı") ? "text-emerald-400" : "text-rose-400"}`}>
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
