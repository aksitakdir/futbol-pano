"use client";

import Link from "next/link";
import { categoryArticlePath } from "@/lib/category-config";

type HubArticlePreview = { title: string; slug: string; category: string; };

type Props = {
  locale?: string;
  wcArticles: HubArticlePreview[];
  transferArticles: HubArticlePreview[];
};

function articleHref(category: string, slug: string): string {
  return categoryArticlePath(category, slug);
}

export default function HomeHubPromo({ wcArticles, transferArticles }: Props) {
  return (
    <section style={{ borderTop: "1px solid var(--sg-border)", background: "var(--sg-surface-low)" }}>
      <div className="sg-editorial-shell" style={{ paddingTop: 72, paddingBottom: 72 }}>
        <div className="eyebrow" style={{ marginBottom: 28 }}>TOURNAMENT & TRANSFERS</div>
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <HubCard
            accent="var(--amber)"
            title="World Cup 2026"
            description="Match schedule, squads, scout analysis, and tournament lists — June 11 to July 19."
            hubHref="/world-cup-2026"
            cta="WC 2026"
            articles={wcArticles}
            extraLinks={[
              { href: "/world-cup-2026/schedule", label: "Match Schedule" },
              { href: "/world-cup-2026/squads", label: "48 Squads" },
            ]}
          />
          <HubCard
            accent="var(--cyan)"
            title="Transfers"
            description="Transfer Wire — rumors from trusted public sources, scout analysis, and confirmed deals."
            hubHref="/transfers"
            cta="TRANSFERS"
            articles={transferArticles}
          />
        </div>
      </div>
    </section>
  );
}

function HubCard({ accent, title, description, hubHref, cta, articles, extraLinks }: {
  accent: string; title: string; description: string;
  hubHref: string; cta: string; articles: HubArticlePreview[];
  extraLinks?: { href: string; label: string }[];
}) {
  return (
    <div style={{ border: "1px solid var(--sg-border)", borderRadius: 20, padding: "clamp(24px, 3vw, 36px)", background: "var(--sg-surface)", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: accent }} />
      <h2 className="display" style={{ fontSize: "clamp(22px, 2.5vw, 30px)", fontWeight: 700, letterSpacing: "-0.03em", margin: "0 0 12px" }}>{title}</h2>
      <p style={{ fontSize: 15, lineHeight: 1.55, color: "var(--sg-text-secondary)", margin: "0 0 20px" }}>{description}</p>
      {articles.length > 0 ? (
        <ul style={{ listStyle: "none", margin: "0 0 20px", padding: 0 }}>
          {articles.slice(0, 3).map((a, i) => (
            <li key={`${a.slug}-${i}`} style={{ marginBottom: 10 }}>
              <Link href={articleHref(a.category, a.slug)} style={{ fontSize: 14, color: "var(--sg-text-primary)", textDecoration: "none" }} className="u-link">
                <span className="mono" style={{ fontSize: 9, letterSpacing: "0.12em", color: accent, marginRight: 8 }}>Latest</span>
                {a.title}
              </Link>
            </li>
          ))}
        </ul>
      ) : null}
      {extraLinks?.length ? (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
          {extraLinks.map((el) => (
            <Link
              key={el.href}
              href={el.href}
              className="mono u-link"
              style={{ fontSize: 11, letterSpacing: "0.1em", color: accent, padding: "4px 0" }}
            >
              {el.label} →
            </Link>
          ))}
        </div>
      ) : null}
      <Link href={hubHref} className="btn btn-solid" style={{ background: accent, borderColor: accent }}>{cta} →</Link>
    </div>
  );
}
