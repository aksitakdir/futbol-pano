"use client";

import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import SiteHeader from "./components/site-header";
import SiteFooter from "./components/site-footer";
import { PlayerScoutLinks } from "./components/player-scout-links";
import PlayerCard, { type PlayerCardData } from "./components/player-card";
import PlayerRatingBars from "./components/player-rating-bars";
import { supabase } from "@/lib/supabase";
import { arenaPath, type ArenaGame } from "@/lib/arena-brackets";
import HomeRecentCarousel from "./components/home-recent-carousel";
import HomeHubPromo from "./components/home-hub-promo";
import HomeWcSquads from "./components/home-wc-squads";
import HomeWcMatches from "./components/home-wc-matches";
import { categoryArticlePath } from "@/lib/category-config";
import { getCategoryImage } from "@/lib/category-images";
import {
  DEFAULT_HERO_SLIDER,
  enabledHeroCategories,
  normalizeHeroSlider,
  normalizeRecentCount,
  normalizeCustomSlides,
  type HeroSliderSettings,
  type CustomHeroSlide,
} from "@/lib/site-settings";
import {
  prioritizeHeroContent,
} from "@/lib/cover-story";
import { EDITORIAL_ARTICLE_SELECT } from "@/lib/cover-story-store";

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

const CAT_LABEL: Record<string, string> = {
  lists: "Scouting Lists",
  radar: "Radar",
  "tactics-lab": "Tactics Lab",
  "wc-2026": "World Cup 2026",
  transfer: "Transfers",
};
const CAT_COLOR: Record<string, string> = {
  lists: "var(--sg-secondary)",
  radar: "var(--sg-primary)",
  "tactics-lab": "var(--sg-tertiary)",
  "wc-2026": "var(--amber)",
  transfer: "var(--cyan)",
  arena: "var(--sg-amber)",
};

function categoryPath(cat: string): string {
  if (cat === "lists") return "/lists";
  if (cat === "radar") return "/radar";
  if (cat === "tactics-lab") return "/tactics-lab";
  if (cat === "wc-2026") return "/world-cup-2026";
  if (cat === "transfer") return "/transfers";
  return categoryArticlePath(cat, "").replace(/\/$/, "") || "/";
}

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

function buildHeroSlides(all: SlideContent[], sliderCount: number, pinnedId?: string): { slide: SlideContent; slideKey: string }[] {
  if (!all.length || sliderCount <= 0) return [];
  const now = Date.now();
  const ms7 = 7 * 24 * 60 * 60 * 1000;
  const ms30 = 30 * 24 * 60 * 60 * 1000;
  const byNewest = [...all].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  const picked: SlideContent[] = [];
  const used = new Set<string>();

  if (pinnedId) {
    const pinned = all.find((c) => c.id === pinnedId);
    if (pinned) {
      picked.push(pinned);
      used.add(pinned.id);
    }
  }

  for (const c of byNewest.filter(c => new Date(c.created_at).getTime() >= now - ms7 && !used.has(c.id))) {
    if (picked.length >= 2) break;
    picked.push(c); used.add(c.id);
  }
  for (const c of byNewest.filter(c => new Date(c.created_at).getTime() >= now - ms30 && !used.has(c.id))) {
    if (picked.length >= sliderCount) break;
    picked.push(c); used.add(c.id);
  }
  for (const c of shuffleInPlace(byNewest.filter(c => !used.has(c.id)))) {
    if (picked.length >= sliderCount) break;
    picked.push(c); used.add(c.id);
  }
  const pool = picked.length > 0 ? picked : byNewest;
  let r = 0;
  while (picked.length < sliderCount && pool.length > 0) { picked.push(pool[r % pool.length]); r++; }
  return picked.slice(0, sliderCount).map((slide, i) => ({ slide, slideKey: `${slide.id}-${i}` }));
}

type HeroContentSlide = { kind: "content"; slide: SlideContent; slideKey: string };
type HeroArenaSlide = { kind: "arena"; slideKey: string; title: string; teaser: string; href: string };
type HeroWcSlide = {
  kind: "wc";
  slideKey: string;
  title: string;
  teaser: string;
  href: string;
  eyebrow: string;
};
type HeroCustomSlide = {
  kind: "custom";
  slideKey: string;
  title: string;
  teaser: string;
  href: string;
  eyebrow: string;
  image?: string;
};
type HeroSlide = HeroContentSlide | HeroArenaSlide | HeroWcSlide | HeroCustomSlide;

const WC_HERO: HeroWcSlide = {
  kind: "wc",
  slideKey: "wc-2026-promo",
  eyebrow: "FIFA WORLD CUP 2026",
  title: "World Cup 2026",
  teaser: "Match schedule, squads, and scout analysis — June 11 to July 19, 2026.",
  href: "/world-cup-2026",
};

function pickArenaSlide(arenaGames: ArenaGame[]): HeroArenaSlide | null {
  if (!arenaGames.length) return null;
  const g = arenaGames[Math.floor(Math.random() * arenaGames.length)];
  return { kind: "arena", slideKey: `arena-${g.slug}-${Date.now()}`, title: g.hero_title_en, teaser: g.hero_teaser_en, href: arenaPath(g.slug) };
}

function mergeHeroSlides(
  content: { slide: SlideContent; slideKey: string }[],
  arenaGames: ArenaGame[],
  heroSettings: HeroSliderSettings,
  customSlides: CustomHeroSlide[] = [],
): HeroSlide[] {
  const arena = heroSettings.arena ? pickArenaSlide(arenaGames) : null;
  const items: HeroSlide[] = content.map(({ slide, slideKey }) => ({ kind: "content", slide, slideKey }));
  const out: HeroSlide[] = heroSettings.wcPromo ? [WC_HERO, ...items] : [...items];

  const activeCustom: HeroCustomSlide[] = customSlides
    .filter((s) => s.enabled && s.title && s.href)
    .map((s) => ({
      kind: "custom",
      slideKey: s.id,
      title: s.title,
      teaser: s.teaser,
      href: s.href,
      eyebrow: s.eyebrow || "FEATURED",
      image: s.image,
    }));
  for (const cs of activeCustom) {
    const at = Math.min(1, out.length);
    out.splice(at, 0, cs);
  }

  if (!items.length && !arena && !activeCustom.length) return heroSettings.wcPromo ? [WC_HERO] : [];
  if (arena) {
    const insertAt = Math.floor(Math.random() * Math.max(1, out.length + 1));
    out.splice(insertAt, 0, arena);
  }
  return out;
}

async function fetchFcPlayer(name: string, club?: string) {
  const sel = "overall,pace,shooting,passing,dribbling,defending,physical,photo_url,position,club,league,age";
  const trimmed = name.trim();
  const words = trimmed.split(/\s+/).filter(Boolean);
  const clubQ = club?.trim();

  if (clubQ) {
    const { data: fullClub } = await supabase.from("fc_players").select(sel).ilike("name", trimmed).ilike("club", `%${clubQ}%`).order("overall", { ascending: false }).limit(1).maybeSingle();
    if (fullClub?.overall) return fullClub;
    if (words.length >= 2) {
      const { data: twoClub } = await supabase.from("fc_players").select(sel).ilike("name", `%${words.slice(0, 2).join(" ")}%`).ilike("club", `%${clubQ}%`).order("overall", { ascending: false }).limit(1).maybeSingle();
      if (twoClub?.overall) return twoClub;
    }
    const { data: oneClub } = await supabase.from("fc_players").select(sel).ilike("name", `%${words[0]}%`).ilike("club", `%${clubQ}%`).order("overall", { ascending: false }).limit(1).maybeSingle();
    if (oneClub?.overall) return oneClub;
  }

  const { data: exact } = await supabase.from("fc_players").select(sel).ilike("name", trimmed).limit(1).maybeSingle();
  if (exact?.overall) return exact;

  if (words.length >= 2) {
    const { data: twoMatch } = await supabase.from("fc_players").select(sel).ilike("name", `%${words.slice(0, 2).join(" ")}%`).order("overall", { ascending: false }).limit(1).maybeSingle();
    if (twoMatch?.overall) return twoMatch;
  }

  return null;
}

export default function HomePage() {
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [activeSlide, setActiveSlide] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [recentItems, setRecentItems] = useState<SlideContent[]>([]);
  const [featuredPlayer, setFeaturedPlayer] = useState<FeaturedPlayer | null>(null);
  const [featuredStats, setFeaturedStats] = useState<Partial<PlayerCardData> | null>(null);
  const [featuredLoading, setFeaturedLoading] = useState(true);
  const [formPlayers, setFormPlayers] = useState<FormPlayerWithStats[]>([]);
  const [formLoading, setFormLoading] = useState(true);
  const [wcHubPreview, setWcHubPreview] = useState<{ title: string; title_en?: string; slug: string; category: string }[]>([]);
  const [transferHubPreview, setTransferHubPreview] = useState<{ title: string; title_en?: string; slug: string; category: string }[]>([]);


  useEffect(() => {
    async function load() {
      const settingsRes = await supabase
        .from("site_settings")
        .select("key, value")
        .in("key", ["hero_slider", "recent_count", "hero_custom_slides"]);

      const pinsRes = await fetch("/api/cover-stories", { cache: "no-store" });
      const pinsJson = pinsRes.ok
        ? ((await pinsRes.json()) as { pins?: { homepage?: string } })
        : { pins: {} };

      let heroSettings = { ...DEFAULT_HERO_SLIDER };
      let articleCount = 16;
      let customSlideData: CustomHeroSlide[] = [];
      let homepageCoverId: string | undefined = pinsJson.pins?.homepage;
      for (const row of settingsRes.data ?? []) {
        if (row.key === "hero_slider") heroSettings = normalizeHeroSlider(row.value);
        if (row.key === "recent_count") articleCount = normalizeRecentCount(row.value);
        if (row.key === "hero_custom_slides") customSlideData = normalizeCustomSlides(row.value);
      }

      const enabledCategories = enabledHeroCategories(heroSettings);
      const { data } = await supabase
        .from("contents")
        .select("id,title,title_en,slug,category,content,content_en,created_at,cover_image")
        .eq("status", "published")
        .in("category", enabledCategories.length ? enabledCategories : ["radar"])
        .order("created_at", { ascending: false })
        .limit(Math.max(articleCount * 3, 24));

      let filtered = (data ?? []) as SlideContent[];

      if (homepageCoverId) {
        const { data: pinnedRow } = await supabase
          .from("contents")
          .select(EDITORIAL_ARTICLE_SELECT)
          .eq("id", homepageCoverId)
          .eq("status", "published")
          .maybeSingle();
        if (pinnedRow) {
          filtered = [
            pinnedRow as SlideContent,
            ...filtered.filter((row) => row.id !== homepageCoverId),
          ];
        }
      }

      filtered = prioritizeHeroContent(filtered, homepageCoverId);

      const { data: allRecent } = await supabase
        .from("contents")
        .select("id,title,title_en,slug,category,content,content_en,created_at,cover_image")
        .eq("status", "published")
        .order("created_at", { ascending: false })
        .limit(articleCount);
      setRecentItems((allRecent ?? []) as SlideContent[]);

      const sliderCount = heroSettings.sliderCount ?? 5;

      const arenaRes = await supabase
        .from("arena_games")
        .select("id,slug,status,title_en,description_en,hero_title_en,hero_teaser_en,card_color,game_type,created_at")
        .eq("status", "published");
      const arenaGames = (arenaRes.data ?? []) as ArenaGame[];

      if (!filtered.length) {
        const a = heroSettings.arena ? pickArenaSlide(arenaGames) : null;
        if (heroSettings.wcPromo && a) setSlides([WC_HERO, a]);
        else if (heroSettings.wcPromo) setSlides([WC_HERO]);
        else if (a) setSlides([a]);
        else setSlides([]);
        return;
      }

      setSlides(mergeHeroSlides(buildHeroSlides(filtered, sliderCount, homepageCoverId), arenaGames, heroSettings, customSlideData));
    }
    load();
  }, []);

  useEffect(() => {
    void Promise.all([
      supabase.from("contents").select("title,title_en,slug,category").eq("status", "published").or("category.eq.wc-2026,hub_tags.cs.{wc-2026}").order("created_at", { ascending: false }).limit(3),
      supabase.from("contents").select("title,title_en,slug,category").eq("status", "published").or("category.eq.transfer,hub_tags.cs.{transfer}").order("created_at", { ascending: false }).limit(3),
    ]).then(([wcRes, trRes]) => {
      const mapRow = (rows: { title: string; title_en?: string; slug: string; category: string }[]) =>
        rows.map((r) => ({ title: r.title_en?.trim() || r.title, slug: r.slug, category: r.category }));
      if (wcRes.data?.length) setWcHubPreview(mapRow(wcRes.data as { title: string; title_en?: string; slug: string; category: string }[]));
      if (trRes.data?.length) setTransferHubPreview(mapRow(trRes.data as { title: string; title_en?: string; slug: string; category: string }[]));
    });
  }, []);

  useEffect(() => {
    async function load() {
      const { data: poolRow } = await supabase.from("site_settings").select("value").eq("key", "form_players_pool").maybeSingle();
      if (poolRow?.value) {
        try {
          const pool = JSON.parse(poolRow.value as string);
          if (Array.isArray(pool) && pool.length > 0) {
            const pick = pool[Math.floor(Math.random() * pool.length)];
            if (pick?.name) {
              setFeaturedPlayer({ name: pick.name ?? "", club: pick.club ?? "", position: pick.position ?? "", age: String(pick.age ?? ""), league: pick.league ?? "", goals: String(pick.goals ?? ""), assists: String(pick.assists ?? ""), description: pick.description ?? "", whyWatch: pick.why_watch ?? "" });
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
        const { data: stats } = await supabase.from("fc_players").select("name,overall,position,pace,shooting,passing,dribbling,defending,physical,photo_url,club,league,age").in("name", list.map((p) => p.name));
        const sm = new Map(((stats ?? []) as { name: string }[]).map((s) => [s.name.toLowerCase(), s]));
        const withStats = list.map((p) => {
          const s = sm.get(p.name.toLowerCase());
          if (!s) return p;
          const row = s as Partial<PlayerCardData> & { club?: string; league?: string; age?: unknown };
          return { ...p, ...row, club: row.club?.trim() || p.club, league: row.league?.trim() || p.league, age: row.age != null && row.age !== "" ? String(row.age) : p.age };
        });
        setFormPlayers(shuffleInPlace(withStats.filter((p) => ((p as FormPlayerWithStats).overall ?? 0) > 0)).slice(0, 10) as FormPlayerWithStats[]);
      }
      setFormLoading(false);
    }
    load();
  }, []);

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
        name: featuredPlayer.name,
        club: (featuredStats.club as string | undefined)?.trim() || featuredPlayer.club,
        league: (featuredStats.league as string | undefined)?.trim() || featuredPlayer.league,
        position: (featuredStats.position as string | undefined)?.trim() || featuredPlayer.position,
        age: featuredStats.age != null && featuredStats.age !== "" ? String(featuredStats.age) : featuredPlayer.age,
        overall: featuredStats.overall ?? 0,
        pace: featuredStats.pace ?? 0,
        shooting: featuredStats.shooting ?? 0,
        passing: featuredStats.passing ?? 0,
        dribbling: featuredStats.dribbling ?? 0,
        defending: featuredStats.defending ?? 0,
        physical: featuredStats.physical ?? 0,
        whyWatch: featuredPlayer.whyWatch,
        photo_url: featuredStats.photo_url as string | undefined,
      }
    : null;

  return (
    <main style={{ background: "var(--sg-bg)", color: "var(--sg-text-primary)", minHeight: "100vh" }}>
      <SiteHeader />
      <div style={{ paddingTop: "68px" }} />

      <h1 className="sr-only">Scout Gamer — Football × Game Culture</h1>

      {/* Hero placeholder — reserves the hero's height while data loads so the
          sections below don't render first and cause a layout shift. */}
      {slides.length === 0 && (
        <section
          aria-hidden="true"
          className="relative w-full overflow-hidden"
          style={{
            height: "78vh",
            minHeight: 580,
            background: "linear-gradient(120deg, var(--ink-800) 0%, var(--ink-900) 100%)",
          }}
        >
          <div className="absolute inset-0" style={{ background: "linear-gradient(to top, var(--sg-bg) 0%, transparent 40%)" }} />
        </section>
      )}

      {/* ── Hero Slider ── */}
      {slides.length > 0 && (
        <section className="relative w-full overflow-hidden grain" style={{ height: "78vh", minHeight: 580 }}>
          <div className="absolute inset-0 z-0">
            {slides[activeSlide]?.kind === "content" ? (
              <img key={(slides[activeSlide] as HeroContentSlide).slide.cover_image ?? (slides[activeSlide] as HeroContentSlide).slide.slug} src={(slides[activeSlide] as HeroContentSlide).slide.cover_image || getCategoryImage((slides[activeSlide] as HeroContentSlide).slide.category, (slides[activeSlide] as HeroContentSlide).slide.slug)} alt="" className="w-full h-full object-cover" style={{ filter: "brightness(0.48) saturate(0.85)" }} />
            ) : slides[activeSlide]?.kind === "custom" && (slides[activeSlide] as HeroCustomSlide).image ? (
              <img key={(slides[activeSlide] as HeroCustomSlide).image} src={(slides[activeSlide] as HeroCustomSlide).image!} alt="" className="w-full h-full object-cover" style={{ filter: "brightness(0.42) saturate(0.9)" }} />
            ) : slides[activeSlide]?.kind === "wc" || slides[activeSlide]?.kind === "custom" ? (
              <div
                key="wc-hero-bg"
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(135deg, #0d2818 0%, #1a3a5c 35%, #0f172a 70%, #1c1408 100%)",
                }}
              />
            ) : (
              <div className="absolute inset-0" style={{ background: "linear-gradient(120deg, var(--ink-800) 0%, var(--ink-900) 100%)" }} />
            )}
            <div className="absolute inset-0" style={{ backgroundImage: "repeating-linear-gradient(-45deg, rgba(0,0,0,0.15) 0 1px, transparent 1px 14px)" }} />
            <div className="absolute inset-0" style={{ background: "linear-gradient(to right, var(--ink-900) 0%, rgba(13,18,30,0.75) 50%, rgba(13,18,30,0.2) 100%)" }} />
            <div className="absolute inset-0" style={{ background: "linear-gradient(to top, var(--sg-bg) 0%, transparent 40%)" }} />
          </div>

          <div className="mono absolute top-8 right-8 z-20" style={{ fontSize: 11, letterSpacing: "0.18em", color: "var(--ink-300)" }}>
            {String(activeSlide + 1).padStart(2, "0")} / {String(slides.length).padStart(2, "0")}
          </div>

          {slides.map((item, i) => (
            <motion.div key={item.slideKey} className="absolute inset-0 flex items-center z-10"
              initial={false} animate={{ opacity: i === activeSlide ? 1 : 0 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              style={{ pointerEvents: i === activeSlide ? "auto" : "none" }}>
              <div className="sg-hero-text-block pb-16">
                {item.kind === "content" ? (
                  <div className="page-enter" key={`text-${i}`}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
                      <span className="chip solid" style={{ background: CAT_COLOR[item.slide.category] ?? "var(--accent)", borderColor: CAT_COLOR[item.slide.category] ?? "var(--accent)", color: "var(--ink-900)" }}>
                        {CAT_LABEL[item.slide.category] ?? item.slide.category}
                      </span>
                    </div>
                    <h2 className="display" style={{ fontSize: "clamp(2.4rem, 5.5vw, 4.8rem)", fontWeight: 700, letterSpacing: "-0.04em", lineHeight: 1.08, margin: "0 0 20px", paddingBottom: "0.14em", textWrap: "balance", maxWidth: 820, background: "linear-gradient(135deg, var(--accent) 0%, var(--accent-2) 60%, var(--accent-3) 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                      {item.slide.title_en || item.slide.title}
                    </h2>
                    <p className="hidden sm:block line-clamp-3" style={{ fontSize: 17, lineHeight: 1.6, color: "var(--ink-200)", maxWidth: 600, marginBottom: 36 }}>
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
                    <Link href={categoryArticlePath(item.slide.category, item.slide.slug)} className="btn btn-solid">Read More →</Link>
                  </div>
                ) : item.kind === "wc" ? (
                  <div className="page-enter" key={`wc-${i}`}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
                      <span
                        className="chip solid"
                        style={{
                          background: "var(--amber)",
                          borderColor: "var(--amber)",
                          color: "var(--ink-900)",
                        }}
                      >
                        {item.eyebrow}
                      </span>
                    </div>
                    <h2
                      className="display"
                      style={{
                        fontSize: "clamp(2.4rem, 5.5vw, 4.8rem)",
                        fontWeight: 700,
                        letterSpacing: "-0.04em",
                        lineHeight: 1.08,
                        margin: "0 0 20px",
                        paddingBottom: "0.14em",
                        textWrap: "balance",
                        maxWidth: 820,
                        background: "linear-gradient(135deg, #f5d020 0%, #fff 45%, #c9a227 100%)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        backgroundClip: "text",
                      }}
                    >
                      {item.title}
                    </h2>
                    <p
                      style={{
                        fontSize: 17,
                        lineHeight: 1.6,
                        color: "var(--ink-200)",
                        maxWidth: 600,
                        marginBottom: 36,
                      }}
                    >
                      {item.teaser}
                    </p>
                    <Link
                      href={item.href}
                      className="btn btn-solid"
                      style={{ background: "var(--amber)", borderColor: "var(--amber)", color: "var(--ink-900)" }}
                    >
                      Explore WC 2026 →
                    </Link>
                  </div>
                ) : item.kind === "custom" ? (
                  <div className="page-enter" key={`custom-${i}`}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
                      <span className="chip solid" style={{ background: "var(--amber)", borderColor: "var(--amber)", color: "var(--ink-900)" }}>
                        {item.eyebrow}
                      </span>
                    </div>
                    <h2 className="display" style={{ fontSize: "clamp(2.4rem, 5.5vw, 4.8rem)", fontWeight: 700, letterSpacing: "-0.04em", lineHeight: 1.08, margin: "0 0 20px", paddingBottom: "0.14em", textWrap: "balance", maxWidth: 820, background: "linear-gradient(135deg, #f5d020 0%, #fff 45%, #c9a227 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                      {item.title}
                    </h2>
                    <p style={{ fontSize: 17, lineHeight: 1.6, color: "var(--ink-200)", maxWidth: 600, marginBottom: 36 }}>{item.teaser}</p>
                    <Link href={item.href} className="btn btn-solid" style={{ background: "var(--amber)", borderColor: "var(--amber)", color: "var(--ink-900)" }}>
                      Explore →
                    </Link>
                  </div>
                ) : (
                  <div className="page-enter" key={`arena-${i}`}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
                      <span className="chip solid" style={{ background: "var(--amber)", borderColor: "var(--amber)", color: "var(--ink-900)" }}>Arena</span>
                    </div>
                    <h2 className="display" style={{ fontSize: "clamp(2.4rem, 5.5vw, 4.8rem)", fontWeight: 700, letterSpacing: "-0.04em", lineHeight: 1.08, margin: "0 0 20px", paddingBottom: "0.14em", textWrap: "balance", maxWidth: 820, background: "linear-gradient(135deg, var(--amber) 0%, var(--accent) 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                      {item.title}
                    </h2>
                    <p style={{ fontSize: 17, lineHeight: 1.6, color: "var(--ink-200)", maxWidth: 600, marginBottom: 36 }}>{item.teaser}</p>
                    <Link href={item.href} className="btn btn-solid" style={{ background: "var(--amber)", borderColor: "var(--amber)" }}>Play →</Link>
                  </div>
                )}
              </div>
            </motion.div>
          ))}

          <div className="absolute bottom-8 z-20 sg-hero-text-block flex items-center justify-between" style={{ left: 0, right: 0 }}>
            <div style={{ display: "flex", gap: 6 }}>
              {slides.map((_, i) => (
                <button key={i} onClick={() => goTo(i)} style={{ width: i === activeSlide ? 32 : 12, height: 3, borderRadius: 2, border: "none", padding: 0, background: i === activeSlide ? "var(--accent)" : "rgba(255,255,255,0.3)", transition: "all 0.3s", cursor: "pointer" }} />
              ))}
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={prev} className="btn" style={{ padding: "8px 14px", borderRadius: 999 }}>←</button>
              <button onClick={next} className="btn" style={{ padding: "8px 14px", borderRadius: 999 }}>→</button>
            </div>
          </div>
        </section>
      )}

      {recentItems.length > 0 && <HomeRecentCarousel items={recentItems} />}

      <HomeHubPromo wcArticles={wcHubPreview} transferArticles={transferHubPreview} />

      {/* ── WC 2026 Upcoming Matches ── */}
      <HomeWcMatches />

      {/* ── WC 2026 Squad Grid ── */}
      <HomeWcSquads />

      {/* ── Radar Player of the Week ── */}
      <section style={{ background: "var(--sg-surface-low)", borderTop: "1px solid var(--sg-border)", borderBottom: "1px solid var(--sg-border)" }}>
        <div className="sg-editorial-shell" style={{ paddingTop: 80, paddingBottom: 80 }}>
          <div style={{ marginBottom: 32 }}>
            <div className="eyebrow" style={{ color: "var(--accent)" }}>FEATURED PROFILE</div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginTop: 8 }}>
              <h2 className="display" style={{ fontSize: 36, fontWeight: 700, letterSpacing: "-0.03em", margin: 0 }}>Radar Player of the Week</h2>
              <Link href="/radar" className="mono u-link" style={{ fontSize: 12, letterSpacing: "0.14em", color: "var(--sg-text-muted)" }}>ALL RADAR →</Link>
            </div>
          </div>

          {featuredLoading ? (
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "48px 0", color: "var(--sg-text-muted)" }}>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-t-transparent" style={{ borderColor: "var(--accent)", borderTopColor: "transparent" }} />
              <span className="mono" style={{ fontSize: 12, letterSpacing: "0.14em" }}>LOADING...</span>
            </div>
          ) : radarCard ? (
            <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-[minmax(0,280px)_1fr] lg:gap-12">
              <PlayerCard player={radarCard} showScoutNote={true} animated={true}
                tmLink={`https://www.transfermarkt.com/schnellsuche/ergebnis/schnellsuche?query=${encodeURIComponent(radarCard.name)}`}
                gLink={`https://www.google.com/search?q=${encodeURIComponent(radarCard.name + " footballer")}`}
              />
              <div>
                <div className="eyebrow" style={{ color: "var(--accent)", marginBottom: 10 }}>FOCUS PLAYER</div>
                <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 12, marginBottom: 12 }}>
                  <h3 className="display grad-text" style={{ fontSize: 48, fontWeight: 700, letterSpacing: "-0.03em", margin: 0 }}>{radarCard.name}</h3>
                  <PlayerScoutLinks playerName={radarCard.name} />
                </div>
                <p className="mono" style={{ fontSize: 11, letterSpacing: "0.1em", color: "var(--sg-text-muted)", marginBottom: 24, lineHeight: 1.5 }}>
                  {[radarCard.club, radarCard.league, radarCard.position, `${radarCard.age} YRS`].filter(Boolean).join(" · ")}
                </p>
                {featuredPlayer?.description && (
                  <p style={{ fontSize: 17, lineHeight: 1.6, color: "var(--sg-text-secondary)", maxWidth: 560, marginBottom: 28 }}>{featuredPlayer.description}</p>
                )}
                <PlayerRatingBars player={radarCard} />
                <div style={{ marginTop: 28, paddingTop: 24, borderTop: "1px solid var(--sg-border)", display: "flex", flexWrap: "wrap", gap: 24, alignItems: "flex-end" }}>
                  <div>
                    <div className="eyebrow" style={{ marginBottom: 6 }}>OVERALL</div>
                    <div className="display tabular-nums" style={{ fontSize: 42, fontWeight: 800, color: "var(--accent)", lineHeight: 1 }}>{radarCard.overall}</div>
                  </div>
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
      <section className="sg-editorial-shell" style={{ paddingTop: 80, paddingBottom: 80 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 32 }}>
          <div>
            <div className="eyebrow">PLAYERS TO WATCH</div>
            <h2 className="display" style={{ fontSize: 36, fontWeight: 700, letterSpacing: "-0.03em", margin: "6px 0 0" }}>On Our Radar</h2>
          </div>
        </div>
        {formLoading ? (
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "32px 0", color: "var(--sg-text-muted)" }}>
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-t-transparent" style={{ borderColor: "var(--accent)", borderTopColor: "transparent" }} />
            <span className="mono" style={{ fontSize: 12 }}>LOADING...</span>
          </div>
        ) : formPlayers.length === 0 ? (
          <p className="mono" style={{ fontSize: 12, padding: "32px 0", textAlign: "center", color: "var(--sg-text-muted)" }}>PLAYERS COMING SOON.</p>
        ) : (
          <div className="grid gap-4 justify-items-stretch" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 190px), 1fr))" }}>
            {formPlayers.map((player, i) => (
              <PlayerCard key={`${player.name}-${i}`}
                player={{ name: player.name, club: player.club, league: player.league, position: player.position || "", age: String(player.age), overall: player.overall!, pace: player.pace ?? 0, shooting: player.shooting ?? 0, passing: player.passing ?? 0, dribbling: player.dribbling ?? 0, defending: player.defending ?? 0, physical: player.physical ?? 0, photo_url: player.photo_url as string | undefined }}
                compact animated={false}
                tmLink={`https://www.transfermarkt.com/schnellsuche/ergebnis/schnellsuche?query=${encodeURIComponent(player.name)}`}
                gLink={`https://www.google.com/search?q=${encodeURIComponent(player.name + " footballer")}`}
              />
            ))}
          </div>
        )}
      </section>

      {/* Editor's Picks removed — All Articles section below covers this */}

      {/* ── All Articles grid ── */}
      <HomeAllArticles />

      {/* ── Radar CTA Banner ── */}
      <section className="sg-editorial-shell" style={{ paddingBottom: 96 }}>
        <div className="grain" style={{ position: "relative", overflow: "hidden", padding: "clamp(40px, 5vw, 72px) clamp(32px, 4vw, 60px)", borderRadius: 20, background: "linear-gradient(120deg, var(--sg-surface) 0%, var(--sg-surface-high) 50%, color-mix(in oklch, var(--accent) 30%, var(--sg-surface)) 100%)", border: "1px solid var(--sg-border)", display: "grid", gridTemplateColumns: "1fr", gap: 32, alignItems: "center" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <div>
              <div className="eyebrow" style={{ color: "var(--accent)", marginBottom: 12 }}>WEEKLY RADAR</div>
              <h2 className="display" style={{ fontSize: "clamp(2rem, 4vw, 3.5rem)", fontWeight: 700, letterSpacing: "-0.04em", margin: "0 0 16px", lineHeight: 1 }}>
                One rising talent, every week.
              </h2>
              <p style={{ fontSize: 18, color: "var(--sg-text-secondary)", maxWidth: 480, lineHeight: 1.5, margin: 0 }}>
                Emerging players, tracked with a tactical eye and match statistics.
              </p>
            </div>
            <div>
              <Link href="/radar" className="btn btn-solid" style={{ padding: "14px 28px" }}>GO TO RADAR →</Link>
            </div>
          </div>
        </div>
      </section>

      <SiteFooter maxWidth="max-w-7xl" />
    </main>
  );
}

function HomeAllArticles() {
  const [articles, setArticles] = useState<SlideContent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("contents")
      .select("id,title,title_en,slug,category,content,content_en,created_at,cover_image")
      .eq("status", "published")
      .order("created_at", { ascending: false })
      .range(0, 11)
      .then(({ data }) => {
        setArticles((data ?? []) as SlideContent[]);
        setLoading(false);
      });
  }, []);

  if (loading || articles.length === 0) return null;

  return (
    <section className="sg-page-shell" style={{ paddingTop: 0, paddingBottom: 80 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 32 }}>
        <div>
          <div className="eyebrow">BROWSE</div>
          <h2 className="display" style={{ fontSize: 36, fontWeight: 700, letterSpacing: "-0.03em", margin: "6px 0 0" }}>All Articles</h2>
        </div>
        <Link href="/articles" className="mono u-link" style={{ fontSize: 12, letterSpacing: "0.14em", color: "var(--sg-text-muted)" }}>SEE ALL →</Link>
      </div>
      <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 280px), 1fr))" }}>
        {articles.map((item) => {
          const accentColor = CAT_COLOR[item.category] ?? "var(--accent)";
          const catLabel = CAT_LABEL[item.category] ?? item.category;
          const coverImg = item.cover_image?.trim() || getCategoryImage(item.category, item.slug);
          const title = item.title_en || item.title;
          return (
            <Link key={item.id} href={categoryArticlePath(item.category, item.slug)}
              className="lift" style={{ background: "var(--sg-surface)", border: "1px solid var(--sg-border)", borderRadius: 8, overflow: "hidden", display: "flex", flexDirection: "column", textDecoration: "none" }}>
              <div style={{ position: "relative", height: 150, overflow: "hidden" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={coverImg} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", filter: "brightness(0.65) saturate(0.85)" }} loading="lazy" />
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, var(--sg-surface) 0%, transparent 60%)" }} />
              </div>
              <div style={{ padding: "14px 20px 20px", flex: 1, display: "flex", flexDirection: "column" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                  <span className="mono" style={{ fontSize: 9, letterSpacing: "0.2em", color: accentColor }}>{catLabel}</span>
                  <span className="mono" style={{ fontSize: 9, letterSpacing: "0.14em", color: "var(--sg-text-muted)" }}>
                    {new Date(item.created_at).toLocaleDateString("en-US", { day: "numeric", month: "short" })}
                  </span>
                </div>
                <h3 className="display" style={{ fontSize: 17, fontWeight: 600, lineHeight: 1.2, letterSpacing: "-0.02em", margin: 0, textWrap: "balance", color: "var(--sg-text-primary)", flex: 1 }}>
                  {title}
                </h3>
                <span className="mono u-link" style={{ fontSize: 10, letterSpacing: "0.16em", color: accentColor, marginTop: 14 }}>READ →</span>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
