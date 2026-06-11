"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
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
  const [page, setPage] = useState(0);
  const [perView, setPerView] = useState(4);

  useEffect(() => {
    const mq = () => {
      const w = typeof window !== "undefined" ? window.innerWidth : 1200;
      if (w < 640) setPerView(1);
      else if (w < 900) setPerView(2);
      else if (w < 1200) setPerView(3);
      else setPerView(4);
    };
    mq();
    window.addEventListener("resize", mq);
    return () => window.removeEventListener("resize", mq);
  }, []);

  const visible = items.slice(0, 8);
  const pageCount = Math.max(1, Math.ceil(visible.length / perView));

  useEffect(() => {
    setPage((p) => Math.min(p, pageCount - 1));
  }, [pageCount]);

  const pages = useMemo(() => {
    const chunks: HomeRecentItem[][] = [];
    for (let i = 0; i < visible.length; i += perView) {
      chunks.push(visible.slice(i, i + perView));
    }
    return chunks.length ? chunks : [[]];
  }, [visible, perView]);

  const safePage = Math.min(page, Math.max(0, pages.length - 1));
  const goPrev = useCallback(() => setPage((p) => Math.max(0, p - 1)), []);
  const goNext = useCallback(() => setPage((p) => Math.min(pageCount - 1, p + 1)), [pageCount]);

  if (!items.length) return null;

  return (
    <section className="sg-page-shell" style={{ paddingTop: 80, paddingBottom: 64 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
        <div>
          <div className="eyebrow" style={{ color: "var(--accent)" }}>DISCOVER</div>
          <h2 className="display" style={{ fontSize: 36, fontWeight: 700, letterSpacing: "-0.03em", margin: "6px 0 0" }}>Latest Content</h2>
        </div>
        <div style={{ display: "flex", gap: 16 }}>
          <Link href="/world-cup-2026" className="mono u-link" style={{ fontSize: 12, letterSpacing: "0.14em", color: "var(--sg-text-muted)" }}>WORLD CUP 2026 →</Link>
          <Link href="/articles" className="mono u-link" style={{ fontSize: 12, letterSpacing: "0.14em", color: "var(--sg-text-muted)" }}>ALL ARTICLES →</Link>
        </div>
      </div>

      <div style={{ position: "relative" }}>
        <div style={{ display: "grid", gridTemplateColumns: `repeat(${perView}, 1fr)`, gap: 16, minHeight: 340 }}>
          {(pages[safePage] ?? []).map((item) => {
            const accent = CAT_COLOR[item.category] ?? "var(--accent)";
            const label = CAT_LABEL[item.category] ?? item.category;
            const title = item.title_en || item.title;
            const coverSrc = item.cover_image || getCategoryImage(item.category, item.slug);
            return (
              <Link key={item.id} href={categoryArticlePath(item.category, item.slug)}
                style={{ display: "flex", flexDirection: "column", textDecoration: "none", border: "1px solid var(--sg-border)", borderRadius: 14, overflow: "hidden", background: "var(--sg-surface)" }}
                className="lift">
                <div style={{ position: "relative", aspectRatio: "16/9", overflow: "hidden" }}>
                  <Image src={coverSrc} alt={title} fill style={{ objectFit: "cover" }} sizes="(max-width: 640px) 100vw, (max-width: 900px) 50vw, (max-width: 1200px) 33vw, 25vw" />
                  <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, transparent 60%, rgba(0,0,0,0.55))" }} />
                </div>
                <div style={{ padding: "16px 20px 20px", flex: 1, display: "flex", flexDirection: "column" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                    <span className="mono" style={{ fontSize: 9, letterSpacing: "0.2em", color: accent }}>{label}</span>
                    <span className="mono" style={{ fontSize: 9, color: "var(--sg-text-muted)" }}>
                      {new Date(item.created_at).toLocaleDateString("en-US", { day: "numeric", month: "short" })}
                    </span>
                  </div>
                  <h3 className="display" style={{ fontSize: 16, fontWeight: 600, lineHeight: 1.2, letterSpacing: "-0.02em", margin: 0, color: "var(--sg-text-primary)" }}>{title}</h3>
                  {(() => {
                    const body = item.content_en || item.content || "";
                    const pills = body ? extractArticleHighlights(body, { max: 3, seed: item.slug, titleHint: title }) : [];
                    return pills.length ? <div style={{ marginTop: 8 }}><ContentHighlightPills tags={pills} accent={accent} label="FROM CONTENT" /></div> : null;
                  })()}
                  <span className="mono u-link" style={{ fontSize: 10, letterSpacing: "0.16em", color: accent, marginTop: "auto", paddingTop: 12, display: "block" }}>READ →</span>
                </div>
              </Link>
            );
          })}
        </div>

        {pageCount > 1 && (
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 12, marginTop: 28 }}>
            <button type="button" onClick={goPrev} disabled={safePage === 0} aria-label="Previous" style={{ background: "none", border: "1px solid var(--sg-border)", color: "var(--sg-text-secondary)", borderRadius: 4, padding: "4px 12px", cursor: "pointer", opacity: safePage === 0 ? 0.3 : 1 }}>←</button>
            <span className="mono" style={{ fontSize: 11, color: "var(--sg-text-muted)" }}>{safePage + 1} / {pageCount}</span>
            <button type="button" onClick={goNext} disabled={safePage === pageCount - 1} aria-label="Next" style={{ background: "none", border: "1px solid var(--sg-border)", color: "var(--sg-text-secondary)", borderRadius: 4, padding: "4px 12px", cursor: "pointer", opacity: safePage === pageCount - 1 ? 0.3 : 1 }}>→</button>
          </div>
        )}
      </div>
    </section>
  );
}
