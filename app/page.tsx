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
import { supabase } from "@/lib/supabase";
import { stripHtml } from "@/lib/utils";
import { ARENA_BRACKETS, arenaPath } from "@/lib/arena-brackets";

// ─── Animasyon varyantları ───────────────────────────────────────────────────

// Tek element: aşağıdan yukarı süzülme
const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
  },
};

// Container: child'ları sırayla tetikler (stagger)
const staggerContainer = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.05,
    },
  },
};

// Stagger için child varyantı
const staggerChild = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] },
  },
};

// ────────────────────────────────────────────────────────────────────────────

function translatePosition(pos: string): string {
  const map: Record<string, string> = {
    Forward: "Forvet",
    Winger: "Kanat",
    Midfielder: "Orta Saha",
    "Attacking Midfielder": "Ofansif Orta Saha",
    "Defensive Midfielder": "Defansif Orta Saha",
    Defender: "Defans",
    "Center Back": "Stoper",
    "Right Back": "Sağ Bek",
    "Left Back": "Sol Bek",
    Goalkeeper: "Kaleci",
    "Right Winger": "Sağ Kanat",
    "Left Winger": "Sol Kanat",
    Striker: "Santrafor",
  };
  const t = pos.trim();
  return map[t] ?? pos;
}

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

  const byNewest = [...all].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );

  const picked: SlideContent[] = [];
  const used = new Set<string>();

  const in7 = byNewest.filter((c) => new Date(c.created_at).getTime() >= now - ms7);
  for (let i = 0; i < Math.min(2, in7.length); i++) {
    picked.push(in7[i]);
    used.add(in7[i].id);
  }

  if (picked.length < SLIDER_COUNT) {
    const in30 = byNewest.filter(
      (c) => new Date(c.created_at).getTime() >= now - ms30 && !used.has(c.id),
    );
    for (const c of in30) {
      if (picked.length >= SLIDER_COUNT) break;
      picked.push(c);
      used.add(c.id);
    }
  }

  if (picked.length < SLIDER_COUNT) {
    const rest = shuffleInPlace(byNewest.filter((c) => !used.has(c.id)));
    for (const c of rest) {
      if (picked.length >= SLIDER_COUNT) break;
      picked.push(c);
      used.add(c.id);
    }
  }

  const pool = picked.length > 0 ? picked : byNewest;
  let r = 0;
  while (picked.length < SLIDER_COUNT && pool.length > 0) {
    picked.push(pool[r % pool.length]);
    r++;
  }

  return picked.map((slide, i) => ({
    slide,
    slideKey: `${slide.id}-hero-${i}`,
  }));
}

type HeroContentSlide = { kind: "content"; slide: SlideContent; slideKey: string };
type HeroArenaSlide = {
  kind: "arena";
  slideKey: string;
  title: string;
  teaser: string;
  href: string;
};
type HeroSlide = HeroContentSlide | HeroArenaSlide;

function pickRandomArenaHeroSlide(): HeroArenaSlide {
  const b = ARENA_BRACKETS[Math.floor(Math.random() * ARENA_BRACKETS.length)];
  return {
    kind: "arena",
    slideKey: `arena-hero-${b.slug}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    title: b.heroTitle,
    teaser: b.heroTeaser,
    href: arenaPath(b.slug),
  };
}

function mergeContentWithArenaSlot(
  content: { slide: SlideContent; slideKey: string }[],
): HeroSlide[] {
  const arena = pickRandomArenaHeroSlide();
  const items: HeroSlide[] = content.map(({ slide, slideKey }) => ({
    kind: "content",
    slide,
    slideKey,
  }));
  if (items.length === 0) return [arena];
  const insertAt = Math.floor(Math.random() * (items.length + 1));
  items.splice(insertAt, 0, arena);
  return items;
}

export default function Home() {
  type FormPlayer = {
    name: string; club: string; league: string;
    position: string; age: string; goals: string;
  };
  const [formPlayers, setFormPlayers] = useState<FormPlayer[]>([]);
  const [formLoading, setFormLoading] = useState(true);

  useEffect(() => {
    async function fetchFormPlayers() {
      const { data: poolRow } = await supabase
        .from("site_settings")
        .select("value")
        .eq("key", "form_players_pool")
        .maybeSingle();

      let list: FormPlayer[] = [];
      if (poolRow?.value) {
        try {
          const parsed = JSON.parse(poolRow.value as string);
          if (Array.isArray(parsed) && parsed.length > 0) {
            const shuffled = shuffleInPlace(parsed as FormPlayer[]);
            list = shuffled.slice(0, 10);
          }
        } catch { /* ignore */ }
      }

      if (list.length === 0) {
        const { data: legacy } = await supabase
          .from("site_settings")
          .select("value")
          .eq("key", "form_players")
          .maybeSingle();
        if (legacy?.value) {
          try {
            const parsed = JSON.parse(legacy.value as string);
            if (Array.isArray(parsed)) {
              const shuffled = shuffleInPlace(parsed as FormPlayer[]);
              list = shuffled.slice(0, 10);
            }
          } catch { /* ignore */ }
        }
      }

      setFormPlayers(list);
      setFormLoading(false);
    }
    fetchFormPlayers();
  }, []);

  type FeaturedPlayerData = {
    name: string; club: string; position: string; age: string;
    league: string; goals: string; assists: string;
    description: string; whyWatch: string;
  };
  const [featuredPlayer, setFeaturedPlayer] = useState<FeaturedPlayerData | null>(null);
  const [featuredLoading, setFeaturedLoading] = useState(true);

  useEffect(() => {
    async function fetchRadarPlayer() {
      type PoolEntry = {
        name?: string; club?: string; league?: string; position?: string;
        age?: string; goals?: string; assists?: string;
        description?: string; why_watch?: string;
      };

      const { data: poolRow } = await supabase
        .from("site_settings")
        .select("value")
        .eq("key", "featured_player_pool")
        .maybeSingle();

      if (poolRow?.value) {
        try {
          const pool = JSON.parse(poolRow.value as string) as PoolEntry[];
          if (Array.isArray(pool) && pool.length > 0) {
            const pick = pool[Math.floor(Math.random() * pool.length)];
            if (pick?.name) {
              setFeaturedPlayer({
                name: pick.name ?? "",
                club: pick.club ?? "",
                position: pick.position ?? "",
                age: String(pick.age ?? ""),
                league: pick.league ?? "",
                goals: String(pick.goals ?? ""),
                assists: String(pick.assists ?? ""),
                description: pick.description ?? "",
                whyWatch: pick.why_watch ?? "",
              });
              setFeaturedLoading(false);
              return;
            }
          }
        } catch { /* fall through */ }
      }

      const keys = [
        "featured_player_name", "featured_player_club", "featured_player_position",
        "featured_player_age", "featured_player_league", "featured_player_goals",
        "featured_player_assists", "featured_player_description", "featured_player_why_watch",
      ];
      const { data } = await supabase
        .from("site_settings")
        .select("key, value")
        .in("key", keys);

      if (data && data.length > 0) {
        const s = Object.fromEntries(data.map((r) => [r.key, r.value as string]));
        if (s.featured_player_name) {
          setFeaturedPlayer({
            name:        s.featured_player_name        ?? "",
            club:        s.featured_player_club        ?? "",
            position:    s.featured_player_position    ?? "",
            age:         s.featured_player_age         ?? "",
            league:      s.featured_player_league      ?? "",
            goals:       s.featured_player_goals       ?? "",
            assists:     s.featured_player_assists     ?? "",
            description: s.featured_player_description ?? "",
            whyWatch:    s.featured_player_why_watch   ?? "",
          });
        }
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
      const { data } = await supabase
        .from("contents")
        .select("id, title, slug, category, content, created_at")
        .eq("status", "yayinda")
        .order("created_at", { ascending: false })
        .limit(200);

      if (!data || data.length === 0) {
        setSlides([pickRandomArenaHeroSlide()]);
        return;
      }

      const built = buildHeroSlides(data as SlideContent[]);
      setSlides(mergeContentWithArenaSlot(built));
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

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (slides.length < 2) return;
    timerRef.current = setInterval(() => {
      setActiveSlide((p) => (p + 1) % slides.length);
    }, 5000);
  }, [slides.length]);

  const goToSlide = useCallback((i: number) => {
    setActiveSlide(i);
    resetTimer();
  }, [resetTimer]);

  const nextSlide = useCallback(() => {
    setActiveSlide((p) => (p + 1) % Math.max(slides.length, 1));
    resetTimer();
  }, [slides.length, resetTimer]);

  const prevSlide = useCallback(() => {
    setActiveSlide((p) => (p - 1 + slides.length) % Math.max(slides.length, 1));
    resetTimer();
  }, [slides.length, resetTimer]);

  useEffect(() => {
    if (slides.length < 2) return;
    timerRef.current = setInterval(() => {
      setActiveSlide((p) => (p + 1) % slides.length);
    }, 5000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [slides.length]);

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100">
      <div className="flex min-h-screen flex-col">
        <SiteHeader />

        {/* ── Hero slider ─────────────────────────────────────────────────── */}
        {slides.length > 0 && (
          <section className="relative h-[280px] w-full overflow-hidden md:h-[420px]">
            <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950/40" />
            <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }} />
            <div className="pointer-events-none absolute -left-20 top-10 h-64 w-64 rounded-full bg-emerald-500/20 blur-[100px]" />
            <div className="pointer-events-none absolute -right-10 bottom-10 h-48 w-48 rounded-full bg-cyan-500/15 blur-[80px]" />

            {slides.map((item, i) => (
              <div
                key={item.slideKey}
                className={[
                  "absolute inset-0 flex items-center transition-opacity duration-700",
                  i === activeSlide ? "opacity-100 z-10" : "opacity-0 z-0",
                ].join(" ")}
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
                      <Link
                        href={`${categoryPath(item.slide.category)}/${item.slide.slug}`}
                        className="inline-flex w-fit items-center gap-1.5 rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400 px-5 py-2.5 text-xs font-semibold text-slate-950 shadow-[0_0_30px_rgba(16,185,129,0.6)] transition hover:brightness-110"
                      >
                        Oku <IconArrowRight />
                      </Link>
                    </>
                  ) : (
                    <>
                      <span className="mb-3 inline-flex w-fit items-center rounded-full border border-amber-500/40 bg-amber-500/15 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-amber-200">
                        Oyna & Paylaş
                      </span>
                      <h2 className="mb-2 max-w-3xl bg-gradient-to-r from-amber-300 via-emerald-400 to-cyan-400 bg-clip-text text-[22px] font-extrabold leading-tight tracking-tight text-transparent sm:text-3xl md:mb-3 md:text-[48px] md:leading-[1.15]">
                        {item.title}
                      </h2>
                      <p className="mb-4 max-w-2xl text-sm leading-relaxed text-slate-300 md:mb-6 md:text-base">
                        {item.teaser}
                      </p>
                      <Link
                        href={item.href}
                        className="inline-flex w-fit items-center gap-1.5 rounded-full bg-gradient-to-r from-amber-400 to-emerald-400 px-5 py-2.5 text-xs font-semibold text-slate-950 shadow-[0_0_30px_rgba(251,191,36,0.45)] transition hover:brightness-110"
                      >
                        Oyna <IconArrowRight />
                      </Link>
                    </>
                  )}
                </div>
              </div>
            ))}

            <button onClick={prevSlide} className="absolute left-2 top-1/2 z-20 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full border border-slate-700/60 bg-slate-900/80 text-slate-300 backdrop-blur transition hover:border-emerald-500/60 hover:text-emerald-300 md:left-4 md:h-9 md:w-9">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="md:h-[14px] md:w-[14px]"><path d="M15 19l-7-7 7-7" /></svg>
            </button>
            <button onClick={nextSlide} className="absolute right-2 top-1/2 z-20 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full border border-slate-700/60 bg-slate-900/80 text-slate-300 backdrop-blur transition hover:border-emerald-500/60 hover:text-emerald-300 md:right-4 md:h-9 md:w-9">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="md:h-[14px] md:w-[14px]"><path d="M9 5l7 7-7 7" /></svg>
            </button>

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

        {/* ── Son Eklenenler ───────────────────────────────────────────────── */}
        {recentItems.length > 0 && (
          <section className="border-b border-slate-800/60 bg-slate-950/80 py-6">
            <div className="mx-auto max-w-6xl px-4">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                  Son Eklenenler
                </h3>
                <span className="text-[11px] text-slate-400">Yayında son içerikler</span>
              </div>

              {/* Stagger container: kartlar sırayla belirir */}
              <motion.div
                className="flex gap-4 overflow-x-auto pb-2 scrollbar-none"
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
              >
                {recentItems.map((item) => (
                  <motion.div key={item.id} variants={staggerChild}>
                    <Link
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
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </section>
        )}

        {/* ── Ana içerik ───────────────────────────────────────────────────── */}
        <div className="flex-1">
          <div className="mx-auto max-w-6xl px-4 py-8 lg:py-12">

            {/* Radar oyuncusu + platform özeti */}
            <motion.section
              className="mb-10 grid gap-6 md:grid-cols-[minmax(0,1.7fr)_minmax(0,1.3fr)]"
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
            >
              {/* Radar oyuncusu kartı */}
              <motion.div
                variants={staggerChild}
                className="relative overflow-hidden rounded-2xl border border-slate-800/80 bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950/40 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.9)]"
              >
                <div className="pointer-events-none absolute -right-12 -top-16 h-40 w-40 rounded-full bg-emerald-500/30 blur-3xl" />
                <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-emerald-300/90">
                  Bu Haftanın Radar Oyuncusu
                </p>

                {featuredLoading ? (
                  <div className="mt-4 flex items-center gap-2 text-sm text-slate-400">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-emerald-400 border-t-transparent" />
                    Veri yükleniyor...
                  </div>
                ) : featuredPlayer ? (
                  <>
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <h1 className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-sky-500 bg-clip-text text-2xl font-extrabold tracking-tight text-transparent md:text-3xl">
                        {featuredPlayer.name}
                      </h1>
                      <PlayerScoutLinks playerName={featuredPlayer.name} />
                    </div>
                    {featuredPlayer.description && (
                      <p className="mt-2 text-sm leading-relaxed text-slate-300">
                        {featuredPlayer.description}
                      </p>
                    )}
                    <div className="mt-4 grid grid-cols-3 gap-2.5 text-xs">
                      {[
                        { label: "Kulüp",    value: featuredPlayer.club,     color: "text-slate-50" },
                        { label: "Pozisyon", value: translatePosition(featuredPlayer.position), color: "text-slate-50" },
                        { label: "Yaş",      value: featuredPlayer.age,      color: "text-slate-50" },
                        { label: "Lig",      value: featuredPlayer.league,   color: "text-slate-50" },
                        { label: "Goller",   value: featuredPlayer.goals,    color: "text-emerald-300" },
                        { label: "Asist",    value: featuredPlayer.assists,  color: "text-cyan-300" },
                      ].map(({ label, value, color }) => (
                        <div key={label} className="rounded-xl bg-slate-900/70 p-3">
                          <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">{label}</p>
                          <p className={`mt-1 truncate text-sm font-semibold ${color}`}>{value || "—"}</p>
                        </div>
                      ))}
                    </div>
                    {featuredPlayer.whyWatch && (
                      <div className="mt-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-3">
                        <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-400">
                          Scout Notu
                        </p>
                        <p className="text-xs leading-relaxed text-slate-300">{featuredPlayer.whyWatch}</p>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <h1 className="mt-3 bg-gradient-to-r from-emerald-400 via-cyan-400 to-sky-500 bg-clip-text text-2xl font-extrabold tracking-tight text-transparent md:text-3xl">
                      Veri bekleniyor
                    </h1>
                    <p className="mt-2 text-sm text-slate-400">
                      Radar oyuncusu henüz belirlenmedi. Cron job çalıştığında otomatik güncellenir.
                    </p>
                  </>
                )}
              </motion.div>

              {/* Platform özeti kartı */}
              <motion.div
                variants={staggerChild}
                className="relative overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-900/80 p-5"
              >
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
                    {[
                      {
                        icon: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>,
                        iconBg: "bg-emerald-500/15 text-emerald-300",
                        title: "Kürasyonlu Listeler",
                        desc: "Pozisyona ve profile göre hazırlanmış genç yetenek listeleri ve scout notları",
                      },
                      {
                        icon: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>,
                        iconBg: "bg-sky-500/15 text-sky-300",
                        title: "Haftalık Radar",
                        desc: "Her hafta güncellenen derinlemesine oyuncu analizleri ve performans raporları",
                      },
                      {
                        icon: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>,
                        iconBg: "bg-violet-500/15 text-violet-300",
                        title: "Taktik Lab",
                        desc: "Modern futbolun pozisyon arketiplerini keşfet: False 9, Inverted Winger ve daha fazlası",
                      },
                    ].map((item) => (
                      <div key={item.title} className="flex items-start gap-3 rounded-xl border border-slate-700/50 bg-slate-950/40 p-3">
                        <span className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg ${item.iconBg}`}>
                          {item.icon}
                        </span>
                        <div>
                          <p className="text-xs font-semibold text-slate-100">{item.title}</p>
                          <p className="mt-0.5 text-[11px] leading-relaxed text-slate-400">{item.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </motion.section>

            {/* ── Alt içerik bölümleri ─────────────────────────────────────── */}
            <section className="space-y-10">

              {/* Form oyuncuları tablosu */}
              <motion.div
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-60px" }}
                className="rounded-2xl border border-slate-800/80 bg-slate-900/70 shadow-[0_24px_80px_rgba(15,23,42,0.9)]"
              >
                <div className="border-b border-slate-800/80 px-5 pb-4 pt-4 sm:px-6">
                  <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-300/90">
                    Bu Dönem Dikkat Çekenler
                  </h2>
                  <p className="mt-1 text-xs text-slate-300/80">
                    2025-26 sezonunda form grafiği yükselen genç oyuncular — tüm liglerden
                  </p>
                </div>

                <div className="relative overflow-x-auto px-2 pb-4 pt-2 sm:px-4">
                  {formLoading ? (
                    <div className="flex min-h-[220px] items-center justify-center text-sm text-slate-300">
                      <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-emerald-400 border-t-transparent" />
                      Veriler güncelleniyor...
                    </div>
                  ) : formPlayers.length === 0 ? (
                    <div className="flex min-h-[220px] flex-col items-center justify-center gap-2 text-center">
                      <p className="text-sm text-slate-400">Veriler güncelleniyor...</p>
                      <p className="text-xs text-slate-600">Cron job çalıştığında form oyuncuları burada listelenir.</p>
                    </div>
                  ) : (
                    <table className="min-w-full border-separate border-spacing-0 text-sm">
                      <thead>
                        <tr className="bg-slate-900/80">
                          <th className="sticky left-0 z-10 border-b border-slate-700/80 bg-slate-900/90 px-3 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">#</th>
                          <th className="border-b border-slate-700/80 px-3 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Oyuncu</th>
                          <th className="border-b border-slate-700/80 px-3 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Pozisyon</th>
                          <th className="hidden border-b border-slate-700/80 px-3 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400 md:table-cell">Yaş</th>
                          <th className="hidden border-b border-slate-700/80 px-3 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400 md:table-cell">Kulüp / Lig</th>
                          <th className="border-b border-slate-700/80 px-3 py-3 text-right text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Goller</th>
                        </tr>
                      </thead>
                      <tbody>
                        {formPlayers.map((player, index) => (
                          <tr
                            key={`${player.name}-${index}`}
                            className="group transition-all duration-200 hover:bg-slate-800/70 hover:shadow-[0_0_0_1px_rgba(45,212,191,0.4)]"
                          >
                            <td className="sticky left-0 z-10 border-b border-slate-800/80 bg-slate-900/80 px-3 py-3 text-xs font-semibold text-slate-300">
                              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-800/80 text-[11px] text-emerald-300 ring-1 ring-emerald-500/40">
                                {index + 1}
                              </span>
                            </td>
                            <td className="border-b border-slate-800/80 px-3 py-3 text-sm font-medium text-slate-100">
                              <div className="flex min-w-0 items-center gap-2.5">
                                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-800 text-[10px] font-bold text-slate-400 ring-1 ring-slate-700/80">
                                  {player.name?.charAt(0) ?? "?"}
                                </span>
                                <div className="flex min-w-0 flex-1 items-center gap-1.5">
                                  <span className="truncate">{player.name}</span>
                                  <PlayerScoutLinks playerName={player.name} />
                                </div>
                              </div>
                            </td>
                            <td className="border-b border-slate-800/80 px-3 py-3 text-xs font-medium text-emerald-300">
                              {player.position ? translatePosition(player.position) : "—"}
                            </td>
                            <td className="hidden border-b border-slate-800/80 px-3 py-3 text-xs text-slate-300 md:table-cell">
                              {player.age || "—"}
                            </td>
                            <td className="hidden border-b border-slate-800/80 px-3 py-3 md:table-cell">
                              <p className="text-xs text-slate-300">{player.club || "—"}</p>
                              <p className="text-[11px] text-slate-500">{player.league || ""}</p>
                            </td>
                            <td className="border-b border-slate-800/80 px-3 py-3 text-right text-sm font-semibold text-emerald-300">
                              {player.goals || "—"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </motion.div>

              {/* Öne Çıkan Listeler */}
              <div>
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-400">
                    Öne Çıkan Listeler
                  </h2>
                  <span className="text-[11px] text-slate-400">Kürasyonlu içerik listeleri</span>
                </div>

                {/* Kartlar stagger ile belirir */}
                <motion.div
                  className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
                  variants={staggerContainer}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: "-60px" }}
                >
                  {[
                    { title: "En Değerli 10 Genç Stoper", slug: "en-iyi-10-genc-stoper", icon: <IconShield className="text-emerald-300" />, desc: "Detaylı analiz, performans metrikleri ve scout notları ile birlikte.", href: "/listeler/en-iyi-10-genc-stoper", tag: "Liste", cta: "Listeyi aç" },
                    { title: "Süper Lig'in Gizli İsimleri", slug: "super-lig-gizli-isimler", icon: <IconTrendUp className="text-sky-300" />, desc: "Detaylı analiz, performans metrikleri ve scout notları ile birlikte.", href: "/listeler/super-lig-gizli-isimler", tag: "Liste", cta: "Listeyi aç" },
                    { title: "Bu Sezonun Sürpriz İsimleri", slug: "surpriz-isimler-2025", icon: <IconStar className="text-amber-300" />, desc: "Detaylı analiz, performans metrikleri ve scout notları ile birlikte.", href: "/listeler/surpriz-isimler-2025", tag: "Liste", cta: "Listeyi aç" },
                    { title: "Oyna", slug: "arena", icon: <IconSoccerBall className="text-[#00d4aa]" />, desc: "Bracket'lar, rastgele eşleşmeler ve şampiyonunu paylaş.", href: "/arena", tag: "Oyna", cta: "Oyna" },
                  ].map((item) => (
                    <motion.div key={item.slug} variants={staggerChild}>
                      <Link
                        href={item.href}
                        className="group flex h-full flex-col items-start rounded-2xl border border-slate-800/80 bg-slate-950/60 px-4 py-4 text-left text-sm text-slate-200 shadow-[0_16px_50px_rgba(15,23,42,0.8)] transition hover:-translate-y-1 hover:border-emerald-500/70 hover:bg-slate-900/80"
                      >
                        <span className="mb-2 flex items-center gap-2">
                          {item.icon}
                          <span className="inline-flex rounded-full bg-emerald-500/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-300">
                            {item.tag}
                          </span>
                        </span>
                        <span className="text-sm font-semibold">{item.title}</span>
                        <span className="mt-1 text-xs text-slate-400">{item.desc}</span>
                        <span className="mt-3 inline-flex items-center text-xs font-semibold text-emerald-300">
                          {item.cta}
                          <span className="ml-1 transition-transform group-hover:translate-x-0.5">→</span>
                        </span>
                      </Link>
                    </motion.div>
                  ))}
                </motion.div>
              </div>

              {/* Haftalık Radar banner */}
              <motion.div
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-60px" }}
                className="rounded-2xl border border-slate-800/80 bg-gradient-to-r from-slate-950 via-slate-900 to-emerald-950/40 px-5 py-5 sm:px-6"
              >
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
              </motion.div>

            </section>
          </div>
        </div>

        <SiteFooter maxWidth="max-w-6xl" />
      </div>
    </main>
  );
}
