"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import SiteHeader from "../components/site-header";
import SiteFooter from "../components/site-footer";
import PlayerCard, { type PlayerCardData } from "../components/player-card";
import { supabase } from "@/lib/supabase";
import { stripHtml, estimateReadMinutes } from "@/lib/utils";

type SupabaseContent = { id: string; title: string; slug: string; content: string; created_at: string; };

const PAGE_SIZE = 12;

function summary(content: string, max = 180): string {
  const t = stripHtml(content).replace(/\s+/g, " ").trim();
  return t.length > max ? `${t.slice(0, max)}…` : t;
}

export default function RadarPage() {
  const [articles, setArticles] = useState<SupabaseContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [heroPlayers, setHeroPlayers] = useState<Partial<PlayerCardData>[]>([]);

  useEffect(() => {
    supabase.from("contents").select("id,title,slug,content,created_at")
      .eq("status", "yayinda").eq("category", "radar").order("created_at", { ascending: false })
      .range(0, PAGE_SIZE - 1)
      .then(({ data }) => {
        const items = data ?? [];
        setArticles(items);
        setHasMore(items.length === PAGE_SIZE);
        setLoading(false);
      });
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

  async function handleLoadMore() {
    setLoadingMore(true);
    const { data } = await supabase.from("contents").select("id,title,slug,content,created_at")
      .eq("status", "yayinda").eq("category", "radar").order("created_at", { ascending: false })
      .range(articles.length, articles.length + PAGE_SIZE - 1);
    const items = data ?? [];
    setArticles(prev => [...prev, ...items]);
    setHasMore(items.length === PAGE_SIZE);
    setLoadingMore(false);
  }

  const featured = articles[0];
  const rest = articles.slice(1);

  return (
    <main style={{ background: "var(--sg-bg)", color: "var(--sg-text-primary)", minHeight: "100vh" }}>
      <SiteHeader activeNav="radar" />
      <div style={{ paddingTop: "68px" }} />

      {/* ── Page Header ── */}
      <div style={{ maxWidth: 1440, margin: "0 auto", padding: "60px 32px 56px", display: "grid", gridTemplateColumns: "2fr 1fr", gap: 32, alignItems: "end" }}>
        <div>
          <div className="eyebrow" style={{ color: "var(--accent)" }}>HAFTALIK ANALİZ</div>
          <h1 className="display" style={{
            fontSize: "clamp(56px, 7vw, 84px)", fontWeight: 700,
            letterSpacing: "-0.04em", lineHeight: 0.9, margin: "8px 0 0",
          }}>
            <span className="grad-text">Radar</span>
          </h1>
        </div>
        <p style={{ fontSize: 18, color: "var(--sg-text-secondary)", lineHeight: 1.5, margin: 0 }}>
          Tek oyuncu odaklı haftalık analizler. Veriler, taktik ve oyun stilleri bir arada.
        </p>
      </div>

      <div style={{ maxWidth: 1440, margin: "0 auto", padding: "0 32px 80px" }}>

        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: "80px 0" }}>
            <span className="h-5 w-5 animate-spin rounded-full border-2 border-t-transparent"
              style={{ borderColor: "var(--accent)", borderTopColor: "transparent" }} />
          </div>
        ) : articles.length === 0 ? (
          <p className="mono" style={{ fontSize: 12, textAlign: "center", padding: "80px 0", color: "var(--sg-text-muted)" }}>
            HENÜZ YAYINDA RADAR YAZISI YOK.
          </p>
        ) : (
          <>
            {/* ── Featured Cover Story ── */}
            {featured && (
              <Link href={`/radar/${featured.slug}`} className="lift" style={{
                display: "block", position: "relative", overflow: "hidden",
                background: "linear-gradient(135deg, oklch(0.16 0.02 150) 0%, oklch(0.12 0.012 220) 70%)",
                border: "1px solid var(--sg-border)", borderRadius: 6, marginBottom: 48,
                minHeight: 340, textDecoration: "none",
              }}>
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: "var(--accent)" }} />
                <div style={{
                  position: "absolute", bottom: -180, left: -100, width: 480, height: 480, borderRadius: "50%",
                  background: "radial-gradient(circle, var(--accent) 0%, transparent 65%)", opacity: 0.15, pointerEvents: "none",
                }} />
                <div style={{
                  position: "absolute", inset: 0, opacity: 0.04, pointerEvents: "none",
                  backgroundImage: "repeating-linear-gradient(90deg, rgba(255,255,255,0.5) 0 1px, transparent 1px 22px)",
                }} />

                <div style={{ position: "relative", display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: 48, padding: "48px 48px", alignItems: "center" }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
                      <span className="chip solid" style={{ background: "var(--accent)", borderColor: "var(--accent)", color: "var(--ink-900)", fontSize: 10 }}>
                        KAPAK YAZISI
                      </span>
                      <span className="mono" style={{ fontSize: 10, letterSpacing: "0.18em", color: "var(--sg-text-muted)" }}>
                        RADAR · {new Date(featured.created_at).toLocaleDateString("tr-TR", { day: "numeric", month: "short", year: "numeric" })}
                      </span>
                    </div>
                    <h2 className="display" style={{
                      fontSize: "clamp(32px, 4.4vw, 56px)", fontWeight: 700,
                      letterSpacing: "-0.04em", margin: 0, lineHeight: 0.95, textWrap: "balance",
                      color: "var(--sg-text-primary)",
                    }}>
                      <span className="grad-text">{featured.title}</span>
                    </h2>
                    <p style={{ fontSize: 16, color: "var(--sg-text-secondary)", lineHeight: 1.55, marginTop: 20, maxWidth: 540 }}>
                      {summary(featured.content, 180)}
                    </p>
                    <div style={{ marginTop: 24, display: "flex", gap: 12, alignItems: "center" }}>
                      <span className="btn btn-solid">YAZIYI OKU →</span>
                      <span className="mono" style={{ fontSize: 10, letterSpacing: "0.16em", color: "var(--sg-text-muted)" }}>
                        {estimateReadMinutes(featured.content)} DK
                      </span>
                    </div>
                  </div>

                  {/* 2×2 player card grid */}
                  {heroPlayers.length >= 2 && (
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10 }}>
                      {heroPlayers.slice(0, 4).map((p, i) => (
                        <div key={i} style={{
                          transform: `translateY(${i % 2 === 0 ? -8 : 8}px)`,
                          boxShadow: "0 16px 32px rgba(0,0,0,0.35)",
                        }}>
                          <PlayerCard player={p as PlayerCardData} size="mini" animated={false} showScoutNote={false} />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </Link>
            )}

            {/* ── All Analyses Grid ── */}
            {rest.length > 0 && (
              <>
                <div className="eyebrow" style={{ marginBottom: 16 }}>TÜM ANALİZLER</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 48 }}>
                  {rest.map((article) => {
                    const readMins = estimateReadMinutes(article.content);
                    return (
                      <Link key={article.id} href={`/radar/${article.slug}`}
                        className="lift" style={{
                          background: "var(--sg-surface)", border: "1px solid var(--sg-border)",
                          borderRadius: 4, overflow: "hidden", display: "flex", flexDirection: "column",
                          textDecoration: "none",
                        }}>
                        <div style={{ height: 2, background: "var(--accent)" }} />
                        <div style={{ padding: "20px 20px 24px", flex: 1, display: "flex", flexDirection: "column" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                            <span className="mono" style={{ fontSize: 9, letterSpacing: "0.2em", color: "var(--accent)" }}>RADAR</span>
                            <span className="mono" style={{ fontSize: 9, letterSpacing: "0.14em", color: "var(--sg-text-muted)" }}>
                              {new Date(article.created_at).toLocaleDateString("tr-TR", { day: "numeric", month: "short" })} · {readMins} DK
                            </span>
                          </div>
                          <h2 className="display" style={{
                            fontSize: 18, fontWeight: 600, lineHeight: 1.2,
                            letterSpacing: "-0.02em", margin: "0 0 auto", textWrap: "balance",
                            color: "var(--sg-text-primary)",
                          }}>
                            {article.title}
                          </h2>
                          <div className="mono" style={{ fontSize: 10, letterSpacing: "0.14em", color: "var(--accent)", marginTop: 16 }}>
                            OKU →
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </>
            )}

            {hasMore && (
              <div style={{ display: "flex", justifyContent: "center" }}>
                <button type="button" onClick={handleLoadMore} disabled={loadingMore} className="btn">
                  {loadingMore ? "Yükleniyor..." : "DAHA FAZLA YÜKLE →"}
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
