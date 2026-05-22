"use client";

import Link from "next/link";
import { HUBS, categoryArticlePath } from "@/lib/hub-config";

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
  const wc = HUBS["wc-2026"].en;
  const tr = HUBS.transfer.en;

  return (
    <section style={{ borderTop: "1px solid var(--sg-border)", background: "var(--sg-surface-low)" }}>
      <div className="sg-editorial-shell" style={{ paddingTop: 72, paddingBottom: 72 }}>
        <div className="eyebrow" style={{ marginBottom: 28 }}>TOURNAMENT & TRANSFERS</div>
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <HubCard
            accent={HUBS["wc-2026"].accent}
            title={wc.pillarTitle}
            description={wc.pillarDescription}
            hubHref={wc.basePath}
            cta="WC 2026 HUB"
            articles={wcArticles}
          />
          <HubCard
            accent={HUBS.transfer.accent}
            title={tr.pillarTitle}
            description={tr.pillarDescription}
            hubHref={tr.basePath}
            cta="TRANSFER HUB"
            articles={transferArticles}
          />
        </div>
      </div>
    </section>
  );
}

function HubCard({ accent, title, description, hubHref, cta, articles }: {
  accent: string; title: string; description: string;
  hubHref: string; cta: string; articles: HubArticlePreview[];
}) {
  return (
    <div style={{ border: "1px solid var(--sg-border)", borderRadius: 20, padding: "clamp(24px, 3vw, 36px)", background: "var(--sg-surface)", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: accent }} />
      <h2 className="display" style={{ fontSize: "clamp(22px, 2.5vw, 30px)", fontWeight: 700, letterSpacing: "-0.03em", margin: "0 0 12px" }}>{title}</h2>
      <p style={{ fontSize: 15, lineHeight: 1.55, color: "var(--sg-text-secondary)", margin: "0 0 20px" }}>{description}</p>
      {articles.length > 0 ? (
        <ul style={{ listStyle: "none", margin: "0 0 20px", padding: 0 }}>
          {articles.slice(0, 3).map((a) => (
            <li key={a.slug} style={{ marginBottom: 10 }}>
              <Link href={articleHref(a.category, a.slug)} style={{ fontSize: 14, color: "var(--sg-text-primary)", textDecoration: "none" }} className="u-link">
                <span className="mono" style={{ fontSize: 9, letterSpacing: "0.12em", color: accent, marginRight: 8 }}>Latest</span>
                {a.title}
              </Link>
            </li>
          ))}
        </ul>
      ) : null}
      <Link href={hubHref} className="btn btn-solid" style={{ background: accent, borderColor: accent }}>{cta} →</Link>
    </div>
  );
}
