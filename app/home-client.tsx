"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import SiteHeader from "./components/site-header";
import SiteFooter from "./components/site-footer";
import { PlayerScoutLinks } from "./components/player-scout-links";
import PlayerCard from "./components/player-card";
import PlayerRatingBars from "./components/player-rating-bars";
import HomeRecentCarousel from "./components/home-recent-carousel";
import HomeHubPromo from "./components/home-hub-promo";
import type { SpotlightCard } from "@/lib/home-spotlights";
import type { HomeArticle, HomeData } from "@/lib/home-data";

/**
 * The homepage's interactive layer. Since 2026-10-20 every section's data is
 * fetched on the server (lib/home-data.ts) and arrives as props, so the hero, the
 * carousel, the article grid and the player sections are in the HTML Googlebot
 * reads first; this component keeps only the slider timer and the carousel paging.
 */

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

export default function HomeClient({ spotlights, home }: { spotlights: SpotlightCard[]; home: HomeData }) {
  const slides = home.slides;
  const [activeSlide, setActiveSlide] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

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

  const radarCard = home.featured;

  return (
    <main style={{ background: "var(--sg-bg)", color: "var(--sg-text-primary)", minHeight: "100vh" }}>
      <SiteHeader />
      <div style={{ paddingTop: "68px" }} />

      <h1 className="sr-only">Scout Gamer — Football × Game Culture</h1>

      {/* ── Hero Slider ── */}
      {slides.length > 0 && (
        <section className="relative w-full overflow-hidden grain" style={{ height: "78vh", minHeight: 580 }}>
          <div className="absolute inset-0 z-0">
            <HeroBackground slide={slides[activeSlide]} first={activeSlide === 0} />
            <div className="absolute inset-0" style={{ backgroundImage: "repeating-linear-gradient(-45deg, rgba(0,0,0,0.15) 0 1px, transparent 1px 14px)" }} />
            <div className="absolute inset-0" style={{ background: "linear-gradient(to right, var(--ink-900) 0%, rgba(13,18,30,0.75) 50%, rgba(13,18,30,0.2) 100%)" }} />
            <div className="absolute inset-0" style={{ background: "linear-gradient(to top, var(--sg-bg) 0%, transparent 40%)" }} />
          </div>

          <div className="mono absolute top-8 right-8 z-20" style={{ fontSize: 11, letterSpacing: "0.18em", color: "var(--ink-300)" }}>
            {String(activeSlide + 1).padStart(2, "0")} / {String(slides.length).padStart(2, "0")}
          </div>

          {slides.map((item, i) => (
            <motion.div key={item.key} className="absolute inset-0 flex items-center z-10"
              initial={false} animate={{ opacity: i === activeSlide ? 1 : 0 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              style={{ pointerEvents: i === activeSlide ? "auto" : "none" }}>
              <div className="sg-hero-text-block pb-16">
                {item.kind === "content" ? (
                  <div className="page-enter" key={`text-${i}`}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
                      <span className="chip solid" style={{ background: CAT_COLOR[item.article.category] ?? "var(--accent)", borderColor: CAT_COLOR[item.article.category] ?? "var(--accent)", color: "var(--ink-900)" }}>
                        {CAT_LABEL[item.article.category] ?? item.article.category}
                      </span>
                    </div>
                    <h2 className="display" style={{ fontSize: "clamp(2.4rem, 5.5vw, 4.8rem)", fontWeight: 700, letterSpacing: "-0.04em", lineHeight: 1.08, margin: "0 0 20px", paddingBottom: "0.14em", textWrap: "balance", maxWidth: 820, background: "linear-gradient(135deg, var(--accent) 0%, var(--accent-2) 60%, var(--accent-3) 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                      {item.article.title}
                    </h2>
                    <p className="hidden sm:block line-clamp-3" style={{ fontSize: 17, lineHeight: 1.6, color: "var(--ink-200)", maxWidth: 600, marginBottom: 36 }}>
                      {item.excerpt}
                    </p>
                    <Link href={item.article.href} className="btn btn-solid" aria-label={`Read more: ${item.article.title}`}>Read More →</Link>
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

      {home.recent.length > 0 && <HomeRecentCarousel items={home.recent} />}

      {/* Server-rendered: only contexts that are live right now (lib/home-spotlights.ts). */}
      <HomeHubPromo spotlights={spotlights} />

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

          {radarCard ? (
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
                {radarCard.description && (
                  <p style={{ fontSize: 17, lineHeight: 1.6, color: "var(--sg-text-secondary)", maxWidth: 560, marginBottom: 28 }}>{radarCard.description}</p>
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
        {home.radar.length === 0 ? (
          <p className="mono" style={{ fontSize: 12, padding: "32px 0", textAlign: "center", color: "var(--sg-text-muted)" }}>PLAYERS COMING SOON.</p>
        ) : (
          <div className="grid gap-4 justify-items-stretch" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 190px), 1fr))" }}>
            {home.radar.map((player, i) => (
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
      <HomeAllArticles articles={home.latest} />

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

/** The hero's backdrop: the article's cover, a custom slide's image, or a gradient. */
function HeroBackground({ slide, first }: { slide: HomeData["slides"][number] | undefined; first: boolean }) {
  if (slide?.kind === "content") {
    // eslint-disable-next-line @next/next/no-img-element
    return <img key={slide.article.image} src={slide.article.image} alt="" className="w-full h-full object-cover" style={{ filter: "brightness(0.48) saturate(0.85)" }} fetchPriority={first ? "high" : undefined} />;
  }
  if (slide?.kind === "custom" && slide.image) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img key={slide.image} src={slide.image} alt="" className="w-full h-full object-cover" style={{ filter: "brightness(0.42) saturate(0.9)" }} />;
  }
  if (slide?.kind === "wc" || slide?.kind === "custom") {
    return <div key="wc-hero-bg" className="absolute inset-0" style={{ background: "linear-gradient(135deg, #0d2818 0%, #1a3a5c 35%, #0f172a 70%, #1c1408 100%)" }} />;
  }
  return <div className="absolute inset-0" style={{ background: "linear-gradient(120deg, var(--ink-800) 0%, var(--ink-900) 100%)" }} />;
}

/** "All articles": the twelve pieces after the carousel's last item, so neither repeats the other. */
function HomeAllArticles({ articles }: { articles: HomeArticle[] }) {
  if (articles.length === 0) return null;

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
          return (
            <Link key={item.id} href={item.href}
              className="lift" style={{ background: "var(--sg-surface)", border: "1px solid var(--sg-border)", borderRadius: 8, overflow: "hidden", display: "flex", flexDirection: "column", textDecoration: "none" }}>
              <div style={{ position: "relative", height: 150, overflow: "hidden" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.image} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", filter: "brightness(0.65) saturate(0.85)" }} loading="lazy" />
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, var(--sg-surface) 0%, transparent 60%)" }} />
              </div>
              <div style={{ padding: "14px 20px 20px", flex: 1, display: "flex", flexDirection: "column" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                  <span className="mono" style={{ fontSize: 9, letterSpacing: "0.2em", color: accentColor }}>{catLabel}</span>
                  <span className="mono" style={{ fontSize: 9, letterSpacing: "0.14em", color: "var(--sg-text-muted)" }}>{item.dateShort}</span>
                </div>
                <h3 className="display" style={{ fontSize: 17, fontWeight: 600, lineHeight: 1.2, letterSpacing: "-0.02em", margin: 0, textWrap: "balance", color: "var(--sg-text-primary)", flex: 1 }}>
                  {item.title}
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
