"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import SiteHeader from "../../components/site-header";
import SiteFooter from "../../components/site-footer";
import { stripHtml, contentLooksLikeHtml } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import PlayerCard, { type PlayerCardData } from "../../components/player-card";
import ArticleHtmlWithPlayerEmbeds from "../../components/article-html-with-player-embeds";

type ContentRow = {
  id: string; title: string; title_en?: string;
  slug: string; category: string;
  content: string; content_en?: string | null;
  created_at: string;
  youtube_id?: string; cover_image?: string;
  player_name?: string; players_json?: string | null;
  hero_variant?: string; accent?: string;
};

type PlayerJsonEntry = {
  name: string; overall: number; position: string;
  club: string; photo_url?: string; scout_note: string;
};

type PlayerWithStats = PlayerJsonEntry & {
  pace?: number; shooting?: number; passing?: number;
  dribbling?: number; defending?: number; physical?: number;
  league?: string; age?: number;
};

function statColor(val?: number) {
  if (!val) return "var(--sg-text-muted)";
  if (val >= 80) return "var(--emerald)";
  if (val >= 65) return "var(--cyan)";
  return "var(--ink-300)";
}

const STAT_LABELS = ["PAC", "SHO", "PAS", "DRI", "DEF", "PHY"] as const;
const STAT_KEYS   = ["pace", "shooting", "passing", "dribbling", "defending", "physical"] as const;
function readTime(t: string) { return Math.max(1, Math.ceil(t.trim().split(/\s+/).length / 200)); }

function playerRowToCardData(p: PlayerWithStats): PlayerCardData {
  return {
    name: p.name, club: p.club, league: p.league ?? "", position: p.position,
    age: p.age ?? "—", overall: p.overall ?? 0,
    pace: p.pace ?? 0, shooting: p.shooting ?? 0, passing: p.passing ?? 0,
    dribbling: p.dribbling ?? 0, defending: p.defending ?? 0, physical: p.physical ?? 0,
    whyWatch: p.scout_note, photo_url: p.photo_url,
  };
}

function NumberedPlayerEntry({ player, rank, accent }: { player: PlayerWithStats; rank: number; accent: string }) {
  const ordinal = String(rank).padStart(2, "0");
  const isEven  = rank % 2 === 0;
  const hasStats = !!(player.pace || player.shooting);

  return (
    <div style={{ position: "relative", overflow: "hidden", borderTop: "1px solid var(--sg-border)", padding: "48px 0 56px" }}>
      <div style={{ position: "absolute", top: -16, left: isEven ? "auto" : -6, right: isEven ? -6 : "auto", fontFamily: "var(--font-display)", fontSize: 140, fontWeight: 900, letterSpacing: "-0.07em", lineHeight: 1, color: `color-mix(in oklch, ${accent} 10%, transparent)`, userSelect: "none", pointerEvents: "none" }}>
        {ordinal}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: isEven ? "1fr minmax(0, 200px)" : "minmax(0, 200px) 1fr", gap: 40, alignItems: "start", position: "relative" }}>
        {isEven ? (
          <><PlayerInfo player={player} rank={rank} accent={accent} hasStats={hasStats} /><PlayerCard player={playerRowToCardData(player)} compact animated={false} showScoutNote={false} tmLink={`https://www.transfermarkt.com/schnellsuche/ergebnis/schnellsuche?query=${encodeURIComponent(player.name)}`} gLink={`https://www.google.com/search?q=${encodeURIComponent(`${player.name} footballer`)}`} /></>
        ) : (
          <><PlayerCard player={playerRowToCardData(player)} compact animated={false} showScoutNote={false} tmLink={`https://www.transfermarkt.com/schnellsuche/ergebnis/schnellsuche?query=${encodeURIComponent(player.name)}`} gLink={`https://www.google.com/search?q=${encodeURIComponent(`${player.name} footballer`)}`} /><PlayerInfo player={player} rank={rank} accent={accent} hasStats={hasStats} /></>
        )}
      </div>
    </div>
  );
}

function PlayerInfo({ player, rank, accent, hasStats }: { player: PlayerWithStats; rank: number; accent: string; hasStats: boolean }) {
  return (
    <div style={{ paddingTop: 8 }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 14, marginBottom: 18, flexWrap: "wrap" }}>
        <span style={{ fontFamily: "var(--font-display)", fontSize: "clamp(28px, 4vw, 48px)", fontWeight: 900, lineHeight: 1, letterSpacing: "-0.05em", color: accent }}>{String(rank).padStart(2, "0")}</span>
        {player.position && <span style={{ fontFamily: "var(--font-mono-stack)", fontSize: 9, fontWeight: 700, letterSpacing: "0.14em", color: accent, background: `color-mix(in oklch, ${accent} 12%, transparent)`, padding: "3px 8px", borderRadius: 3 }}>{player.position.toUpperCase()}</span>}
        {player.club && <span style={{ fontFamily: "var(--font-mono-stack)", fontSize: 9, letterSpacing: "0.12em", color: "var(--sg-text-muted)" }}>{player.club.toUpperCase()}</span>}
        {player.overall > 0 && <span style={{ fontFamily: "var(--font-mono-stack)", fontSize: 9, fontWeight: 700, color: "var(--sg-text-muted)" }}>OVR {player.overall}</span>}
      </div>
      <h3 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(26px, 3.5vw, 44px)", fontWeight: 700, letterSpacing: "-0.035em", lineHeight: 1.0, margin: "0 0 12px", color: "var(--sg-text-primary)" }}>{player.name}</h3>
      {player.scout_note && <p style={{ fontStyle: "italic", fontSize: 15, lineHeight: 1.6, color: "var(--sg-text-secondary)", margin: "0 0 28px", maxWidth: 520 }}>{player.scout_note}</p>}
      {hasStats && (
        <div style={{ display: "flex", gap: 20, marginBottom: 28, flexWrap: "wrap" }}>
          {STAT_KEYS.map((key, i) => {
            const val = player[key];
            if (!val) return null;
            return (
              <div key={key}>
                <div style={{ fontFamily: "var(--font-mono-stack)", fontSize: 8, fontWeight: 700, letterSpacing: "0.14em", color: "var(--sg-text-muted)", marginBottom: 4 }}>{STAT_LABELS[i]}</div>
                <div style={{ fontFamily: "var(--font-mono-stack)", fontSize: 22, fontWeight: 900, color: statColor(val), lineHeight: 1 }}>{val}</div>
              </div>
            );
          })}
        </div>
      )}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <Link href={`/radar?q=${encodeURIComponent(player.name)}`} style={{ fontFamily: "var(--font-mono-stack)", fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", padding: "8px 16px", borderRadius: 999, background: accent, color: "var(--ink-900)", textDecoration: "none", display: "inline-block" }}>GO TO RADAR →</Link>
        <a href={`https://www.transfermarkt.com/schnellsuche/ergebnis/schnellsuche?query=${encodeURIComponent(player.name)}`} target="_blank" rel="noopener noreferrer" style={{ fontFamily: "var(--font-mono-stack)", fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", padding: "8px 16px", borderRadius: 999, border: "1px solid var(--sg-border)", color: "var(--sg-text-muted)", textDecoration: "none", display: "inline-block" }}>TM</a>
        <a href={`https://www.google.com/search?q=${encodeURIComponent(player.name + " footballer")}`} target="_blank" rel="noopener noreferrer" style={{ fontFamily: "var(--font-mono-stack)", fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", padding: "8px 16px", borderRadius: 999, border: "1px solid var(--sg-border)", color: "var(--sg-text-muted)", textDecoration: "none", display: "inline-block" }}>GOOGLE</a>
      </div>
    </div>
  );
}

function usePlayersWithStats(players: PlayerJsonEntry[]) {
  const [enriched, setEnriched] = useState<PlayerWithStats[]>(players.map(p => ({ ...p })));
  useEffect(() => {
    if (!players.length) return;
    let cancelled = false;
    async function fetchAll() {
      const out: PlayerWithStats[] = [];
      for (const p of players) {
        const { data: exact } = await supabase.from("fc_players").select("overall,pace,shooting,passing,dribbling,defending,physical,photo_url,position,club,league,age").ilike("name", p.name).limit(1).maybeSingle();
        if (exact?.overall) { out.push({ ...p, ...exact }); continue; }
        const two = p.name.split(" ").slice(0, 2).join(" ");
        const { data: fuzzy } = await supabase.from("fc_players").select("overall,pace,shooting,passing,dribbling,defending,physical,photo_url,position,club,league,age").ilike("name", `%${two}%`).order("overall", { ascending: false }).limit(1).maybeSingle();
        out.push(fuzzy?.overall ? { ...p, ...fuzzy } : p);
      }
      if (!cancelled) setEnriched(out);
    }
    fetchAll();
    return () => { cancelled = true; };
  }, [players]);
  return enriched;
}

const ACCENT_CSS: Record<string, string> = {
  emerald: "var(--emerald)", cyan: "var(--cyan)", sky: "var(--sky)",
  rose: "var(--rose)", amber: "var(--amber)", lime: "var(--lime)",
};

function ListLayout({ row }: { row: ContentRow }) {
  const [similar, setSimilar] = useState<{ id: string; title: string; title_en?: string; slug: string; created_at: string }[]>([]);

  useEffect(() => {
    supabase.from("contents").select("id,title,title_en,slug,category,created_at").eq("status", "yayinda").eq("category", "listeler").neq("slug", row.slug).order("created_at", { ascending: false }).limit(4).then(({ data }) => { if (data) setSimilar(data); });
    fetch("/api/view", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ slug: row.slug }) }).catch(() => {});
  }, [row.slug]);

  const players = useMemo<PlayerJsonEntry[]>(() => {
    if (!row.players_json) return [];
    try { return JSON.parse(row.players_json); } catch { return []; }
  }, [row.players_json]);

  const enriched = usePlayersWithStats(players);
  const accent = ACCENT_CSS[row.accent ?? ""] ?? "var(--emerald)";
  const displayTitle   = row.title_en   || row.title;
  const displayContent = row.content_en?.trim() ? row.content_en : row.content;
  const isHtml = contentLooksLikeHtml(displayContent);
  const formattedDate = new Date(row.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  const minutes = readTime(stripHtml(displayContent));

  return (
    <main style={{ background: "var(--sg-bg)", color: "var(--sg-text-primary)", minHeight: "100vh" }}>
      <SiteHeader activeNav="listeler" />
      <div style={{ paddingTop: "68px" }} />

      <header style={{ position: "relative", overflow: "hidden", background: "linear-gradient(180deg, oklch(0.13 0.018 240) 0%, oklch(0.10 0.012 250) 100%)", borderBottom: "1px solid var(--sg-border)" }}>
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: accent }} />
        <div style={{ position: "absolute", inset: 0, opacity: 0.04, pointerEvents: "none", backgroundImage: "repeating-linear-gradient(90deg, rgba(255,255,255,0.5) 0 1px, transparent 1px 22px)" }} />
        <div style={{ position: "absolute", bottom: -200, left: -100, width: 500, height: 500, borderRadius: "50%", background: `radial-gradient(circle, ${accent} 0%, transparent 65%)`, opacity: 0.12, pointerEvents: "none" }} />
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "40px 32px 60px", position: "relative" }}>
          <button onClick={() => window.history.back()} className="mono" style={{ background: "transparent", border: "none", color: "var(--sg-text-muted)", fontSize: 11, letterSpacing: "0.14em", padding: 0, marginBottom: 40, cursor: "pointer" }}>← Back to Lists</button>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
            <span className="chip solid" style={{ background: accent, borderColor: accent, color: "var(--ink-900)", fontSize: 10 }}>LIST</span>
            <span className="mono" style={{ fontSize: 10, letterSpacing: "0.18em", color: "var(--sg-text-muted)" }}>{formattedDate}</span>
          </div>
          <h1 className="display grad-text" style={{ fontSize: "clamp(36px, 5vw, 72px)", fontWeight: 700, letterSpacing: "-0.04em", margin: 0, lineHeight: 0.92, textWrap: "balance", maxWidth: 800 }}>{displayTitle}</h1>
          <div style={{ display: "flex", gap: 20, marginTop: 32, alignItems: "center", paddingTop: 20, borderTop: "1px solid var(--sg-border)", maxWidth: 560 }}>
            <div><div className="mono" style={{ fontSize: 9, letterSpacing: "0.18em", color: "var(--sg-text-muted)" }}>PLAYERS</div><div className="mono" style={{ fontSize: 13, color: "var(--sg-text-primary)", marginTop: 2 }}>{players.length}</div></div>
            <div style={{ width: 1, height: 28, background: "var(--sg-border)" }} />
            <div><div className="mono" style={{ fontSize: 9, letterSpacing: "0.18em", color: "var(--sg-text-muted)" }}>READ TIME</div><div className="mono" style={{ fontSize: 13, color: "var(--sg-text-primary)", marginTop: 2 }}>{minutes} MIN</div></div>
            <div style={{ width: 1, height: 28, background: "var(--sg-border)" }} />
            <div><div className="mono" style={{ fontSize: 9, letterSpacing: "0.18em", color: "var(--sg-text-muted)" }}>EDITOR</div><div className="mono" style={{ fontSize: 13, color: "var(--sg-text-primary)", marginTop: 2 }}>SCOUT GAMER</div></div>
          </div>
        </div>
      </header>

      {enriched.length > 0 && (
        <div style={{ background: "var(--sg-bg)", borderBottom: "1px solid var(--sg-border)" }}>
          <div style={{ maxWidth: 1280, margin: "0 auto", padding: "14px 32px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
              <div className="mono" style={{ fontSize: 9, letterSpacing: "0.2em", color: "var(--sg-text-muted)", whiteSpace: "nowrap" }}>IN THIS LIST</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {enriched.map((p, i) => (
                  <button key={p.name} onClick={() => document.getElementById(`player-${i + 1}`)?.scrollIntoView({ behavior: "smooth", block: "start" })}
                    style={{ cursor: "pointer", fontSize: 10, background: "transparent", border: "1px solid var(--sg-border)", padding: "4px 10px", borderRadius: 999, color: "var(--sg-text-primary)" }}>
                    <span style={{ color: accent, marginRight: 4 }}>{String(i + 1).padStart(2, "0")}</span>
                    {p.name.split(" ").slice(-1)[0]}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "64px 32px 80px", display: "grid", gridTemplateColumns: "1fr 280px", gap: 56, alignItems: "start" }}>
        <div>
          {displayContent && (
            <div className="article-v2" style={{ fontSize: 18, lineHeight: 1.65, color: "var(--sg-text-secondary)", marginBottom: 56 }}>
              {isHtml ? <ArticleHtmlWithPlayerEmbeds html={displayContent} locale="en" /> : <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>{displayContent}</ReactMarkdown>}
            </div>
          )}
          {enriched.map((player, i) => (
            <div key={player.name} id={`player-${i + 1}`}>
              <NumberedPlayerEntry player={player} rank={i + 1} accent={accent} />
            </div>
          ))}
        </div>

        <aside style={{ position: "sticky", top: 88 }}>
          <div style={{ marginBottom: 32, padding: "20px", background: "var(--sg-surface)", borderRadius: 6, border: "1px solid var(--sg-border)" }}>
            <div className="mono" style={{ fontSize: 9, letterSpacing: "0.2em", color: "var(--sg-text-muted)", marginBottom: 14 }}>SHARE</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <button onClick={() => { if (typeof navigator !== "undefined") navigator.clipboard.writeText(window.location.href); }}
                style={{ fontSize: 11, fontWeight: 600, color: "var(--sg-text-primary)", padding: "8px 12px", background: "var(--sg-surface-high)", borderRadius: 4, border: "none", cursor: "pointer", textAlign: "left" }}>
                🔗 Copy Link
              </button>
            </div>
          </div>
          {similar.length > 0 && (
            <div style={{ padding: "20px", background: "var(--sg-surface)", borderRadius: 6, border: "1px solid var(--sg-border)" }}>
              <div className="mono" style={{ fontSize: 9, letterSpacing: "0.2em", color: "var(--sg-text-muted)", marginBottom: 16 }}>MORE LISTS</div>
              {similar.map((item) => (
                <Link key={item.id} href={`/listeler/${item.slug}`} style={{ padding: "12px 0", borderBottom: "1px solid var(--sg-border)", textDecoration: "none", display: "block" }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "var(--sg-text-primary)", lineHeight: 1.35, marginBottom: 4 }}>{item.title_en || item.title}</div>
                  <div className="mono" style={{ fontSize: 9, color: "var(--sg-text-muted)", letterSpacing: "0.1em" }}>{new Date(item.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}</div>
                </Link>
              ))}
            </div>
          )}
          <div style={{ marginTop: 24 }}>
            <Link href="/listeler" className="btn" style={{ display: "block", textAlign: "center", fontSize: 11 }}>← All Lists</Link>
          </div>
        </aside>
      </div>

      <SiteFooter maxWidth="max-w-7xl" />
    </main>
  );
}

export default function ListelerDetailClient({ slug }: { slug: string }) {
  const [article, setArticle] = useState<ContentRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) return;
    supabase.from("contents").select("*").eq("slug", slug).eq("status", "yayinda").single()
      .then(({ data, error }) => {
        if (error || !data) { setNotFound(true); } else { setArticle(data as ContentRow); }
        setLoading(false);
      });
  }, [slug]);

  if (loading) return (
    <main className="flex min-h-screen items-center justify-center" style={{ background: "var(--sg-bg)" }}>
      <span className="h-5 w-5 animate-spin rounded-full border-2" style={{ borderColor: "var(--emerald)", borderTopColor: "transparent" }} />
    </main>
  );

  if (notFound || !article) return (
    <main className="flex min-h-screen flex-col items-center justify-center" style={{ background: "var(--sg-bg)", color: "var(--sg-text-primary)" }}>
      <h1 className="mb-2 text-2xl font-bold">404</h1>
      <Link href="/listeler" className="text-sm" style={{ color: "var(--emerald)" }}>← Back to Lists</Link>
    </main>
  );

  return <ListLayout row={article} />;
}
