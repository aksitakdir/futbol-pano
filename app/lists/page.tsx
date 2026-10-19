import Link from "next/link";
import SiteHeader from "../components/site-header";
import SiteFooter from "../components/site-footer";
import HubArticleCard from "../components/hub-article-card";
import { ContentHighlightPills } from "../components/content-highlight-pills";
import { getHubCards } from "@/lib/hub-cards";
import { groupTopics } from "@/lib/list-topics";
import { HIGHLIGHT_CARD_ACCENTS_CYCLE } from "@/lib/content-highlight-tags";

/**
 * /lists, rendered on the server (2026-10-19). It used to be a client page whose
 * useSearchParams bailed the whole page out of server rendering: Googlebot got no
 * <main>, no <h1> and no card. Every published list is now in the HTML, with a
 * "Browse by topic" row between the cover list and the grid. The old "Load more" button is gone: the
 * section is small enough to show in full, and paging would hide links again.
 * Fresh after a publish through lib/revalidate-content.ts; hourly as a fallback.
 */
export const revalidate = 3600;

const LIST_COVER_ACCENT = "var(--emerald)";

export default async function ListsPage() {
  const cards = await getHubCards("lists");
  const [featured, ...rest] = cards;
  const { groups } = groupTopics(cards.map((c) => ({ href: c.href, title: c.title, createdAt: c.createdAt })));

  return (
    <main style={{ background: "var(--sg-bg)", color: "var(--sg-text-primary)", minHeight: "100vh" }}>
      <SiteHeader activeNav="lists" />
      <div style={{ paddingTop: "68px" }} />

      <div className="sg-hero-text-block sg-page-shell--hero sg-hub-hero">
        <div>
          <div className="eyebrow" style={{ color: "var(--emerald)" }}>ARCHIVE</div>
          <h1 className="display" style={{ fontSize: "clamp(56px, 7vw, 84px)", fontWeight: 700, letterSpacing: "-0.04em", lineHeight: 0.9, margin: "8px 0 0" }}>
            Lists
          </h1>
        </div>
        <p style={{ fontSize: 18, color: "var(--sg-text-secondary)", lineHeight: 1.5, margin: 0 }}>
          Curated player lists — each with scout notes, stats and comparisons.
        </p>
      </div>

      <div className="sg-page-shell" style={{ paddingBottom: 80 }}>
        {cards.length === 0 ? (
          <p className="mono" style={{ fontSize: 12, textAlign: "center", padding: "40px 0", color: "var(--sg-text-muted)" }}>NO PUBLISHED LISTS YET.</p>
        ) : null}

        {featured ? (
          <Link href={featured.href} className="lift" style={{ display: "block", position: "relative", overflow: "hidden", background: "linear-gradient(135deg, oklch(0.17 0.04 155) 0%, oklch(0.12 0.018 200) 72%)", border: "1px solid var(--sg-border)", borderRadius: 16, marginBottom: 48, minHeight: 320, textDecoration: "none" }}>
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: LIST_COVER_ACCENT }} />
            {featured.cover ? (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={featured.cover} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", filter: "brightness(0.38) saturate(0.9)" }} />
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right, rgba(13,18,30,0.94) 0%, rgba(13,18,30,0.72) 55%, rgba(13,18,30,0.45) 100%)" }} />
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(13,18,30,0.85) 0%, transparent 50%)" }} />
              </>
            ) : (
              <>
                <div style={{ position: "absolute", bottom: -160, right: -100, width: 440, height: 440, borderRadius: "50%", background: "radial-gradient(circle, var(--emerald) 0%, transparent 65%)", opacity: 0.14, pointerEvents: "none" }} />
                <svg viewBox="0 0 140 120" preserveAspectRatio="xMidYMid slice" style={{ position: "absolute", right: 0, top: 0, height: "100%", width: "44%", opacity: 0.28, pointerEvents: "none" }}>
                  <rect x="24" y="18" width="96" height="10" rx="2" fill="rgba(255,255,255,0.12)" />
                  <rect x="24" y="38" width="72" height="8" rx="2" fill="rgba(255,255,255,0.08)" />
                  <rect x="24" y="54" width="84" height="8" rx="2" fill="rgba(255,255,255,0.08)" />
                  <rect x="24" y="70" width="60" height="8" rx="2" fill="rgba(255,255,255,0.08)" />
                  <circle cx="34" cy="92" r="10" fill="none" stroke="var(--emerald)" strokeWidth="1.2" opacity="0.9" />
                  <text x="34" y="96" textAnchor="middle" fill="var(--emerald)" fontSize="11" fontWeight="700" opacity="0.95">1</text>
                  <circle cx="70" cy="88" r="9" fill="none" stroke="var(--emerald)" strokeWidth="1" opacity="0.65" />
                  <text x="70" y="91" textAnchor="middle" fill="var(--emerald)" fontSize="9" fontWeight="600" opacity="0.75">2</text>
                  <circle cx="102" cy="94" r="8" fill="none" stroke="var(--emerald)" strokeWidth="0.9" opacity="0.5" />
                  <text x="102" y="97" textAnchor="middle" fill="var(--emerald)" fontSize="8" fontWeight="600" opacity="0.6">3</text>
                </svg>
              </>
            )}
            <div style={{ position: "relative", padding: "clamp(24px, 5vw, 48px)", maxWidth: 760 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
                <span className="chip solid" style={{ background: LIST_COVER_ACCENT, borderColor: LIST_COVER_ACCENT, color: "var(--ink-900)", fontSize: 10 }}>COVER LIST</span>
                <span className="mono" style={{ fontSize: 10, letterSpacing: "0.18em", color: "var(--sg-text-muted)" }}>LISTS · {featured.dateLong}</span>
              </div>
              <h2 className="display" style={{ fontSize: "clamp(32px, 4.4vw, 56px)", fontWeight: 700, letterSpacing: "-0.04em", margin: 0, lineHeight: 0.95, textWrap: "balance", color: "var(--sg-text-primary)" }}>
                <span className="grad-text">{featured.title}</span>
              </h2>
              <p style={{ fontSize: 16, color: "var(--sg-text-secondary)", lineHeight: 1.55, marginTop: 18, maxWidth: 580 }}>{featured.excerpt}</p>
              {featured.pills.length ? (
                <div style={{ marginTop: 22 }}>
                  <ContentHighlightPills tags={featured.pills.slice(0, 4)} accent={LIST_COVER_ACCENT} label="HIGHLIGHTS" />
                </div>
              ) : null}
              <div style={{ marginTop: 24 }}>
                <span className="btn btn-solid" style={{ background: LIST_COVER_ACCENT, borderColor: LIST_COVER_ACCENT }}>READ →</span>
              </div>
            </div>
          </Link>
        ) : null}

        {groups.length > 0 ? (
          <nav aria-label="Browse lists by topic" className="sg-topic-row">
            {groups.map(({ name, items }) => (
              <div key={name} style={{ minWidth: 0 }}>
                <h2 className="sg-index-subheading" style={{ marginBottom: 10 }}>{name}</h2>
                <ul className="sg-index-chips">
                  {items.map((it) => (
                    <li key={it.href}>
                      <Link href={it.href} title={it.title} className="sg-index-chip">{it.label}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        ) : null}

        {rest.length > 0 ? (
          <section style={{ marginBottom: 64 }}>
            <h2 className="eyebrow" style={{ color: "var(--emerald)", margin: "0 0 20px", fontWeight: 400 }}>ALL LISTS</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 260px), 1fr))", gap: 16 }}>
              {rest.map((card, idx) => (
                <HubArticleCard key={card.id} card={card} label="LIST" accent={HIGHLIGHT_CARD_ACCENTS_CYCLE[(idx + 1) % HIGHLIGHT_CARD_ACCENTS_CYCLE.length]!} />
              ))}
            </div>
          </section>
        ) : null}
      </div>

      <SiteFooter maxWidth="max-w-7xl" />
    </main>
  );
}
