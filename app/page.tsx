"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import SiteHeader from "./components/site-header";
import SiteFooter from "./components/site-footer";
import { PlayerScoutLinks } from "./components/player-scout-links";
import PlayerCard, { type PlayerCardData } from "./components/player-card";
import { supabase } from "@/lib/supabase";
import { stripHtml } from "@/lib/utils";
import { ARENA_BRACKETS, arenaPath } from "@/lib/arena-brackets";

// ─── Tipler ──────────────────────────────────────────────────────────────────
type SlideContent = { id: string; title: string; slug: string; category: string; content: string; created_at: string; };
type FormPlayer = { name: string; club: string; league: string; position: string; age: string; goals: string; };
type FormPlayerWithStats = FormPlayer & Partial<PlayerCardData>;
type FeaturedPlayer = { name: string; club: string; position: string; age: string; league: string; goals: string; assists: string; description: string; whyWatch: string; };

// ─── Kategori sabitleri ────────────────────────────────────────────────────
const CAT_LABEL: Record<string, string> = { listeler: "Listeler", radar: "Radar", "taktik-lab": "Taktik Lab" };
const CAT_COLOR: Record<string, string> = { listeler: "var(--sg-secondary)", radar: "var(--sg-primary)", "taktik-lab": "var(--sg-tertiary)", arena: "var(--sg-amber)" };

function categoryPath(cat: string): string {
  if (cat === "listeler") return "/listeler";
  if (cat === "radar") return "/radar";
  if (cat === "taktik-lab") return "/taktik-lab";
  return "/";
}

// ─── Slider yardımcıları ───────────────────────────────────────────────────
const SLIDER_COUNT = 5;

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
  return picked.map((slide, i) => ({ slide, slideKey: `${slide.id}-${i}` }));
}

type HeroContentSlide = { kind: "content"; slide: SlideContent; slideKey: string };
type HeroArenaSlide = { kind: "arena"; slideKey: string; title: string; teaser: string; href: string };
type HeroSlide = HeroContentSlide | HeroArenaSlide;

function pickArenaSlide(): HeroArenaSlide {
  const b = ARENA_BRACKETS[Math.floor(Math.random() * ARENA_BRACKETS.length)];
  return { kind: "arena", slideKey: `arena-${b.slug}-${Date.now()}`, title: b.heroTitle, teaser: b.heroTeaser, href: arenaPath(b.slug) };
}

function mergeWithArena(content: { slide: SlideContent; slideKey: string }[]): HeroSlide[] {
  const arena = pickArenaSlide();
  const items: HeroSlide[] = content.map(({ slide, slideKey }) => ({ kind: "content", slide, slideKey }));
  if (!items.length) return [arena];
  items.splice(Math.floor(Math.random() * (items.length + 1)), 0, arena);
  return items;
}

function translatePosition(pos: string): string {
  const map: Record<string, string> = {
    Forward: "Forvet", Winger: "Kanat", Midfielder: "Orta Saha",
    "Attacking Midfielder": "Ofansif OS", "Defensive Midfielder": "Defansif OS",
    Defender: "Defans", "Center Back": "Stoper", "Right Back": "Sağ Bek",
    "Left Back": "Sol Bek", Goalkeeper: "Kaleci",
    "Right Winger": "Sağ Kanat", "Left Winger": "Sol Kanat", Striker: "Santrafor",
  };
  return map[pos?.trim()] ?? pos;
}

async function fetchFcPlayer(name: string, club?: string) {
  const { data: exact } = await supabase
    .from("fc_players")
    .select("overall,pace,shooting,passing,dribbling,defending,physical,photo_url,position,club,league,age")
    .ilike("name", name)
    .limit(1)
    .maybeSingle();
  if (exact?.overall) return exact;

  const two = name.split(" ").slice(0, 2).join(" ");
  const { data: twoMatch } = await supabase
    .from("fc_players")
    .select("overall,pace,shooting,passing,dribbling,defending,physical,photo_url,position,club,league,age")
    .ilike("name", `%${two}%`)
    .order("overall", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (twoMatch?.overall) return twoMatch;

  if (club) {
    const one = name.split(" ")[0];
    const { data: clubMatch } = await supabase
      .from("fc_players")
      .select("overall,pace,shooting,passing,dribbling,defending,physical,photo_url,position,club,league,age")
      .ilike("name", `%${one}%`)
      .ilike("club", `%${club}%`)
      .order("overall", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (clubMatch?.overall) return clubMatch;
  }

  const oneWord = name.split(" ")[0];
  const { data: oneMatch } = await supabase
    .from("fc_players")
    .select("overall,pace,shooting,passing,dribbling,defending,physical,photo_url,position,club,league,age")
    .ilike("name", `%${oneWord}%`)
    .order("overall", { ascending: false })
    .limit(1)
    .maybeSingle();
  return oneMatch?.overall ? oneMatch : null;
}

// ─── Ana bileşen ──────────────────────────────────────────────────────────
export default function Home() {
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [activeSlide, setActiveSlide] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [recentItems, setRecentItems] = useState<SlideContent[]>([]);
  const [featuredPlayer, setFeaturedPlayer] = useState<FeaturedPlayer | null>(null);
  const [featuredStats, setFeaturedStats] = useState<Partial<PlayerCardData> | null>(null);
  const [featuredLoading, setFeaturedLoading] = useState(true);
  const [formPlayers, setFormPlayers] = useState<FormPlayerWithStats[]>([]);
  const [formLoading, setFormLoading] = useState(true);

  // Slider verisi
  useEffect(() => {
    async function load() {
      const { data } = await supabase.from("contents").select("id,title,slug,category,content,created_at").eq("status", "yayinda").order("created_at", { ascending: false }).limit(200);
      if (!data?.length) { setSlides([pickArenaSlide()]); return; }
      setSlides(mergeWithArena(buildHeroSlides(data as SlideContent[])));
    }
    load();
  }, []);

  // Son eklenenler
  useEffect(() => {
    supabase.from("contents").select("id,title,slug,category,content,created_at").eq("status", "yayinda").order("created_at", { ascending: false }).limit(6)
      .then(({ data }) => { if (data?.length) setRecentItems(data); });
  }, []);

  // Radar oyuncusu
  useEffect(() => {
    async function load() {
      const { data: poolRow } = await supabase.from("site_settings").select("value").eq("key", "featured_player_pool").maybeSingle();
      if (poolRow?.value) {
        try {
          const pool = JSON.parse(poolRow.value as string);
          if (Array.isArray(pool) && pool.length > 0) {
            const pick = pool[Math.floor(Math.random() * pool.length)];
            if (pick?.name) {
              setFeaturedPlayer({ name: pick.name, club: pick.club ?? "", position: pick.position ?? "", age: String(pick.age ?? ""), league: pick.league ?? "", goals: String(pick.goals ?? ""), assists: String(pick.assists ?? ""), description: pick.description ?? "", whyWatch: pick.why_watch ?? "" });
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

  // Form oyuncuları
  useEffect(() => {
    async function load() {
      const { data: poolRow } = await supabase.from("site_settings").select("value").eq("key", "form_players_pool").maybeSingle();
      let list: FormPlayer[] = [];
      if (poolRow?.value) {
        try {
          const p = JSON.parse(poolRow.value as string);
          if (Array.isArray(p) && p.length) list = shuffleInPlace(p as FormPlayer[]).slice(0, 10);
        } catch { /* ignore */ }
      }
      if (!list.length) {
        const { data: leg } = await supabase.from("site_settings").select("value").eq("key", "form_players").maybeSingle();
        if (leg?.value) try { list = shuffleInPlace(JSON.parse(leg.value as string) as FormPlayer[]).slice(0, 10); } catch { /* ignore */ }
      }
      if (list.length) {
        const { data: stats } = await supabase.from("fc_players").select("name,overall,position,pace,shooting,passing,dribbling,defending,physical,photo_url").in("name", list.map(p => p.name));
        const sm = new Map(((stats ?? []) as { name: string }[]).map(s => [s.name.toLowerCase(), s]));
        setFormPlayers(list.map(p => { const s = sm.get(p.name.toLowerCase()); return s ? { ...p, ...(s as Partial<PlayerCardData>), age: String((s as { age?: unknown }).age ?? p.age) } : p; }).filter(p => ((p as FormPlayerWithStats).overall ?? 0) > 0) as FormPlayerWithStats[]);
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

  // Radar kartı
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
    <main style={{ background: "var(--sg-bg)", color: "var(--sg-text-primary)", minHeight: "100vh" }}>
      <SiteHeader />

      {/* ── Hero Slider ───────────────────────────────────────────────────── */}
      {slides.length > 0 && (
        <section className="relative w-full overflow-hidden" style={{ height: "80vh", minHeight: "600px" }}>
          {/* Stadyum arka plan — Unsplash ücretsiz */}
          <div className="absolute inset-0 z-0">
            <img
              src="https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=1600&q=80"
              alt=""
              className="w-full h-full object-cover"
              style={{ filter: "brightness(0.35) saturate(0.8)" }}
            />
            <div className="absolute inset-0" style={{ background: "linear-gradient(to top, var(--sg-bg) 0%, rgba(6,15,30,0.5) 50%, transparent 100%)" }} />
            <div className="absolute inset-0" style={{ background: "linear-gradient(to right, var(--sg-bg) 0%, transparent 60%)" }} />
          </div>

          {/* Slide içerikleri */}
          {slides.map((item, i) => (
            <motion.div
              key={item.slideKey}
              className="absolute inset-0 flex items-center z-10"
              initial={false}
              animate={{ opacity: i === activeSlide ? 1 : 0 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              style={{ pointerEvents: i === activeSlide ? "auto" : "none" }}
            >
              <div className="w-full max-w-7xl mx-auto px-8 md:px-12">
                {item.kind === "content" ? (
                  <>
                    <span className="inline-block px-3 py-1 text-[10px] font-bold tracking-[0.2em] uppercase mb-5 w-fit"
                      style={{
                        background: CAT_COLOR[item.slide.category] ? `${CAT_COLOR[item.slide.category]}20` : "rgba(70,241,197,0.15)",
                        color: CAT_COLOR[item.slide.category] ?? "var(--sg-primary)",
                        border: `1px solid ${CAT_COLOR[item.slide.category] ?? "var(--sg-primary)"}40`,
                        fontFamily: "var(--font-headline)",
                      }}>
                      {CAT_LABEL[item.slide.category] ?? item.slide.category}
                    </span>
                    <h1 className="font-bold leading-none tracking-tighter mb-5 max-w-4xl"
                      style={{
                        fontFamily: "var(--font-headline)",
                        fontSize: "clamp(2.5rem, 7vw, 5.5rem)",
                        background: "linear-gradient(135deg, var(--sg-primary), var(--sg-secondary))",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        backgroundClip: "text",
                      }}>
                      {item.slide.title}
                    </h1>
                    <p className="text-base md:text-lg max-w-2xl mb-8 hidden sm:block"
                      style={{ color: "var(--sg-text-secondary)", fontFamily: "var(--font-body)" }}>
                      {stripHtml(item.slide.content).replace(/[#*_\n]/g, " ").trim().slice(0, 140)}…
                    </p>
                    <Link href={`${categoryPath(item.slide.category)}/${item.slide.slug}`}
                      className="inline-flex items-center gap-2 px-8 py-3.5 font-bold uppercase tracking-wider transition-all hover:brightness-110 active:scale-95"
                      style={{
                        background: "var(--sg-primary)", color: "#060f1e",
                        fontFamily: "var(--font-headline)", fontSize: "12px",
                      }}>
                      Devamını Oku
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                    </Link>
                  </>
                ) : (
                  <>
                    <span className="inline-block px-3 py-1 text-[10px] font-bold tracking-[0.2em] uppercase mb-5 w-fit"
                      style={{ background: "rgba(249,189,34,0.15)", color: "var(--sg-amber)", border: "1px solid rgba(249,189,34,0.3)", fontFamily: "var(--font-headline)" }}>
                      Arena
                    </span>
                    <h1 className="font-bold leading-none tracking-tighter mb-5 max-w-4xl"
                      style={{
                        fontFamily: "var(--font-headline)",
                        fontSize: "clamp(2.5rem, 7vw, 5.5rem)",
                        background: "linear-gradient(135deg, var(--sg-amber), var(--sg-primary))",
                        WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
                      }}>
                      {item.title}
                    </h1>
                    <p className="text-base md:text-lg max-w-2xl mb-8" style={{ color: "var(--sg-text-secondary)" }}>{item.teaser}</p>
                    <Link href={item.href}
                      className="inline-flex items-center gap-2 px-8 py-3.5 font-bold uppercase tracking-wider transition-all hover:brightness-110"
                      style={{ background: "var(--sg-amber)", color: "#060f1e", fontFamily: "var(--font-headline)", fontSize: "12px" }}>
                      Oyna
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                    </Link>
                  </>
                )}
              </div>
            </motion.div>
          ))}

          {/* Slide indikatörler */}
          <div className="absolute bottom-10 left-8 md:left-12 z-20 flex gap-3">
            {slides.map((_, i) => (
              <button key={i} onClick={() => goTo(i)}
                className="h-1.5 transition-all duration-300"
                style={{ width: i === activeSlide ? "48px" : "24px", background: i === activeSlide ? "var(--sg-primary)" : "rgba(255,255,255,0.2)" }}
              />
            ))}
          </div>

          {/* Ok butonları */}
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

      {/* ── Son Eklenenler ────────────────────────────────────────────────── */}
      {recentItems.length > 0 && (
        <section className="py-16 px-8 max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.25em] mb-1"
                style={{ color: "var(--sg-primary)", fontFamily: "var(--font-headline)" }}>Keşfet</p>
              <h2 className="text-3xl md:text-4xl font-bold" style={{ fontFamily: "var(--font-headline)" }}>Son Eklenenler</h2>
            </div>
          </div>
          {/* Scroll container — touch-friendly */}
          <div className="flex gap-4 overflow-x-auto pb-4 -mx-8 px-8 snap-x snap-mandatory scrollbar-none">
            {recentItems.map((item) => {
              const accentColor = CAT_COLOR[item.category] ?? "var(--sg-primary)";
              const catLabel = CAT_LABEL[item.category] ?? item.category;
              return (
                <Link key={item.id} href={`${categoryPath(item.category)}/${item.slug}`}
                  className="group flex-shrink-0 snap-start flex flex-col transition hover:-translate-y-0.5"
                  style={{ width: "260px", background: "var(--sg-surface)" }}>
                  {/* Üst görsel alan — degrade arka plan */}
                  <div className="relative h-32 overflow-hidden flex items-center justify-center"
                    style={{ background: `linear-gradient(135deg, color-mix(in srgb, ${accentColor} 15%, transparent) 0%, var(--sg-surface-low) 100%)` }}>
                    <span className="text-[80px] font-black opacity-[0.06] select-none leading-none"
                      style={{ fontFamily: "var(--font-headline)", color: accentColor }}>
                      {catLabel.toUpperCase().slice(0, 1)}
                    </span>
                    {/* Kategori badge */}
                    <span className="absolute top-3 left-3 px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.18em]"
                      style={{
                        background: `color-mix(in srgb, ${accentColor} 20%, transparent)`,
                        color: accentColor,
                        fontFamily: "var(--font-headline)",
                        border: `1px solid color-mix(in srgb, ${accentColor} 30%, transparent)`,
                      }}>
                      {catLabel}
                    </span>
                    <span className="absolute top-3 right-3 text-[10px]" style={{ color: "var(--sg-text-muted)" }}>
                      {new Date(item.created_at).toLocaleDateString("tr-TR", { day: "numeric", month: "short" })}
                    </span>
                  </div>
                  {/* Accent çizgisi */}
                  <div className="h-[2px]" style={{ background: accentColor }} />
                  {/* İçerik */}
                  <div className="p-4 flex flex-col flex-1">
                    <h3 className="text-sm font-bold leading-snug line-clamp-3 transition group-hover:opacity-80"
                      style={{ fontFamily: "var(--font-headline)", color: "var(--sg-text-primary)" }}>
                      {item.title}
                    </h3>
                    <div className="mt-3 inline-flex items-center gap-1 text-[10px] font-bold"
                      style={{ color: accentColor, fontFamily: "var(--font-headline)" }}>
                      Oku <span className="transition-transform group-hover:translate-x-0.5">→</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* ── Radar Oyuncusu ───────────────────────────────────────────────── */}
      <section className="py-20 relative" style={{ background: "var(--sg-surface-low)" }}>
        {/* Dekoratif glow */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -left-32 top-1/2 -translate-y-1/2 h-96 w-96 rounded-full opacity-10"
            style={{ background: "radial-gradient(circle, var(--sg-primary) 0%, transparent 70%)", filter: "blur(60px)" }} />
        </div>
        <div className="max-w-7xl mx-auto px-8">
          <div className="mb-10">
            <p className="text-[10px] font-bold uppercase tracking-[0.25em] mb-1" style={{ color: "var(--sg-primary)", fontFamily: "var(--font-headline)" }}>Öne Çıkan Profil</p>
            <h2 className="text-3xl md:text-4xl font-bold" style={{ fontFamily: "var(--font-headline)" }}>Bu Haftanın Radar Oyuncusu</h2>
          </div>

          {featuredLoading ? (
            <div className="flex items-center gap-2 py-12" style={{ color: "var(--sg-text-muted)" }}>
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-t-transparent" style={{ borderColor: "var(--sg-primary)", borderTopColor: "transparent" }} />
              <span className="text-sm">Yükleniyor...</span>
            </div>
          ) : radarCard ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
              {/* Sol — PlayerCard */}
              <div className="lg:col-span-4 flex justify-center lg:justify-start">
                <PlayerCard player={radarCard} size="full" showScoutNote={true} animated={true}
                  tmLink={`https://www.transfermarkt.com.tr/schnellsuche/ergebnis/schnellsuche?query=${encodeURIComponent(radarCard.name)}`}
                  gLink={`https://www.google.com/search?q=${encodeURIComponent(radarCard.name + " footballer")}`}
                />
              </div>

              {/* Sağ — Detaylar */}
              <div className="lg:col-span-8 flex flex-col justify-center">
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  <h3 className="text-3xl md:text-5xl font-bold tracking-tighter" style={{ fontFamily: "var(--font-headline)", color: "var(--sg-primary)", textShadow: "0 0 20px rgba(70,241,197,0.3)" }}>
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
                    { label: "Yaş", value: radarCard.age },
                    { label: "Kulüp", value: radarCard.club },
                    { label: "Pozisyon", value: translatePosition(radarCard.position) },
                    { label: "Lig", value: radarCard.league },
                    { label: "Goller", value: featuredPlayer?.goals ?? "—", highlight: true },
                    { label: "Asist", value: featuredPlayer?.assists ?? "—", highlight: true },
                  ].map(({ label, value, highlight }) => (
                    <div key={label} className="p-4 border-l-2" style={{ background: "var(--sg-surface)", borderLeftColor: highlight ? "var(--sg-primary)" : "var(--sg-secondary)" }}>
                      <p className="text-[10px] font-bold uppercase tracking-[0.18em] mb-1" style={{ color: "var(--sg-text-muted)", fontFamily: "var(--font-headline)" }}>{label}</p>
                      <p className="text-xl font-bold" style={{ fontFamily: "var(--font-headline)", color: highlight ? "var(--sg-primary)" : "var(--sg-text-primary)" }}>{String(value) || "—"}</p>
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

      {/* ── Bu Dönem Dikkat Çekenler ──────────────────────────────────────── */}
      <section className="py-20 px-8 max-w-7xl mx-auto">
        <div className="mb-8">
          <p className="text-[10px] font-bold uppercase tracking-[0.25em] mb-1" style={{ color: "var(--sg-secondary)", fontFamily: "var(--font-headline)" }}>Rising Stars</p>
          <h2 className="text-3xl md:text-4xl font-bold" style={{ fontFamily: "var(--font-headline)" }}>Bu Dönem Dikkat Çekenler</h2>
        </div>

        {formLoading ? (
          <div className="flex items-center gap-2 py-8" style={{ color: "var(--sg-text-muted)" }}>
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-t-transparent" style={{ borderColor: "var(--sg-primary)", borderTopColor: "transparent" }} />
            <span className="text-sm">Yükleniyor...</span>
          </div>
        ) : formPlayers.length === 0 ? (
          <p className="text-sm py-8 text-center" style={{ color: "var(--sg-text-muted)" }}>Oyuncular yakında listelenecek.</p>
        ) : (
          <motion.div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
            initial="hidden" whileInView="visible" viewport={{ once: true }}
            variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.07 } } }}>
            {formPlayers.map((player, i) => (
              <motion.div key={`${player.name}-${i}`}
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
                  tmLink={`https://www.transfermarkt.com.tr/schnellsuche/ergebnis/schnellsuche?query=${encodeURIComponent(player.name)}`}
                  gLink={`https://www.google.com/search?q=${encodeURIComponent(player.name + " footballer")}`}
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </section>

      {/* ── Laboratuvara Katıl (newsletter CTA) ─────────────────────────── */}
      <section className="mx-8 mb-16 max-w-7xl lg:mx-auto p-10 md:p-16 relative overflow-hidden"
        style={{ background: "var(--sg-primary)" }}>
        <div className="pointer-events-none absolute inset-0" style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 60%)" }} />
        <div className="relative grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tighter leading-none mb-3" style={{ fontFamily: "var(--font-headline)", color: "#060f1e" }}>
              Laboratuvara<br />Katıl
            </h2>
            <p className="text-sm leading-relaxed" style={{ color: "rgba(6,15,30,0.7)", fontFamily: "var(--font-body)" }}>
              Haftalık taktiksel scout raporları ve oyuncu analizleri doğrudan sana gelsin.
            </p>
          </div>
          <div className="flex gap-0">
            <input
              type="email"
              placeholder="E-POSTA ADRESİN"
              className="flex-1 px-5 py-4 text-sm font-bold outline-none tracking-wider"
              style={{ background: "rgba(6,15,30,0.15)", color: "#060f1e", fontFamily: "var(--font-headline)", border: "none" }}
            />
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
