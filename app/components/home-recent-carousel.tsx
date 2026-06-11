"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
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

const PER_PAGE = 8;

export default function HomeRecentCarousel({ items }: { items: HomeRecentItem[]; locale?: string }) {
  const totalPages = Math.ceil(items.length / PER_PAGE);
  const [page, setPage] = useState(0);
  const [direction, setDirection] = useState(0);

  if (!items.length) return null;

  const pageItems = items.slice(page * PER_PAGE, page * PER_PAGE + PER_PAGE);

  function go(dir: -1 | 1) {
    setDirection(dir);
    setPage((p) => {
      const next = p + dir;
      if (next < 0) return totalPages - 1;
      if (next >= totalPages) return 0;
      return next;
    });
  }

  const variants = {
    enter: (d: number) => ({ x: d > 0 ? 300 : -300, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d: number) => ({ x: d > 0 ? -300 : 300, opacity: 0 }),
  };

  return (
    <section className="sg-page-shell" style={{ paddingTop: 80, paddingBottom: 64 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
        <div>
          <div className="eyebrow" style={{ color: "var(--accent)" }}>DISCOVER</div>
          <h2 className="display" style={{ fontSize: 36, fontWeight: 700, letterSpacing: "-0.03em", margin: "6px 0 0" }}>Latest Content</h2>
        </div>
        <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
          <Link href="/world-cup-2026" className="mono u-link" style={{ fontSize: 12, letterSpacing: "0.14em", color: "var(--sg-text-muted)" }}>WORLD CUP 2026 →</Link>
          <Link href="/articles" className="mono u-link" style={{ fontSize: 12, letterSpacing: "0.14em", color: "var(--sg-text-muted)" }}>ALL ARTICLES →</Link>
          {totalPages > 1 && (
            <div style={{ display: "flex", gap: 6, alignItems: "center", marginLeft: 8 }}>
              <button type="button" onClick={() => go(-1)} aria-label="Previous" style={{ background: "none", border: "1px solid var(--sg-border)", color: "var(--sg-text-secondary)", borderRadius: 4, padding: "4px 12px", cursor: "pointer", fontSize: 14 }}>←</button>
              <span className="mono" style={{ fontSize: 11, color: "var(--sg-text-muted)", letterSpacing: "0.1em", minWidth: 36, textAlign: "center" }}>{page + 1}/{totalPages}</span>
              <button type="button" onClick={() => go(1)} aria-label="Next" style={{ background: "none", border: "1px solid var(--sg-border)", color: "var(--sg-text-secondary)", borderRadius: 4, padding: "4px 12px", cursor: "pointer", fontSize: 14 }}>→</button>
            </div>
          )}
        </div>
      </div>

      <div style={{ position: "relative", overflow: "hidden" }}>
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={page}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="grid gap-4"
            style={{ gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 260px), 1fr))" }}
          >
            {pageItems.map((item) => {
              const accent = CAT_COLOR[item.category] ?? "var(--accent)";
              const label = CAT_LABEL[item.category] ?? item.category;
              const title = item.title_en || item.title;
              const coverSrc = item.cover_image || getCategoryImage(item.category, item.slug);
              return (
                <Link key={item.id} href={categoryArticlePath(item.category, item.slug)}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    textDecoration: "none",
                    border: "1px solid var(--sg-border)",
                    borderRadius: 14,
                    overflow: "hidden",
                    background: "var(--sg-surface)",
                  }}
                  className="lift">
                  <div style={{ position: "relative", aspectRatio: "16/9", overflow: "hidden" }}>
                    <Image src={coverSrc} alt={title} fill style={{ objectFit: "cover" }} sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw" />
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
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
