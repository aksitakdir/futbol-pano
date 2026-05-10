"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import SiteHeader from "../../components/site-header";
import SiteFooter from "../../components/site-footer";
import PlayerCard, { type PlayerCardData } from "../../components/player-card";
import { supabase } from "@/lib/supabase";
import { stripHtml, estimateReadMinutes } from "@/lib/utils";

type Content = {
  id: string; title: string; title_en?: string; slug: string;
  content: string; content_en?: string; created_at: string;
};

const PAGE_SIZE = 9;

function RadarMosaic({ players }: { players: Partial<PlayerCardData>[] }) {
  if (!players.length) return null;
  const offsets = [
    { top: 0, left: 0, rotate: -4, zIndex: 1 },
    { top: 20, left: 60, rotate: 2, zIndex: 2 },
    { top: -10, left: 120, rotate: -2, zIndex: 3 },
  ];
  return (
    <div style={{ position: "relative", height: 280, width: "100%" }}>
      {players.slice(0, 3).map((p, i) => (
        <div key={i} style={{
          position: "absolute",
          top: offsets[i]?.top ?? 0, left: offsets[i]?.left ?? 0,
          transform: `rotate(${offsets[i]?.rotate ?? 0}deg)`,
          zIndex: offsets[i]?.zIndex ?? 1, opacity: 1 - i * 0.08,
          transformOrigin: "center bottom",
        }}>
          <PlayerCard player={p as PlayerCardData} size="mini" animated={false} showScoutNote={false} />
        </div>
      ))}
    </div>
  );
}

export default function EnRadarPage() {
  const [articles, setArticles] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [heroPlayers, setHeroPlayers] = useState<Partial<PlayerCardData>[]>([]);

  useEffect(() => {
    supabase.from("contents")
      .select("id,title,title_en,slug,content,content_en,created_at")
      .eq("status", "yayinda").eq("category", "radar")
      .order("created_at", { ascending: false }).range(0, PAGE_SIZE - 1)
      .then(({ data }) => {
        const items = data ?? [];
        setArticles(items); setHasMore(items.length === PAGE_SIZE); setLoading(false);
      });
  }, []);

  useEffect(() => {
    supabase.from("fc_players")
      .select("name,overall,pace,shooting,passing,dribbling,defending,physical,photo_url,position,club,league,age")
      .order("overall", { ascending: false }).limit(9)
      .then(({ data }) => {
        if (data?.length) {
          const shuffled = [...data].sort(() => Math.random() - 0.5).slice(0, 3);
          setHeroPlayers(shuffled);
        }
      });
  }, []);

  async function handleLoadMore() {
    setLoadingMore(true);
    const { data } = await supabase.from("contents")
      .select("id,title,title_en,slug,content,content_en,created_at")
      .eq("status", "yayinda").eq("category", "radar")
      .order("created_at", { ascending: false })
      .range(articles.length, articles.length + PAGE_SIZE - 1);
    const items = data ?? [];
    setArticles(prev => [...prev, ...items]);
    setHasMore(items.length === PAGE_SIZE); setLoadingMore(false);
  }

  return (
    <main style={{ background: "var(--sg-bg)", color: "var(--sg-text-primary)", minHeight: "100vh" }}>
      <SiteHeader activeNav="radar" />
      <div style={{ paddingTop: "68px" }} />

      {/* ── V2 Category Hero ── */}
      <section className="grain relative overflow-hidden" style={{
        background: "var(--sg-surface-low)", borderBottom: "1px solid var(--sg-border)",
      }}>
        <div style={{
          backgroundImage: "repeating-linear-gradient(-45deg, rgba(0,0,0,0.06) 0 1px, transparent 1px 12px)",
          position: "absolute", inset: 0, pointerEvents: "none",
        }} />
        <div style={{
          maxWidth: 1440, margin: "0 auto", padding: "72px 32px 56px",
          display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48, alignItems: "center",
        }}>
          <div>
            <div className="eyebrow" style={{ color: "var(--accent)", marginBottom: 14 }}>WEEKLY RADAR</div>
            <h1 className="display" style={{
              fontSize: "clamp(3rem, 6vw, 5rem)", fontWeight: 700,
              letterSpacing: "-0.04em", lineHeight: 0.92, margin: "0 0 20px",
            }}>
              Radar<br />
              <span style={{
                background: "linear-gradient(120deg, var(--accent) 0%, var(--accent-2) 100%)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
              }}>Archive</span>
            </h1>
            <p style={{ fontSize: 18, lineHeight: 1.6, color: "var(--sg-text-secondary)", maxWidth: 440, margin: "0 0 28px" }}>
              Weekly player analyses, undiscovered talents and in-depth reviews from a scout&apos;s perspective.
            </p>
            <div style={{ display: "flex", gap: 8 }}>
              {["Forward", "Midfield", "Defence", "Goalkeeper"].map((pos) => (
                <span key={pos} className="chip" style={{ fontSize: 10 }}>{pos}</span>
              ))}
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", paddingRight: 24 }}>
            {heroPlayers.length > 0 ? (
              <RadarMosaic players={heroPlayers} />
            ) : (
              <div style={{
                width: 220, height: 280, border: "1px solid var(--sg-border)",
                background: "var(--sg-surface)", display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <span className="mono" style={{ fontSize: 10, letterSpacing: "0.14em", color: "var(--sg-text-muted)" }}>
                  RADAR RADAR
                </span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── Article Grid ── */}
      <div style={{ maxWidth: 1440, margin: "0 auto", padding: "60px 32px 80px" }}>
        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: "80px 0" }}>
            <span className="h-5 w-5 animate-spin rounded-full border-2 border-t-transparent"
              style={{ borderColor: "var(--accent)", borderTopColor: "transparent" }} />
          </div>
        ) : articles.length === 0 ? (
          <p className="mono" style={{ fontSize: 12, textAlign: "center", padding: "80px 0", color: "var(--sg-text-muted)" }}>
            NO RADAR ARTICLES PUBLISHED YET.
          </p>
        ) : (
          <>
            <div style={{ marginBottom: 32 }}>
              <div className="eyebrow" style={{ color: "var(--accent)" }}>LATEST ANALYSES</div>
              <h2 className="display" style={{ fontSize: 28, fontWeight: 700, letterSpacing: "-0.03em", margin: "6px 0 0" }}>
                All Reports
              </h2>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
              {articles.map((article) => {
                const hasEn = !!article.title_en;
                const readMins = estimateReadMinutes(article.content_en || article.content);
                return (
                  <Link key={article.id} href={`/en/radar/${article.slug}`}
                    className="lift" style={{
                      background: "var(--sg-surface)", border: "1px solid var(--sg-border)",
                      borderRadius: 4, overflow: "hidden", display: "flex", flexDirection: "column",
                    }}>
                    <div style={{ height: 2, background: "var(--accent)" }} />
                    <div style={{ padding: "20px 24px 24px", flex: 1, display: "flex", flexDirection: "column" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                        <span className="mono" style={{ fontSize: 9, letterSpacing: "0.2em", color: "var(--accent)" }}>RADAR</span>
                        <div className="mono" style={{ fontSize: 9, letterSpacing: "0.14em", color: "var(--sg-text-muted)", display: "flex", gap: 10, alignItems: "center" }}>
                          {!hasEn && (
                            <span style={{ color: "var(--amber)", fontSize: 8, letterSpacing: "0.1em" }}>DRAFT</span>
                          )}
                          <span>{new Date(article.created_at).toLocaleDateString("en-US", { day: "numeric", month: "short" })}</span>
                          <span>{readMins} MIN</span>
                        </div>
                      </div>
                      <h2 className="display" style={{
                        fontSize: 18, fontWeight: 600, lineHeight: 1.2,
                        letterSpacing: "-0.02em", margin: "0 0 10px", textWrap: "balance",
                      }}>
                        {article.title_en || article.title}
                      </h2>
                      <p style={{ fontSize: 13, lineHeight: 1.5, color: "var(--sg-text-secondary)", flex: 1, margin: "0 0 16px" }}>
                        {stripHtml(article.content_en || article.content).replace(/\s+/g, " ").trim().slice(0, 160)}…
                      </p>
                      <div className="mono" style={{ fontSize: 10, letterSpacing: "0.14em", color: "var(--accent)" }}>
                        READ REPORT →
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
            {hasMore && (
              <div style={{ marginTop: 48, display: "flex", justifyContent: "center" }}>
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
