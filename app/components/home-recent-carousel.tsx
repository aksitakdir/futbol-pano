"use client";

import Image from "next/image";
import Link from "next/link";
import { getCategoryImage } from "@/lib/category-images";
import { categoryArticlePath } from "@/lib/category-config";
import { ContentHighlightPills } from "./content-highlight-pills";
import { extractArticleHighlights } from "@/lib/content-highlight-tags";

export type HomeRecentItem = {
  id: string;
  title: string;
  title_en?: string;
  slug: string;
  category: string;
  created_at: string;
  cover_image?: string;
  content?: string;
  content_en?: string;
};

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

export default function HomeRecentCarousel({ items }: { items: HomeRecentItem[]; locale?: string }) {
  if (!items.length) return null;

  const visible = items.slice(0, 6);

  return (
    <section className="sg-page-shell" style={{ paddingTop: 80, paddingBottom: 64 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
        <div>
          <div className="eyebrow" style={{ color: "var(--accent)" }}>DISCOVER</div>
          <h2 className="display" style={{ fontSize: 36, fontWeight: 700, letterSpacing: "-0.03em", margin: "6px 0 0" }}>Latest Content</h2>
        </div>
        <div style={{ display: "flex", gap: 16 }}>
          <Link href="/world-cup-2026" className="mono u-link" style={{ fontSize: 12, letterSpacing: "0.14em", color: "var(--sg-text-muted)" }}>WORLD CUP 2026 →</Link>
          <Link href="/radar" className="mono u-link" style={{ fontSize: 12, letterSpacing: "0.14em", color: "var(--sg-text-muted)" }}>ALL ARTICLES →</Link>
        </div>
      </div>

      <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 300px), 1fr))" }}>
        {visible.map((item) => {
          const accent = CAT_COLOR[item.category] ?? "var(--accent)";
          const label = CAT_LABEL[item.category] ?? item.category;
          const title = item.title_en || item.title;
          const coverSrc = item.cover_image || getCategoryImage(item.category, item.slug);
          return (
            <Link key={item.id} href={categoryArticlePath(item.category, item.slug)}
              style={{ display: "flex", flexDirection: "column", textDecoration: "none", border: "1px solid var(--sg-border)", borderRadius: 14, overflow: "hidden", background: "var(--sg-surface)" }}
              className="lift">
              <div style={{ position: "relative", aspectRatio: "16/9", overflow: "hidden" }}>
                <Image src={coverSrc} alt={title} fill style={{ objectFit: "cover" }} sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" />
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, transparent 60%, rgba(0,0,0,0.55))" }} />
              </div>
              <div style={{ padding: "20px 24px 24px", flex: 1, display: "flex", flexDirection: "column" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                  <span className="mono" style={{ fontSize: 9, letterSpacing: "0.2em", color: accent }}>{label}</span>
                  <span className="mono" style={{ fontSize: 9, color: "var(--sg-text-muted)" }}>
                    {new Date(item.created_at).toLocaleDateString("en-US", { day: "numeric", month: "short" })}
                  </span>
                </div>
                <h3 className="display" style={{ fontSize: 18, fontWeight: 600, lineHeight: 1.2, letterSpacing: "-0.02em", margin: 0, color: "var(--sg-text-primary)" }}>{title}</h3>
                {(() => {
                  const body = item.content_en || item.content || "";
                  const pills = body ? extractArticleHighlights(body, { max: 3, seed: item.slug, titleHint: title }) : [];
                  return pills.length ? <div style={{ marginTop: 10 }}><ContentHighlightPills tags={pills} accent={accent} label="FROM CONTENT" /></div> : null;
                })()}
                <span className="mono u-link" style={{ fontSize: 11, letterSpacing: "0.16em", color: accent, marginTop: "auto", paddingTop: 14, display: "block" }}>READ →</span>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
