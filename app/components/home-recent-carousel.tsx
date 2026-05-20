"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { getCategoryImage } from "@/lib/category-images";

export type HomeRecentItem = {
  id: string;
  title: string;
  title_en?: string;
  slug: string;
  category: string;
  created_at: string;
  cover_image?: string;
};

const CAT_COLOR: Record<string, string> = {
  listeler: "var(--sg-secondary)",
  radar: "var(--sg-primary)",
  "taktik-lab": "var(--sg-tertiary)",
  arena: "var(--sg-amber)",
};

const CAT_LABEL: Record<string, string> = {
  listeler: "Scouting Lists",
  radar: "Radar",
  "taktik-lab": "Tactics Lab",
};

function itemHref(category: string, slug: string): string {
  if (category === "listeler") return `/listeler/${slug}`;
  if (category === "radar") return `/radar/${slug}`;
  if (category === "taktik-lab") return `/taktik-lab/${slug}`;
  return `/listeler/${slug}`;
}

export default function HomeRecentCarousel({ items, locale }: { items: HomeRecentItem[]; locale?: string }) {
  const [page, setPage] = useState(0);
  const [perView, setPerView] = useState(3);

  useEffect(() => {
    const mq = () => {
      const w = typeof window !== "undefined" ? window.innerWidth : 1200;
      if (w < 640) setPerView(1);
      else if (w < 1024) setPerView(2);
      else setPerView(3);
    };
    mq();
    window.addEventListener("resize", mq);
    return () => window.removeEventListener("resize", mq);
  }, []);

  const pageCount = Math.max(1, Math.ceil(items.length / perView));

  useEffect(() => {
    setPage((p) => Math.min(p, pageCount - 1));
  }, [pageCount, items.length]);

  const pages = useMemo(() => {
    const chunks: HomeRecentItem[][] = [];
    for (let i = 0; i < items.length; i += perView) {
      chunks.push(items.slice(i, i + perView));
    }
    return chunks.length ? chunks : [[]];
  }, [items, perView]);

  const safePage = Math.min(page, Math.max(0, pages.length - 1));

  const goPrev = useCallback(() => setPage((p) => Math.max(0, p - 1)), []);
  const goNext = useCallback(() => setPage((p) => Math.min(pageCount - 1, p + 1)), [pageCount]);

  if (!items.length) return null;

  return (
    <section className="sg-page-shell" style={{ paddingTop: 80, paddingBottom: 64 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 24 }}>
        <div>
          <div className="eyebrow" style={{ color: "var(--accent)" }}>DISCOVER</div>
          <h2 className="display" style={{ fontSize: 36, fontWeight: 700, letterSpacing: "-0.03em", margin: "6px 0 0" }}>Latest Content</h2>
        </div>
        <Link href="/listeler" className="mono u-link" style={{ fontSize: 12, letterSpacing: "0.14em", color: "var(--sg-text-muted)" }}>ARCHIVE →</Link>
      </div>

      <div style={{ position: "relative" }}>
        <div style={{ display: "grid", gridTemplateColumns: `repeat(${perView}, 1fr)`, gap: 20, minHeight: 340 }}>
          {(pages[safePage] ?? []).map((item) => {
            const accent = CAT_COLOR[item.category] ?? "var(--accent)";
            const label = CAT_LABEL[item.category] ?? item.category;
            const title = item.title_en || item.title;
              const coverSrc = item.cover_image || getCategoryImage(item.category, item.slug);
            return (
              <Link key={item.id} href={itemHref(item.category, item.slug)}
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
                  <h3 className="display" style={{ fontSize: 18, fontWeight: 600, lineHeight: 1.2, letterSpacing: "-0.02em", margin: 0, flex: 1, color: "var(--sg-text-primary)" }}>{title}</h3>
                  <span className="mono u-link" style={{ fontSize: 11, letterSpacing: "0.16em", color: accent, marginTop: 14, display: "block" }}>READ →</span>
                </div>
              </Link>
            );
          })}
        </div>

        {pageCount > 1 ? (
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 12, marginTop: 28 }}>
            <button type="button" onClick={goPrev} disabled={safePage === 0} aria-label="Previous" style={{ background: "none", border: "1px solid var(--sg-border)", color: "var(--sg-text-secondary)", borderRadius: 4, padding: "4px 12px", cursor: "pointer", opacity: safePage === 0 ? 0.3 : 1 }}>←</button>
            <span className="mono" style={{ fontSize: 11, color: "var(--sg-text-muted)" }}>{safePage + 1} / {pageCount}</span>
            <button type="button" onClick={goNext} disabled={safePage === pageCount - 1} aria-label="Next" style={{ background: "none", border: "1px solid var(--sg-border)", color: "var(--sg-text-secondary)", borderRadius: 4, padding: "4px 12px", cursor: "pointer", opacity: safePage === pageCount - 1 ? 0.3 : 1 }}>→</button>
          </div>
        ) : null}
      </div>
    </section>
  );
}
