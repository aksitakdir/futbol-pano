"use client";

import { useMemo } from "react";
import Link from "next/link";
import { ContentHighlightPills } from "./content-highlight-pills";
import { stripHtml, estimateReadMinutes } from "@/lib/utils";
import { extractArticleHighlights, HIGHLIGHT_CARD_ACCENTS_CYCLE } from "@/lib/content-highlight-tags";
import { categoryArticlePath, CAT_LABEL } from "@/lib/category-config";
import { editorialBody, editorialTitle, type EditorialArticle } from "@/lib/editorial-article";

export type { EditorialArticle };

type Props = {
  articles: EditorialArticle[];
  locale?: string;
  emptyMessage: string;
  accent?: string;
  gridEyebrow?: string;
  featuredChip?: string;
  getHref?: (article: EditorialArticle) => string;
  onLoadMore?: () => void;
  hasMore?: boolean;
  loadingMore?: boolean;
};

function summary(html: string, max = 180): string {
  const t = stripHtml(html).replace(/\s+/g, " ").trim();
  return t.length > max ? `${t.slice(0, max)}…` : t;
}

export default function EditorialContentFeed({
  articles,
  emptyMessage,
  accent = "var(--accent)",
  gridEyebrow,
  featuredChip,
  getHref = (a) => categoryArticlePath(a.category, a.slug),
  onLoadMore,
  hasMore,
  loadingMore,
}: Props) {
  const labels = {
    featuredChip: featuredChip ?? "COVER STORY",
    gridEyebrow: gridEyebrow ?? "ALL ARTICLES",
    highlights: "TEXT HIGHLIGHTS",
    readCta: "READ ARTICLE →",
    readMin: "MIN",
    readLink: "READ →",
  };

  const highlightsBySlug = useMemo(() => {
    const m = new Map<string, string[]>();
    for (const a of articles) {
      const body = editorialBody(a, "en");
      m.set(a.slug, extractArticleHighlights(body, { max: 4, seed: a.slug, titleHint: editorialTitle(a, "en") }));
    }
    return m;
  }, [articles]);

  if (articles.length === 0) {
    return (
      <p className="mono" style={{ fontSize: 12, textAlign: "center", padding: "80px 0", color: "var(--sg-text-muted)" }}>{emptyMessage}</p>
    );
  }

  const featured = articles[0]!;
  const rest = articles.slice(1);
  const featuredBody = editorialBody(featured, "en");
  const featuredTitle = editorialTitle(featured, "en");
  const featuredPills = highlightsBySlug.get(featured.slug);
  const catLabel = CAT_LABEL[featured.category] ?? featured.category;
  const featuredCover = featured.cover_image?.trim();

  return (
    <>
      <Link href={getHref(featured)} className="lift editorial-featured-story"
        style={{ display: "block", position: "relative", overflow: "hidden", background: featuredCover ? "var(--ink-900)" : "linear-gradient(135deg, oklch(0.16 0.02 150) 0%, oklch(0.12 0.012 220) 70%)", border: "1px solid var(--sg-border)", borderRadius: 6, marginBottom: 48, minHeight: 320, textDecoration: "none" }}>
        {featuredCover ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={featuredCover} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", filter: "brightness(0.38) saturate(0.9)" }} />
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right, rgba(13,18,30,0.94) 0%, rgba(13,18,30,0.72) 55%, rgba(13,18,30,0.45) 100%)" }} />
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(13,18,30,0.85) 0%, transparent 50%)" }} />
          </>
        ) : null}
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: accent, zIndex: 1 }} />
        {!featuredCover ? (
          <>
            <div style={{ position: "absolute", bottom: -180, left: -100, width: 480, height: 480, borderRadius: "50%", background: `radial-gradient(circle, ${accent} 0%, transparent 65%)`, opacity: 0.12, pointerEvents: "none" }} />
            <div style={{ position: "absolute", inset: 0, opacity: 0.04, pointerEvents: "none", backgroundImage: "repeating-linear-gradient(90deg, rgba(255,255,255,0.5) 0 1px, transparent 1px 22px)" }} />
          </>
        ) : null}
        <div className="editorial-featured-story__inner" style={{ position: "relative", zIndex: 2 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
            <span className="chip solid" style={{ background: accent, borderColor: accent, color: "var(--ink-900)", fontSize: 10 }}>{labels.featuredChip}</span>
            <span className="mono" style={{ fontSize: 10, letterSpacing: "0.18em", color: "var(--sg-text-muted)" }}>
              {catLabel} · {new Date(featured.created_at).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })}
            </span>
          </div>
          <h2 className="display" style={{ fontSize: "clamp(32px, 4.4vw, 56px)", fontWeight: 700, letterSpacing: "-0.04em", margin: 0, lineHeight: 0.95, textWrap: "balance", color: "var(--sg-text-primary)" }}>
            <span className="grad-text">{featuredTitle}</span>
          </h2>
          <p style={{ fontSize: 16, color: "var(--sg-text-secondary)", lineHeight: 1.55, marginTop: 20, maxWidth: 640 }}>{summary(featuredBody, 200)}</p>
          {featuredPills?.length ? (
            <div style={{ marginTop: 18 }}>
              <ContentHighlightPills tags={featuredPills.slice(0, 4)} accent={accent} label={labels.highlights} />
            </div>
          ) : null}
          <div style={{ marginTop: 24, display: "flex", gap: 12, alignItems: "center" }}>
            <span className="btn btn-solid">{labels.readCta}</span>
            <span className="mono" style={{ fontSize: 10, letterSpacing: "0.16em", color: "var(--sg-text-muted)" }}>{estimateReadMinutes(featuredBody)} {labels.readMin}</span>
          </div>
        </div>
      </Link>

      {rest.length > 0 ? (
        <>
          <div className="eyebrow" style={{ marginBottom: 16 }}>{labels.gridEyebrow}</div>
          <div className="editorial-feed-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 260px), 1fr))", gap: 16, marginBottom: 48 }}>
            {rest.map((article, idx) => {
              const body = editorialBody(article, "en");
              const title = editorialTitle(article, "en");
              const readMins = estimateReadMinutes(body);
              const cardAccent = HIGHLIGHT_CARD_ACCENTS_CYCLE[idx % HIGHLIGHT_CARD_ACCENTS_CYCLE.length]!;
              const pills = highlightsBySlug.get(article.slug) ?? [];
              const label = CAT_LABEL[article.category] ?? article.category;
              return (
                <Link key={article.id} href={getHref(article)} className="lift"
                  style={{ background: "var(--sg-surface)", border: "1px solid var(--sg-border)", borderRadius: 4, overflow: "hidden", display: "flex", flexDirection: "column", textDecoration: "none", minHeight: 220 }}>
                  <div style={{ height: 2, background: cardAccent }} />
                  <div style={{ padding: "20px 20px 24px", flex: 1, display: "flex", flexDirection: "column" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                      <span className="mono" style={{ fontSize: 9, letterSpacing: "0.2em", color: cardAccent }}>{label}</span>
                      <span className="mono" style={{ fontSize: 9, letterSpacing: "0.14em", color: "var(--sg-text-muted)" }}>
                        {new Date(article.created_at).toLocaleDateString("en-US", { day: "numeric", month: "short" })} · {readMins} {labels.readMin}
                      </span>
                    </div>
                    <h2 className="display" style={{ fontSize: 18, fontWeight: 600, lineHeight: 1.2, letterSpacing: "-0.02em", margin: 0, textWrap: "balance", color: "var(--sg-text-primary)", flex: 1 }}>
                      {title}
                    </h2>
                    <div style={{ marginTop: "auto", paddingTop: 16, borderTop: "1px solid var(--sg-border)" }}>
                      {pills.length > 0 ? <ContentHighlightPills tags={pills.slice(0, 4)} accent={cardAccent} label={labels.highlights} /> : null}
                      <span className="mono u-link" style={{ fontSize: 11, letterSpacing: "0.16em", color: cardAccent, display: "block", marginTop: pills.length ? 12 : 0 }}>{labels.readLink}</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </>
      ) : null}

      {hasMore && onLoadMore ? (
        <div style={{ display: "flex", justifyContent: "center" }}>
          <button type="button" onClick={onLoadMore} disabled={loadingMore} className="btn">
            {loadingMore ? "Loading..." : "LOAD MORE →"}
          </button>
        </div>
      ) : null}
    </>
  );
}
