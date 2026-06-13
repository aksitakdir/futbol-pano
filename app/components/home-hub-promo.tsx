"use client";

import Link from "next/link";
import { categoryArticlePath } from "@/lib/category-config";

type HubArticlePreview = { title: string; slug: string; category: string; };

type Props = {
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
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2" style={{ alignItems: "stretch" }}>
          <HubCard
            accent="var(--amber)"
            title="World Cup 2026"
            description="104 matches across USA, Mexico & Canada — June 11 to July 19, 2026. Scout reports, squad analysis, and complete fixture data."
            hubHref="/world-cup-2026"
            cta="WC 2026 Hub"
            articles={wcArticles}
            extraLinks={[
              { href: "/world-cup-2026/schedule", label: "Match Schedule" },
              { href: "/world-cup-2026/squads", label: "48 Team Squads" },
            ]}
            stats={[
              { value: "104", label: "Matches" },
              { value: "48", label: "Teams" },
              { value: "16", label: "Venues" },
            ]}
          />
          <HubCard
            accent="var(--cyan)"
            title="Transfers"
            description="Real-time transfer intelligence — verified rumors, confirmed deals, and scout analysis on the most impactful moves shaping football."
            hubHref="/transfers"
            cta="Transfer Wire"
            articles={transferArticles}
            extraLinks={[
              { href: "/transfers/radar", label: "Transfer Radar" },
              { href: "/transfers/lists", label: "Transfer Lists" },
            ]}
            stats={[
              { value: "24/7", label: "Wire Feed" },
              { value: "5", label: "Leagues" },
              { value: "∞", label: "Rumors" },
            ]}
          />
        </div>
      </div>
    </section>
  );
}

function HubCard({ accent, title, description, hubHref, cta, articles, extraLinks, stats }: {
  accent: string; title: string; description: string;
  hubHref: string; cta: string; articles: HubArticlePreview[];
  extraLinks?: { href: string; label: string }[];
  stats?: { value: string; label: string }[];
}) {
  return (
    <div style={{
      border: "1px solid var(--sg-border)", borderRadius: 20,
      padding: "clamp(24px, 3vw, 36px)", background: "var(--sg-surface)",
      position: "relative", overflow: "hidden",
      display: "flex", flexDirection: "column",
    }}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: accent }} />

      <h2 className="display" style={{ fontSize: "clamp(22px, 2.5vw, 30px)", fontWeight: 700, letterSpacing: "-0.03em", margin: "0 0 12px" }}>{title}</h2>
      <p style={{ fontSize: 14, lineHeight: 1.55, color: "var(--sg-text-secondary)", margin: "0 0 20px" }}>{description}</p>

      {stats?.length ? (
        <div style={{ display: "flex", gap: 20, marginBottom: 20, paddingBottom: 16, borderBottom: "1px solid var(--sg-border)" }}>
          {stats.map((s) => (
            <div key={s.label}>
              <div className="display" style={{ fontSize: 22, fontWeight: 800, color: accent, lineHeight: 1 }}>{s.value}</div>
              <div className="mono" style={{ fontSize: 9, letterSpacing: "0.12em", color: "var(--sg-text-muted)", marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>
      ) : null}

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

      <div style={{ marginTop: "auto" }}>
        {extraLinks?.length ? (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginBottom: 16 }}>
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
    </div>
  );
}
