"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import SiteHeader from "../components/site-header";
import SiteFooter from "../components/site-footer";
import { ContentHighlightPills } from "../components/content-highlight-pills";
import { supabase } from "@/lib/supabase";
import { stripHtml } from "@/lib/utils";
import { extractArticleHighlights, HIGHLIGHT_CARD_ACCENTS_CYCLE } from "@/lib/content-highlight-tags";
import { getCategoryImage } from "@/lib/category-images";


type Content = {
  id: string; title: string; title_en?: string; slug: string;
  content?: string; content_en?: string; created_at: string;
  cover_image?: string | null;
};

const PAGE_SIZE = 9;

const LIST_COVER_ACCENT = "var(--emerald)";

function listSummary(item: Content, max = 200): string {
  const body = item.content_en || item.content || "";
  const t = stripHtml(body).replace(/\s+/g, " ").trim();
  return t.length > max ? `${t.slice(0, max)}…` : t;
}

export default function ListelerPage() {
  const [dbLists, setDbLists] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const highlightsBySlug = useMemo(() => {
    const m = new Map<string, string[]>();
    for (const item of dbLists) {
      const body = item.content_en || item.content || "";
      const ttl = item.title_en || item.title;
      m.set(item.slug, extractArticleHighlights(body, { max: 4, seed: item.slug, titleHint: ttl }));
    }
    return m;
  }, [dbLists]);

  useEffect(() => {
    supabase.from("contents")
      .select("id,title,title_en,slug,content,content_en,created_at,cover_image")
      .eq("status", "published").eq("category", "lists")
      .order("created_at", { ascending: false }).range(0, PAGE_SIZE - 1)
      .then(({ data }) => {
        const items = data ?? [];
        setDbLists(items); setHasMore(items.length === PAGE_SIZE); setLoading(false);
      });
  }, []);

  async function handleLoadMore() {
    setLoadingMore(true);
    const { data } = await supabase.from("contents")
      .select("id,title,title_en,slug,content,content_en,created_at,cover_image")
      .eq("status", "published").eq("category", "lists")
      .order("created_at", { ascending: false })
      .range(dbLists.length, dbLists.length + PAGE_SIZE - 1);
    const items = data ?? [];
    setDbLists(prev => [...prev, ...items]);
    setHasMore(items.length === PAGE_SIZE); setLoadingMore(false);
  }

  const featured = dbLists[0];
  const recentDbLists = dbLists.slice(1);
  const featuredHighlights = featured ? highlightsBySlug.get(featured.slug) : undefined;
  const featuredTitle = featured ? featured.title_en || featured.title : "";

  return (
    <main style={{ background: "var(--sg-bg)", color: "var(--sg-text-primary)", minHeight: "100vh" }}>
      <SiteHeader activeNav="lists" />
      <div style={{ paddingTop: "68px" }} />

      <div className="sg-hero-text-block sg-page-shell--hero" style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 32, alignItems: "end" }}>
        <div>
          <div className="eyebrow" style={{ color: "var(--emerald)" }}>ARCHIVE</div>
          <h1 className="display" style={{ fontSize: "clamp(56px, 7vw, 84px)", fontWeight: 700, letterSpacing: "-0.04em", lineHeight: 0.9, margin: "8px 0 0" }}>
            Lists
          </h1>
        </div>
        <p style={{ fontSize: 18, color: "var(--sg-text-secondary)", lineHeight: 1.5, margin: 0 }}>
          Curated player lists — each with scout notes, stats and comparisons.
        </p>
      </div>

      <div className="sg-page-shell" style={{ paddingBottom: 80 }}>
        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: "48px 0 8px" }}>
            <span className="h-5 w-5 animate-spin rounded-full border-2 border-t-transparent" style={{ borderColor: "var(--emerald)", borderTopColor: "transparent" }} />
          </div>
        ) : null}

        {!loading && dbLists.length === 0 ? (
          <p className="mono" style={{ fontSize: 12, textAlign: "center", padding: "40px 0", color: "var(--sg-text-muted)" }}>NO PUBLISHED LISTS YET.</p>
        ) : null}

        {!loading && featured ? (
          <Link href={`/lists/${featured.slug}`} className="lift" style={{ display: "block", position: "relative", overflow: "hidden", background: "linear-gradient(135deg, oklch(0.17 0.04 155) 0%, oklch(0.12 0.018 200) 72%)", border: "1px solid var(--sg-border)", borderRadius: 16, marginBottom: recentDbLists.length > 0 ? 48 : hasMore ? 36 : 48, minHeight: 320, textDecoration: "none" }}>
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: LIST_COVER_ACCENT }} />
            <div style={{ position: "absolute", bottom: -160, right: -100, width: 440, height: 440, borderRadius: "50%", background: "radial-gradient(circle, var(--emerald) 0%, transparent 65%)", opacity: 0.14, pointerEvents: "none" }} />
            <svg viewBox="0 0 140 120" preserveAspectRatio="xMidYMid slice" style={{ position: "absolute", right: 0, top: 0, height: "100%", width: "44%", opacity: 0.28, pointerEvents: "none" }}>
              <rect x="24" y="18" width="96" height="10" rx="2" fill="rgba(255,255,255,0.12)" />
              <rect x="24" y="38" width="72" height="8" rx="2" fill="rgba(255,255,255,0.08)" />
              <rect x="24" y="54" width="84" height="8" rx="2" fill="rgba(255,255,255,0.08)" />
              <rect x="24" y="70" width="60" height="8" rx="2" fill="rgba(255,255,255,0.08)" />
              <circle cx="34" cy="92" r="10" fill="none" stroke="var(--emerald)" strokeWidth="1.2" opacity="0.9" />
              <text x="34" y="96" textAnchor="middle" fill="var(--emerald)" fontSize="11" fontWeight="700" opacity="0.95">1</text>
              <circle cx="70" cy="88" r="9" fill="none" stroke="var(--emerald)" strokeWidth="1" opacity="0.65" />
              <text x="70" y="91" textAnchor="middle" fill="var(--emerald)" fontSize="9" fontWeight="600" opacity="0.75">2</text>
              <circle cx="102" cy="94" r="8" fill="none" stroke="var(--emerald)" strokeWidth="0.9" opacity="0.5" />
              <text x="102" y="97" textAnchor="middle" fill="var(--emerald)" fontSize="8" fontWeight="600" opacity="0.6">3</text>
            </svg>
            <div style={{ position: "relative", padding: "48px", maxWidth: 760 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
                <span className="chip solid" style={{ background: LIST_COVER_ACCENT, borderColor: LIST_COVER_ACCENT, color: "var(--ink-900)", fontSize: 10 }}>COVER LIST</span>
                <span className="mono" style={{ fontSize: 10, letterSpacing: "0.18em", color: "var(--sg-text-muted)" }}>
                  LISTS · {new Date(featured.created_at).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })}
                </span>
              </div>
              <h2 className="display" style={{ fontSize: "clamp(32px, 4.4vw, 56px)", fontWeight: 700, letterSpacing: "-0.04em", margin: 0, lineHeight: 0.95, textWrap: "balance", color: "var(--sg-text-primary)" }}>
                <span className="grad-text">{featuredTitle}</span>
              </h2>
              <p style={{ fontSize: 16, color: "var(--sg-text-secondary)", lineHeight: 1.55, marginTop: 18, maxWidth: 580 }}>{listSummary(featured)}</p>
              {featuredHighlights?.length ? (
                <div style={{ marginTop: 22 }}>
                  <ContentHighlightPills tags={featuredHighlights.slice(0, 4)} accent={LIST_COVER_ACCENT} label="HIGHLIGHTS" />
                </div>
              ) : null}
              <div style={{ marginTop: 24 }}>
                <span className="btn btn-solid" style={{ background: LIST_COVER_ACCENT, borderColor: LIST_COVER_ACCENT }}>READ →</span>
              </div>
            </div>
          </Link>
        ) : null}

        {!loading && dbLists.length > 0 && (
          <section style={{ marginBottom: 64 }}>
            {recentDbLists.length > 0 ? (
              <>
                <div className="eyebrow" style={{ color: "var(--emerald)", marginBottom: 20 }}>LATEST LISTS</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 260px), 1fr))", gap: 16 }}>
                  {recentDbLists.map((item, idx) => {
                    const accent = HIGHLIGHT_CARD_ACCENTS_CYCLE[(idx + 1) % HIGHLIGHT_CARD_ACCENTS_CYCLE.length]!;
                    const pills = highlightsBySlug.get(item.slug) ?? [];
                    const coverImg = item.cover_image?.trim() || getCategoryImage("lists", item.slug);
                    return (
                      <Link key={item.id} href={`/lists/${item.slug}`}
                        className="lift" style={{ background: "var(--sg-surface)", border: "1px solid var(--sg-border)", borderRadius: 12, overflow: "hidden", cursor: "pointer", textDecoration: "none", display: "flex", flexDirection: "column" }}>
                        <div style={{ position: "relative", height: 140, overflow: "hidden" }}>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={coverImg} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", filter: "brightness(0.65) saturate(0.85)" }} loading="lazy" />
                          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, var(--sg-surface) 0%, transparent 60%)" }} />
                        </div>
                        <div style={{ padding: "16px 20px 24px", flex: 1, display: "flex", flexDirection: "column" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                            <span className="mono" style={{ fontSize: 9, letterSpacing: "0.2em", color: accent }}>
                              LIST{!item.title_en ? " · DRAFT" : ""}
                            </span>
                            <span className="mono" style={{ fontSize: 9, letterSpacing: "0.14em", color: "var(--sg-text-muted)" }}>
                              {new Date(item.created_at).toLocaleDateString("en-US", { day: "numeric", month: "short" })}
                            </span>
                          </div>
                          <h3 className="display" style={{ fontSize: 18, fontWeight: 600, lineHeight: 1.2, letterSpacing: "-0.02em", margin: 0, textWrap: "balance", color: "var(--sg-text-primary)", flex: 1 }}>
                            {item.title_en || item.title}
                          </h3>
                          <div style={{ marginTop: "auto", paddingTop: 16, borderTop: "1px solid var(--sg-border)" }}>
                            {pills.length > 0 ? <ContentHighlightPills tags={pills} accent={accent} label="HIGHLIGHTS" /> : null}
                            <span className="mono u-link" style={{ fontSize: 11, letterSpacing: "0.16em", color: accent, display: "block", marginTop: pills.length ? 12 : 0 }}>READ →</span>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </>
            ) : null}
            {hasMore && (
              <div style={{ marginTop: recentDbLists.length > 0 ? 36 : 0, display: "flex", justifyContent: "center" }}>
                <button type="button" onClick={handleLoadMore} disabled={loadingMore} className="btn" style={{ borderColor: "var(--emerald)", color: "var(--emerald)" }}>
                  {loadingMore ? "Loading..." : "LOAD MORE →"}
                </button>
              </div>
            )}
          </section>
        )}

      </div>

      <SiteFooter maxWidth="max-w-7xl" />
    </main>
  );
}
