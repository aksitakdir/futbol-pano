"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";
import {
  IconBracket,
  IconShield,
  IconTrendUp,
  IconStar,
  IconArrowRight,
} from "./components/icons";
import SiteHeader from "./components/site-header";
import { supabase } from "@/lib/supabase";
import { stripHtml } from "@/lib/utils";

type SlideContent = {
  id: string;
  title: string;
  slug: string;
  category: string;
  content: string;
  created_at: string;
};

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

function categoryPath(cat: string): string {
  if (cat === "listeler") return "/listeler";
  if (cat === "radar") return "/radar";
  if (cat === "taktik-lab") return "/taktik-lab";
  return "/";
}

export default function Home() {
  type FilterKey = "all" | "stoper" | "mid" | "forward";

  type ApiPlayer = {
    id: number;
    name: string;
    age: number;
    nationality?: string;
    photo?: string;
    position?: string;
    team?: string;
    league?: string;
    appearances?: number;
    minutes?: number;
    goals?: number;
  };

  const [players, setPlayers] = useState<ApiPlayer[]>([]);
  const [activeFilter, setActiveFilter] = useState<FilterKey>("all");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const filterButtons: { key: FilterKey; label: string }[] = [
    { key: "all", label: "Tümü" },
    { key: "stoper", label: "Stoper" },
    { key: "mid", label: "Orta Saha" },
    { key: "forward", label: "Forvet" },
  ];

  const filteredPlayers = players.filter((player) => {
    const pos = (player.position ?? "").toLowerCase();

    if (activeFilter === "all") return true;

    if (activeFilter === "stoper") {
      return (
        pos.includes("defender") ||
        pos.includes("centre-back") ||
        pos.includes("center back") ||
        pos.includes("centre back") ||
        pos.includes("cb")
      );
    }

    if (activeFilter === "mid") {
      return pos.includes("midfielder") || pos.includes("cm") || pos.includes("dm") || pos.includes("am");
    }

    if (activeFilter === "forward") {
      return (
        pos.includes("attacker") ||
        pos.includes("forward") ||
        pos.includes("striker") ||
        pos.includes("winger")
      );
    }

    return true;
  });

  useEffect(() => {
    let isMounted = true;

    async function loadPlayers() {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch("/api/players", { cache: "no-store" });

        if (!res.ok) {
          const text = await res.text();
          if (!isMounted) return;
          setError(
            `Oyuncu verileri alınırken bir hata oluştu (status ${res.status}).`
          );
          console.error("Failed to fetch /api/players:", text);
          return;
        }

        const json = await res.json();
        const apiPlayers: ApiPlayer[] = Array.isArray(json?.players)
          ? json.players
          : [];

        if (!isMounted) return;

        setPlayers(apiPlayers);
      } catch (err) {
        console.error("Unexpected error fetching /api/players:", err);
        if (!isMounted) return;
        setError("Oyuncu verileri alınırken beklenmeyen bir hata oluştu.");
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadPlayers();

    return () => {
      isMounted = false;
    };
  }, []);

  const featuredPlayer = players[0] ?? null;

  const [slides, setSlides] = useState<SlideContent[]>([]);
  const [recentItems, setRecentItems] = useState<SlideContent[]>([]);
  const [activeSlide, setActiveSlide] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);


  useEffect(() => {
    async function fetchSlider() {
      const { data } = await supabase
        .from("contents")
        .select("id, title, slug, category, content, created_at")
        .eq("status", "yayinda")
        .order("created_at", { ascending: false })
        .limit(4);
      if (data && data.length > 0) setSlides(data);
    }
    async function fetchRecent() {
      const { data } = await supabase
        .from("contents")
        .select("id, title, slug, category, content, created_at")
        .eq("status", "yayinda")
        .order("created_at", { ascending: false })
        .limit(6);
      if (data && data.length > 0) setRecentItems(data);
    }
    fetchSlider();
    fetchRecent();
  }, []);

  const goToSlide = useCallback((i: number) => {
    setActiveSlide(i);
  }, []);

  const nextSlide = useCallback(() => {
    setActiveSlide((p) => (p + 1) % Math.max(slides.length, 1));
  }, [slides.length]);

  const prevSlide = useCallback(() => {
    setActiveSlide((p) => (p - 1 + slides.length) % Math.max(slides.length, 1));
  }, [slides.length]);

  useEffect(() => {
    if (slides.length < 2) return;
    timerRef.current = setInterval(nextSlide, 5000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [slides.length, nextSlide]);

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100">
      <div className="flex min-h-screen flex-col">
        <SiteHeader />

        {/* Hero slider */}
        {slides.length > 0 && (
          <section className="relative h-[280px] w-full overflow-hidden md:h-[420px]">
            {/* Noise/geometric background */}
            <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950/40" />
            <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }} />
            <div className="pointer-events-none absolute -left-20 top-10 h-64 w-64 rounded-full bg-emerald-500/20 blur-[100px]" />
            <div className="pointer-events-none absolute -right-10 bottom-10 h-48 w-48 rounded-full bg-cyan-500/15 blur-[80px]" />

            {/* Slides */}
            {slides.map((slide, i) => (
              <div
                key={slide.id}
                className={[
                  "absolute inset-0 flex items-center transition-opacity duration-700",
                  i === activeSlide ? "opacity-100 z-10" : "opacity-0 z-0",
                ].join(" ")}
              >
                <div className="mx-auto flex max-w-6xl flex-col justify-center px-6 lg:px-8">
                  <span className={`mb-3 inline-flex w-fit items-center rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] ${CATEGORY_COLOR[slide.category] ?? "bg-slate-500/15 text-slate-300 border-slate-500/40"}`}>
                    {CATEGORY_LABEL[slide.category] ?? slide.category}
                  </span>
                  <h2 className="mb-2 max-w-3xl bg-gradient-to-r from-emerald-400 via-cyan-400 to-sky-500 bg-clip-text text-[22px] font-extrabold leading-tight tracking-tight text-transparent sm:text-3xl md:mb-3 md:text-[48px] md:leading-[1.15]">
                    {slide.title}
                  </h2>
                  <p className="mb-4 hidden max-w-2xl text-sm leading-relaxed text-slate-300 sm:block md:mb-6">
                    {stripHtml(slide.content).replace(/[#*_\n]/g, " ").trim().slice(0, 150)}…
                  </p>
                  <Link
                    href={`${categoryPath(slide.category)}/${slide.slug}`}
                    className="inline-flex w-fit items-center gap-1.5 rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400 px-5 py-2.5 text-xs font-semibold text-slate-950 shadow-[0_0_30px_rgba(16,185,129,0.6)] transition hover:brightness-110"
                  >
                    Oku <IconArrowRight />
                  </Link>
                </div>
              </div>
            ))}

            {/* Arrows */}
            <button onClick={prevSlide} className="absolute left-2 top-1/2 z-20 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full border border-slate-700/60 bg-slate-900/80 text-slate-300 backdrop-blur transition hover:border-emerald-500/60 hover:text-emerald-300 md:left-4 md:h-9 md:w-9">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="md:h-[14px] md:w-[14px]"><path d="M15 19l-7-7 7-7" /></svg>
            </button>
            <button onClick={nextSlide} className="absolute right-2 top-1/2 z-20 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full border border-slate-700/60 bg-slate-900/80 text-slate-300 backdrop-blur transition hover:border-emerald-500/60 hover:text-emerald-300 md:right-4 md:h-9 md:w-9">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="md:h-[14px] md:w-[14px]"><path d="M9 5l7 7-7 7" /></svg>
            </button>

            {/* Dots */}
            <div className="absolute bottom-5 left-1/2 z-20 flex -translate-x-1/2 gap-2">
              {slides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => goToSlide(i)}
                  className={[
                    "h-2 rounded-full transition-all",
                    i === activeSlide ? "w-6 bg-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.8)]" : "w-2 bg-slate-600 hover:bg-slate-400",
                  ].join(" ")}
                />
              ))}
            </div>
          </section>
        )}

        {/* Öne Çıkan Listeler band */}
        <section className="border-b border-slate-800/60 bg-slate-950/80 py-6">
          <div className="mx-auto max-w-6xl px-4">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                Öne Çıkan Listeler
              </h3>
              <span className="text-[11px] text-slate-400">
                Kürasyonlu içerik listeleri
              </span>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {[
                { title: "En Değerli 10 Genç Stoper", slug: "en-iyi-10-genc-stoper", icon: <IconShield className="text-emerald-300" />, desc: "Detaylı analiz, performans metrikleri ve scout notları ile birlikte.", href: "/listeler/en-iyi-10-genc-stoper", tag: "Liste", cta: "Listeyi aç" },
                { title: "Süper Lig'in Gizli İsimleri", slug: "super-lig-gizli-isimler", icon: <IconTrendUp className="text-sky-300" />, desc: "Detaylı analiz, performans metrikleri ve scout notları ile birlikte.", href: "/listeler/super-lig-gizli-isimler", tag: "Liste", cta: "Listeyi aç" },
                { title: "Bu Sezonun Sürpriz İsimleri", slug: "surpriz-isimler-2025", icon: <IconStar className="text-amber-300" />, desc: "Detaylı analiz, performans metrikleri ve scout notları ile birlikte.", href: "/listeler/surpriz-isimler-2025", tag: "Liste", cta: "Listeyi aç" },
                { title: "Favori Yeteneğini Seç", slug: "turnuva", icon: <IconBracket className="text-[#00d4aa]" />, desc: "16 genç yetenek, tek şampiyon. Kim kazanır?", href: "/turnuva", tag: "Turnuva", cta: "Oyna" },
              ].map((item) => (
                <Link
                  key={item.slug}
                  href={item.href}
                  className="group flex flex-col items-start rounded-2xl border border-slate-800/80 bg-slate-950/60 px-4 py-4 text-left text-sm text-slate-200 shadow-[0_16px_50px_rgba(15,23,42,0.8)] transition hover:-translate-y-1 hover:border-emerald-500/70 hover:bg-slate-900/80"
                >
                  <span className="mb-2 flex items-center gap-2">
                    {item.icon}
                    <span className="inline-flex rounded-full bg-emerald-500/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-300">
                      {item.tag}
                    </span>
                  </span>
                  <span className="text-sm font-semibold">{item.title}</span>
                  <span className="mt-1 text-xs text-slate-400">
                    {item.desc}
                  </span>
                  <span className="mt-3 inline-flex items-center text-xs font-semibold text-emerald-300">
                    {item.cta}
                    <span className="ml-1 transition-transform group-hover:translate-x-0.5">
                      →
                    </span>
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* İçerik */}
        <div className="flex-1">
          <div className="mx-auto max-w-6xl px-4 py-8 lg:py-12">
            {/* Hero: Bu haftanın öne çıkan oyuncusu */}
            <section className="mb-10 grid gap-6 md:grid-cols-[minmax(0,1.7fr)_minmax(0,1.3fr)]">
              <div className="relative overflow-hidden rounded-2xl border border-slate-800/80 bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950/40 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.9)]">
                <div className="pointer-events-none absolute -right-12 -top-16 h-40 w-40 rounded-full bg-emerald-500/30 blur-3xl" />
                <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-emerald-300/90">
                  Bu haftanın öne çıkan oyuncusu
                </p>
                <h1 className="mt-3 bg-gradient-to-r from-emerald-400 via-cyan-400 to-sky-500 bg-clip-text text-2xl font-extrabold tracking-tight text-transparent md:text-3xl">
                  {loading
                    ? "Yükleniyor..."
                    : featuredPlayer?.name ?? "Veri bekleniyor"}
                </h1>
                <p className="mt-2 text-sm text-slate-300">
                  {loading && "Premier League gol krallığı verileri yükleniyor."}
                  {!loading &&
                    !featuredPlayer &&
                    "Şu anda öne çıkan oyuncu verisine erişilemiyor. Lütfen daha sonra tekrar deneyin."}
                  {!loading &&
                    featuredPlayer &&
                    `${featuredPlayer.team ?? "Kulüp bilgisi yok"} formasıyla ${
                      featuredPlayer.position?.toLowerCase() ??
                      "bilinmeyen pozisyon"
                    } rolünde bu sezon dikkat çekici bir gol katkısı sergiliyor.`}
                </p>

                <div className="mt-6 grid grid-cols-3 gap-4 text-xs">
                  <div className="rounded-xl bg-slate-900/70 p-3">
                    <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">
                      Lig
                    </p>
                    <p className="mt-1 text-sm font-semibold text-slate-50">
                      {featuredPlayer?.league ?? "Premier League"}
                    </p>
                    <p className="mt-0.5 text-[11px] text-slate-400">
                      Sezon 2024
                    </p>
                  </div>
                  <div className="rounded-xl bg-slate-900/70 p-3">
                    <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">
                      Goller
                    </p>
                    <p className="mt-1 text-sm font-semibold text-emerald-300">
                      {featuredPlayer?.goals ?? "—"}
                    </p>
                    <p className="mt-0.5 text-[11px] text-slate-400">
                      Toplam gol sayısı
                    </p>
                  </div>
                  <div className="rounded-xl bg-slate-900/70 p-3">
                    <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">
                      Dakika
                    </p>
                    <p className="mt-1 text-sm font-semibold text-slate-50">
                      {featuredPlayer?.minutes ?? "—"}
                    </p>
                    <p className="mt-0.5 text-[11px] text-slate-400">
                      Sahada kalma süresi
                    </p>
                  </div>
                </div>

                <div className="mt-6">
                  <button className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400 px-5 py-2 text-xs font-semibold text-slate-950 shadow-[0_0_30px_rgba(16,185,129,0.8)] transition hover:brightness-110">
                    Profili Gör
                  </button>
                </div>
              </div>

              <div className="relative overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-900/80 p-5">
                {/* Decorative elements */}
                <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-emerald-500/10 blur-[60px]" />
                <div className="pointer-events-none absolute -bottom-6 -left-6 h-24 w-24 rounded-full bg-cyan-500/10 blur-[50px]" />
                <div className="pointer-events-none absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }} />

                <div className="relative">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                    Platform Özeti
                  </p>
                  <p className="mt-3 text-sm leading-relaxed text-slate-200">
                    Scout Intelligence, Avrupa&apos;nın en parlak genç
                    yeteneklerini takip eden, haftalık analizler üreten
                    ve taktik derinlik sunan bir futbol keşif platformudur.
                  </p>

                  <div className="mt-4 space-y-3">
                    <div className="flex items-start gap-3 rounded-xl border border-slate-700/50 bg-slate-950/40 p-3">
                      <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-300">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                      </span>
                      <div>
                        <p className="text-xs font-semibold text-slate-100">Kürasyonlu Listeler</p>
                        <p className="mt-0.5 text-[11px] leading-relaxed text-slate-400">Pozisyona ve profile göre hazırlanmış genç yetenek listeleri ve scout notları</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 rounded-xl border border-slate-700/50 bg-slate-950/40 p-3">
                      <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-sky-500/15 text-sky-300">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>
                      </span>
                      <div>
                        <p className="text-xs font-semibold text-slate-100">Haftalık Radar</p>
                        <p className="mt-0.5 text-[11px] leading-relaxed text-slate-400">Her hafta güncellenen derinlemesine oyuncu analizleri ve performans raporları</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 rounded-xl border border-slate-700/50 bg-slate-950/40 p-3">
                      <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-violet-500/15 text-violet-300">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
                      </span>
                      <div>
                        <p className="text-xs font-semibold text-slate-100">Taktik Lab</p>
                        <p className="mt-0.5 text-[11px] leading-relaxed text-slate-400">Modern futbolun pozisyon arketiplerini keşfet: False 9, Inverted Winger ve daha fazlası</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Ana içerik: tablo + listeler + radar */}
            <section className="space-y-10">
              {/* Oyuncu tablosu */}
              <div className="rounded-2xl border border-slate-800/80 bg-slate-900/70 shadow-[0_24px_80px_rgba(15,23,42,0.9)]">
                <div className="flex flex-col gap-3 border-b border-slate-800/80 px-5 pb-4 pt-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                  <div>
                    <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-300/90">
                      Bu Haftanın En İyileri
                    </h2>
                    <p className="mt-1 text-xs text-slate-300/80">
                      Premier League 2024 sezonu gol krallığı sıralamasından
                      ilk 10 oyuncu.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs">
                    {filterButtons.map((filter) => {
                      const isActive = activeFilter === filter.key;
                      return (
                        <button
                          key={filter.key}
                          type="button"
                          onClick={() => setActiveFilter(filter.key)}
                          className={[
                            "rounded-full border px-3 py-1.5 transition-all duration-150",
                            "backdrop-blur hover:-translate-y-[1px]",
                            isActive
                              ? "border-emerald-500/80 bg-emerald-500/20 text-emerald-100 shadow-[0_0_25px_rgba(16,185,129,0.5)]"
                              : "border-slate-700/90 bg-slate-900/80 text-slate-300 hover:border-emerald-500/60 hover:text-emerald-100",
                          ].join(" ")}
                        >
                          {filter.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="relative overflow-x-auto px-2 pb-4 pt-2 sm:px-4">
                  {loading && (
                    <div className="flex min-h-[220px] items-center justify-center text-sm text-slate-300">
                      <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-emerald-400 border-t-transparent" />
                      Yükleniyor...
                    </div>
                  )}

                  {!loading && error && (
                    <div className="min-h-[220px] rounded-xl border border-red-500/40 bg-red-500/5 px-4 py-3 text-sm text-red-200">
                      {error}
                    </div>
                  )}

                  {!loading && !error && filteredPlayers.length === 0 && (
                    <div className="min-h-[220px] rounded-xl border border-slate-700/70 bg-slate-900/70 px-4 py-3 text-sm text-slate-300">
                      Seçili filtreye uygun oyuncu bulunamadı.
                    </div>
                  )}

                  {!loading && !error && filteredPlayers.length > 0 && (
                    <table className="min-w-full border-separate border-spacing-0 text-sm">
                      <thead>
                        <tr className="bg-slate-900/80">
                          <th className="sticky left-0 z-10 border-b border-slate-700/80 bg-slate-900/90 px-3 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                            #
                          </th>
                          <th className="border-b border-slate-700/80 px-3 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                            Oyuncu
                          </th>
                          <th className="border-b border-slate-700/80 px-3 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                            Pozisyon
                          </th>
                          <th className="hidden border-b border-slate-700/80 px-3 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400 md:table-cell">
                            Yaş
                          </th>
                          <th className="hidden border-b border-slate-700/80 px-3 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400 md:table-cell">
                            Kulüp
                          </th>
                          <th className="border-b border-slate-700/80 px-3 py-3 text-right text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                            Goller
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredPlayers.map((player, index) => (
                          <tr
                            key={player.id ?? player.name}
                            className="group transition-all duration-200 hover:bg-slate-800/70 hover:shadow-[0_0_0_1px_rgba(45,212,191,0.4)]"
                          >
                            <td className="sticky left-0 z-10 border-b border-slate-800/80 bg-slate-900/80 px-3 py-3 text-xs font-semibold text-slate-300">
                              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-800/80 text-[11px] text-emerald-300 ring-1 ring-emerald-500/40">
                                {index + 1}
                              </span>
                            </td>
                            <td className="border-b border-slate-800/80 px-3 py-3 text-sm font-medium text-slate-100">
                              <div className="flex items-center gap-2.5">
                                {player.photo ? (
                                  <img
                                    src={player.photo}
                                    alt={player.name}
                                    width={32}
                                    height={32}
                                    className="h-8 w-8 shrink-0 rounded-full object-cover ring-1 ring-slate-700/80"
                                  />
                                ) : (
                                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-800 text-[10px] font-bold text-slate-400 ring-1 ring-slate-700/80">
                                    {player.name?.charAt(0) ?? "?"}
                                  </span>
                                )}
                                {player.name}
                              </div>
                            </td>
                            <td className="border-b border-slate-800/80 px-3 py-3 text-xs font-medium text-emerald-300">
                              {player.position ?? "—"}
                            </td>
                            <td className="hidden border-b border-slate-800/80 px-3 py-3 text-xs text-slate-300 md:table-cell">
                              {player.age ?? "—"}
                            </td>
                            <td className="hidden border-b border-slate-800/80 px-3 py-3 text-xs text-slate-300 md:table-cell">
                              {player.team ?? "—"}
                            </td>
                            <td className="border-b border-slate-800/80 px-3 py-3 text-right text-sm font-semibold text-emerald-300">
                              {player.goals ?? 0}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>

              {/* Son Eklenenler */}
              {recentItems.length > 0 && (
                <div>
                  <h2 className="mb-4 text-sm font-semibold uppercase tracking-[0.22em] text-slate-400">
                    Son Eklenenler
                  </h2>
                  <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-none">
                    {recentItems.map((item) => (
                      <Link
                        key={item.id}
                        href={`${categoryPath(item.category)}/${item.slug}`}
                        className="group flex w-64 shrink-0 flex-col rounded-xl border border-slate-800/80 bg-slate-950/70 p-4 transition hover:-translate-y-0.5 hover:border-emerald-500/50"
                      >
                        <span className={`mb-2 inline-flex w-fit items-center rounded-full border px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.14em] ${CATEGORY_COLOR[item.category] ?? "bg-slate-500/15 text-slate-300 border-slate-500/40"}`}>
                          {CATEGORY_LABEL[item.category] ?? item.category}
                        </span>
                        <p className="line-clamp-2 text-xs font-semibold text-slate-100 transition group-hover:text-emerald-300">
                          {item.title}
                        </p>
                        <span className="mt-auto pt-2 text-[10px] text-slate-500">
                          {new Date(item.created_at).toLocaleDateString("tr-TR", { day: "numeric", month: "short" })}
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Haftalık Radar */}
              <div className="rounded-2xl border border-slate-800/80 bg-gradient-to-r from-slate-950 via-slate-900 to-emerald-950/40 px-5 py-5 sm:px-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="max-w-2xl">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-emerald-300/90">
                      Haftalık Radar
                    </p>
                    <h3 className="mt-2 text-base font-semibold text-slate-50 md:text-lg">
                      Premier League&apos;de gölgede kalan bitiriciler
                    </h3>
                    <p className="mt-2 text-sm text-slate-300">
                      Bu haftaki radar yazımızda, skor tabelasına düzenli
                      yansımayan ancak xG, koşu kalitesi ve baskı altında
                      bitiricilik metrikleriyle scout ekranlarında öne çıkan
                      genç forvetleri inceliyoruz.
                    </p>
                  </div>
                  <div className="flex flex-col items-start gap-3 sm:items-end">
                    <Link
                      href="/radar"
                      className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400 px-5 py-2 text-xs font-semibold text-slate-950 shadow-[0_0_30px_rgba(16,185,129,0.6)] transition hover:brightness-110"
                    >
                      Tümünü Oku
                    </Link>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>

        {/* Footer */}
        <footer className="border-t border-slate-800/80 bg-slate-950/90">
          <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 py-5 text-xs text-slate-400 sm:flex-row">
            <span className="font-medium text-slate-300">
              Scout Intelligence
            </span>
            <div className="flex items-center gap-4">
              <span className="h-6 w-6 rounded-full border border-slate-700/80 bg-slate-900/80" />
              <span className="h-6 w-6 rounded-full border border-slate-700/80 bg-slate-900/80" />
              <span className="h-6 w-6 rounded-full border border-slate-700/80 bg-slate-900/80" />
            </div>
            <span className="text-[11px] text-slate-500">
              © 2026 Scout Intelligence
            </span>
          </div>
        </footer>
      </div>
    </main>
  );
}