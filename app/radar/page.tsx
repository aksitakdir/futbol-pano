"use client";

import { Suspense, useEffect, useState, useMemo, useCallback } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import SiteHeader from "../components/site-header";
import SiteFooter from "../components/site-footer";
import PlayerCard, { type PlayerCardData } from "../components/player-card";
import { ContentHighlightPills } from "../components/content-highlight-pills";
import { supabase } from "@/lib/supabase";
import { stripHtml } from "@/lib/utils";
import { extractArticleHighlights, HIGHLIGHT_CARD_ACCENTS_CYCLE } from "@/lib/content-highlight-tags";
import {
  COVER_STORY_SETTINGS_KEY,
  normalizeCoverStories,
  orderWithCoverPin,
} from "@/lib/cover-story";
import { getCategoryImage } from "@/lib/category-images";


type Content = {
  id: string; title: string; title_en?: string; slug: string;
  content: string; content_en?: string; created_at: string;
  cover_image?: string | null;
};

const PAGE_SIZE = 12;

function summaryBody(content: string, max = 180): string {
  const t = stripHtml(content).replace(/\s+/g, " ").trim();
  return t.length > max ? `${t.slice(0, max)}…` : t;
}

export default function RadarPage() {
  return <Suspense><RadarPageInner /></Suspense>;
}

function RadarPageInner() {
  const searchParams = useSearchParams();
  const initialPage = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10) || 1);
  const [page, setPage] = useState(initialPage);
  const [articles, setArticles] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [heroPlayers, setHeroPlayers] = useState<Partial<PlayerCardData>[]>([]);

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
    void (async () => {
      const count = initialPage * PAGE_SIZE;
      const [{ data: pinRow }, listRes] = await Promise.all([
        supabase.from("site_settings").select("value").eq("key", COVER_STORY_SETTINGS_KEY).maybeSingle(),
        supabase.from("contents")
          .select("id,title,title_en,slug,content,content_en,created_at,cover_image")
          .eq("status", "published").eq("category", "radar")
          .order("created_at", { ascending: false }).range(0, count - 1),
      ]);
      const pinnedId = normalizeCoverStories(pinRow?.value).radar;
      const items = orderWithCoverPin((listRes.data ?? []) as Content[], pinnedId);
      setArticles(items);
      setHasMore(items.length === count);
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    supabase.from("fc_players")
      .select("name,overall,pace,shooting,passing,dribbling,defending,physical,photo_url,position,club,league,age")
      .order("overall", { ascending: false }).limit(20)
      .then(({ data }) => {
        if (data?.length) {
          const shuffled = [...data].sort(() => Math.random() - 0.5).slice(0, 4);
          setHeroPlayers(shuffled);
        }
      });
  }, []);

  const handleLoadMore = useCallback(async () => {
    setLoadingMore(true);
    const { data } = await supabase.from("contents")
      .select("id,title,title_en,slug,content,content_en,created_at,cover_image")
      .eq("status", "published").eq("category", "radar")
      .order("created_at", { ascending: false })
      .range(articles.length, articles.length + PAGE_SIZE - 1);
    const items = data ?? [];
    setArticles(prev => [...prev, ...items]);
    const nextPage = page + 1;
    setPage(nextPage);
    window.history.replaceState(null, "", nextPage > 1 ? `?page=${nextPage}` : window.location.pathname);
    setHasMore(items.length === PAGE_SIZE);
    setLoadingMore(false);
  }, [articles.length, page]);

  const featured = articles[0];
  const rest = articles.slice(1);
  const featuredHighlights = featured ? highlightsBySlug.get(featured.slug) : undefined;

  return (
    <main style={{ background: "var(--sg-bg)", color: "var(--sg-text-primary)", minHeight: "100vh" }}>
      <SiteHeader activeNav="radar" />
      <div style={{ paddingTop: "68px" }} />

      <div className="sg-hero-text-block sg-page-shell--hero" style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 32, alignItems: "end" }}>
        <div>
          <div className="eyebrow" style={{ color: "var(--accent)" }}>WEEKLY ANALYSIS</div>
          <h1 className="display" style={{ fontSize: "clamp(56px, 7vw, 84px)", fontWeight: 700, letterSpacing: "-0.04em", lineHeight: 0.9, margin: "8px 0 0" }}>
            <span className="grad-text">Radar</span>
          </h1>
        </div>
        <p style={{ fontSize: 18, color: "var(--sg-text-secondary)", lineHeight: 1.5, margin: 0 }}>
          Single-player weekly deep dives. Data, tactics and playing styles.
        </p>
      </div>

      <div className="sg-page-shell" style={{ paddingBottom: 80 }}>
        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: "80px 0" }}>
            <span className="h-5 w-5 animate-spin rounded-full border-2 border-t-transparent" style={{ borderColor: "var(--accent)", borderTopColor: "transparent" }} />
          </div>
        ) : articles.length === 0 ? (
          <p className="mono" style={{ fontSize: 12, textAlign: "center", padding: "80px 0", color: "var(--sg-text-muted)" }}>NO RADAR ARTICLES PUBLISHED YET.</p>
        ) : (
          <>
            {featured && (
              <Link href={`/radar/${featured.slug}`} className="lift" style={{ display: "block", position: "relative", overflow: "hidden", background: "linear-gradient(135deg, oklch(0.16 0.02 150) 0%, oklch(0.12 0.012 220) 70%)", border: "1px solid var(--sg-border)", borderRadius: 16, marginBottom: 48, minHeight: 340, textDecoration: "none" }}>
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: "var(--accent)" }} />
                <div style={{ position: "absolute", bottom: -180, left: -100, width: 480, height: 480, borderRadius: "50%", background: "radial-gradient(circle, var(--accent) 0%, transparent 65%)", opacity: 0.15, pointerEvents: "none" }} />
                <div style={{ position: "absolute", inset: 0, opacity: 0.04, pointerEvents: "none", backgroundImage: "repeating-linear-gradient(90deg, rgba(255,255,255,0.5) 0 1px, transparent 1px 22px)" }} />
                <div style={{ position: "relative", display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: 48, padding: "48px 48px", alignItems: "center" }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
                      <span className="chip solid" style={{ background: "var(--accent)", borderColor: "var(--accent)", color: "var(--ink-900)", fontSize: 10 }}>COVER STORY</span>
                      <span className="mono" style={{ fontSize: 10, letterSpacing: "0.18em", color: "var(--sg-text-muted)" }}>
                        RADAR · {new Date(featured.created_at).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })}
                      </span>
                      {!featured.title_en && <span className="mono" style={{ fontSize: 9, letterSpacing: "0.1em", color: "var(--amber)" }}>DRAFT</span>}
                    </div>
                    <h2 className="display" style={{ fontSize: "clamp(32px, 4.4vw, 56px)", fontWeight: 700, letterSpacing: "-0.04em", margin: 0, lineHeight: 0.95, textWrap: "balance", color: "var(--sg-text-primary)" }}>
                      <span className="grad-text">{featured.title_en || featured.title}</span>
                    </h2>
                    <p style={{ fontSize: 16, color: "var(--sg-text-secondary)", lineHeight: 1.55, marginTop: 20, maxWidth: 540 }}>
                      {summaryBody(featured.content_en || featured.content, 180)}
                    </p>
                    {featuredHighlights?.length ? (
                      <div style={{ marginTop: 18 }}>
                        <ContentHighlightPills tags={featuredHighlights.slice(0, 4)} accent="var(--accent)" label="HIGHLIGHTS" />
                      </div>
                    ) : null}
                    <div style={{ marginTop: 24 }}>
                      <span className="btn btn-solid">READ THE STORY →</span>
                    </div>
                  </div>
                  {featured.cover_image?.trim() ? (
                    <div style={{ position: "relative", borderRadius: 12, overflow: "hidden", aspectRatio: "4/3" }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={featured.cover_image} alt={featured.title_en || featured.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right, var(--sg-bg) 0%, transparent 40%)" }} />
                    </div>
                  ) : heroPlayers.length >= 2 ? (
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10, justifyItems: "center" }}>
                      {heroPlayers.slice(0, 4).map((p, i) => (
                        <div key={i} style={{ transform: `translateY(${i % 2 === 0 ? -8 : 8}px)`, boxShadow: "0 16px 32px rgba(0,0,0,0.35)" }}>
                          <PlayerCard player={p as PlayerCardData} compact animated={false} showScoutNote={false} />
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>
              </Link>
            )}

            {rest.length > 0 && (
              <>
                <div className="eyebrow" style={{ marginBottom: 16 }}>ALL ANALYSES</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 260px), 1fr))", gap: 16, marginBottom: 48 }}>
                  {rest.map((article, idx) => {
                    const accent = HIGHLIGHT_CARD_ACCENTS_CYCLE[idx % HIGHLIGHT_CARD_ACCENTS_CYCLE.length]!;
                    const pills = highlightsBySlug.get(article.slug) ?? [];
                    const coverImg = article.cover_image?.trim() || getCategoryImage("radar", article.slug);
                    return (
                      <Link key={article.id} href={`/radar/${article.slug}`}
                        className="lift" style={{ background: "var(--sg-surface)", border: "1px solid var(--sg-border)", borderRadius: 12, overflow: "hidden", display: "flex", flexDirection: "column", textDecoration: "none" }}>
                        <div style={{ position: "relative", height: 140, overflow: "hidden" }}>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={coverImg} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", filter: "brightness(0.65) saturate(0.85)" }} loading="lazy" />
                          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, var(--sg-surface) 0%, transparent 60%)" }} />
                        </div>
                        <div style={{ padding: "16px 20px 24px", flex: 1, display: "flex", flexDirection: "column" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                            <span className="mono" style={{ fontSize: 9, letterSpacing: "0.2em", color: accent }}>RADAR</span>
                            <div className="mono" style={{ fontSize: 9, letterSpacing: "0.14em", color: "var(--sg-text-muted)", display: "flex", gap: 8, alignItems: "center" }}>
                              {!article.title_en && <span style={{ color: "var(--amber)", fontSize: 8 }}>DRAFT</span>}
                              <span>{new Date(article.created_at).toLocaleDateString("en-US", { day: "numeric", month: "short" })}</span>
                            </div>
                          </div>
                          <h2 className="display" style={{ fontSize: 18, fontWeight: 600, lineHeight: 1.2, letterSpacing: "-0.02em", margin: 0, textWrap: "balance", color: "var(--sg-text-primary)", flex: 1 }}>
                            {article.title_en || article.title}
                          </h2>
                          <div style={{ marginTop: "auto", paddingTop: 16, borderTop: "1px solid var(--sg-border)" }}>
                            {pills.length > 0 ? <ContentHighlightPills tags={pills.slice(0, 4)} accent={accent} label="HIGHLIGHTS" /> : null}
                            <span className="mono u-link" style={{ fontSize: 11, letterSpacing: "0.16em", color: accent, display: "block", marginTop: pills.length ? 12 : 0 }}>READ →</span>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </>
            )}

            {hasMore && (
              <div style={{ display: "flex", justifyContent: "center", marginTop: 8, marginBottom: 32 }}>
                <a
                  href={`?page=${page + 1}`}
                  onClick={(e) => { e.preventDefault(); handleLoadMore(); }}
                  className="btn"
                  style={{ pointerEvents: loadingMore ? "none" : undefined, opacity: loadingMore ? 0.6 : undefined }}
                >
                  {loadingMore ? "Loading..." : "LOAD MORE →"}
                </a>
              </div>
            )}
          </>
        )}
      </div>

      <SiteFooter maxWidth="max-w-7xl" />
    </main>
  );
}
