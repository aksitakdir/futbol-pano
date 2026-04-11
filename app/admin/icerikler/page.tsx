"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import AdminLayout from "../components/admin-layout";
import { stripHtml } from "@/lib/utils";

function contentPreviewSnippet(raw: string, maxLen = 180): string {
  const text = stripHtml(raw ?? "").replace(/\s+/g, " ").trim();
  if (!text) return "";
  return text.length > maxLen ? `${text.slice(0, maxLen)}…` : text;
}

type ContentRow = {
  id: string;
  title: string;
  slug: string;
  category: string;
  content: string;
  status: string;
  created_at: string;
};

type Tab = "all" | "bekliyor" | "yayinda" | "reddedildi";

const TABS: { key: Tab; label: string }[] = [
  { key: "all", label: "Tümü" },
  { key: "bekliyor", label: "Bekleyenler" },
  { key: "yayinda", label: "Yayında" },
  { key: "reddedildi", label: "Reddedilenler" },
];

const CATEGORY_LABEL: Record<string, string> = {
  listeler: "Listeler",
  radar: "Radar",
  "taktik-lab": "Taktik Lab",
};

const CATEGORY_COLOR: Record<string, string> = {
  listeler: "bg-sky-500/15 text-sky-300 border-sky-500/40",
  radar: "bg-emerald-500/15 text-emerald-300 border-emerald-500/40",
  "taktik-lab": "bg-violet-500/15 text-violet-300 border-violet-500/40",
};

const STATUS_CONFIG: Record<string, { label: string; cls: string }> = {
  bekliyor: { label: "Bekliyor", cls: "bg-amber-500/15 text-amber-300 border-amber-500/40" },
  yayinda: { label: "Yayında", cls: "bg-emerald-500/15 text-emerald-300 border-emerald-500/40" },
  reddedildi: { label: "Reddedildi", cls: "bg-rose-500/15 text-rose-300 border-rose-500/40" },
};

type TrendItem = { title: string; traffic: string };

type TitleSuggestion = {
  title: string;
  category: string;
  seo_value: string;
  slug: string;
};

type CcMode = "trend" | "general" | "historical" | "chronological";

const CC_MODES: { key: CcMode; label: string }[] = [
  { key: "trend", label: "Güncel & Trend" },
  { key: "general", label: "Genel Güncel" },
  { key: "historical", label: "Tarihsel" },
  { key: "chronological", label: "Kronolojik" },
];

const SEO_VALUE_STYLE: Record<string, string> = {
  Yüksek: "bg-emerald-500/20 text-emerald-200 border-emerald-500/40",
  Orta: "bg-amber-500/20 text-amber-200 border-amber-500/40",
  Düşük: "bg-slate-500/20 text-slate-300 border-slate-500/40",
};

export default function IceriklerPage() {
  const [allContents, setAllContents] = useState<ContentRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<Set<string>>(new Set());
  const [tab, setTab] = useState<Tab>("all");
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const [ccKeyword, setCcKeyword] = useState("");
  const [ccMode, setCcMode] = useState<CcMode>("trend");
  const [suggestions, setSuggestions] = useState<TitleSuggestion[]>([]);
  const [suggestLoading, setSuggestLoading] = useState(false);
  const [suggestError, setSuggestError] = useState("");
  const [selectedSuggestIdx, setSelectedSuggestIdx] = useState<number | null>(null);
  const [contentGenerating, setContentGenerating] = useState(false);
  const [hubNotice, setHubNotice] = useState("");
  const [hubNoticeOk, setHubNoticeOk] = useState(true);

  const [trendsOpen, setTrendsOpen] = useState(false);
  const [trendsLoading, setTrendsLoading] = useState(false);
  const [trends, setTrends] = useState<TrendItem[]>([]);
  const [trendsSample, setTrendsSample] = useState<string[]>([]);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("contents")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) console.error("Supabase fetch error:", error);
    setAllContents(data ?? []);
    setLoading(false);
  }, []);

  async function handleSuggestTitles() {
    const kw = ccKeyword.trim();
    if (!kw) {
      setSuggestError("Önce bir konu veya keyword girin.");
      return;
    }
    setSuggestLoading(true);
    setSuggestError("");
    setSuggestions([]);
    setSelectedSuggestIdx(null);
    try {
      const res = await fetch("/api/suggest-titles", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ keyword: kw, mode: ccMode }),
      });
      const data = await res.json();
      if (!res.ok) {
        setSuggestError(data.error || "Başlık önerisi alınamadı.");
        return;
      }
      const list = (data.suggestions ?? []) as TitleSuggestion[];
      setSuggestions(list.slice(0, 8));
    } catch {
      setSuggestError("Ağ hatası — sunucuya ulaşılamadı.");
    }
    setSuggestLoading(false);
  }

  async function generateFromSuggestion(s: TitleSuggestion) {
    if (!["radar", "taktik-lab", "listeler"].includes(s.category)) {
      setHubNoticeOk(false);
      setHubNotice("Geçersiz kategori — başlığı yeniden önerin.");
      setTimeout(() => setHubNotice(""), 8000);
      return;
    }
    setContentGenerating(true);
    setHubNotice("");
    try {
      const res = await fetch("/api/generate-content", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          title: s.title,
          category: s.category,
          slug: s.slug,
          keyword: ccKeyword.trim(),
          mode: ccMode,
        }),
      });
      const data = await res.json();
      if (res.ok && data.generated > 0) {
        setHubNoticeOk(true);
        setHubNotice("İçerik oluşturuldu; Bekleyenler sekmesine geçildi.");
        setTab("bekliyor");
        setSelected(new Set());
        await fetchAll();
      } else {
        const err = data.results?.[0]?.error || data.error || "Bilinmeyen hata";
        setHubNoticeOk(false);
        setHubNotice(`Hata: ${err}`);
      }
    } catch {
      setHubNoticeOk(false);
      setHubNotice("Ağ hatası — sunucuya ulaşılamadı.");
    }
    setContentGenerating(false);
    setTimeout(() => setHubNotice(""), 12000);
  }

  function handleProduceSelected() {
    if (selectedSuggestIdx === null || !suggestions[selectedSuggestIdx]) {
      setHubNoticeOk(false);
      setHubNotice("Önce başlık önerin; bir kart seçin veya başlığa tıklayın.");
      setTimeout(() => setHubNotice(""), 8000);
      return;
    }
    void generateFromSuggestion(suggestions[selectedSuggestIdx]);
  }

  async function handleFetchTrends() {
    setTrendsOpen(true);
    setTrendsLoading(true);
    setTrends([]);
    setTrendsSample([]);
    try {
      const res = await fetch("/api/trends");
      const data = await res.json();
      setTrends(data.trends ?? []);
      setTrendsSample(data.all_sample ?? []);
    } catch {
      setTrends([]);
    }
    setTrendsLoading(false);
  }

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const counts = useMemo(() => {
    const c = { all: 0, bekliyor: 0, yayinda: 0, reddedildi: 0 };
    for (const item of allContents) {
      c.all++;
      if (item.status in c) c[item.status as keyof typeof c]++;
    }
    return c;
  }, [allContents]);

  const filtered = useMemo(() => {
    let list = allContents;
    if (tab !== "all") list = list.filter((c) => c.status === tab);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          c.slug.toLowerCase().includes(q) ||
          (CATEGORY_LABEL[c.category] ?? c.category).toLowerCase().includes(q)
      );
    }
    return list;
  }, [allContents, tab, search]);

  async function updateStatus(id: string, newStatus: string) {
    setActionLoading((prev) => new Set(prev).add(id));
    const { error } = await supabase.from("contents").update({ status: newStatus }).eq("id", id);
    if (error) {
      console.error("Supabase update error:", error);
    } else {
      setAllContents((prev) => prev.map((c) => (c.id === id ? { ...c, status: newStatus } : c)));
      setSelected((prev) => { const next = new Set(prev); next.delete(id); return next; });
    }
    setActionLoading((prev) => { const next = new Set(prev); next.delete(id); return next; });
  }

  async function deleteItem(id: string) {
    if (!confirm("Bu içerik kalıcı olarak silinecek. Emin misin?")) return;
    setActionLoading((prev) => new Set(prev).add(id));
    const { error } = await supabase.from("contents").delete().eq("id", id);
    if (!error) {
      setAllContents((prev) => prev.filter((c) => c.id !== id));
      setSelected((prev) => { const next = new Set(prev); next.delete(id); return next; });
    }
    setActionLoading((prev) => { const next = new Set(prev); next.delete(id); return next; });
  }

  async function bulkUpdateStatus(newStatus: string) {
    const ids = Array.from(selected);
    if (ids.length === 0) return;
    setActionLoading(new Set(ids));
    const { error } = await supabase.from("contents").update({ status: newStatus }).in("id", ids);
    if (error) {
      console.error("Supabase bulk update error:", error);
    } else {
      setAllContents((prev) => prev.map((c) => (ids.includes(c.id) ? { ...c, status: newStatus } : c)));
      setSelected(new Set());
    }
    setActionLoading(new Set());
  }

  async function bulkDelete() {
    const ids = Array.from(selected);
    if (ids.length === 0) return;
    if (!confirm(`${ids.length} içerik kalıcı olarak silinecek. Emin misin?`)) return;
    setActionLoading(new Set(ids));
    const { error } = await supabase.from("contents").delete().in("id", ids);
    if (error) {
      console.error("Supabase bulk delete error:", error);
    } else {
      setAllContents((prev) => prev.filter((c) => !ids.includes(c.id)));
      setSelected(new Set());
    }
    setActionLoading(new Set());
  }

  function toggleSelect(id: string) {
    setSelected((prev) => { const next = new Set(prev); if (next.has(id)) next.delete(id); else next.add(id); return next; });
  }

  function toggleSelectAll() {
    if (selected.size === filtered.length) setSelected(new Set());
    else setSelected(new Set(filtered.map((c) => c.id)));
  }

  const allChecked = filtered.length > 0 && selected.size === filtered.length;

  const emptyMessages: Record<Tab, string> = {
    all: "Henüz hiç içerik eklenmemiş",
    bekliyor: "Onay bekleyen içerik yok",
    yayinda: "Yayında içerik yok",
    reddedildi: "Reddedilen içerik yok",
  };

  return (
    <AdminLayout>
      <div className="mx-auto max-w-6xl">
        {/* Sticky üst araç çubuğu — kaydırırken daima erişilebilir */}
        <div className="sticky top-0 z-30 -mx-1 mb-4 rounded-xl border border-slate-800/60 bg-slate-950/90 px-3 py-3 shadow-[0_8px_30px_rgba(0,0,0,0.35)] backdrop-blur-md sm:-mx-0 sm:px-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-xl font-bold">İçerik Yönetimi</h1>
            <p className="text-xs text-slate-400">Tüm yayınları görüntüle, düzenle ve yönet</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <svg className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
              <input
                type="text"
                placeholder="Ara..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-44 rounded-lg border border-slate-700/80 bg-slate-800/70 py-2 pl-9 pr-3 text-xs text-slate-100 placeholder-slate-500 outline-none transition focus:border-emerald-500/60"
              />
            </div>
            <button
              type="button"
              onClick={handleFetchTrends}
              className="rounded-lg border border-sky-500/40 bg-sky-500/10 px-3 py-2 text-xs font-semibold text-sky-300 transition hover:bg-sky-500/20"
            >
              Güncel Trendler
            </button>
            <Link
              href="/admin/yeni"
              className="rounded-lg bg-emerald-500 px-4 py-2 text-xs font-semibold text-slate-950 transition hover:bg-emerald-400"
            >
              + Yeni İçerik
            </Link>
          </div>
          </div>
        </div>

        {/* İçerik Kontrol Merkezi */}
        <div className="mb-6 rounded-2xl border border-slate-800/70 bg-slate-900/40 p-4 shadow-lg sm:p-6">
          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-100">İçerik Kontrol Merkezi</h2>
              <p className="text-[11px] text-slate-500">Başlık keşfi, trendler ve hedefli içerik üretimi</p>
            </div>
            {contentGenerating && (
              <span className="inline-flex items-center gap-2 rounded-lg border border-violet-500/30 bg-violet-500/10 px-3 py-1.5 text-[11px] font-semibold text-violet-200">
                <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-violet-400 border-t-transparent" />
                İçerik üretiliyor…
              </span>
            )}
          </div>

          {/* Başlık Keşfet */}
          <div className="mb-6 rounded-xl border border-slate-800/60 bg-slate-950/50 p-4">
            <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-emerald-400/90">Başlık Keşfet</h3>
            <input
              type="text"
              value={ccKeyword}
              onChange={(e) => setCcKeyword(e.target.value)}
              placeholder="Konu veya keyword gir..."
              disabled={contentGenerating}
              className="mb-3 w-full rounded-lg border border-slate-700/80 bg-slate-900/80 px-3 py-2.5 text-sm text-slate-100 placeholder-slate-500 outline-none transition focus:border-emerald-500/50 disabled:opacity-50"
            />
            <div className="mb-3 flex flex-wrap gap-2">
              {CC_MODES.map((m) => (
                <button
                  key={m.key}
                  type="button"
                  disabled={contentGenerating}
                  onClick={() => setCcMode(m.key)}
                  className={[
                    "rounded-lg border px-2.5 py-1.5 text-[11px] font-semibold transition disabled:opacity-50",
                    ccMode === m.key
                      ? "border-emerald-500/50 bg-emerald-500/15 text-emerald-200"
                      : "border-slate-700/80 bg-slate-900/60 text-slate-400 hover:border-slate-600 hover:text-slate-200",
                  ].join(" ")}
                >
                  {m.label}
                </button>
              ))}
            </div>
            <button
              type="button"
              disabled={contentGenerating || suggestLoading}
              onClick={() => void handleSuggestTitles()}
              className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-bold text-slate-950 transition hover:bg-emerald-500 disabled:opacity-50"
            >
              {suggestLoading ? (
                <span className="inline-flex items-center gap-2">
                  <span className="h-3 w-3 animate-spin rounded-full border-2 border-slate-900 border-t-transparent" />
                  Öneriliyor…
                </span>
              ) : (
                "Başlık Öner"
              )}
            </button>
            {suggestError && <p className="mt-2 text-xs text-rose-400">{suggestError}</p>}
          </div>

          {/* Önerilen başlıklar */}
          {suggestions.length > 0 && (
            <div className="mb-6">
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-slate-500">Önerilen başlıklar</p>
              <div className="grid gap-3 sm:grid-cols-2">
                {suggestions.map((s, i) => (
                  <div
                    key={`${s.slug}-${i}`}
                    role="button"
                    tabIndex={0}
                    onClick={() => setSelectedSuggestIdx(i)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setSelectedSuggestIdx(i);
                      }
                    }}
                    className={[
                      "flex flex-col rounded-xl border bg-slate-950/60 p-3 text-left transition cursor-pointer",
                      selectedSuggestIdx === i
                        ? "border-emerald-500/50 ring-1 ring-emerald-500/30"
                        : "border-slate-800/70 hover:border-slate-700",
                    ].join(" ")}
                  >
                    <button
                      type="button"
                      disabled={contentGenerating}
                      onClick={(e) => {
                        e.stopPropagation();
                        void generateFromSuggestion(s);
                      }}
                      className="mb-2 text-left text-sm font-semibold text-slate-100 transition hover:text-emerald-300 disabled:opacity-50"
                    >
                      {s.title}
                    </button>
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <span
                        className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-semibold ${CATEGORY_COLOR[s.category] ?? "bg-slate-500/15 text-slate-300 border-slate-500/40"}`}
                      >
                        {CATEGORY_LABEL[s.category] ?? s.category}
                      </span>
                      <span
                        className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-semibold ${SEO_VALUE_STYLE[s.seo_value] ?? SEO_VALUE_STYLE.Orta}`}
                      >
                        SEO: {s.seo_value}
                      </span>
                    </div>
                    <button
                      type="button"
                      disabled={contentGenerating}
                      onClick={(e) => {
                        e.stopPropagation();
                        void generateFromSuggestion(s);
                      }}
                      className="mt-auto inline-flex w-fit items-center gap-1 text-[11px] font-bold text-violet-300 transition hover:text-violet-200 disabled:opacity-50"
                    >
                      Bu Başlıkla Üret →
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* İçerik Üret */}
          <div className="rounded-xl border border-slate-800/60 bg-slate-950/40 p-4">
            <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-violet-400/90">İçerik Üret</h3>
            <p className="mb-3 text-[11px] text-slate-500">
              Bir kartı seçip <strong className="text-slate-400">Üret</strong> ile onaylayın; veya başlığa / &quot;Bu Başlıkla Üret&quot;e tıklayarak doğrudan başlatın.
            </p>
            <button
              type="button"
              disabled={contentGenerating || suggestLoading}
              onClick={() => handleProduceSelected()}
              className="rounded-lg border border-violet-500/40 bg-violet-500/15 px-4 py-2 text-xs font-bold text-violet-200 transition hover:bg-violet-500/25 disabled:opacity-50"
            >
              {contentGenerating ? (
                <span className="inline-flex items-center gap-2">
                  <span className="h-3 w-3 animate-spin rounded-full border-2 border-violet-300 border-t-transparent" />
                  Üretiliyor…
                </span>
              ) : (
                "Üret"
              )}
            </button>
          </div>
        </div>

        {hubNotice && (
          <div
            className={`mb-4 rounded-lg border px-4 py-2.5 text-xs font-medium ${hubNoticeOk ? "border-emerald-500/30 bg-emerald-500/5 text-emerald-300" : "border-rose-500/30 bg-rose-500/5 text-rose-300"}`}
          >
            {hubNotice}
          </div>
        )}

        {/* Trends popup */}
        {trendsOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
            <div className="w-full max-w-lg rounded-2xl border border-slate-800/80 bg-slate-950 p-6 shadow-2xl">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-sm font-bold">Güncel Futbol Trendleri (TR)</h2>
                <button onClick={() => setTrendsOpen(false)} className="text-slate-500 transition hover:text-slate-300">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                </button>
              </div>
              {trendsLoading ? (
                <div className="flex items-center gap-2 py-8 text-sm text-slate-400 justify-center">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-sky-400 border-t-transparent" />
                  Trendler yükleniyor...
                </div>
              ) : (
                <>
                  {trends.length > 0 ? (
                    <div className="mb-4">
                      <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-emerald-400">Futbol / Spor Trendleri</p>
                      <div className="space-y-1.5">
                        {trends.map((t, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => {
                              setCcKeyword(t.title);
                              setTrendsOpen(false);
                            }}
                            className="flex w-full items-center justify-between rounded-lg border border-slate-800/60 bg-slate-900/40 px-3 py-2 text-left transition hover:border-sky-500/40 hover:bg-slate-900/70"
                          >
                            <span className="text-xs font-medium text-slate-200">{t.title}</span>
                            {t.traffic && <span className="shrink-0 text-[10px] text-slate-500">{t.traffic}</span>}
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className="mb-4 text-xs text-slate-500">Şu an futbol ile ilgili trend bulunamadı.</p>
                  )}
                  {trendsSample.length > 0 && (
                    <div>
                      <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-slate-500">Tüm Trendler (İlk 10)</p>
                      <div className="flex flex-wrap gap-1.5">
                        {trendsSample.map((t, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => {
                              setCcKeyword(t);
                              setTrendsOpen(false);
                            }}
                            className="rounded-full border border-slate-800/60 bg-slate-900/40 px-2.5 py-1 text-[11px] text-slate-400 transition hover:border-sky-500/40 hover:text-sky-200"
                          >
                            {t}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="mb-5 flex gap-1 rounded-xl border border-slate-800/60 bg-slate-900/40 p-1">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => { setTab(t.key); setSelected(new Set()); }}
              className={[
                "flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2.5 text-xs font-semibold transition",
                tab === t.key
                  ? "bg-emerald-500/15 text-emerald-300"
                  : "text-slate-400 hover:text-slate-200",
              ].join(" ")}
            >
              {t.label}
              <span className={[
                "inline-flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-[10px] font-bold",
                tab === t.key ? "bg-emerald-500/25 text-emerald-200" : "bg-slate-800 text-slate-400",
              ].join(" ")}>
                {counts[t.key]}
              </span>
            </button>
          ))}
        </div>

        {/* Bulk actions */}
        {selected.size > 0 && (
          <div className="mb-4 flex flex-wrap items-center gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/5 px-4 py-3">
            <span className="text-xs font-semibold text-emerald-300">{selected.size} içerik seçili</span>
            <div className="flex flex-wrap gap-2">
              <button onClick={() => bulkUpdateStatus("yayinda")} className="rounded-lg bg-emerald-500/15 px-3 py-1.5 text-[11px] font-semibold text-emerald-300 transition hover:bg-emerald-500/25">Seçilenleri Yayınla</button>
              <button onClick={() => bulkUpdateStatus("bekliyor")} className="rounded-lg bg-amber-500/15 px-3 py-1.5 text-[11px] font-semibold text-amber-300 transition hover:bg-amber-500/25">Beklemeye Al</button>
              <button onClick={bulkDelete} className="rounded-lg bg-rose-500/15 px-3 py-1.5 text-[11px] font-semibold text-rose-300 transition hover:bg-rose-500/25">Seçilenleri Sil</button>
            </div>
            <button onClick={() => setSelected(new Set())} className="ml-auto text-[11px] text-slate-400 transition hover:text-slate-200">Seçimi kaldır</button>
          </div>
        )}

        {/* Content */}
        {loading ? (
          <div className="flex items-center gap-2 py-16 text-sm text-slate-400 justify-center">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-emerald-400 border-t-transparent" />
            Yükleniyor...
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border border-slate-800/60 bg-slate-900/30 px-6 py-16 text-center">
            <p className="text-sm text-slate-400">
              {search.trim() ? `"${search}" ile eşleşen içerik bulunamadı` : emptyMessages[tab]}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-800/60">
            {/* Desktop: sabit genişlikli işlem sütunu + min-w-0 ile başlık kırılır */}
            {/* Table header — liste kayarken sütun başlıkları görünür kalsın */}
            <div className="grid min-w-[56rem] grid-cols-[40px_minmax(0,1fr)_100px_100px_92px_230px] items-center gap-2 border-b border-slate-800/40 bg-slate-900/90 px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-slate-500 max-lg:hidden">
              <div className="flex items-center justify-center">
                <input type="checkbox" checked={allChecked} onChange={toggleSelectAll} className="h-3.5 w-3.5 cursor-pointer rounded border-slate-600 bg-slate-900 accent-emerald-500" />
              </div>
              <div>Başlık · özet</div>
              <div>Kategori</div>
              <div>Durum</div>
              <div>Tarih</div>
              <div className="border-l border-slate-800/50 pl-2 text-right">İşlemler</div>
            </div>

            {filtered.map((item) => {
              const isOpen = expandedId === item.id;
              const isChecked = selected.has(item.id);
              const isActioning = actionLoading.has(item.id);
              const status = STATUS_CONFIG[item.status] ?? STATUS_CONFIG.bekliyor;
              const catColor = CATEGORY_COLOR[item.category] ?? "bg-slate-500/15 text-slate-300 border-slate-500/40";
              const preview = contentPreviewSnippet(item.content);

              return (
                <div key={item.id} className={["border-b border-slate-800/40 last:border-b-0 transition", isChecked ? "bg-emerald-500/[0.03]" : ""].join(" ")}>
                  {/* Desktop row */}
                  <div className="grid min-w-[56rem] grid-cols-[40px_minmax(0,1fr)_100px_100px_92px_230px] items-start gap-2 px-4 py-3 max-lg:hidden">
                    <div className="flex items-center justify-center pt-1">
                      <input type="checkbox" checked={isChecked} onChange={() => toggleSelect(item.id)} className="h-3.5 w-3.5 cursor-pointer rounded border-slate-600 bg-slate-900 accent-emerald-500" />
                    </div>
                    <div className="min-w-0">
                      <button
                        type="button"
                        onClick={() => setExpandedId(isOpen ? null : item.id)}
                        className="flex w-full items-start gap-2 text-left"
                      >
                        <svg className={["mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-500 transition-transform", isOpen ? "rotate-90" : ""].join(" ")} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path d="M9 5l7 7-7 7" /></svg>
                        <div className="min-w-0 flex-1">
                          <span className="line-clamp-2 text-sm font-semibold text-slate-100 transition hover:text-emerald-300" title={item.title}>
                            {item.title}
                          </span>
                          {preview ? (
                            <p className="mt-1 line-clamp-2 text-left text-[11px] leading-snug text-slate-500" title={stripHtml(item.content).replace(/\s+/g, " ").trim().slice(0, 400)}>
                              {preview}
                            </p>
                          ) : (
                            <p className="mt-1 text-[11px] italic text-slate-600">Özet yok</p>
                          )}
                        </div>
                      </button>
                    </div>
                    <div className="flex flex-col gap-1 pt-1">
                      <span className={`inline-flex w-fit max-w-full items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold ${catColor}`}>{CATEGORY_LABEL[item.category] ?? item.category}</span>
                    </div>
                    <div className="pt-1">
                      <span className={`inline-flex w-fit items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold ${status.cls}`}>{status.label}</span>
                    </div>
                    <span className="whitespace-nowrap pt-1.5 text-[11px] text-slate-400">{new Date(item.created_at).toLocaleDateString("tr-TR", { day: "numeric", month: "short", year: "numeric" })}</span>
                    <div className="sticky right-0 z-[1] flex min-h-[4.5rem] flex-col justify-center gap-1.5 border-l border-slate-800/50 bg-slate-950/95 py-2 pl-2 pr-1 shadow-[-12px_0_24px_-8px_rgba(0,0,0,0.5)]">
                      <div className="flex flex-wrap justify-end gap-1">
                        <Link href={`/admin/duzenle/${item.id}`} className="rounded-md border border-slate-700/60 bg-slate-900/90 px-2 py-1.5 text-[11px] font-semibold text-amber-300 transition hover:border-amber-500/50">Düzenle</Link>
                        {item.status === "bekliyor" && (
                          <>
                            <button type="button" onClick={() => updateStatus(item.id, "yayinda")} disabled={isActioning} className="rounded-md bg-emerald-500/15 px-2 py-1.5 text-[11px] font-semibold text-emerald-300 transition hover:bg-emerald-500/25 disabled:opacity-50">Yayınla</button>
                            <button type="button" onClick={() => updateStatus(item.id, "reddedildi")} disabled={isActioning} className="rounded-md bg-rose-500/15 px-2 py-1.5 text-[11px] font-semibold text-rose-300 transition hover:bg-rose-500/25 disabled:opacity-50">Reddet</button>
                          </>
                        )}
                        {item.status === "yayinda" && (
                          <button type="button" onClick={() => updateStatus(item.id, "bekliyor")} disabled={isActioning} className="rounded-md bg-rose-500/15 px-2 py-1.5 text-[11px] font-semibold text-rose-300 transition hover:bg-rose-500/25 disabled:opacity-50">Kaldır</button>
                        )}
                        {item.status === "reddedildi" && (
                          <>
                            <button type="button" onClick={() => updateStatus(item.id, "bekliyor")} disabled={isActioning} className="rounded-md bg-amber-500/15 px-2 py-1.5 text-[11px] font-semibold text-amber-300 transition hover:bg-amber-500/25 disabled:opacity-50">Geri Al</button>
                            <button
                              type="button"
                              onClick={() => deleteItem(item.id)}
                              disabled={isActioning}
                              className="rounded-md bg-rose-900/30 px-2 py-1.5 text-[11px] font-semibold text-rose-400 transition hover:bg-rose-500/25 disabled:opacity-50"
                            >
                              Sil
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Mobile row */}
                  <div className="space-y-3 px-4 py-4 lg:hidden">
                    <div className="flex items-start gap-3">
                      <input type="checkbox" checked={isChecked} onChange={() => toggleSelect(item.id)} className="mt-1 h-3.5 w-3.5 shrink-0 cursor-pointer rounded border-slate-600 bg-slate-900 accent-emerald-500" />
                      <div className="min-w-0 flex-1">
                        <button type="button" onClick={() => setExpandedId(isOpen ? null : item.id)} className="text-left text-sm font-semibold text-slate-100" title={item.title}>
                          <span className="line-clamp-3">{item.title}</span>
                        </button>
                        {preview ? (
                          <p className="mt-1 line-clamp-2 text-xs text-slate-500">{preview}</p>
                        ) : null}
                        <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                          <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold ${catColor}`}>{CATEGORY_LABEL[item.category] ?? item.category}</span>
                          <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold ${status.cls}`}>{status.label}</span>
                          <span className="text-[10px] text-slate-500">{new Date(item.created_at).toLocaleDateString("tr-TR", { day: "numeric", month: "short" })}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1.5 pl-6">
                      <Link href={`/admin/duzenle/${item.id}`} className="rounded-md border border-slate-700/60 bg-slate-900/70 px-2.5 py-1.5 text-[11px] font-semibold text-amber-300">Düzenle</Link>
                      <button onClick={() => setExpandedId(isOpen ? null : item.id)} className="rounded-md border border-slate-700/60 bg-slate-900/70 px-2.5 py-1.5 text-[11px] font-semibold text-slate-300">{isOpen ? "Kapat" : "Önizle"}</button>
                      {item.status === "bekliyor" && (
                        <>
                          <button onClick={() => updateStatus(item.id, "yayinda")} disabled={isActioning} className="rounded-md bg-emerald-500/15 px-2.5 py-1.5 text-[11px] font-semibold text-emerald-300 disabled:opacity-50">Yayınla</button>
                          <button onClick={() => updateStatus(item.id, "reddedildi")} disabled={isActioning} className="rounded-md bg-rose-500/15 px-2.5 py-1.5 text-[11px] font-semibold text-rose-300 disabled:opacity-50">Reddet</button>
                        </>
                      )}
                      {item.status === "yayinda" && (
                        <button onClick={() => updateStatus(item.id, "bekliyor")} disabled={isActioning} className="rounded-md bg-rose-500/15 px-2.5 py-1.5 text-[11px] font-semibold text-rose-300 disabled:opacity-50">Kaldır</button>
                      )}
                      {item.status === "reddedildi" && (
                        <>
                          <button onClick={() => updateStatus(item.id, "bekliyor")} disabled={isActioning} className="rounded-md bg-amber-500/15 px-2.5 py-1.5 text-[11px] font-semibold text-amber-300 disabled:opacity-50">Geri Al</button>
                          <button
                            type="button"
                            onClick={() => deleteItem(item.id)}
                            disabled={isActioning}
                            className="rounded-md bg-rose-900/30 px-2.5 py-1.5 text-[11px] font-semibold text-rose-400 transition hover:bg-rose-500/25 disabled:opacity-50"
                          >
                            Sil
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Accordion preview */}
                  {isOpen && (
                    <div className="border-t border-slate-800/40 bg-slate-900/30 px-4 py-4 lg:pl-14">
                      <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-slate-500">İçerik önizlemesi</p>
                      <p className="mb-3 text-xs font-medium text-slate-200" title={item.title}>{item.title}</p>
                      <div className="max-h-[min(28rem,calc(100vh-16rem))] overflow-y-auto rounded-lg border border-slate-800/50 bg-slate-950/50 p-4 text-[13px] leading-relaxed text-slate-300">
                        {item.content ? (
                          <div className="whitespace-pre-wrap break-words [word-break:break-word]">
                            {item.content}
                          </div>
                        ) : (
                          "— İçerik yok —"
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {!loading && filtered.length > 0 && (
          <div className="mt-4 flex items-center justify-between text-[11px] text-slate-500">
            <span>Toplam {filtered.length} içerik gösteriliyor</span>
            <span>{counts.bekliyor} bekleyen · {counts.yayinda} yayında · {counts.reddedildi} reddedilen</span>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
