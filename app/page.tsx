"use client";

import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import SiteHeader from "./components/site-header";
import SiteFooter from "./components/site-footer";
import PlayerCard, { type PlayerCardData } from "./components/player-card";
import { supabase } from "@/lib/supabase";
import { getCategoryImage } from "@/lib/category-images";
import { ARENA_BRACKETS, arenaPath } from "@/lib/arena-brackets";

type SlideContent = { id: string; title: string; slug: string; category: string; content: string; created_at: string; cover_image?: string; };
type FormPlayer = { name: string; club: string; league: string; position: string; age: string; goals: string; };
type FormPlayerWithStats = FormPlayer & Partial<PlayerCardData>;
type FeaturedPlayer = { name: string; club: string; position: string; age: string; league: string; goals: string; assists: string; description: string; whyWatch: string; };

const CAT_LABEL: Record<string, string> = { listeler: "Listeler", radar: "Radar", "taktik-lab": "Taktik Lab" };
const CAT_ACCENT: Record<string, string> = { listeler: "var(--cyan)", radar: "var(--emerald)", "taktik-lab": "var(--sky)", arena: "var(--amber)" };

function categoryPath(cat: string): string {
  if (cat === "listeler") return "/listeler";
  if (cat === "radar") return "/radar";
  if (cat === "taktik-lab") return "/taktik-lab";
  return "/";
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

function buildHeroSlides(all: SlideContent[]): { slide: SlideContent; slideKey: string }[] {
  if (!all.length) return [];
  const now = Date.now();
  const ms7 = 7 * 24 * 60 * 60 * 1000;
  const ms30 = 30 * 24 * 60 * 60 * 1000;
  const byNewest = [...all].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  const picked: SlideContent[] = [];
  const used = new Set<string>();
  for (const c of byNewest.filter(c => new Date(c.created_at).getTime() >= now - ms7)) {
    if (picked.length >= 2) break; picked.push(c); used.add(c.id);
  }
  for (const c of byNewest.filter(c => new Date(c.created_at).getTime() >= now - ms30 && !used.has(c.id))) {
    if (picked.length >= SLIDER_COUNT) break; picked.push(c); used.add(c.id);
  }
  for (const c of shuffleInPlace(byNewest.filter(c => !used.has(c.id)))) {
    if (picked.length >= SLIDER_COUNT) break; picked.push(c); used.add(c.id);
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

async function fetchFcPlayer(name: string, club?: string) {
  const { data: exact } = await supabase.from("fc_players").select("overall,pace,shooting,passing,dribbling,defending,physical,photo_url,position,club,league,age").ilike("name", name).limit(1).maybeSingle();
  if (exact?.overall) return exact;
  const words = name.split(" ");
  if (words.length >= 2) {
    const { data: two } = await supabase.from("fc_players").select("overall,pace,shooting,passing,dribbling,defending,physical,photo_url,position,club,league,age").ilike("name", `%${words.slice(0, 2).join(" ")}%`).order("overall", { ascending: false }).limit(1).maybeSingle();
    if (two?.overall) return two;
  }
  if (club) {
    const { data: cm } = await supabase.from("fc_players").select("overall,pace,shooting,passing,dribbling,defending,physical,photo_url,position,club,league,age").ilike("name", `%${words[0]}%`).ilike("club", `%${club}%`).order("overall", { ascending: false }).limit(1).maybeSingle();
    if (cm?.overall) return cm;
  }
  return null;
}

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

  const editorItems = useMemo(() => (recentItems.length ? shuffleInPlace([...recentItems]).slice(0, 4) : []), [recentItems]);

  useEffect(() => {
    supabase.from("contents").select("id,title,slug,category,content,created_at,cover_image").eq("status", "yayinda").order("created_at", { ascending: false }).limit(200)
      .then(({ data }) => { if (!data?.length) { setSlides([pickArenaSlide()]); return; } setSlides(mergeWithArena(buildHeroSlides(data as SlideContent[]))); });
  }, []);

  useEffect(() => {
    supabase.from("contents").select("id,title,slug,category,content,created_at,cover_image").eq("status", "yayinda").order("created_at", { ascending: false }).limit(8)
      .then(({ data }) => { if (data?.length) setRecentItems(data); });
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
      if (poolRow?.value) { try { const p = JSON.parse(poolRow.value as string); if (Array.isArray(p) && p.length) list = shuffleInPlace(p as FormPlayer[]).slice(0, 20); } catch { /* ignore */ } }
      if (!list.length) {
        const { data: leg } = await supabase.from("site_settings").select("value").eq("key", "form_players").maybeSingle();
        if (leg?.value) { try { const parsed = JSON.parse(leg.value as string); if (Array.isArray(parsed)) list = shuffleInPlace(parsed as FormPlayer[]).slice(0, 20); } catch { /* ignore */ } }
      }
      if (list.length) {
        const { data: stats } = await supabase.from("fc_players").select("name,overall,position,pace,shooting,passing,dribbling,defending,physical,photo_url").in("name", list.map(p => p.name));
        const sm = new Map(((stats ?? []) as { name: string }[]).map(s => [s.name.toLowerCase(), s]));
        const withStats = list.map(p => { const s = sm.get(p.name.toLowerCase()); return s ? { ...p, ...(s as Partial<PlayerCardData>), age: String((s as { age?: unknown }).age ?? p.age) } : p; });
        setFormPlayers(shuffleInPlace(withStats.filter(p => ((p as FormPlayerWithStats).overall ?? 0) > 0)).slice(0, 10) as FormPlayerWithStats[]);
      }
      setFormLoading(false);
    }
    load();
  }, []);

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (slides.length < 2) return;
    timerRef.current = setInterval(() => setActiveSlide(p => (p + 1) % slides.length), 6500);
  }, [slides.length]);

  useEffect(() => {
    if (slides.length < 2) return;
    timerRef.current = setInterval(() => setActiveSlide(p => (p + 1) % slides.length), 6500);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [slides.length]);

  const goTo = (i: number) => { setActiveSlide(i); resetTimer(); };
  const prev = () => { setActiveSlide(p => (p - 1 + slides.length) % slides.length); resetTimer(); };
  const next = () => { setActiveSlide(p => (p + 1) % slides.length); resetTimer(); };

  const radarCard: PlayerCardData | null = featuredPlayer && featuredStats
    ? { name: featuredPlayer.name, club: featuredPlayer.club, league: featuredPlayer.league, position: featuredPlayer.position, age: featuredPlayer.age, overall: featuredStats.overall ?? 0, pace: featuredStats.pace ?? 0, shooting: featuredStats.shooting ?? 0, passing: featuredStats.passing ?? 0, dribbling: featuredStats.dribbling ?? 0, defending: featuredStats.defending ?? 0, physical: featuredStats.physical ?? 0, whyWatch: featuredPlayer.whyWatch, photo_url: featuredStats.photo_url as string | undefined }
    : null;

  return (
    <main style={{ background: "var(--ink-900)", color: "var(--ink-100)", minHeight: "100vh" }}>
      <SiteHeader />

      {/* ── HERO SLIDER ─────────────────────────────────────────────── */}
      {slides.length > 0 && (
        <section style={{ position: "relative", height: "78vh", minHeight: 580, overflow: "hidden" }}>
          {/* Arka planlar */}
          {slides.map((item, i) => (
            <div key={item.slideKey} className="sg-grain" style={{ position: "absolute", inset: 0, background: "linear-gradient(120deg, var(--ink-800), var(--ink-900))", opacity: i === activeSlide ? 1 : 0, transition: "opacity 0.8s ease", zIndex: 0 }}>
              {item.kind === "content" && item.slide.cover_image && (
                <img src={item.slide.cover_image} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", filter: "brightness(0.25) saturate(0.7)" }} />
              )}
              {item.kind === "content" && !item.slide.cover_image && (
                <img src="https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=1600&q=80" alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", filter: "brightness(0.2) saturate(0.6)" }} />
              )}
            </div>
          ))}
          <div style={{ position: "absolute", inset: 0, zIndex: 1, backgroundImage: "repeating-linear-gradient(-45deg, rgba(0,0,0,0.15) 0 1px, transparent 1px 14px)", pointerEvents: "none" }} />
          <div style={{ position: "absolute", inset: 0, zIndex: 1, background: "linear-gradient(to right, rgba(13,17,23,0.9) 0%, rgba(13,17,23,0.5) 50%, rgba(13,17,23,0.2) 100%)" }} />
          <div style={{ position: "absolute", inset: 0, zIndex: 1, background: "linear-gradient(to top, var(--ink-900) 0%, transparent 40%)" }} />

          {/* Slide counter */}
          <div className="mono" style={{ position: "absolute", top: 100, right: 32, zIndex: 20, fontSize: 11, letterSpacing: "0.18em", color: "var(--ink-300)" }}>
            {String(activeSlide + 1).padStart(2, "0")} / {String(slides.length).padStart(2, "0")}
          </div>

          {/* Slides */}
          {slides.map((item, i) => (
            <div key={item.slideKey} style={{ position: "absolute", inset: 0, zIndex: 10, display: "flex", alignItems: "center", opacity: i === activeSlide ? 1 : 0, transition: "opacity 0.8s ease", pointerEvents: i === activeSlide ? "auto" : "none" }}>
              <div style={{ width: "100%", maxWidth: 1440, margin: "0 auto", padding: "60px 32px", display: "grid", gridTemplateColumns: item.kind === "content" && item.slide.category === "radar" && radarCard ? "1.4fr 1fr" : "1fr", gap: 48, alignItems: "center" }}>
                {item.kind === "content" ? (
                  <>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
                        <span className="sg-chip sg-chip-solid" style={{ fontSize: 10 }}>{CAT_LABEL[item.slide.category] ?? item.slide.category}</span>
                        <span className="mono" style={{ fontSize: 10, letterSpacing: "0.18em", color: "var(--ink-300)" }}>
                          {item.slide.category === "radar" ? "BU HAFTANIN RADAR OYUNCUSU" : "KEŞFET"}
                        </span>
                      </div>
                      <h1 className="display grad-text" style={{ fontSize: "clamp(48px, 6vw, 84px)", fontWeight: 700, lineHeight: 0.95, letterSpacing: "-0.04em", margin: "0 0 20px" }}>
                        {item.slide.title.length > 80 ? item.slide.title.slice(0, 80) + "…" : item.slide.title}
                      </h1>
                      <p style={{ fontSize: 18, lineHeight: 1.5, color: "var(--ink-200)", marginBottom: 32, maxWidth: 540 }}>
                        {(() => {
                          const clean = item.slide.content.replace(/<[^>]+>/g, " ").replace(/[#*_\n]/g, " ").replace(/\s+/g, " ").trim();
                          const tn = item.slide.title.replace(/\s+/g, " ").trim().toLowerCase();
                          const cs = clean.toLowerCase().startsWith(tn) ? clean.slice(item.slide.title.length).trim() : clean;
                          const first = cs.match(/^[^.!?]{20,}[.!?]/)?.[0];
                          return first ? first.trim() : cs.slice(0, 160) + "…";
                        })()}
                      </p>
                      <div style={{ display: "flex", gap: 12 }}>
                        <Link href={`${categoryPath(item.slide.category)}/${item.slide.slug}`} className="sg-btn sg-btn-solid">OKU →</Link>
                        <Link href={categoryPath(item.slide.category)} className="sg-btn">TÜM İÇERİKLER</Link>
                      </div>
                    </div>
                    {item.slide.category === "radar" && radarCard && (
                      <div style={{ maxWidth: 300, justifySelf: "end", width: "100%" }}>
                        <PlayerCard player={radarCard} size="full" showScoutNote={false} animated={false}
                          tmLink={`https://www.transfermarkt.com.tr/schnellsuche/ergebnis/schnellsuche?query=${encodeURIComponent(radarCard.name)}`}
                          gLink={`https://www.google.com/search?q=${encodeURIComponent(radarCard.name + " footballer")}`}
                        />
                      </div>
                    )}
                  </>
                ) : (
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
                      <span className="sg-chip" style={{ fontSize: 10, borderColor: "var(--amber)", color: "var(--amber)" }}>ARENA</span>
                    </div>
                    <h1 className="display" style={{ fontSize: "clamp(48px, 6vw, 84px)", fontWeight: 700, lineHeight: 0.95, letterSpacing: "-0.04em", margin: "0 0 20px", color: "var(--amber)" }}>
                      {item.title}
                    </h1>
                    <p style={{ fontSize: 18, lineHeight: 1.5, color: "var(--ink-200)", marginBottom: 32, maxWidth: 540 }}>{item.teaser}</p>
                    <Link href={item.href} className="sg-btn" style={{ borderColor: "var(--amber)", color: "var(--amber)" }}>OYNA →</Link>
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Dots */}
          <div style={{ position: "absolute", bottom: 32, left: 32, zIndex: 20, display: "flex", gap: 6 }}>
            {slides.map((_, i) => (
              <button key={i} onClick={() => goTo(i)} style={{ width: i === activeSlide ? 32 : 12, height: 3, borderRadius: 2, background: i === activeSlide ? "var(--accent)" : "rgba(255,255,255,0.3)", border: "none", padding: 0, cursor: "pointer", transition: "all 0.3s" }} />
            ))}
          </div>
          <div style={{ position: "absolute", bottom: 24, right: 32, zIndex: 20, display: "flex", gap: 8 }}>
            <button onClick={prev} className="sg-btn" style={{ padding: "8px 12px" }}>←</button>
            <button onClick={next} className="sg-btn" style={{ padding: "8px 12px" }}>→</button>
          </div>
        </section>
      )}

      {/* ── SON EKLENENLER ───────────────────────────────────────────── */}
      {recentItems.length > 0 && (
        <section style={{ maxWidth: 1440, margin: "0 auto", padding: "80px 32px 40px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 24 }}>
            <h2 className="display" style={{ fontSize: 36, fontWeight: 700, letterSpacing: "-0.03em", margin: 0 }}>Son Eklenenler</h2>
            <Link href="/radar" className="sg-link mono" style={{ fontSize: 12, letterSpacing: "0.14em", color: "var(--ink-300)" }}>ARŞİV →</Link>
          </div>
          <div style={{ overflowX: "auto", paddingBottom: 16 }}>
            <div style={{ display: "grid", gridAutoFlow: "column", gridAutoColumns: "minmax(280px, 1fr)", gap: 16, minWidth: "100%" }}>
              {recentItems.map((item) => {
                const accent = CAT_ACCENT[item.category] ?? "var(--emerald)";
                return (
                  <article key={item.id} onClick={() => window.location.href = `${categoryPath(item.category)}/${item.slug}`}
                    className="sg-lift" style={{ background: "var(--ink-800)", border: "1px solid var(--ink-700)", borderRadius: 4, overflow: "hidden", cursor: "pointer" }}>
                    <div style={{ height: 2, background: accent }} />
                    <div style={{ height: 160, position: "relative", overflow: "hidden", background: "linear-gradient(140deg, var(--ink-700) 0%, var(--ink-800) 100%)" }}>
                      <div className="sg-stripe" style={{ position: "absolute", inset: 0, opacity: 0.4 }} />
                      <img src={item.cover_image || getCategoryImage(item.category, item.slug)} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", filter: "brightness(0.35) saturate(0.6)", opacity: 0.7 }} onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                      <div style={{ position: "absolute", bottom: 12, left: 16, right: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span className="mono" style={{ fontSize: 10, letterSpacing: "0.18em", color: accent }}>{CAT_LABEL[item.category] ?? item.category}</span>
                        <span className="mono" style={{ fontSize: 10, color: "var(--ink-400)" }}>
                          {new Date(item.created_at).toLocaleDateString("tr-TR", { day: "numeric", month: "short" }).toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <div style={{ padding: 20 }}>
                      <h3 className="display" style={{ fontSize: 16, fontWeight: 700, margin: "0 0 8px", lineHeight: 1.25, color: "var(--ink-100)" }}>{item.title}</h3>
                      <p style={{ fontSize: 13, color: "var(--ink-300)", lineHeight: 1.5, margin: 0 }}>
                        {item.content.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 100)}…
                      </p>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ── RADAR OYUNCUSU ───────────────────────────────────────────── */}
      <section style={{ maxWidth: 1440, margin: "0 auto", padding: "60px 32px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 32 }}>
          <div>
            <p className="eyebrow" style={{ marginBottom: 8 }}>BU HAFTANIN RADAR OYUNCUSU</p>
            <h2 className="display" style={{ fontSize: 36, fontWeight: 700, letterSpacing: "-0.03em", margin: 0 }}>{featuredPlayer?.name ?? "Radar Oyuncusu"}</h2>
          </div>
          <Link href="/radar" className="sg-link mono" style={{ fontSize: 12, letterSpacing: "0.14em", color: "var(--ink-300)" }}>TÜM RADAR →</Link>
        </div>

        {featuredLoading ? (
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "48px 0", color: "var(--ink-400)" }}>
            <span className="h-5 w-5 animate-spin rounded-full border-2 border-t-transparent" style={{ borderColor: "var(--accent)", borderTopColor: "transparent" }} />
          </div>
        ) : radarCard ? (
          <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 48, alignItems: "start" }}>
            <PlayerCard player={radarCard} size="full" showScoutNote={true} animated={true}
              tmLink={`https://www.transfermarkt.com.tr/schnellsuche/ergebnis/schnellsuche?query=${encodeURIComponent(radarCard.name)}`}
              gLink={`https://www.google.com/search?q=${encodeURIComponent(radarCard.name + " footballer")}`}
            />
            <div>
              <p className="eyebrow" style={{ marginBottom: 12 }}>ODAK OYUNCU</p>
              <h3 className="display" style={{ fontSize: 36, fontWeight: 700, letterSpacing: "-0.03em", margin: "0 0 4px" }}>{radarCard.name}</h3>
              <p className="mono" style={{ fontSize: 11, color: "var(--ink-400)", letterSpacing: "0.12em", marginBottom: 28 }}>
                {radarCard.club} · {radarCard.league} · {radarCard.position} · {radarCard.age} YAŞ
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 28 }}>
                {[
                  { label: "PAC · HIZ", v: radarCard.pace },
                  { label: "SHO · ŞUT", v: radarCard.shooting },
                  { label: "PAS · PAS", v: radarCard.passing },
                  { label: "DRI · DRİBLİNG", v: radarCard.dribbling },
                  { label: "DEF · DEFANS", v: radarCard.defending },
                  { label: "PHY · FİZİK", v: radarCard.physical },
                ].map(({ label, v }) => (
                  <div key={label} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <span className="mono" style={{ fontSize: 10, color: "var(--ink-400)", letterSpacing: "0.1em", width: 140, flexShrink: 0 }}>{label}</span>
                    <div style={{ flex: 1, height: 3, background: "var(--ink-700)", borderRadius: 2, overflow: "hidden" }}>
                      <div className="stat-bar-fill" style={{ height: "100%", width: `${v}%`, background: v >= 80 ? "var(--emerald)" : v >= 65 ? "var(--cyan)" : "var(--ink-500)", borderRadius: 2 }} />
                    </div>
                    <span className="mono" style={{ fontSize: 11, fontWeight: 600, color: v >= 80 ? "var(--emerald)" : v >= 65 ? "var(--cyan)" : "var(--ink-400)", width: 28, textAlign: "right" }}>{v}</span>
                  </div>
                ))}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 24, marginBottom: 24 }}>
                {[
                  { label: "GOL", value: featuredPlayer?.goals ?? "—" },
                  { label: "ASİST", value: featuredPlayer?.assists ?? "—" },
                  { label: "GENEL", value: radarCard.overall, accent: true },
                ].map(({ label, value, accent }) => (
                  <div key={label}>
                    <p className="eyebrow" style={{ marginBottom: 4 }}>{label}</p>
                    <p className="display" style={{ fontSize: 32, fontWeight: 700, margin: 0, color: accent ? "var(--accent)" : "var(--ink-100)" }}>{value}</p>
                  </div>
                ))}
              </div>
              {radarCard.whyWatch && (
                <div style={{ padding: "12px 16px", borderLeft: "2px solid var(--accent)", background: "var(--ink-800)" }}>
                  <p className="eyebrow" style={{ marginBottom: 6 }}>SCOUT NOTU</p>
                  <p style={{ fontSize: 13, color: "var(--ink-300)", lineHeight: 1.55, fontStyle: "italic", margin: 0 }}>"{radarCard.whyWatch}"</p>
                </div>
              )}
              <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
                <a href={`https://www.transfermarkt.com.tr/schnellsuche/ergebnis/schnellsuche?query=${encodeURIComponent(radarCard.name)}`} target="_blank" rel="noopener noreferrer" className="sg-btn" style={{ fontSize: 11 }}>TRANSFERMARKT</a>
                <a href={`https://www.google.com/search?q=${encodeURIComponent(radarCard.name + " footballer")}`} target="_blank" rel="noopener noreferrer" className="sg-btn" style={{ fontSize: 11 }}>GOOGLE</a>
              </div>
            </div>
          </div>
        ) : featuredPlayer ? (
          <div style={{ padding: 24, background: "var(--ink-800)", border: "1px solid var(--ink-700)" }}>
            <h3 className="display" style={{ fontSize: 24, color: "var(--accent)", margin: "0 0 8px" }}>{featuredPlayer.name}</h3>
            <p style={{ fontSize: 14, color: "var(--ink-300)", margin: 0 }}>{featuredPlayer.description}</p>
          </div>
        ) : null}
      </section>

      {/* ── FORM OYUNCULARI ──────────────────────────────────────────── */}
      <section style={{ maxWidth: 1440, margin: "0 auto", padding: "40px 32px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 24 }}>
          <div>
            <p className="eyebrow" style={{ marginBottom: 8 }}>BU DÖNEM DİKKAT ÇEKENLER</p>
            <h2 className="display" style={{ fontSize: 36, fontWeight: 700, letterSpacing: "-0.03em", margin: 0 }}>Form Oyuncuları</h2>
          </div>
        </div>
        {formLoading ? (
          <div style={{ padding: "32px 0", color: "var(--ink-400)" }}><span className="h-4 w-4 animate-spin rounded-full border-2 border-t-transparent" style={{ borderColor: "var(--accent)", borderTopColor: "transparent", display: "inline-block" }} /></div>
        ) : formPlayers.length === 0 ? (
          <p style={{ fontSize: 14, color: "var(--ink-400)", padding: "32px 0" }}>Oyuncular yakında listelenecek.</p>
        ) : (
          <motion.div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 16 }}
            initial="hidden" whileInView="visible" viewport={{ once: true }}
            variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.07 } } }}>
            {formPlayers.map((player, i) => (
              <motion.div key={`${player.name}-${i}`} variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5 } } }}>
                <PlayerCard player={{ name: player.name, club: player.club, league: player.league, position: player.position || "", age: String(player.age), overall: player.overall!, pace: player.pace ?? 0, shooting: player.shooting ?? 0, passing: player.passing ?? 0, dribbling: player.dribbling ?? 0, defending: player.defending ?? 0, physical: player.physical ?? 0, photo_url: player.photo_url as string | undefined }} size="mini" animated={false} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </section>

      {/* ── EDİTÖRÜN SEÇİMİ ──────────────────────────────────────────── */}
      {editorItems.length > 0 && (
        <section style={{ maxWidth: 1440, margin: "0 auto", padding: "40px 32px" }}>
          <h2 className="display" style={{ fontSize: 36, fontWeight: 700, letterSpacing: "-0.03em", margin: "0 0 24px" }}>Editörün Seçimi</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
            {editorItems.map((item) => {
              const accent = CAT_ACCENT[item.category] ?? "var(--emerald)";
              return (
                <Link key={`${item.id}-ed`} href={`${categoryPath(item.category)}/${item.slug}`} className="sg-lift" style={{ background: "var(--ink-800)", border: "1px solid var(--ink-700)", borderRadius: 4, overflow: "hidden", display: "block" }}>
                  <div style={{ padding: 24 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                      <span className="mono" style={{ fontSize: 10, letterSpacing: "0.18em", color: accent }}>{CAT_LABEL[item.category] ?? item.category}</span>
                      <span className="mono" style={{ fontSize: 10, color: "var(--ink-400)" }}>
                        {new Date(item.created_at).toLocaleDateString("tr-TR", { day: "numeric", month: "short" }).toUpperCase()}
                      </span>
                    </div>
                    <h3 className="display" style={{ fontSize: 18, fontWeight: 700, letterSpacing: "-0.02em", margin: "0 0 16px", lineHeight: 1.2, color: "var(--ink-100)" }}>{item.title}</h3>
                    <div style={{ borderTop: "1px solid var(--ink-700)", paddingTop: 12 }}>
                      <span className="mono" style={{ fontSize: 10, color: "var(--ink-400)", letterSpacing: "0.1em" }}>
                        {Math.max(1, Math.ceil(item.content.replace(/<[^>]+>/g, "").split(/\s+/).length / 200))} DK · OKUMA
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* ── HAFTALIK RADAR CTA ───────────────────────────────────────── */}
      <section style={{ maxWidth: 1440, margin: "0 auto", padding: "0 32px 80px" }}>
        <div style={{ background: "var(--ink-800)", border: "1px solid var(--ink-700)", padding: "48px 56px", display: "grid", gridTemplateColumns: "1fr auto", gap: 32, alignItems: "center" }}>
          <div>
            <p className="eyebrow" style={{ marginBottom: 12 }}>HAFTALIK RADAR</p>
            <h2 className="display" style={{ fontSize: "clamp(28px, 4vw, 48px)", fontWeight: 700, letterSpacing: "-0.03em", margin: "0 0 12px", lineHeight: 1.1 }}>
              Her hafta bir genç yetenek.
            </h2>
            <p style={{ fontSize: 16, color: "var(--ink-300)", lineHeight: 1.5, margin: 0 }}>
              Yükselen oyuncuları, taktik gözüyle ve oyun istatistikleriyle birlikte.<br />Pazartesi sabahları yayında.
            </p>
          </div>
          <Link href="/radar" className="sg-btn sg-btn-solid" style={{ whiteSpace: "nowrap" }}>
            RADAR&apos;A GİT →
          </Link>
        </div>
      </section>

      <SiteFooter maxWidth="max-w-7xl" />
    </main>
  );
}
