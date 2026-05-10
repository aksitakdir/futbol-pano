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
import { arenaPath, type ArenaGame } from "@/lib/arena-brackets";

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

function pickArenaSlide(arenaGames: ArenaGame[]): HeroArenaSlide | null {
  if (!arenaGames.length) return null;
  const g = arenaGames[Math.floor(Math.random() * arenaGames.length)];
  return { kind: "arena", slideKey: `arena-en-${g.slug}-${Date.now()}`, title: g.hero_title_en, teaser: g.hero_teaser_en, href: arenaPath(g.slug) };
}

function mergeWithArena(content: { slide: SlideContent; slideKey: string }[], arenaGames: ArenaGame[]): HeroSlide[] {
  const arena = pickArenaSlide(arenaGames);
  const items: HeroSlide[] = content.map(({ slide, slideKey }) => ({ kind: "content", slide, slideKey }));
  if (!items.length) return arena ? [arena] : [];
  if (arena) items.splice(Math.floor(Math.random() * (items.length + 1)), 0, arena);
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
      const arenaRes = await supabase
        .from("arena_games")
        .select("id,slug,status,title_tr,title_en,description_tr,description_en,hero_title_tr,hero_title_en,hero_teaser_tr,hero_teaser_en,card_color,game_type,created_at")
        .eq("status", "published");
      const arenaGames = (arenaRes.data ?? []) as ArenaGame[];
      if (!data?.length) {
        const a = pickArenaSlide(arenaGames);
        setSlides(a ? [a] : []);
        return;
      }
      setSlides(mergeWithArena(buildHeroSlides(data as SlideContent[]), arenaGames));
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
      <div style={{ paddingTop: "68px" }} />

      {/* ── Hero Slider ── */}
      {slides.length > 0 && (
        <section className="relative w-full overflow-hidden grain" style={{ height: "78vh", minHeight: 580 }}>
          <div className="absolute inset-0 z-0">
            {slides[activeSlide]?.kind === "content" && (slides[activeSlide] as HeroContentSlide).slide.cover_image ? (
              <img
                key={(slides[activeSlide] as HeroContentSlide).slide.cover_image}
                src={(slides[activeSlide] as HeroContentSlide).slide.cover_image!}
                alt="" className="w-full h-full object-cover"
                style={{ filter: "brightness(0.28) saturate(0.7)" }}
              />
            ) : (
              <div className="absolute inset-0" style={{ background: "linear-gradient(120deg, var(--ink-800) 0%, var(--ink-900) 100%)" }} />
            )}
            <div className="absolute inset-0" style={{
              backgroundImage: "repeating-linear-gradient(-45deg, rgba(0,0,0,0.15) 0 1px, transparent 1px 14px)",
            }} />
            <div className="absolute inset-0" style={{
              background: "linear-gradient(to right, var(--ink-900) 0%, rgba(13,18,30,0.75) 50%, rgba(13,18,30,0.2) 100%)",
            }} />
            <div className="absolute inset-0" style={{
              background: "linear-gradient(to top, var(--sg-bg) 0%, transparent 40%)",
            }} />
          </div>

          <div className="mono absolute top-8 right-8 z-20" style={{ fontSize: 11, letterSpacing: "0.18em", color: "var(--ink-300)" }}>
            {String(activeSlide + 1).padStart(2, "0")} / {String(slides.length).padStart(2, "0")}
          </div>

          {slides.map((item, i) => (
            <motion.div key={item.slideKey} className="absolute inset-0 flex items-center z-10"
              initial={false} animate={{ opacity: i === activeSlide ? 1 : 0 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              style={{ pointerEvents: i === activeSlide ? "auto" : "none" }}>
              <div className="w-full max-w-7xl mx-auto px-8 md:px-12 pb-16">
                {item.kind === "content" ? (
                  <div className="page-enter" key={`text-en-${i}`}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
                      <span className="chip solid" style={{
                        background: CAT_COLOR[item.slide.category] ?? "var(--accent)",
                        borderColor: CAT_COLOR[item.slide.category] ?? "var(--accent)",
                        color: "var(--ink-900)",
                      }}>
                        {CAT_LABEL[item.slide.category] ?? item.slide.category}
                      </span>
                    </div>
                    <h1 className="display" style={{
                      fontSize: "clamp(2.8rem, 6.5vw, 5.5rem)", fontWeight: 700,
                      letterSpacing: "-0.04em", lineHeight: 0.95, margin: "0 0 20px",
                      textWrap: "balance", maxWidth: 900,
                      background: "linear-gradient(135deg, var(--accent) 0%, var(--accent-2) 60%, var(--accent-3) 100%)",
                      WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
                    }}>
                      {item.slide.title_en || item.slide.title}
                    </h1>
                    <p className="hidden sm:block line-clamp-3" style={{
                      fontSize: 18, lineHeight: 1.5, color: "var(--ink-200)",
                      maxWidth: 540, marginBottom: 32,
                    }}>
                      {(() => {
                        const raw = item.slide.content_en || item.slide.content;
                        const clean = raw.replace(/<[^>]+>/g, " ").replace(/[#*_\n]/g, " ").replace(/\s+/g, " ").trim();
                        const titleText = item.slide.title_en || item.slide.title;
                        const titleNorm = titleText.replace(/\s+/g, " ").trim().toLowerCase();
                        const cleanStart = clean.toLowerCase().startsWith(titleNorm) ? clean.slice(titleText.length).trim() : clean;
                        const firstSentence = cleanStart.match(/^[^.!?]{20,}[.!?]/)?.[0];
                        const text = firstSentence ? firstSentence.trim() : cleanStart.slice(0, 140);
                        return text.length > 140 ? text.slice(0, 140) + "…" : text;
                      })()}
                    </p>
                    <Link href={`${categoryPath(item.slide.category)}/${item.slide.slug}`} className="btn btn-solid">
                      Read More →
                    </Link>
                  </div>
                ) : (
                  <div className="page-enter" key={`arena-en-${i}`}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
                      <span className="chip solid" style={{ background: "var(--amber)", borderColor: "var(--amber)", color: "var(--ink-900)" }}>
                        Arena
                      </span>
                    </div>
                    <h1 className="display" style={{
                      fontSize: "clamp(2.8rem, 6.5vw, 5.5rem)", fontWeight: 700,
                      letterSpacing: "-0.04em", lineHeight: 0.95, margin: "0 0 20px",
                      textWrap: "balance", maxWidth: 900,
                      background: "linear-gradient(135deg, var(--amber) 0%, var(--accent) 100%)",
                      WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
                    }}>
                      {item.title}
                    </h1>
                    <p style={{ fontSize: 18, lineHeight: 1.5, color: "var(--ink-200)", maxWidth: 540, marginBottom: 32 }}>
                      {item.teaser}
                    </p>
                    <Link href={item.href} className="btn btn-solid" style={{ background: "var(--amber)", borderColor: "var(--amber)" }}>
                      Play →
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          ))}

          <div className="absolute bottom-8 left-8 md:left-12 z-20 flex items-center justify-between" style={{ right: 32, maxWidth: 1376, margin: "0 auto" }}>
            <div style={{ display: "flex", gap: 6 }}>
              {slides.map((_, i) => (
                <button key={i} onClick={() => goTo(i)} style={{
                  width: i === activeSlide ? 32 : 12, height: 3, borderRadius: 2, border: "none", padding: 0,
                  background: i === activeSlide ? "var(--accent)" : "rgba(255,255,255,0.3)",
                  transition: "all 0.3s", cursor: "pointer",
                }} />
              ))}
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={prev} className="btn" style={{ padding: "8px 14px", borderRadius: 999 }}>←</button>
              <button onClick={next} className="btn" style={{ padding: "8px 14px", borderRadius: 999 }}>→</button>
            </div>
          </div>
        </section>
      )}

      {/* ── Latest Content — horizontal scroll strip ── */}
      {recentItems.length > 0 && (
        <section style={{ maxWidth: 1440, margin: "0 auto", padding: "80px 32px 40px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 24 }}>
            <div>
              <div className="eyebrow" style={{ color: "var(--accent)" }}>DISCOVER</div>
              <h2 className="display" style={{ fontSize: 36, fontWeight: 700, letterSpacing: "-0.03em", margin: "6px 0 0" }}>
                Latest Content
              </h2>
            </div>
            <Link href="/en/listeler" className="mono u-link" style={{ fontSize: 12, letterSpacing: "0.14em", color: "var(--sg-text-muted)" }}>
              ARCHIVE →
            </Link>
          </div>
          <div className="h-scroll" style={{ paddingBottom: 16 }}>
            <div style={{ display: "grid", gridAutoFlow: "column", gridAutoColumns: "minmax(280px, 1fr)", gap: 16, minWidth: "100%" }}>
              {recentItems.map((item) => {
                const accentColor = CAT_COLOR[item.category] ?? "var(--accent)";
                const catLabel = CAT_LABEL[item.category] ?? item.category;
                return (
                  <Link key={item.id} href={`${categoryPath(item.category)}/${item.slug}`}
                    className="lift" style={{
                      background: "var(--sg-surface)", border: "1px solid var(--sg-border)",
                      borderRadius: 4, overflow: "hidden", display: "flex", flexDirection: "column",
                    }}>
                    <div style={{ height: 2, background: accentColor }} />
                    <div className="relative overflow-hidden" style={{ height: 160, background: "var(--sg-surface-low)" }}>
                      <img
                        src={item.cover_image || getCategoryImage(item.category, item.slug)}
                        alt="" className="w-full h-full object-cover"
                        style={{ filter: "brightness(0.4) saturate(0.6)" }}
                        onError={(e) => { (e.target as HTMLImageElement).style.opacity = "0"; }}
                      />
                      <div style={{ position: "absolute", bottom: 12, left: 16, right: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span className="mono" style={{ fontSize: 10, letterSpacing: "0.18em", color: accentColor }}>
                          {catLabel}
                        </span>
                        <span className="mono" style={{ fontSize: 10, letterSpacing: "0.14em", color: "var(--ink-400)" }}>
                          {new Date(item.created_at).toLocaleDateString("en-US", { day: "numeric", month: "short" })}
                        </span>
                      </div>
                    </div>
                    <div style={{ padding: "16px 20px 20px", flex: 1, display: "flex", flexDirection: "column" }}>
                      <h3 className="display" style={{
                        fontSize: 17, fontWeight: 600, letterSpacing: "-0.02em",
                        lineHeight: 1.2, margin: 0, textWrap: "balance",
                      }}>
                        {item.title_en || item.title}
                      </h3>
                      <div className="mono" style={{ fontSize: 10, letterSpacing: "0.16em", color: "var(--ink-400)", marginTop: 12 }}>
                        READ →
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
      <section style={{ background: "var(--sg-surface-low)", borderTop: "1px solid var(--sg-border)", borderBottom: "1px solid var(--sg-border)" }}>
        <div style={{ maxWidth: 1440, margin: "0 auto", padding: "60px 32px" }}>
          <div style={{ marginBottom: 32 }}>
            <div className="eyebrow" style={{ color: "var(--accent)" }}>FEATURED PROFILE</div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginTop: 8 }}>
              <h2 className="display" style={{ fontSize: 36, fontWeight: 700, letterSpacing: "-0.03em", margin: 0 }}>
                Radar Player of the Week
              </h2>
              <Link href="/en/radar" className="mono u-link" style={{ fontSize: 12, letterSpacing: "0.14em", color: "var(--sg-text-muted)" }}>
                ALL RADAR →
              </Link>
            </div>
          </div>

          {featuredLoading ? (
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "48px 0", color: "var(--sg-text-muted)" }}>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-t-transparent" style={{ borderColor: "var(--accent)", borderTopColor: "transparent" }} />
              <span className="mono" style={{ fontSize: 12, letterSpacing: "0.14em" }}>LOADING...</span>
            </div>
          ) : radarCard ? (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1.4fr", gap: 48, alignItems: "start" }}>
              <PlayerCard player={radarCard} size="full" showScoutNote={true} animated={true}
                tmLink={`https://www.transfermarkt.com/schnellsuche/ergebnis/schnellsuche?query=${encodeURIComponent(radarCard.name)}`}
                gLink={`https://www.google.com/search?q=${encodeURIComponent(radarCard.name + " footballer")}`}
              />
              <div>
                <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 12, marginBottom: 16 }}>
                  <h3 className="display grad-text" style={{ fontSize: 48, fontWeight: 700, letterSpacing: "-0.03em", margin: 0 }}>
                    {radarCard.name}
                  </h3>
                  <PlayerScoutLinks playerName={radarCard.name} />
                </div>
                {featuredPlayer?.description && (
                  <p style={{ fontSize: 18, lineHeight: 1.6, color: "var(--sg-text-secondary)", maxWidth: 560, marginBottom: 32 }}>
                    {featuredPlayer.description}
                  </p>
                )}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
                  {[
                    { label: "AGE", value: radarCard.age },
                    { label: "CLUB", value: radarCard.club },
                    { label: "POSITION", value: radarCard.position },
                    { label: "LEAGUE", value: radarCard.league },
                    { label: "GOALS", value: featuredPlayer?.goals ?? "—", hi: true },
                    { label: "ASSISTS", value: featuredPlayer?.assists ?? "—", hi: true },
                  ].map(({ label, value, hi }) => (
                    <div key={label} style={{
                      padding: "16px 20px", background: "var(--sg-surface)",
                      border: "1px solid var(--sg-border)", borderLeft: `3px solid ${hi ? "var(--accent)" : "var(--accent-2)"}`,
                    }}>
                      <div className="eyebrow" style={{ marginBottom: 4 }}>{label}</div>
                      <div className="display" style={{ fontSize: 20, fontWeight: 700, color: hi ? "var(--accent)" : "var(--sg-text-primary)" }}>
                        {String(value) || "—"}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : featuredPlayer ? (
            <div style={{ padding: 32, background: "var(--sg-surface)", border: "1px solid var(--sg-border)" }}>
              <h3 className="display" style={{ fontSize: 24, fontWeight: 700, color: "var(--accent)" }}>{featuredPlayer.name}</h3>
              <p style={{ marginTop: 8, fontSize: 14, color: "var(--sg-text-secondary)" }}>{featuredPlayer.description}</p>
            </div>
          ) : null}
        </div>
      </section>

      {/* ── Players to Watch ── */}
      <section style={{ maxWidth: 1440, margin: "0 auto", padding: "60px 32px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 32 }}>
          <div>
            <div className="eyebrow">PLAYERS TO WATCH</div>
            <h2 className="display" style={{ fontSize: 36, fontWeight: 700, letterSpacing: "-0.03em", margin: "6px 0 0" }}>
              On Our Radar
            </h2>
          </div>
        </div>

        {formLoading ? (
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "32px 0", color: "var(--sg-text-muted)" }}>
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-t-transparent" style={{ borderColor: "var(--accent)", borderTopColor: "transparent" }} />
            <span className="mono" style={{ fontSize: 12 }}>LOADING...</span>
          </div>
        ) : formPlayers.length === 0 ? (
          <p className="mono" style={{ fontSize: 12, padding: "32px 0", textAlign: "center", color: "var(--sg-text-muted)" }}>
            PLAYERS COMING SOON.
          </p>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16 }}
            className="sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {formPlayers.map((player, i) => (
              <PlayerCard key={`${player.name}-en-${i}`}
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
            ))}
          </div>
        )}
      </section>

      {/* ── Editor's Picks (3-col) ── */}
      {gundemItems.length > 0 && (
        <section style={{ maxWidth: 1440, margin: "0 auto", padding: "60px 32px" }}>
          <div style={{ marginBottom: 32 }}>
            <div className="eyebrow">EDITOR&apos;S PICK</div>
            <h2 className="display" style={{ fontSize: 36, fontWeight: 700, letterSpacing: "-0.03em", margin: "6px 0 0" }}>
              Featured Articles
            </h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
            {gundemItems.map((item) => {
              const accentColor = CAT_COLOR[item.category] ?? "var(--accent)";
              const catLabel = CAT_LABEL[item.category] ?? item.category;
              return (
                <Link key={`${item.id}-en-picks`} href={`${categoryPath(item.category)}/${item.slug}`}
                  className="lift" style={{
                    background: "var(--sg-surface)", border: "1px solid var(--sg-border)",
                    borderRadius: 4, padding: 24, display: "flex", flexDirection: "column",
                    justifyContent: "space-between", minHeight: 220,
                  }}>
                  <div>
                    <div className="mono" style={{ fontSize: 10, letterSpacing: "0.18em", color: accentColor, marginBottom: 14 }}>
                      {catLabel}
                    </div>
                    <h3 className="display" style={{
                      fontSize: 20, fontWeight: 600, lineHeight: 1.15,
                      letterSpacing: "-0.02em", margin: "0 0 12px", textWrap: "balance",
                    }}>
                      {item.title_en || item.title}
                    </h3>
                  </div>
                  <div className="mono" style={{ fontSize: 10, letterSpacing: "0.14em", color: "var(--ink-400)" }}>
                    {new Date(item.created_at).toLocaleDateString("en-US", { day: "numeric", month: "short" })} · READ →
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* ── Radar CTA Banner ── */}
      <section style={{ maxWidth: 1440, margin: "0 auto", padding: "0 32px 80px" }}>
        <div className="grain" style={{
          position: "relative", overflow: "hidden", padding: "64px 48px", borderRadius: 6,
          background: "linear-gradient(120deg, var(--sg-surface) 0%, var(--sg-surface-high) 50%, color-mix(in oklch, var(--accent) 30%, var(--sg-surface)) 100%)",
          border: "1px solid var(--sg-border)",
          display: "grid", gridTemplateColumns: "2fr 1fr", gap: 32, alignItems: "center",
        }}>
          <div>
            <div className="eyebrow" style={{ color: "var(--accent)", marginBottom: 12 }}>WEEKLY RADAR</div>
            <h2 className="display" style={{
              fontSize: "clamp(2rem, 4vw, 3.5rem)", fontWeight: 700,
              letterSpacing: "-0.04em", margin: "0 0 16px", lineHeight: 1,
            }}>
              One rising talent, every week.
            </h2>
            <p style={{ fontSize: 18, color: "var(--sg-text-secondary)", maxWidth: 480, lineHeight: 1.5, margin: 0 }}>
              Emerging players, tracked with a tactical eye and match statistics.
            </p>
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <Link href="/en/radar" className="btn btn-solid" style={{ padding: "14px 24px" }}>
              GO TO RADAR →
            </Link>
          </div>
        </div>
      </section>

      <SiteFooter maxWidth="max-w-7xl" />
    </main>
  );
}
