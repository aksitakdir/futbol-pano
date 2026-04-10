"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  IconSoccerBall,
  IconShield,
  IconTrendUp,
  IconStar,
  IconArrowRight,
} from "./components/icons";
import SiteHeader from "./components/site-header";
import SiteFooter from "./components/site-footer";
import { PlayerScoutLinks } from "./components/player-scout-links";
import PlayerCard, { type PlayerCardData } from "./components/player-card";
import { supabase } from "@/lib/supabase";
import { stripHtml } from "@/lib/utils";
import { ARENA_BRACKETS, arenaPath } from "@/lib/arena-brackets";

const easeOut = [0.22, 1, 0.36, 1] as [number, number, number, number];

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: easeOut } },
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
};

const staggerChild = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.65, ease: easeOut } },
};

function translatePosition(pos: string): string {
  const map: Record<string, string> = {
    Forward: "Forvet", Winger: "Kanat", Midfielder: "Orta Saha",
    "Attacking Midfielder": "Ofansif OS", "Defensive Midfielder": "Defansif OS",
    Defender: "Defans", "Center Back": "Stoper", "Right Back": "Sağ Bek",
    "Left Back": "Sol Bek", Goalkeeper: "Kaleci",
    "Right Winger": "Sağ Kanat", "Left Winger": "Sol Kanat", Striker: "Santrafor",
  };
  return map[pos.trim()] ?? pos;
}

type SlideContent = { id: string; title: string; slug: string; category: string; content: string; created_at: string; };

const CATEGORY_LABEL: Record<string, string> = { listeler: "Listeler", radar: "Radar", "taktik-lab": "Taktik Lab" };
const CATEGORY_COLOR: Record<string, string> = {
  listeler: "bg-sky-500/15 text-sky-300 border-sky-500/40",
  radar: "bg-emerald-500/15 text-emerald-300 border-emerald-500/40",
  "taktik-lab": "bg-violet-500/15 text-violet-300 border-violet-500/40",
};
const CATEGORY_DOT: Record<string, string> = { listeler: "#22d3ee", radar: "#00d4aa", "taktik-lab": "#a78bfa" };

function categoryPath(cat: string): string {
  if (cat === "listeler") return "/listeler";
  if (cat === "radar") return "/radar";
  if (cat === "taktik-lab") return "/taktik-lab";
  return "/";
}

const SLIDER_COUNT = 4;

function shuffleInPlace<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildHeroSlides(all: SlideContent[]): { slide: SlideContent; slideKey: string }[] {
  if (!all.length) return [];
  const now = Date.now();
  const ms7 = 7 * 24 * 60 * 60 * 1000;
  const ms30 = 30 * 24 * 60 * 60 * 1000;
  const byNewest = [...all].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  const picked: SlideContent[] = [];
  const used = new Set<string>();
  const in7 = byNewest.filter((c) => new Date(c.created_at).getTime() >= now - ms7);
  for (let i = 0; i < Math.min(2, in7.length); i++) { picked.push(in7[i]); used.add(in7[i].id); }
  if (picked.length < SLIDER_COUNT) {
    for (const c of byNewest.filter((c) => new Date(c.created_at).getTime() >= now - ms30 && !used.has(c.id))) {
      if (picked.length >= SLIDER_COUNT) break;
      picked.push(c); used.add(c.id);
    }
  }
  if (picked.length < SLIDER_COUNT) {
    for (const c of shuffleInPlace(byNewest.filter((c) => !used.has(c.id)))) {
      if (picked.length >= SLIDER_COUNT) break;
      picked.push(c); used.add(c.id);
    }
  }
  const pool = picked.length > 0 ? picked : byNewest;
  let r = 0;
  while (picked.length < SLIDER_COUNT && pool.length > 0) { picked.push(pool[r % pool.length]); r++; }
  return picked.map((slide, i) => ({ slide, slideKey: `${slide.id}-hero-${i}` }));
}

type HeroContentSlide = { kind: "content"; slide: SlideContent; slideKey: string };
type HeroArenaSlide = { kind: "arena"; slideKey: string; title: string; teaser: string; href: string };
type HeroSlide = HeroContentSlide | HeroArenaSlide;

function pickRandomArenaHeroSlide(): HeroArenaSlide {
  const b = ARENA_BRACKETS[Math.floor(Math.random() * ARENA_BRACKETS.length)];
  return { kind: "arena", slideKey: `arena-hero-${b.slug}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`, title: b.heroTitle, teaser: b.heroTeaser, href: arenaPath(b.slug) };
}

function mergeContentWithArenaSlot(content: { slide: SlideContent; slideKey: string }[]): HeroSlide[] {
  const arena = pickRandomArenaHeroSlide();
  const items: HeroSlide[] = content.map(({ slide, slideKey }) => ({ kind: "content", slide, slideKey }));
  if (items.length === 0) return [arena];
  items.splice(Math.floor(Math.random() * (items.length + 1)), 0, arena);
  return items;
}

export default function Home() {
  type FormPlayer = { name: string; club: string; league: string; position: string; age: string; goals: string; };
  type FormPlayerWithStats = FormPlayer & Partial<PlayerCardData>;

  const [formPlayersWithStats, setFormPlayersWithStats] = useState<FormPlayerWithStats[]>([]);
  const [formLoading, setFormLoading] = useState(true);

  useEffect(() => {
    async function fetchFormPlayers() {
      const { data: poolRow } = await supabase.from("site_settings").select("value").eq("key", "form_players_pool").maybeSingle();
      let list: FormPlayer[] = [];
      if (poolRow?.value) {
        try {
          const parsed = JSON.parse(poolRow.value as string);
          if (Array.isArray(parsed) && parsed.length > 0) list = shuffleInPlace(parsed as FormPlayer[]).slice(0, 10);
        } catch { /* ignore */ }
      }
      if (list.length === 0) {
        const { data: legacy } = await supabase.from("site_settings").select("value").eq("key", "form_players").maybeSingle();
        if (legacy?.value) {
          try {
            const parsed = JSON.parse(legacy.value as string);
            if (Array.isArray(parsed)) list = shuffleInPlace(parsed as FormPlayer[]).slice(0, 10);
          } catch { /* ignore */ }
        }
      }
      if (list.length > 0) {
        const names = list.map((p) => p.name);
        const { data: statsData } = await supabase
          .from("fc_players")
          .select("name,overall,position,pace,shooting,passing,dribbling,defending,physical,photo_url")
          .in("name", names);
        const statsMap = new Map(((statsData ?? []) as { name: string }[]).map((s) => [s.name.toLowerCase(), s]));
        setFormPlayersWithStats(list.map((p) => {
          const stats = statsMap.get(p.name.toLowerCase());
          return stats ? { ...p, ...(stats as Partial<PlayerCardData>), age: String((stats as Partial<PlayerCardData>).age ?? p.age) } : p;
        }));
      }
      setFormLoading(false);
    }
    fetchFormPlayers();
  }, []);

  type FeaturedPlayerData = { name: string; club: string; position: string; age: string; league: string; goals: string; assists: string; description: string; whyWatch: string; };
  const [featuredPlayer, setFeaturedPlayer] = useState<FeaturedPlayerData | null>(null);
  const [featuredPlayerStats, setFeaturedPlayerStats] = useState<Partial<PlayerCardData> | null>(null);
  const [featuredLoading, setFeaturedLoading] = useState(true);

  useEffect(() => {
    async function fetchRadarPlayer() {
      type PoolEntry = { name?: string; club?: string; league?: string; position?: string; age?: string; goals?: string; assists?: string; description?: string; why_watch?: string; };
      const { data: poolRow } = await supabase.from("site_settings").select("value").eq("key", "featured_player_pool").maybeSingle();
      if (poolRow?.value) {
        try {
          const pool = JSON.parse(poolRow.value as string) as PoolEntry[];
          if (Array.isArray(pool) && pool.length > 0) {
            const pick = pool[Math.floor(Math.random() * pool.length)];
            if (pick?.name) {
              setFeaturedPlayer({ name: pick.name ?? "", club: pick.club ?? "", position: pick.position ?? "", age: String(pick.age ?? ""), league: pick.league ?? "", goals: String(pick.goals ?? ""), assists: String(pick.assists ?? ""), description: pick.description ?? "", whyWatch: pick.why_watch ?? "" });
              const { data: statsData } = await supabase.from("fc_players").select("overall,pace,shooting,passing,dribbling,defending,physical,photo_url").ilike("name", pick.name).limit(1).maybeSingle();
              if (statsData) setFeaturedPlayerStats(statsData as Partial<PlayerCardData>);
              setFeaturedLoading(false);
              return;
            }
          }
        } catch { /* fall through */ }
      }
      setFeaturedLoading(false);
    }
    fetchRadarPlayer();
  }, []);

  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [recentItems, setRecentItems] = useState<SlideContent[]>([]);
  const [activeSlide, setActiveSlide] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    async function fetchSlider() {
      const { data } = await supabase.from("contents").select("id,title,slug,category,content,created_at").eq("status", "yayinda").order("created_at", { ascending: false }).limit(200);
      if (!data || data.length === 0) { setSlides([pickRandomArenaHeroSlide()]); return; }
      setSlides(mergeContentWithArenaSlot(buildHeroSlides(data as SlideContent[])));
    }
    async function fetchRecent() {
      const { data } = await supabase.from("contents").select("id,title,slug,category,content,created_at").eq("status", "yayinda").order("created_at", { ascending: false }).limit(6);
      if (data && data.length > 0) setRecentItems(data);
    }
    fetchSlider();
    fetchRecent();
  }, []);

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (slides.length < 2) return;
    timerRef.current = setInterval(() => setActiveSlide((p) => (p + 1) % slides.length), 5000);
  }, [slides.length]);

  const goToSlide = useCallback((i: number) => { setActiveSlide(i); resetTimer(); }, [resetTimer]);
  const nextSlide = useCallback(() => { setActiveSlide((p) => (p + 1) % Math.max(slides.length, 1)); resetTimer(); }, [slides.length, resetTimer]);
  const prevSlide = useCallback(() => { setActiveSlide((p) => (p - 1 + slides.length) % Math.max(slides.length, 1)); resetTimer(); }, [slides.length, resetTimer]);

  useEffect(() => {
    if (slides.length < 2) return;
    timerRef.current = setInterval(() => setActiveSlide((p) => (p + 1) % slides.length), 5000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [slides.length]);

  const radarCardData: PlayerCardData | null = featuredPlayer && featuredPlayerStats
    ? {
        name: featuredPlayer.name, club: featuredPlayer.club, league: featuredPlayer.league,
        position: featuredPlayer.position, age: featuredPlayer.age,
        overall: featuredPlayerStats.overall ?? 0, pace: featuredPlayerStats.pace ?? 0,
        shooting: featuredPlayerStats.shooting ?? 0, passing: featuredPlayerStats.passing ?? 0,
        dribbling: featuredPlayerStats.dribbling ?? 0, defending: featuredPlayerStats.defending ?? 0,
        physical: featuredPlayerStats.physical ?? 0, whyWatch: featuredPlayer.whyWatch,
        photo_url: featuredPlayerStats.photo_url as string | undefined,
      }
    : null;

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100">
      <div className="flex min-h-screen flex-col">
        <SiteHeader />

        {/* Hero slider */}
        {slides.length > 0 && (
          <section className="relative h-[280px] w-full overflow-hidden md:h-[420px]">
            <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950/40" />
            <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }} />
            <div className="pointer-events-none absolute -left-20 top-10 h-64 w-64 rounded-full bg-emerald-500/20 blur-[100px]" />
            <div className="pointer-events-none absolute -right-10 bottom-10 h-48 w-48 rounded-full bg-cyan-500/15 blur-[80px]" />

            {slides.map((item, i) => (
              <motion.div
                key={item.slideKey}
                className="absolute inset-0 flex items-center"
                initial={false}
                animate={{ opacity: i === activeSlide ? 1 : 0, scale: i === activeSlide ? 1 : 1.04, zIndex: i === activeSlide ? 10 : 0 }}
                transition={{ opacity: { duration: 0.8, ease: easeOut }, scale: { duration: 1.1, ease: easeOut } }}
              >
                <div className="mx-auto flex max-w-6xl flex-col justify-center px-6 lg:px-8">
                  {item.kind === "content" ? (
                    <>
                      <span className={`mb-3 inline-flex w-fit items-center rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] ${CATEGORY_COLOR[item.slide.category] ?? "bg-slate-500/15 text-slate-300 border-slate-500/40"}`}>
                        {CATEGORY_LABEL[item.slide.category] ?? item.slide.category}
                      </span>
                      <h2 className="mb-2 max-w-3xl bg-gradient-to-r from-emerald-400 via-cyan-400 to-sky-500 bg-clip-text text-[22px] font-extrabold leading-tight tracking-tight text-transparent sm:text-3xl md:mb-3 md:text-[48px] md:leading-[1.15]">
                        {item.slide.title}
                      </h2>
                      <p className="mb-4 hidden max-w-2xl text-sm leading-relaxed text-slate-300 sm:block md:mb-6">
                        {stripHtml(item.slide.content).replace(/[#*_\n]/g, " ").trim().slice(0, 150)}…
                      </p>
                      <Link href={`${categoryPath(item.slide.category)}/${item.slide.slug}`} className="inline-flex w-fit items-center gap-1.5 rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400 px-5 py-2.5 text-xs font-semibold text-slate-950 shadow-[0_0_30px_rgba(16,185,129,0.6)] transition hover:brightness-110">
                        Oku <IconArrowRight />
                      </Link>
                    </>
                  ) : (
                    <>
                      <span className="mb-3 inline-flex w-fit items-center rounded-full border border-amber-500/40 bg-amber-500/15 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-amber-200">Oyna & Paylaş</span>
                      <h2 className="mb-2 max-w-3xl bg-gradient-to-r from-amber-300 via-emerald-400 to-cyan-400 bg-clip-text text-[22px] font-extrabold leading-tight tracking-tight text-transparent sm:text-3xl md:mb-3 md:text-[48px] md:leading-[1.15]">{item.title}</h2>
                      <p className="mb-4 max-w-2xl text-sm leading-relaxed text-slate-300 md:mb-6 md:text-base">{item.teaser}</p>
                      <Link href={item.href} className="inline-flex w-fit items-center gap-1.5 rounded-full bg-gradient-to-r from-amber-400 to-emerald-400 px-5 py-2.5 text-xs font-semibold text-slate-950 shadow-[0_0_30px_rgba(251,191,36,0.45)] transition hover:brightness-110">
                        Oyna <IconArrowRight />
                      </Link>
                    </>
                  )}
                </div>
              </motion.div>
            ))}

            <button onClick={prevSlide} className="absolute left-2 top-1/2 z-20 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full border border-slate-700/60 bg-slate-900/80 text-slate-300 backdrop-blur transition hover:border-emerald-500/60 hover:text-emerald-300 md:left-4 md:h-9 md:w-9">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M15 19l-7-7 7-7" /></svg>
            </button>
            <button onClick={nextSlide} className="absolute right-2 top-1/2 z-20 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full border border-slate-700/60 bg-slate-900/80 text-slate-300 backdrop-blur transition hover:border-emerald-500/60 hover:text-emerald-300 md:right-4 md:h-9 md:w-9">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9 5l7 7-7 7" /></svg>
            </button>
            <div className="absolute bottom-5 left-1/2 z-20 flex -translate-x-1/2 gap-2">
              {slides.map((_, i) => (
                <button key={i} onClick={() => goToSlide(i)} className={["h-2 rounded-full transition-all", i === activeSlide ? "w-6 bg-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.8)]" : "w-2 bg-slate-600 hover:bg-slate-400"].join(" ")} />
              ))}
            </div>
          </section>
        )}

        {/* Son Eklenenler */}
        {recentItems.length > 0 && (
          <section className="border-b border-slate-800/60 bg-slate-950/80 py-6">
            <div className="mx-auto max-w-6xl px-4">
              <div className="mb-4">
                <h3 className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">Son Eklenenler</h3>
              </div>
              <motion.div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none" variants={staggerContainer} initial="hidden" animate="visible">
                {recentItems.map((item) => (
                  <motion.div key={item.id} variants={staggerChild} className="shrink-0">
                    <Link href={`${categoryPath(item.category)}/${item.slug}`} className="group flex w-60 flex-col rounded-xl border border-slate-800/80 bg-slate-950/70 overflow-hidden transition hover:border-emerald-500/40">
                      <div className="h-1" style={{ background: CATEGORY_DOT[item.category] ?? "#4a7a9a" }} />
                      <div className="p-3">
                        <span className={`mb-2 inline-flex w-fit items-center rounded-full border px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.14em] ${CATEGORY_COLOR[item.category] ?? "bg-slate-500/15 text-slate-300 border-slate-500/40"}`}>
                          {CATEGORY_LABEL[item.category] ?? item.category}
                        </span>
                        <p className="line-clamp-2 text-xs font-semibold text-slate-100 transition group-hover:text-emerald-300">{item.title}</p>
                        <span className="mt-2 block text-[10px] text-slate-500">{new Date(item.created_at).toLocaleDateString("tr-TR", { day: "numeric", month: "short" })}</span>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </section>
        )}

        <div className="flex-1">
          <div className="mx-auto max-w-6xl px-4 py-8 lg:py-12">

            {/* Radar Oyuncusu */}
            <motion.section className="mb-10" variants={staggerContainer} initial="hidden" animate="visible">
              <motion.div variants={staggerChild} className="mb-4">
                <h2 className="text-[11px] font-semibold uppercase tracking-[0.22em] text-emerald-300/80">Bu Haftanın Radar Oyuncusu</h2>
              </motion.div>

              {featuredLoading ? (
                <div className="flex items-center gap-2 py-8 text-sm text-slate-400">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-emerald-400 border-t-transparent" />
                  Yükleniyor...
                </div>
              ) : radarCardData ? (
                <motion.div variants={staggerChild} className="grid gap-6 md:grid-cols-[240px_1fr]">
                  <div className="flex justify-center md:justify-start">
                    <PlayerCard
                      player={radarCardData}
                      size="full"
                      showScoutNote={true}
                      animated={true}
                      tmLink={`https://www.transfermarkt.com.tr/schnellsuche/ergebnis/schnellsuche?query=${encodeURIComponent(radarCardData.name)}`}
                      gLink={`https://www.google.com/search?q=${encodeURIComponent(radarCardData.name + " footballer")}`}
                    />
                  </div>
                  <div className="relative overflow-hidden rounded-2xl border border-slate-800/80 bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950/40 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.9)]">
                    <div className="pointer-events-none absolute -right-12 -top-16 h-40 w-40 rounded-full bg-emerald-500/30 blur-3xl" />
                    <div className="relative">
                      <div className="mb-3 flex flex-wrap items-center gap-2">
                        <h1 className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-sky-500 bg-clip-text text-2xl font-extrabold tracking-tight text-transparent md:text-3xl">
                          {radarCardData.name}
                        </h1>
                        <PlayerScoutLinks playerName={radarCardData.name} />
                      </div>
                      {featuredPlayer?.description && (
                        <p className="mb-4 text-sm leading-relaxed text-slate-300">{featuredPlayer.description}</p>
                      )}
                      <div className="grid grid-cols-3 gap-2.5 text-xs">
                        {[
                          { label: "Kulüp", value: radarCardData.club, color: "text-slate-50" },
                          { label: "Pozisyon", value: translatePosition(radarCardData.position), color: "text-slate-50" },
                          { label: "Yaş", value: radarCardData.age, color: "text-slate-50" },
                          { label: "Lig", value: radarCardData.league, color: "text-slate-50" },
                          { label: "Goller", value: featuredPlayer?.goals ?? "—", color: "text-emerald-300" },
                          { label: "Asist", value: featuredPlayer?.assists ?? "—", color: "text-cyan-300" },
                        ].map(({ label, value, color }) => (
                          <div key={label} className="rounded-xl bg-slate-900/70 p-3">
                            <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">{label}</p>
                            <p className={`mt-1 truncate text-sm font-semibold ${color}`}>{String(value) || "—"}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ) : featuredPlayer ? (
                <motion.div variants={staggerChild} className="relative overflow-hidden rounded-2xl border border-slate-800/80 bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950/40 p-6">
                  <h1 className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-sky-500 bg-clip-text text-2xl font-extrabold tracking-tight text-transparent">{featuredPlayer.name}</h1>
                  <p className="mt-2 text-sm text-slate-400">{featuredPlayer.description}</p>
                </motion.div>
              ) : null}
            </motion.section>

            <section className="space-y-10">
              {/* Form Oyuncuları Mini Kart Grid */}
              <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-60px" }}>
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-[11px] font-semibold uppercase tracking-[0.22em] text-emerald-300/80">Bu Dönem Dikkat Çekenler</h2>
                  <span className="text-[11px] text-slate-500">2025-26 · tüm liglerden</span>
                </div>

                {formLoading ? (
                  <div className="flex items-center gap-2 py-8 text-sm text-slate-400">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-emerald-400 border-t-transparent" />
                    Veriler güncelleniyor...
                  </div>
                ) : formPlayersWithStats.length === 0 ? (
                  <p className="py-8 text-center text-sm text-slate-400">Cron job çalıştığında oyuncular burada listelenir.</p>
                ) : (
                  <motion.div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5" variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-40px" }}>
                    {formPlayersWithStats.map((player, index) => {
                      const hasStats = (player.overall ?? 0) > 0;
                      return (
                        <motion.div key={`${player.name}-${index}`} variants={staggerChild}>
                          {hasStats ? (
                            <PlayerCard
                              player={{
                                name: player.name, club: player.club, league: player.league,
                                position: player.position || "", age: player.age,
                                overall: player.overall!, pace: player.pace ?? 0,
                                shooting: player.shooting ?? 0, passing: player.passing ?? 0,
                                dribbling: player.dribbling ?? 0, defending: player.defending ?? 0,
                                physical: player.physical ?? 0,
                                photo_url: player.photo_url as string | undefined,
                              }}
                              size="mini"
                              animated={false}
                            />
                          ) : (
                            <div className="rounded-xl border border-slate-800/80 bg-slate-900/70 p-3">
                              <div className="flex items-center gap-2">
                                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-800 text-[10px] font-bold text-slate-400 ring-1 ring-slate-700/80">
                                  {player.name?.charAt(0) ?? "?"}
                                </span>
                                <div className="min-w-0">
                                  <p className="truncate text-xs font-semibold text-slate-100">{player.name}</p>
                                  <p className="text-[10px] text-slate-500">{player.club}</p>
                                </div>
                              </div>
                              <div className="mt-2 flex items-center justify-between">
                                <span className="text-[10px] text-emerald-300">{translatePosition(player.position)}</span>
                                <PlayerScoutLinks playerName={player.name} />
                              </div>
                            </div>
                          )}
                        </motion.div>
                      );
                    })}
                  </motion.div>
                )}
              </motion.div>

              {/* Öne Çıkan İçerikler */}
              <div>
                <div className="mb-4">
                  <h2 className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">Öne Çıkan İçerikler</h2>
                </div>
                <motion.div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4" variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-60px" }}>
                  {[
                    { title: "En Değerli 10 Genç Stoper", icon: <IconShield className="text-emerald-300" />, desc: "Detaylı analiz, performans metrikleri ve scout notları.", href: "/listeler/en-iyi-10-genc-stoper", tag: "Liste" },
                    { title: "Süper Lig'in Gizli İsimleri", icon: <IconTrendUp className="text-sky-300" />, desc: "Detaylı analiz, performans metrikleri ve scout notları.", href: "/listeler/super-lig-gizli-isimler", tag: "Liste" },
                    { title: "Bu Sezonun Sürpriz İsimleri", icon: <IconStar className="text-amber-300" />, desc: "Detaylı analiz, performans metrikleri ve scout notları.", href: "/listeler/surpriz-isimler-2025", tag: "Liste" },
                    { title: "Oyna & Paylaş", icon: <IconSoccerBall className="text-[#00d4aa]" />, desc: "Bracket'lar, rastgele eşleşmeler ve şampiyonunu paylaş.", href: "/arena", tag: "Arena" },
                  ].map((item) => (
                    <motion.div key={item.href} variants={staggerChild}>
                      <Link href={item.href} className="group flex h-full flex-col items-start rounded-2xl border border-slate-800/80 bg-slate-950/60 px-4 py-4 text-left text-sm text-slate-200 shadow-[0_16px_50px_rgba(15,23,42,0.8)] transition hover:-translate-y-1 hover:border-emerald-500/70 hover:bg-slate-900/80">
                        <span className="mb-2 flex items-center gap-2">
                          {item.icon}
                          <span className="inline-flex rounded-full bg-emerald-500/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-300">{item.tag}</span>
                        </span>
                        <span className="text-sm font-semibold">{item.title}</span>
                        <span className="mt-1 text-xs text-slate-400">{item.desc}</span>
                        <span className="mt-3 inline-flex items-center text-xs font-semibold text-emerald-300">
                          İncele <span className="ml-1 transition-transform group-hover:translate-x-0.5">→</span>
                        </span>
                      </Link>
                    </motion.div>
                  ))}
                </motion.div>
              </div>

              {/* Haftalık Radar banner */}
              <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-60px" }} className="rounded-2xl border border-slate-800/80 bg-gradient-to-r from-slate-950 via-slate-900 to-emerald-950/40 px-5 py-5 sm:px-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="max-w-2xl">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-emerald-300/90">Haftalık Radar</p>
                    <h3 className="mt-2 text-base font-semibold text-slate-50 md:text-lg">Premier League&apos;de gölgede kalan bitiriciler</h3>
                    <p className="mt-2 text-sm text-slate-300">Bu haftaki radar yazımızda, skor tabelasına düzenli yansımayan ancak xG ve bitiricilik metrikleriyle scout ekranlarında öne çıkan genç forvetleri inceliyoruz.</p>
                  </div>
                  <Link href="/radar" className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400 px-5 py-2 text-xs font-semibold text-slate-950 shadow-[0_0_30px_rgba(16,185,129,0.6)] transition hover:brightness-110">
                    Tümünü Oku
                  </Link>
                </div>
              </motion.div>
            </section>
          </div>
        </div>

        <SiteFooter maxWidth="max-w-6xl" />
      </div>
    </main>
  );
}
