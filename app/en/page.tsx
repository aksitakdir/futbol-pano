"use client";

import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import SiteHeader from "../components/site-header";
import SiteFooter from "../components/site-footer";
import { PlayerScoutLinks } from "../components/player-scout-links";
import PlayerCard, { type PlayerCardData } from "../components/player-card";
import { supabase } from "@/lib/supabase";
import { getCategoryImage } from "@/lib/category-images";
import { ARENA_BRACKETS, arenaPath } from "@/lib/arena-brackets";

// ─── Types ───────────────────────────────────────────────────────────────────
type SlideContent = {
  id: string;
  title: string;
  title_en?: string;
  slug: string;
  category: string;
  content: string;
  content_en?: string;
  created_at: string;
  cover_image?: string;
};
type FormPlayer = { name: string; club: string; league: string; position: string; age: string; goals: string; };
type FormPlayerWithStats = FormPlayer & Partial<PlayerCardData>;
type FeaturedPlayer = { name: string; club: string; position: string; age: string; league: string; goals: string; assists: string; description: string; whyWatch: string; };

// ─── Category constants ───────────────────────────────────────────────────
const CAT_LABEL: Record<string, string> = { listeler: "Scouting Lists", radar: "Radar", "taktik-lab": "Tactics Lab" };
const CAT_COLOR: Record<string, string> = { listeler: "var(--sg-secondary)", radar: "var(--sg-primary)", "taktik-lab": "var(--sg-tertiary)", arena: "var(--sg-amber)" };

function categoryPath(cat: string): string {
  if (cat === "listeler") return "/en/listeler";
  if (cat === "radar") return "/en/radar";
  if (cat === "taktik-lab") return "/en/taktik-lab";
  return "/en";
}

const SLIDER_COUNT = 5;

function shuffleInPlace<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

function buildHeroSlides(all: SlideContent[]): { slide: SlideContent; slideKey: string }[] {
  if (!all.length) return [];
  const now = Date.now();
  const ms7 = 7 * 24 * 60 * 60 * 1000;
  const ms30 = 30 * 24 * 60 * 60 * 1000;
  const byNewest = [...all].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  const picked: SlideContent[] = [];
  const used = new Set<string>();
  for (const c of byNewest.filter(c => new Date(c.created_at).getTime() >= now - ms7)) {
    if (picked.length >= 2) break;
    picked.push(c); used.add(c.id);
  }
  for (const c of byNewest.filter(c => new Date(c.created_at).getTime() >= now - ms30 && !used.has(c.id))) {
    if (picked.length >= SLIDER_COUNT) break;
    picked.push(c); used.add(c.id);
  }
  for (const c of shuffleInPlace(byNewest.filter(c => !used.has(c.id)))) {
    if (picked.length >= SLIDER_COUNT) break;
    picked.push(c); used.add(c.id);
  }
  const pool = picked.length > 0 ? picked : byNewest;
  let r = 0;
  while (picked.length < SLIDER_COUNT && pool.length > 0) { picked.push(pool[r % pool.length]); r++; }
  return picked.map((slide, i) => ({ slide, slideKey: `${slide.id}-en-${i}` }));
}

type HeroContentSlide = { kind: "content"; slide: SlideContent; slideKey: string };
type HeroArenaSlide = { kind: "arena"; slideKey: string; title: string; teaser: string; href: string };
type HeroSlide = HeroContentSlide | HeroArenaSlide;

function pickArenaSlide(): HeroArenaSlide {
  const b = ARENA_BRACKETS[Math.floor(Math.random() * ARENA_BRACKETS.length)];
  return { kind: "arena", slideKey: `arena-en-${b.slug}-${Date.now()}`, title: b.heroTitle, teaser: b.heroTeaser, href: arenaPath(b.slug) };
}

function mergeWithArena(content: { slide: SlideContent; slideKey: string }[]): HeroSlide[] {
  const arena = pickArenaSlide();
  const items: HeroSlide[] = content.map(({ slide, slideKey }) => ({ kind: "content", slide, slideKey }));
  if (!items.length) return [arena];
  items.splice(Math.floor(Math.random() * (items.length + 1)), 0, arena);
  return items;
}

async function fetchFcPlayer(name: string, club?: string) {
  const { data: exact } = await supabase.from("fc_players")
    .select("overall,pace,shooting,passing,dribbling,defending,physical,photo_url,position,club,league,age")
    .ilike("name", name).limit(1).maybeSingle();
  if (exact?.overall) return exact;
  const words = name.split(" ");
  if (words.length >= 2) {
    const two = words.slice(0, 2).join(" ");
    const { data: twoMatch } = await supabase.from("fc_players")
      .select("overall,pace,shooting,passing,dribbling,defending,physical,photo_url,position,club,league,age")
      .ilike("name", `%${two}%`).order("overall", { ascending: false }).limit(1).maybeSingle();
    if (twoMatch?.overall) return twoMatch;
  }
  if (club) {
    const one = words[0];
    const { data: clubMatch } = await supabase.from("fc_players")
      .select("overall,pace,shooting,passing,dribbling,defending,physical,photo_url,position,club,league,age")
      .ilike("name", `%${one}%`).ilike("club", `%${club}%`)
      .order("overall", { ascending: false }).limit(1).maybeSingle();
    if (clubMatch?.overall) return clubMatch;
  }
  return null;
}

export default function EnHome() {
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [activeSlide, setActiveSlide] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [recentItems, setRecentItems] = useState<SlideContent[]>([]);
  const [featuredPlayer, setFeaturedPlayer] = useState<FeaturedPlayer | null>(null);
  const [featuredStats, setFeaturedStats] = useState<Partial<PlayerCardData> | null>(null);
  const [featuredLoading, setFeaturedLoading] = useState(true);
  const [formPlayers, setFormPlayers] = useState<FormPlayerWithStats[]>([]);
  const [formLoading, setFormLoading] = useState(true);

  const gundemItems = useMemo(
    () => (recentItems.length ? shuffleInPlace([...recentItems]).slice(0, 3) : []),
    [recentItems],
  );

  // Slider
  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from("contents")
        .select("id,title,title_en,slug,category,content,content_en,created_at,cover_image")
        .eq("status", "yayinda")
        .order("created_at", { ascending: false })
        .limit(200);
      if (!data?.length) { setSlides([pickArenaSlide()]); return; }
      setSlides(mergeWithArena(buildHeroSlides(data as SlideContent[])));
    }
    load();
  }, []);

  // Recent items
  useEffect(() => {
    supabase
      .from("contents")
      .select("id,title,title_en,slug,category,content,content_en,created_at,cover_image")
      .eq("status", "yayinda")
      .order("created_at", { ascending: false })
      .limit(6)
      .then(({ data }) => { if (data?.length) setRecentItems(data); });
  }, []);

  // Featured player
  useEffect(() => {
    async function load() {
      const { data: poolRow } = await supabase.from("site_settings").select("value").eq("key", "form_players_pool").maybeSingle();
      if (poolRow?.value) {
        try {
          const pool = JSON.parse(poolRow.value as string);
          if (Array.isArray(pool) && pool.length > 0) {
            const pick = pool[Math.floor(Math.random() * pool.length)];
            if (pick?.name) {
              setFeaturedPlayer({
                name: pick.name ?? "", club: pick.club ?? "", position: pick.position ?? "",
                age: String(pick.age ?? ""), league: pick.league ?? "",
                goals: String(pick.goals ?? ""), assists: String(pick.assists ?? ""),
                description: pick.description ?? "", whyWatch: pick.why_watch ?? "",
              });
              const stats = await fetchFcPlayer(pick.name, pick.club);
              if (stats?.overall) setFeaturedStats(stats as Partial<PlayerCardData>);
            }
          }
        } catch { /* ignore */ }
      }
      setFeaturedLoading(false);
    }
    load();
  }, []);

  // Form players
  useEffect(() => {
    async function load() {
      const { data: poolRow } = await supabase.from("site_settings").select("value").eq("key", "form_players_pool").maybeSingle();
      let list: FormPlayer[] = [];
      if (poolRow?.value) {
        try {
          const p = JSON.parse(poolRow.value as string);
          if (Array.isArray(p) && p.length) list = shuffleInPlace(p as FormPlayer[]).slice(0, 20);
        } catch { /* ignore */ }
      }
      if (!list.length) {
        const { data: leg } = await supabase.from("site_settings").select("value").eq("key", "form_players").maybeSingle();
        if (leg?.value) {
          try {
            const parsed = JSON.parse(leg.value as string);
            if (Array.isArray(parsed)) list = shuffleInPlace(parsed as FormPlayer[]).slice(0, 20);
          } catch { /* ignore */ }
        }
      }
      if (list.length) {
        const { data: stats } = await supabase.from("fc_players").select("name,overall,position,pace,shooting,passing,dribbling,defending,physical,photo_url").in("name", list.map(p => p.name));
        const sm = new Map(((stats ?? []) as { name: string }[]).map(s => [s.name.toLowerCase(), s]));
        const withStats = list.map((p) => {
          const s = sm.get(p.name.toLowerCase());
          return s ? { ...p, ...(s as Partial<PlayerCardData>), age: String((s as { age?: unknown }).age ?? p.age) } : p;
        });
        const statPlayers = withStats.filter((p) => ((p as FormPlayerWithStats).overall ?? 0) > 0);
        setFormPlayers(shuffleInPlace(statPlayers).slice(0, 10) as FormPlayerWithStats[]);
      }
      setFormLoading(false);
    }
    load();
  }, []);

  // Slider timer
  const resetTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (slides.length < 2) return;
    timerRef.current = setInterval(() => setActiveSlide(p => (p + 1) % slides.length), 5000);
  }, [slides.length]);

  useEffect(() => {
    if (slides.length < 2) return;
    timerRef.current = setInterval(() => setActiveSlide(p => (p + 1) % slides.length), 5000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [slides.length]);

  const goTo = (i: number) => { setActiveSlide(i); resetTimer(); };
  const prev = () => { setActiveSlide(p => (p - 1 + slides.length) % slides.length); resetTimer(); };
  const next = () => { setActiveSlide(p => (p + 1) % slides.length); resetTimer(); };

  const radarCard: PlayerCardData | null = featuredPlayer && featuredStats
    ? {
        name: featuredPlayer.name, club: featuredPlayer.club, league: featuredPlayer.league,
        position: featuredPlayer.position, age: featuredPlayer.age,
        overall: featuredStats.overall ?? 0, pace: featuredStats.pace ?? 0,
        shooting: featuredStats.shooting ?? 0, passing: featuredStats.passing ?? 0,
        dribbling: featuredStats.dribbling ?? 0, defending: featuredStats.defending ?? 0,
        physical: featuredStats.physical ?? 0, whyWatch: featuredPlayer.whyWatch,
        photo_url: featuredStats.photo_url as string | undefined,
      }
    : null;

  return (
    <main lang="en" style={{ background: "var(--sg-bg)", color: "var(--sg-text-primary)", minHeight: "100vh" }}>
      <SiteHeader />

      {/* ── Hero Slider ── */}
      {slides.length > 0 && (
        <section className="relative w-full overflow-hidden" style={{ height: "80vh", minHeight: "600px" }}>
          <div className="absolute inset-0 z-0">
            {slides[activeSlide]?.kind === "content" && slides[activeSlide].slide.cover_image ? (
              <img
                key={slides[activeSlide].slide.cover_image}
                src={slides[activeSlide].slide.cover_image}
                alt=""
                className="w-full h-full object-cover"
                style={{ filter: "brightness(0.35) saturate(0.8)" }}
              />
            ) : (
              <img
                key="hero-fallback"
                src="https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=1600&q=80"
                alt=""
                className="w-full h-full object-cover"
                style={{ filter: "brightness(0.35) saturate(0.8)" }}
              />
            )}
            <div className="absolute inset-0" style={{ background: "linear-gradient(to top, var(--sg-bg) 0%, rgba(6,15,30,0.5) 50%, transparent 100%)" }} />
            <div className="absolute inset-0" style={{ background: "linear-gradient(to right, var(--sg-bg) 0%, transparent 60%)" }} />
          </div>

          {slides.map((item, i) => (
            <motion.div key={item.slideKey} className="absolute inset-0 flex items-center z-10"
              initial={false} animate={{ opacity: i === activeSlide ? 1 : 0 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              style={{ pointerEvents: i === activeSlide ? "auto" : "none" }}>
              <div className="w-full max-w-7xl mx-auto px-8 md:px-12 pb-16">
                {item.kind === "content" ? (
                  <>
                    <span className="inline-block px-3 py-1 text-[10px] font-bold tracking-[0.2em] uppercase mb-5 w-fit"
                      style={{
                        background: `color-mix(in srgb, ${CAT_COLOR[item.slide.category] ?? "var(--sg-primary)"} 22%, transparent)`,
                        color: CAT_COLOR[item.slide.category] ?? "var(--sg-primary)",
                        border: `1px solid color-mix(in srgb, ${CAT_COLOR[item.slide.category] ?? "var(--sg-primary)"} 38%, transparent)`,
                        fontFamily: "var(--font-headline)",
                      }}>
                      {CAT_LABEL[item.slide.category] ?? item.slide.category}
                    </span>
                    <h1 className="font-bold tracking-tighter mb-5 max-w-4xl"
                      style={{
                        fontFamily: "var(--font-headline)",
                        fontSize: "clamp(2.5rem, 7vw, 5.5rem)",
                        lineHeight: 1.18, paddingBottom: "0.12em",
                        background: "linear-gradient(135deg, var(--sg-primary), var(--sg-secondary))",
                        WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
                      }}>
                      {(() => {
                        const t = item.slide.title_en || item.slide.title;
                        return t.length > 80 ? t.slice(0, 80) + "…" : t;
                      })()}
                    </h1>
                    <p className="text-base md:text-lg max-w-2xl mb-8 hidden sm:block"
                      style={{ color: "var(--sg-text-secondary)" }}>
                      {(() => {
                        const raw = item.slide.content_en || item.slide.content;
                        const clean = raw.replace(/<[^>]+>/g, " ").replace(/[#*_\n]/g, " ").replace(/\s+/g, " ").trim();
                        const titleNorm = (item.slide.title_en || item.slide.title).replace(/\s+/g, " ").trim().toLowerCase();
                        const cleanStart = clean.toLowerCase().startsWith(titleNorm) ? clean.slice((item.slide.title_en || item.slide.title).length).trim() : clean;
                        const firstSentence = cleanStart.match(/^[^.!?]{20,}[.!?]/)?.[0];
                        return firstSentence ? firstSentence.trim() : cleanStart.slice(0, 160) + "…";
                      })()}
                    </p>
                    <Link href={`${categoryPath(item.slide.category)}/${item.slide.slug}`}
                      className="inline-flex items-center gap-2 px-8 py-3.5 font-bold uppercase tracking-wider transition-all hover:brightness-110 active:scale-95"
                      style={{ background: "var(--sg-primary)", color: "#060f1e", fontFamily: "var(--font-headline)", fontSize: "12px" }}>
                      Read More
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                    </Link>
                  </>
                ) : (
                  <>
                    <span className="inline-block px-3 py-1 text-[10px] font-bold tracking-[0.2em] uppercase mb-5 w-fit"
                      style={{ background: "rgba(249,189,34,0.15)", color: "var(--sg-amber)", border: "1px solid rgba(249,189,34,0.3)", fontFamily: "var(--font-headline)" }}>
                      Arena
                    </span>
                    <h1 className="font-bold tracking-tighter mb-5 max-w-4xl"
                      style={{
                        fontFamily: "var(--font-headline)", fontSize: "clamp(2.5rem, 7vw, 5.5rem)",
                        lineHeight: 1.18, paddingBottom: "0.12em",
                        background: "linear-gradient(135deg, var(--sg-amber), var(--sg-primary))",
                        WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
                      }}>
                      {item.title}
                    </h1>
                    <p className="text-base md:text-lg max-w-2xl mb-8" style={{ color: "var(--sg-text-secondary)" }}>{item.teaser}</p>
                    <Link href={item.href}
                      className="inline-flex items-center gap-2 px-8 py-3.5 font-bold uppercase tracking-wider transition-all hover:brightness-110"
                      style={{ background: "var(--sg-amber)", color: "#060f1e", fontFamily: "var(--font-headline)", fontSize: "12px" }}>
                      Play
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                    </Link>
                  </>
                )}
              </div>
            </motion.div>
          ))}

          <div className="absolute bottom-10 left-8 md:left-12 z-20 flex gap-3">
            {slides.map((_, i) => (
              <button key={i} onClick={() => goTo(i)} className="h-1.5 transition-all duration-300"
                style={{ width: i === activeSlide ? "48px" : "24px", background: i === activeSlide ? "var(--sg-primary)" : "rgba(255,255,255,0.2)" }} />
            ))}
          </div>
          <button onClick={prev} className="absolute left-4 top-1/2 -translate-y-1/2 z-20 flex h-10 w-10 items-center justify-center transition-all hover:opacity-80"
            style={{ background: "rgba(23,32,47,0.7)", backdropFilter: "blur(8px)", color: "var(--sg-text-secondary)" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M15 19l-7-7 7-7" /></svg>
          </button>
          <button onClick={next} className="absolute right-4 top-1/2 -translate-y-1/2 z-20 flex h-10 w-10 items-center justify-center transition-all hover:opacity-80"
            style={{ background: "rgba(23,32,47,0.7)", backdropFilter: "blur(8px)", color: "var(--sg-text-secondary)" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9 5l7 7-7 7" /></svg>
          </button>
        </section>
      )}

      {/* ── Latest Content ── */}
      {recentItems.length > 0 && (
        <section className="py-10 px-8 max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.25em] mb-1"
                style={{ color: "var(--sg-primary)", fontFamily: "var(--font-headline)" }}>Discover</p>
              <h2 className="text-3xl md:text-4xl font-bold" style={{ fontFamily: "var(--font-headline)" }}>Latest Content</h2>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
            {recentItems[0] && (() => {
              const item = recentItems[0];
              const accentColor = CAT_COLOR[item.category] ?? "var(--sg-primary)";
              const catLabel = CAT_LABEL[item.category] ?? item.category;
              return (
                <Link href={`${categoryPath(item.category)}/${item.slug}`}
                  className="group lg:col-span-6 flex flex-col transition hover:-translate-y-0.5"
                  style={{ background: "var(--sg-surface)" }}>
                  <div className="relative h-64 lg:h-80 overflow-hidden" style={{ background: "var(--sg-surface-low)" }}>
                    <img
                      src={item.cover_image || getCategoryImage(item.category, item.slug)}
                      alt=""
                      className="w-full h-full object-cover transition group-hover:scale-105 duration-500"
                      style={{ filter: "brightness(0.4) saturate(0.6)" }}
                      onError={(e) => { (e.target as HTMLImageElement).style.opacity = "0"; }}
                    />
                    <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, transparent 30%, var(--sg-surface) 100%)" }} />
                    <span className="absolute top-3 left-3 px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.18em]"
                      style={{ background: `color-mix(in srgb, ${accentColor} 20%, transparent)`, color: accentColor, fontFamily: "var(--font-headline)", border: `1px solid color-mix(in srgb, ${accentColor} 30%, transparent)` }}>
                      {catLabel}
                    </span>
                    <span className="absolute top-3 right-3 text-[10px]" style={{ color: "var(--sg-text-muted)" }}>
                      {new Date(item.created_at).toLocaleDateString("en-US", { day: "numeric", month: "short" })}
                    </span>
                  </div>
                  <div className="h-[3px]" style={{ background: accentColor }} />
                  <div className="p-5 flex flex-col flex-1">
                    <h3 className="text-lg font-bold leading-snug line-clamp-2 mb-3"
                      style={{ fontFamily: "var(--font-headline)", color: "var(--sg-text-primary)" }}>
                      {item.title_en || item.title}
                    </h3>
                    <p className="text-sm line-clamp-2 mb-4" style={{ color: "var(--sg-text-secondary)" }}>
                      {(item.content_en || item.content) ? (item.content_en || item.content).replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 120) + "…" : ""}
                    </p>
                    <div className="mt-auto inline-flex items-center gap-1 text-[11px] font-bold"
                      style={{ color: accentColor, fontFamily: "var(--font-headline)" }}>
                      Read <span className="transition-transform group-hover:translate-x-0.5">→</span>
                    </div>
                  </div>
                </Link>
              );
            })()}
            <div className="lg:col-span-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-2">
              {recentItems.slice(1, 5).map((item) => {
                const accentColor = CAT_COLOR[item.category] ?? "var(--sg-primary)";
                const catLabel = CAT_LABEL[item.category] ?? item.category;
                return (
                  <Link key={item.id} href={`${categoryPath(item.category)}/${item.slug}`}
                    className="group flex flex-col transition hover:-translate-y-0.5"
                    style={{ background: "var(--sg-surface)" }}>
                    <div className="relative h-28 overflow-hidden" style={{ background: "var(--sg-surface-low)" }}>
                      <img
                        src={item.cover_image || getCategoryImage(item.category, item.slug)}
                        alt=""
                        className="w-full h-full object-cover transition group-hover:scale-105 duration-500"
                        style={{ filter: "brightness(0.4) saturate(0.6)" }}
                        onError={(e) => { (e.target as HTMLImageElement).style.opacity = "0"; }}
                      />
                      <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, transparent 20%, var(--sg-surface) 100%)" }} />
                      <span className="absolute top-2 left-2 px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-[0.15em]"
                        style={{ background: `color-mix(in srgb, ${accentColor} 20%, transparent)`, color: accentColor, fontFamily: "var(--font-headline)", border: `1px solid color-mix(in srgb, ${accentColor} 30%, transparent)` }}>
                        {catLabel}
                      </span>
                    </div>
                    <div className="h-[2px]" style={{ background: accentColor }} />
                    <div className="p-3 flex flex-col flex-1">
                      <h3 className="text-xs font-bold leading-snug line-clamp-2 mb-2"
                        style={{ fontFamily: "var(--font-headline)", color: "var(--sg-text-primary)" }}>
                        {item.title_en || item.title}
                      </h3>
                      <div className="mt-auto inline-flex items-center gap-1 text-[10px] font-bold"
                        style={{ color: accentColor, fontFamily: "var(--font-headline)" }}>
                        Read <span className="transition-transform group-hover:translate-x-0.5">→</span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ── Radar Player of the Week ── */}
      <section className="py-20 relative" style={{ background: "var(--sg-surface-low)" }}>
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -left-32 top-1/2 -translate-y-1/2 h-96 w-96 rounded-full opacity-10"
            style={{ background: "radial-gradient(circle, var(--sg-primary) 0%, transparent 70%)", filter: "blur(60px)" }} />
        </div>
        <div className="max-w-7xl mx-auto px-8">
          <div className="mb-10">
            <p className="text-[10px] font-bold uppercase tracking-[0.25em] mb-1" style={{ color: "var(--sg-primary)", fontFamily: "var(--font-headline)" }}>Featured Profile</p>
            <h2 className="text-3xl md:text-4xl font-bold" style={{ fontFamily: "var(--font-headline)" }}>Radar Player of the Week</h2>
          </div>
          {featuredLoading ? (
            <div className="flex items-center gap-2 py-12" style={{ color: "var(--sg-text-muted)" }}>
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-t-transparent" style={{ borderColor: "var(--sg-primary)", borderTopColor: "transparent" }} />
              <span className="text-sm">Loading...</span>
            </div>
          ) : radarCard ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
              <div className="lg:col-span-4 flex justify-center lg:justify-start">
                <PlayerCard player={radarCard} size="full" showScoutNote={true} animated={true}
                  tmLink={`https://www.transfermarkt.com/schnellsuche/ergebnis/schnellsuche?query=${encodeURIComponent(radarCard.name)}`}
                  gLink={`https://www.google.com/search?q=${encodeURIComponent(radarCard.name + " footballer")}`}
                />
              </div>
              <div className="lg:col-span-8 flex flex-col justify-center">
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  <h3 className="text-3xl md:text-5xl font-bold tracking-tighter"
                    style={{ fontFamily: "var(--font-headline)", color: "var(--sg-primary)", textShadow: "0 0 20px rgba(70,241,197,0.3)" }}>
                    {radarCard.name}
                  </h3>
                  <PlayerScoutLinks playerName={radarCard.name} />
                </div>
                {featuredPlayer?.description && (
                  <p className="text-base leading-relaxed mb-8 max-w-2xl" style={{ color: "var(--sg-text-secondary)" }}>
                    {featuredPlayer.description}
                  </p>
                )}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {[
                    { label: "Age", value: radarCard.age },
                    { label: "Club", value: radarCard.club },
                    { label: "Position", value: radarCard.position },
                    { label: "League", value: radarCard.league },
                    { label: "Goals", value: featuredPlayer?.goals ?? "—", highlight: true },
                    { label: "Assists", value: featuredPlayer?.assists ?? "—", highlight: true },
                  ].map(({ label, value, highlight }) => (
                    <div key={label} className="p-4 border-l-2"
                      style={{ background: "var(--sg-surface)", borderLeftColor: highlight ? "var(--sg-primary)" : "var(--sg-secondary)" }}>
                      <p className="text-[10px] font-bold uppercase tracking-[0.18em] mb-1"
                        style={{ color: "var(--sg-text-muted)", fontFamily: "var(--font-headline)" }}>{label}</p>
                      <p className="text-xl font-bold"
                        style={{ fontFamily: "var(--font-headline)", color: highlight ? "var(--sg-primary)" : "var(--sg-text-primary)" }}>
                        {String(value) || "—"}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : featuredPlayer ? (
            <div className="p-8" style={{ background: "var(--sg-surface)" }}>
              <h3 className="text-2xl font-bold" style={{ fontFamily: "var(--font-headline)", color: "var(--sg-primary)" }}>{featuredPlayer.name}</h3>
              <p className="mt-2 text-sm" style={{ color: "var(--sg-text-secondary)" }}>{featuredPlayer.description}</p>
            </div>
          ) : null}
        </div>
      </section>

      {/* ── On Our Radar ── */}
      <section className="py-20 px-8 max-w-7xl mx-auto">
        <div className="mb-8">
          <p className="text-[10px] font-bold uppercase tracking-[0.25em] mb-1"
            style={{ color: "var(--sg-secondary)", fontFamily: "var(--font-headline)" }}>On Our Radar</p>
          <h2 className="text-3xl md:text-4xl font-bold" style={{ fontFamily: "var(--font-headline)" }}>Players to Watch</h2>
        </div>
        {formLoading ? (
          <div className="flex items-center gap-2 py-8" style={{ color: "var(--sg-text-muted)" }}>
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-t-transparent" style={{ borderColor: "var(--sg-primary)", borderTopColor: "transparent" }} />
            <span className="text-sm">Loading...</span>
          </div>
        ) : formPlayers.length === 0 ? (
          <p className="text-sm py-8 text-center" style={{ color: "var(--sg-text-muted)" }}>Players coming soon.</p>
        ) : (
          <motion.div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
            initial="hidden" whileInView="visible" viewport={{ once: true }}
            variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.07 } } }}>
            {formPlayers.map((player, i) => (
              <motion.div key={`${player.name}-en-${i}`}
                variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5 } } }}>
                <PlayerCard
                  player={{
                    name: player.name, club: player.club, league: player.league,
                    position: player.position || "", age: String(player.age),
                    overall: player.overall!, pace: player.pace ?? 0,
                    shooting: player.shooting ?? 0, passing: player.passing ?? 0,
                    dribbling: player.dribbling ?? 0, defending: player.defending ?? 0,
                    physical: player.physical ?? 0,
                    photo_url: player.photo_url as string | undefined,
                  }}
                  size="mini" animated={false}
                  tmLink={`https://www.transfermarkt.com/schnellsuche/ergebnis/schnellsuche?query=${encodeURIComponent(player.name)}`}
                  gLink={`https://www.google.com/search?q=${encodeURIComponent(player.name + " footballer")}`}
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </section>

      {/* ── Featured Articles ── */}
      {gundemItems.length > 0 && (
        <section className="py-8 px-8 max-w-7xl mx-auto">
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-60px" }}>
            <div className="mb-6">
              <p className="text-[10px] font-bold uppercase tracking-[0.25em] mb-1"
                style={{ color: "var(--sg-tertiary)", fontFamily: "var(--font-headline)" }}>Editor's Pick</p>
              <h2 className="text-2xl md:text-3xl font-bold" style={{ fontFamily: "var(--font-headline)" }}>Featured Articles</h2>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {gundemItems.map((item) => {
                const accentColor = CAT_COLOR[item.category] ?? "var(--sg-primary)";
                const catLabel = CAT_LABEL[item.category] ?? item.category;
                return (
                  <Link key={`${item.id}-en-gundem`} href={`${categoryPath(item.category)}/${item.slug}`}
                    className="group flex flex-col transition hover:-translate-y-0.5"
                    style={{ background: "var(--sg-surface)", borderLeft: `3px solid ${accentColor}` }}>
                    <div className="relative h-28 overflow-hidden" style={{ background: "var(--sg-surface-low)" }}>
                      <img
                        src={item.cover_image || getCategoryImage(item.category, item.slug)}
                        alt=""
                        className="w-full h-full object-cover transition group-hover:scale-105 duration-500"
                        style={{ filter: "brightness(0.35) saturate(0.6)" }}
                        onError={(e) => { (e.target as HTMLImageElement).style.opacity = "0"; }}
                      />
                      <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, transparent 30%, var(--sg-surface) 100%)" }} />
                    </div>
                    <div className="p-4 flex flex-col flex-1">
                      <span className="text-[9px] font-bold uppercase tracking-[0.18em] mb-2 block"
                        style={{ color: accentColor, fontFamily: "var(--font-headline)" }}>{catLabel}</span>
                      <h3 className="text-sm font-bold leading-snug line-clamp-2 mb-3"
                        style={{ fontFamily: "var(--font-headline)", color: "var(--sg-text-primary)" }}>
                        {item.title_en || item.title}
                      </h3>
                      <div className="mt-auto inline-flex items-center gap-1 text-[10px] font-bold"
                        style={{ color: accentColor, fontFamily: "var(--font-headline)" }}>
                        Read <span className="transition-transform group-hover:translate-x-0.5">→</span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </motion.div>
        </section>
      )}

      {/* ── Join the Lab CTA ── */}
      <section className="mx-8 mb-16 max-w-7xl lg:mx-auto p-10 md:p-16 relative overflow-hidden"
        style={{ background: "var(--sg-primary)" }}>
        <div className="pointer-events-none absolute inset-0" style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 60%)" }} />
        <div className="relative grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tighter leading-none mb-3"
              style={{ fontFamily: "var(--font-headline)", color: "#060f1e" }}>
              Join the<br />Laboratory
            </h2>
            <p className="text-sm leading-relaxed" style={{ color: "rgba(6,15,30,0.7)", fontFamily: "var(--font-body)" }}>
              Weekly tactical scouting reports and player analyses delivered directly to you.
            </p>
          </div>
          <div className="flex gap-0">
            <input type="email" placeholder="YOUR EMAIL ADDRESS"
              className="flex-1 px-5 py-4 text-sm font-bold outline-none tracking-wider"
              style={{ background: "rgba(6,15,30,0.15)", color: "#060f1e", fontFamily: "var(--font-headline)", border: "none" }} />
            <button className="px-6 py-4 font-bold uppercase tracking-wider transition-all hover:opacity-80"
              style={{ background: "#060f1e", color: "var(--sg-primary)", fontFamily: "var(--font-headline)", fontSize: "12px" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
            </button>
          </div>
        </div>
      </section>

      <SiteFooter maxWidth="max-w-7xl" />
    </main>
  );
}
