"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import ArticleLayout from "../../components/article-layout";

type SectionBlock =
  | { type: "intro"; html: string }
  | { type: "section"; heading: string; html: string }
  | { type: "pullquote"; text: string }
  | { type: "callout"; html: string };

type ContentRow = {
  id: string; title: string; slug: string; category: string;
  content: string; content_en?: string | null; created_at: string;
  youtube_id?: string; cover_image?: string;
  youtube_query_1?: string; youtube_query_2?: string;
  news_query?: string; player_name?: string;
  hero_variant?: string; accent?: string;
  sections_json?: SectionBlock[] | null;
  stat_pace?: number; stat_shooting?: number; stat_passing?: number;
  stat_dribbling?: number; stat_defending?: number; stat_physical?: number;
  stat_overall?: number;
};

type PlayerStats = {
  overall: number; pace?: number; shooting?: number; passing?: number;
  dribbling?: number; defending?: number; physical?: number;
  position?: string; club?: string; league?: string; age?: number;
};

async function fetchPlayerStats(name: string): Promise<PlayerStats | null> {
  const { data: exact } = await supabase.from("fc_players")
    .select("overall,pace,shooting,passing,dribbling,defending,physical,position,club,league,age")
    .ilike("name", name).limit(1).maybeSingle();
  if (exact?.overall) return exact;

  const two = name.split(" ").slice(0, 2).join(" ");
  const { data: fuzzy } = await supabase.from("fc_players")
    .select("overall,pace,shooting,passing,dribbling,defending,physical,position,club,league,age")
    .ilike("name", `%${two}%`).order("overall", { ascending: false }).limit(1).maybeSingle();
  return fuzzy?.overall ? fuzzy : null;
}

/* ─── V2 Silhouette hero card (no photo fetch) ───────────────────── */
function V2RadarHeroCard({ name, position, club, overall, pace, shooting, passing, dribbling, defending, physical, accent }: {
  name: string; position?: string; club?: string; overall?: number;
  pace?: number; shooting?: number; passing?: number;
  dribbling?: number; defending?: number; physical?: number;
  accent: string;
}) {
  const initials = name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();

  const POS_GRADIENT: Record<string, string> = {
    GK: "linear-gradient(160deg, oklch(0.22 0.04 260), oklch(0.11 0.02 260))",
    CB: "linear-gradient(160deg, oklch(0.20 0.06 240), oklch(0.10 0.03 240))",
    LB: "linear-gradient(160deg, oklch(0.18 0.06 220), oklch(0.10 0.03 220))",
    RB: "linear-gradient(160deg, oklch(0.18 0.06 220), oklch(0.10 0.03 220))",
    CDM:"linear-gradient(160deg, oklch(0.20 0.07 200), oklch(0.10 0.04 200))",
    CM: "linear-gradient(160deg, oklch(0.18 0.08 180), oklch(0.10 0.04 180))",
    CAM:"linear-gradient(160deg, oklch(0.24 0.09 150), oklch(0.12 0.05 150))",
    LW: "linear-gradient(160deg, oklch(0.24 0.10 130), oklch(0.12 0.05 130))",
    RW: "linear-gradient(160deg, oklch(0.24 0.10 130), oklch(0.12 0.05 130))",
    ST: "linear-gradient(160deg, oklch(0.22 0.10 20),  oklch(0.12 0.05 20))",
    CF: "linear-gradient(160deg, oklch(0.22 0.09 30),  oklch(0.12 0.05 30))",
  };
  const gradient = POS_GRADIENT[position?.toUpperCase() ?? ""] ?? "linear-gradient(160deg, oklch(0.18 0.06 240), oklch(0.10 0.03 240))";

  function statColor(v?: number) {
    if (!v) return "var(--sg-text-muted)";
    return v >= 80 ? "var(--emerald)" : v >= 65 ? "var(--cyan)" : "var(--ink-300)";
  }

  const STATS = [
    { label: "PAC", val: pace }, { label: "SHO", val: shooting },
    { label: "PAS", val: passing }, { label: "DRI", val: dribbling },
    { label: "DEF", val: defending }, { label: "PHY", val: physical },
  ];
  const hasStats = STATS.some((s) => s.val);

  return (
    <div style={{
      width: "100%", maxWidth: 240,
      background: gradient, borderRadius: 10,
      overflow: "hidden", border: "1px solid oklch(1 0 0 / 0.08)",
      position: "relative",
    }}>
      {/* Texture */}
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: "repeating-linear-gradient(-45deg, oklch(1 0 0 / 0.04) 0 1px, transparent 1px 12px)",
        pointerEvents: "none",
      }} />

      {/* SCOUT GAMER badge */}
      <div style={{
        position: "relative", padding: "10px 12px 0",
        display: "flex", justifyContent: "space-between", alignItems: "center",
      }}>
        <span style={{ fontFamily: "var(--font-mono-stack)", fontSize: 8, letterSpacing: "0.14em", color: "oklch(1 0 0 / 0.40)" }}>
          SCOUT GAMER · №001
        </span>
        <span style={{ fontFamily: "var(--font-mono-stack)", fontSize: 8, letterSpacing: "0.10em", color: "oklch(1 0 0 / 0.40)" }}>
          {position} / {(overall ?? 0)}
        </span>
      </div>

      {/* Silhouette — large initials */}
      <div style={{
        position: "relative", height: 140,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        {/* Big background initials */}
        <div style={{
          position: "absolute", fontFamily: "var(--font-display)", fontSize: 96, fontWeight: 900,
          letterSpacing: "-0.07em", color: "oklch(1 0 0 / 0.07)",
          userSelect: "none", lineHeight: 1,
        }}>{initials}</div>
        {/* Foreground initials */}
        <div style={{
          fontFamily: "var(--font-display)", fontSize: 52, fontWeight: 900,
          color: "oklch(1 0 0 / 0.22)", letterSpacing: "-0.05em", lineHeight: 1,
          position: "relative",
        }}>{initials}</div>
        {/* Overall badge */}
        <div style={{
          position: "absolute", top: 8, right: 12,
          fontFamily: "var(--font-mono-stack)", fontSize: 28, fontWeight: 900,
          color: "oklch(1 0 0 / 0.88)", lineHeight: 1, textShadow: "0 2px 8px oklch(0 0 0 / 0.5)",
        }}>{overall ?? "—"}</div>
      </div>

      {/* Name + club strip */}
      <div style={{
        padding: "8px 12px 4px",
        background: "linear-gradient(to top, oklch(0 0 0 / 0.70) 0%, transparent 100%)",
      }}>
        <div style={{ fontFamily: "var(--font-mono-stack)", fontSize: 8, letterSpacing: "0.14em", color: `color-mix(in oklch, ${accent} 80%, white)`, marginBottom: 3 }}>
          ON THE RADAR · {position}
        </div>
        <div style={{ fontFamily: "var(--font-display)", fontSize: 15, fontWeight: 700, color: "oklch(1 0 0 / 0.92)", lineHeight: 1.1 }}>
          {name}
        </div>
        <div style={{ fontFamily: "var(--font-mono-stack)", fontSize: 8, color: "oklch(1 0 0 / 0.40)", letterSpacing: "0.06em", marginTop: 2 }}>
          {club}
        </div>
      </div>

      {/* Stat strip */}
      {hasStats && (
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(6, 1fr)",
          padding: "8px 10px 10px",
          background: "oklch(0 0 0 / 0.45)",
        }}>
          {STATS.map(({ label, val }) => (
            <div key={label} style={{ textAlign: "center" }}>
              <div style={{ fontFamily: "var(--font-mono-stack)", fontSize: 11, fontWeight: 900, color: statColor(val), lineHeight: 1 }}>
                {val ?? "—"}
              </div>
              <div style={{ fontFamily: "var(--font-mono-stack)", fontSize: 7, color: "oklch(1 0 0 / 0.30)", letterSpacing: "0.06em", marginTop: 1 }}>
                {label}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Main client ────────────────────────────────────────────────── */
export default function RadarDetailClient({ slug }: { slug: string }) {
  const [article, setArticle] = useState<ContentRow | null>(null);
  const [playerStats, setPlayerStats] = useState<PlayerStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) return;
    supabase.from("contents").select("*")
      .eq("slug", slug).eq("status", "yayinda").single()
      .then(async ({ data, error }) => {
        if (error || !data) { setNotFound(true); setLoading(false); return; }
        setArticle(data as ContentRow);
        const row = data as ContentRow;
        // Fetch stats only if not already stored
        const hasStoredStats = row.stat_overall || row.stat_pace;
        if (row.player_name && !hasStoredStats) {
          const stats = await fetchPlayerStats(row.player_name);
          if (stats) setPlayerStats(stats);
        }
        setLoading(false);
      });
  }, [slug]);

  if (loading) return (
    <main className="flex min-h-screen items-center justify-center" style={{ background: "var(--sg-bg)" }}>
      <span className="h-5 w-5 animate-spin rounded-full border-2"
        style={{ borderColor: "var(--sg-primary)", borderTopColor: "transparent" }} />
    </main>
  );

  if (notFound || !article) return (
    <main className="flex min-h-screen flex-col items-center justify-center" style={{ background: "var(--sg-bg)", color: "var(--sg-text-primary)" }}>
      <h1 className="mb-2 text-2xl font-extrabold">404</h1>
      <p className="mb-6 text-sm" style={{ color: "var(--sg-text-muted)" }}>Bu radar yazısı bulunamadı.</p>
      <Link href="/radar" style={{ color: "var(--sg-primary)", fontSize: 13 }}>← Radar&apos;a Dön</Link>
    </main>
  );

  const ACCENT_CSS: Record<string, string> = {
    emerald: "var(--emerald)", cyan: "var(--cyan)", sky: "var(--sky)",
    rose: "var(--rose)", amber: "var(--amber)", lime: "var(--lime)",
  };
  const accent = ACCENT_CSS[article.accent ?? ""] ?? "var(--sky)";

  // Stat values: prefer DB stored, fallback to fc_players fetch
  const heroStats = {
    overall:   article.stat_overall   ?? playerStats?.overall,
    pace:      article.stat_pace      ?? playerStats?.pace,
    shooting:  article.stat_shooting  ?? playerStats?.shooting,
    passing:   article.stat_passing   ?? playerStats?.passing,
    dribbling: article.stat_dribbling ?? playerStats?.dribbling,
    defending: article.stat_defending ?? playerStats?.defending,
    physical:  article.stat_physical  ?? playerStats?.physical,
    position:  playerStats?.position,
    club:      playerStats?.club,
  };

  const hasPlayerHero = article.player_name && (heroStats.overall || heroStats.pace);

  return (
    <ArticleLayout
      title={article.title}
      content={article.content}
      category={article.category}
      date={article.created_at}
      slug={article.slug}
      activeNav="radar"
      backHref="/radar"
      backLabel="Radar'a Dön"
      youtubeId={article.youtube_id}
      coverImage={article.cover_image}
      youtubeQuery1={article.youtube_query_1}
      youtubeQuery2={article.youtube_query_2}
      newsQuery={article.news_query}
      playerName={article.player_name}
      heroVariant={article.hero_variant ?? (hasPlayerHero ? "player-cards" : "text-only")}
      accentOverride={article.accent ?? "sky"}
      sectionsJson={Array.isArray(article.sections_json) ? article.sections_json : null}
    >
      {hasPlayerHero && (
        <V2RadarHeroCard
          name={article.player_name!}
          position={heroStats.position}
          club={heroStats.club}
          overall={heroStats.overall}
          pace={heroStats.pace}
          shooting={heroStats.shooting}
          passing={heroStats.passing}
          dribbling={heroStats.dribbling}
          defending={heroStats.defending}
          physical={heroStats.physical}
          accent={accent}
        />
      )}
    </ArticleLayout>
  );
}
