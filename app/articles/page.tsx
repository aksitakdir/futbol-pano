import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "../components/site-header";
import SiteFooter from "../components/site-footer";
import HubArticleCard from "../components/hub-article-card";
import { getHubCards } from "@/lib/hub-cards";
import { CAT_LABEL } from "@/lib/category-config";
import { HIGHLIGHT_CARD_ACCENTS_CYCLE } from "@/lib/content-highlight-tags";

/**
 * /articles, rendered on the server (2026-10-19). Linked from the homepage, it was a
 * client page that bailed out of server rendering entirely: Googlebot got an empty
 * body, no links, no footer and the generic site title. Now the newest pieces are
 * cards and every older one is a plain link below them, all in the HTML, with no
 * "Load more" to hide anything behind JavaScript.
 */
export const revalidate = 3600;

export const metadata: Metadata = {
  title: "All Articles",
  description: "Every Scout Gamer piece in one place: scouting lists, player reports, tactical analysis, transfers and the World Cup 2026 archive.",
  alternates: { canonical: "https://www.scoutgamer.com/articles" },
};

const CARDS = 24;

export default async function ArticlesPage() {
  const all = await getHubCards(null);
  const cards = all.slice(0, CARDS);
  const older = all.slice(CARDS);

  return (
    <main style={{ background: "var(--sg-bg)", color: "var(--sg-text-primary)", minHeight: "100vh" }}>
      <SiteHeader />
      <div style={{ paddingTop: "68px" }} />

      <div className="sg-page-shell" style={{ paddingTop: 64, paddingBottom: 80 }}>
        <div style={{ marginBottom: 40 }}>
          <div className="eyebrow" style={{ color: "var(--accent)" }}>BROWSE</div>
          <h1 className="display" style={{ fontSize: "clamp(36px, 5vw, 56px)", fontWeight: 700, letterSpacing: "-0.04em", margin: "8px 0 0" }}>
            All Articles
          </h1>
          <p style={{ fontSize: 17, color: "var(--sg-text-secondary)", lineHeight: 1.5, marginTop: 12, maxWidth: 520 }}>
            Every piece of content across all categories — scouting, tactics, transfers, lists, and World Cup 2026.
          </p>
        </div>

        {all.length === 0 ? (
          <p className="mono" style={{ fontSize: 12, textAlign: "center", padding: "80px 0", color: "var(--sg-text-muted)" }}>NO ARTICLES PUBLISHED YET.</p>
        ) : null}

        {cards.length > 0 ? <h2 className="eyebrow" style={{ margin: "0 0 20px", fontWeight: 400 }}>LATEST</h2> : null}
        <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 280px), 1fr))", marginBottom: 56 }}>
          {cards.map((card, idx) => (
            <HubArticleCard
              key={card.id}
              card={card}
              variant="browse"
              label={(CAT_LABEL[card.category] ?? card.category).toUpperCase()}
              accent={HIGHLIGHT_CARD_ACCENTS_CYCLE[idx % HIGHLIGHT_CARD_ACCENTS_CYCLE.length]!}
            />
          ))}
        </div>

        {older.length > 0 ? (
          <section aria-label="Older articles">
            <h2 className="eyebrow" style={{ margin: "0 0 20px", fontWeight: 400 }}>OLDER ARTICLES</h2>
            <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 340px), 1fr))", gap: "14px 40px" }}>
              {older.map((card) => (
                <li key={card.id} style={{ minWidth: 0, borderTop: "1px solid var(--sg-border)", paddingTop: 12 }}>
                  <div className="mono" style={{ fontSize: 9, letterSpacing: "0.16em", color: "var(--sg-text-muted)", marginBottom: 4 }}>
                    {(CAT_LABEL[card.category] ?? card.category).toUpperCase()} · {card.dateLong}
                  </div>
                  <Link href={card.href} className="u-link" style={{ fontSize: 15, lineHeight: 1.4, color: "var(--sg-text-secondary)", textDecoration: "none" }}>
                    {card.title}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </div>

      <SiteFooter maxWidth="max-w-7xl" />
    </main>
  );
}
