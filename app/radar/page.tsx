import Link from "next/link";
import SiteHeader from "../components/site-header";
import SiteFooter from "../components/site-footer";
import HubArticleCard from "../components/hub-article-card";
import { ContentHighlightPills } from "../components/content-highlight-pills";
import { getHubCards } from "@/lib/hub-cards";
import { HIGHLIGHT_CARD_ACCENTS_CYCLE } from "@/lib/content-highlight-tags";

/**
 * /radar, rendered on the server (2026-10-19). The client version bailed out of
 * server rendering (useSearchParams under a fallback-less Suspense), so Googlebot
 * got no <main>, <h1> or card; it also fetched twenty fc_players rows on every
 * visit and never showed them. Every published report is now in the HTML, the
 * admin's cover-story pin still leads, and "Load more" is gone (see app/lists/page.tsx).
 */
export const revalidate = 3600;

export default async function RadarPage() {
  const cards = await getHubCards("radar", { excerptMax: 180, pinScope: "radar" });
  const [featured, ...rest] = cards;

  return (
    <main style={{ background: "var(--sg-bg)", color: "var(--sg-text-primary)", minHeight: "100vh" }}>
      <SiteHeader activeNav="radar" />
      <div style={{ paddingTop: "68px" }} />

      <div className="sg-hero-text-block sg-page-shell--hero sg-hub-hero">
        <div>
          <div className="eyebrow" style={{ color: "var(--accent)" }}>WEEKLY ANALYSIS</div>
          <h1 className="display" style={{ fontSize: "clamp(56px, 7vw, 84px)", fontWeight: 700, letterSpacing: "-0.04em", lineHeight: 0.9, margin: "8px 0 0" }}>
            <span className="grad-text">Radar</span>
          </h1>
        </div>
        <p style={{ fontSize: 18, color: "var(--sg-text-secondary)", lineHeight: 1.5, margin: 0 }}>
          Single-player weekly deep dives. Data, tactics and playing styles.
        </p>
      </div>

      <div className="sg-page-shell" style={{ paddingBottom: 80 }}>
        {cards.length === 0 ? (
          <p className="mono" style={{ fontSize: 12, textAlign: "center", padding: "80px 0", color: "var(--sg-text-muted)" }}>NO RADAR ARTICLES PUBLISHED YET.</p>
        ) : null}

        {featured ? (
          <Link href={featured.href} className="lift" style={{ display: "block", position: "relative", overflow: "hidden", background: featured.cover ? "var(--ink-900)" : "linear-gradient(135deg, oklch(0.16 0.02 150) 0%, oklch(0.12 0.012 220) 70%)", border: "1px solid var(--sg-border)", borderRadius: 16, marginBottom: 48, minHeight: 340, textDecoration: "none" }}>
            {featured.cover ? (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={featured.cover} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", filter: "brightness(0.38) saturate(0.9)" }} />
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right, rgba(13,18,30,0.94) 0%, rgba(13,18,30,0.72) 55%, rgba(13,18,30,0.45) 100%)" }} />
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(13,18,30,0.85) 0%, transparent 50%)" }} />
              </>
            ) : (
              <>
                <div style={{ position: "absolute", bottom: -180, left: -100, width: 480, height: 480, borderRadius: "50%", background: "radial-gradient(circle, var(--accent) 0%, transparent 65%)", opacity: 0.15, pointerEvents: "none" }} />
                <div style={{ position: "absolute", inset: 0, opacity: 0.04, pointerEvents: "none", backgroundImage: "repeating-linear-gradient(90deg, rgba(255,255,255,0.5) 0 1px, transparent 1px 22px)" }} />
              </>
            )}
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: "var(--accent)", zIndex: 1 }} />
            <div style={{ position: "relative", zIndex: 2, padding: "clamp(24px, 5vw, 48px)", maxWidth: 760 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
                <span className="chip solid" style={{ background: "var(--accent)", borderColor: "var(--accent)", color: "var(--ink-900)", fontSize: 10 }}>COVER STORY</span>
                <span className="mono" style={{ fontSize: 10, letterSpacing: "0.18em", color: "var(--sg-text-muted)" }}>RADAR · {featured.dateLong}</span>
                {featured.draft && <span className="mono" style={{ fontSize: 9, letterSpacing: "0.1em", color: "var(--amber)" }}>DRAFT</span>}
              </div>
              <h2 className="display" style={{ fontSize: "clamp(32px, 4.4vw, 56px)", fontWeight: 700, letterSpacing: "-0.04em", margin: 0, lineHeight: 0.95, textWrap: "balance", color: "var(--sg-text-primary)" }}>
                <span className="grad-text">{featured.title}</span>
              </h2>
              <p style={{ fontSize: 16, color: "var(--sg-text-secondary)", lineHeight: 1.55, marginTop: 20, maxWidth: 540 }}>{featured.excerpt}</p>
              {featured.pills.length ? (
                <div style={{ marginTop: 18 }}>
                  <ContentHighlightPills tags={featured.pills.slice(0, 4)} accent="var(--accent)" label="HIGHLIGHTS" />
                </div>
              ) : null}
              <div style={{ marginTop: 24 }}>
                <span className="btn btn-solid">READ THE STORY →</span>
              </div>
            </div>
          </Link>
        ) : null}

        {rest.length > 0 ? (
          <section>
            <h2 className="eyebrow" style={{ margin: "0 0 16px", fontWeight: 400 }}>ALL ANALYSES</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 260px), 1fr))", gap: 16, marginBottom: 48 }}>
              {rest.map((card, idx) => (
                <HubArticleCard key={card.id} card={card} label="RADAR" accent={HIGHLIGHT_CARD_ACCENTS_CYCLE[idx % HIGHLIGHT_CARD_ACCENTS_CYCLE.length]!} />
              ))}
            </div>
          </section>
        ) : null}
      </div>

      <SiteFooter maxWidth="max-w-7xl" />
    </main>
  );
}
