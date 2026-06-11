"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import SiteHeader from "../components/site-header";
import SiteFooter from "../components/site-footer";
import { supabase } from "@/lib/supabase";
import { categoryArticlePath, CAT_LABEL } from "@/lib/category-config";
import { getCategoryImage } from "@/lib/category-images";
import { stripHtml, estimateReadMinutes } from "@/lib/utils";
import { extractArticleHighlights, HIGHLIGHT_CARD_ACCENTS_CYCLE } from "@/lib/content-highlight-tags";
import { ContentHighlightPills } from "../components/content-highlight-pills";

type Article = {
  id: string;
  title: string;
  title_en?: string;
  slug: string;
  category: string;
  content: string;
  content_en?: string;
  created_at: string;
  cover_image?: string | null;
};

const PAGE_SIZE = 12;

export default function ArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const highlightsBySlug = useMemo(() => {
    const m = new Map<string, string[]>();
    for (const a of articles) {
      const body = a.content_en || a.content;
      const ttl = a.title_en || a.title;
      m.set(a.slug, extractArticleHighlights(body, { max: 4, seed: a.slug, titleHint: ttl }));
    }
    return m;
  }, [articles]);

  useEffect(() => {
    supabase
      .from("contents")
      .select("id,title,title_en,slug,category,content,content_en,created_at,cover_image")
      .eq("status", "published")
      .order("created_at", { ascending: false })
      .range(0, PAGE_SIZE - 1)
      .then(({ data }) => {
        const items = (data ?? []) as Article[];
        setArticles(items);
        setHasMore(items.length === PAGE_SIZE);
        setLoading(false);
      });
  }, []);

  async function handleLoadMore() {
    setLoadingMore(true);
    const { data } = await supabase
      .from("contents")
      .select("id,title,title_en,slug,category,content,content_en,created_at,cover_image")
      .eq("status", "published")
      .order("created_at", { ascending: false })
      .range(articles.length, articles.length + PAGE_SIZE - 1);
    const items = (data ?? []) as Article[];
    setArticles((prev) => [...prev, ...items]);
    setHasMore(items.length === PAGE_SIZE);
    setLoadingMore(false);
  }

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

        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: "80px 0" }}>
            <span className="h-5 w-5 animate-spin rounded-full border-2 border-t-transparent" style={{ borderColor: "var(--accent)", borderTopColor: "transparent" }} />
          </div>
        ) : articles.length === 0 ? (
          <p className="mono" style={{ fontSize: 12, textAlign: "center", padding: "80px 0", color: "var(--sg-text-muted)" }}>NO ARTICLES PUBLISHED YET.</p>
        ) : (
          <>
            <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 280px), 1fr))", marginBottom: 48 }}>
              {articles.map((article, idx) => {
                const body = article.content_en || article.content;
                const title = article.title_en || article.title;
                const readMins = estimateReadMinutes(body);
                const accent = HIGHLIGHT_CARD_ACCENTS_CYCLE[idx % HIGHLIGHT_CARD_ACCENTS_CYCLE.length]!;
                const pills = highlightsBySlug.get(article.slug) ?? [];
                const label = CAT_LABEL[article.category] ?? article.category;
                const coverImg = article.cover_image?.trim() || getCategoryImage(article.category, article.slug);
                return (
                  <Link key={article.id} href={categoryArticlePath(article.category, article.slug)}
                    className="lift" style={{ background: "var(--sg-surface)", border: "1px solid var(--sg-border)", borderRadius: 8, overflow: "hidden", display: "flex", flexDirection: "column", textDecoration: "none" }}>
                    <div style={{ position: "relative", height: 150, overflow: "hidden" }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={coverImg} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", filter: "brightness(0.65) saturate(0.85)" }} loading="lazy" />
                      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, var(--sg-surface) 0%, transparent 60%)" }} />
                    </div>
                    <div style={{ padding: "14px 20px 20px", flex: 1, display: "flex", flexDirection: "column" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                        <span className="mono" style={{ fontSize: 9, letterSpacing: "0.2em", color: accent }}>{label}</span>
                        <span className="mono" style={{ fontSize: 9, letterSpacing: "0.14em", color: "var(--sg-text-muted)" }}>
                          {new Date(article.created_at).toLocaleDateString("en-US", { day: "numeric", month: "short" })} · {readMins} MIN
                        </span>
                      </div>
                      <h2 className="display" style={{ fontSize: 17, fontWeight: 600, lineHeight: 1.2, letterSpacing: "-0.02em", margin: 0, textWrap: "balance", color: "var(--sg-text-primary)", flex: 1 }}>
                        {title}
                      </h2>
                      <div style={{ marginTop: "auto", paddingTop: 14, borderTop: "1px solid var(--sg-border)" }}>
                        {pills.length > 0 ? <ContentHighlightPills tags={pills.slice(0, 4)} accent={accent} label="HIGHLIGHTS" /> : null}
                        <span className="mono u-link" style={{ fontSize: 10, letterSpacing: "0.16em", color: accent, display: "block", marginTop: pills.length ? 10 : 0 }}>READ →</span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>

            {hasMore && (
              <div style={{ display: "flex", justifyContent: "center" }}>
                <button type="button" onClick={handleLoadMore} disabled={loadingMore} className="btn">
                  {loadingMore ? "Loading..." : "LOAD MORE →"}
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <SiteFooter maxWidth="max-w-7xl" />
    </main>
  );
}
