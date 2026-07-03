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
import SectionsJsonBody from "../../components/sections-json-body";
import { tocFromSections, type SectionBlock } from "@/lib/section-blocks";
import { normalizeYoutubeId } from "@/lib/youtube-id";

type ContentRow = {
  id: string; title: string; title_en?: string;
  slug: string; category: string;
  content: string; content_en?: string | null;
  created_at: string;
  youtube_id?: string; cover_image?: string;
  youtube_query_1?: string; youtube_query_2?: string;
  player_name?: string; players_json?: string | null;
  hero_variant?: string; accent?: string;
  sections_json?: SectionBlock[] | null;
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

type YouTubeSearchItem = { videoId: string; title: string; thumbnail: string; channelTitle: string };

function ListLayout({ row }: { row: ContentRow }) {
  const [similar, setSimilar] = useState<{ id: string; title: string; title_en?: string; slug: string; created_at: string }[]>([]);
  const [youtubeVideos1, setYoutubeVideos1] = useState<YouTubeSearchItem[] | null>(null);
  const [youtubeVideos2, setYoutubeVideos2] = useState<YouTubeSearchItem[] | null>(null);

  useEffect(() => {
    supabase.from("contents").select("id,title,title_en,slug,category,created_at").eq("status", "published").eq("category", "lists").neq("slug", row.slug).order("created_at", { ascending: false }).limit(4).then(({ data }) => { if (data) setSimilar(data); });
    fetch("/api/view", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ slug: row.slug }) }).catch(() => {});
  }, [row.slug]);

  useEffect(() => {
    const q = row.youtube_query_1?.trim();
    if (!q) return;
    fetch(`/api/youtube?query=${encodeURIComponent(q)}`)
      .then(r => r.json())
      .then(d => setYoutubeVideos1(Array.isArray(d) ? d : d.items ?? []))
      .catch(() => setYoutubeVideos1([]));
  }, [row.youtube_query_1]);

  useEffect(() => {
    const q = row.youtube_query_2?.trim();
    if (!q) return;
    fetch(`/api/youtube?query=${encodeURIComponent(q)}`)
      .then(r => r.json())
      .then(d => setYoutubeVideos2(Array.isArray(d) ? d : d.items ?? []))
      .catch(() => setYoutubeVideos2([]));
  }, [row.youtube_query_2]);

  const youtubeEmbedId = useMemo(() => normalizeYoutubeId(row.youtube_id), [row.youtube_id]);

  const players = useMemo<PlayerJsonEntry[]>(() => {
    if (!row.players_json) return [];
    try { return JSON.parse(row.players_json); } catch { return []; }
  }, [row.players_json]);

  const enriched = usePlayersWithStats(players);
  const accent = ACCENT_CSS[row.accent ?? ""] ?? "var(--emerald)";
  const displayTitle   = row.title_en   || row.title;
  const coverImg = row.cover_image?.trim();
  const sections = Array.isArray(row.sections_json) ? row.sections_json : null;
  const displayContent = row.content_en?.trim() ? row.content_en : row.content;
  const isHtml = contentLooksLikeHtml(displayContent);
  const structuredToc = sections?.length ? tocFromSections(sections) : [];
  const formattedDate = new Date(row.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

  return (
    <main style={{ background: "var(--sg-bg)", color: "var(--sg-text-primary)", minHeight: "100vh" }}>
      <SiteHeader activeNav="lists" />
      <div style={{ paddingTop: "68px" }} />

      <header style={{ position: "relative", overflow: "hidden", background: coverImg ? "var(--ink-900)" : "linear-gradient(180deg, oklch(0.13 0.018 240) 0%, oklch(0.10 0.012 250) 100%)", borderBottom: "1px solid var(--sg-border)" }}>
        {coverImg && (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={coverImg} alt={displayTitle} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", filter: "brightness(0.32) saturate(0.85)" }} />
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right, rgba(13,18,30,0.92) 0%, rgba(13,18,30,0.7) 55%, rgba(13,18,30,0.4) 100%)" }} />
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(13,18,30,0.85) 0%, transparent 50%)" }} />
          </>
        )}
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: accent }} />
        {!coverImg && <div style={{ position: "absolute", inset: 0, opacity: 0.04, pointerEvents: "none", backgroundImage: "repeating-linear-gradient(90deg, rgba(255,255,255,0.5) 0 1px, transparent 1px 22px)" }} />}
        {!coverImg && <div style={{ position: "absolute", bottom: -200, left: -100, width: 500, height: 500, borderRadius: "50%", background: `radial-gradient(circle, ${accent} 0%, transparent 65%)`, opacity: 0.12, pointerEvents: "none" }} />}
        <div className="sg-editorial-shell" style={{ padding: "40px 0 60px", position: "relative" }}>
          <nav aria-label="Breadcrumb" className="mono" style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 10, letterSpacing: "0.12em", marginBottom: 40, flexWrap: "wrap" }}>
            <Link href="/" style={{ color: "var(--sg-text-muted)", textDecoration: "none" }}>HOME</Link>
            <span style={{ color: "var(--sg-text-muted)", opacity: 0.5 }}>/</span>
            <Link href="/lists" style={{ color: accent, textDecoration: "none" }}>LISTS</Link>
            <span style={{ color: "var(--sg-text-muted)", opacity: 0.5 }}>/</span>
            <span style={{ color: "var(--sg-text-muted)", maxWidth: 280, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{displayTitle.length > 40 ? `${displayTitle.slice(0, 40)}…` : displayTitle}</span>
          </nav>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
            <span className="chip solid" style={{ background: accent, borderColor: accent, color: "var(--ink-900)", fontSize: 10 }}>LIST</span>
            <span className="mono" style={{ fontSize: 10, letterSpacing: "0.18em", color: "var(--sg-text-muted)" }}>{formattedDate}</span>
          </div>
          <h1 className="display grad-text" style={{ fontSize: "clamp(36px, 5vw, 72px)", fontWeight: 700, letterSpacing: "-0.04em", margin: 0, lineHeight: 0.92, paddingBottom: "0.14em", textWrap: "balance", maxWidth: 800 }}>{displayTitle}</h1>
          <div style={{ display: "flex", gap: 20, marginTop: 32, alignItems: "center", paddingTop: 20, borderTop: "1px solid var(--sg-border)", maxWidth: 560 }}>
            <div><div className="mono" style={{ fontSize: 9, letterSpacing: "0.18em", color: "var(--sg-text-muted)" }}>PUBLISHED</div><div className="mono" style={{ fontSize: 13, color: "var(--sg-text-primary)", marginTop: 2 }}>{formattedDate}</div></div>
            <div style={{ width: 1, height: 28, background: "var(--sg-border)" }} />
            <div><div className="mono" style={{ fontSize: 9, letterSpacing: "0.18em", color: "var(--sg-text-muted)" }}>EDITOR</div><div className="mono" style={{ fontSize: 13, color: "var(--sg-text-primary)", marginTop: 2 }}>SCOUT GAMER</div></div>
          </div>
        </div>
      </header>

      {youtubeEmbedId && (
        <section style={{ background: "var(--sg-bg)", borderBottom: "1px solid var(--sg-border)" }}>
          <div style={{ maxWidth: 960, margin: "0 auto", padding: "28px 32px 40px" }}>
            <div className="mono" style={{ fontSize: 10, letterSpacing: "0.18em", color: accent, marginBottom: 14 }}>
              FEATURED VIDEO
            </div>
            <div style={{ position: "relative", width: "100%", aspectRatio: "16 / 9", borderRadius: 6, overflow: "hidden", border: "1px solid var(--sg-border)", background: "var(--sg-surface-low)" }}>
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${youtubeEmbedId}`}
                title={`${displayTitle} — YouTube`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
                style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: "none" }}
              />
            </div>
          </div>
        </section>
      )}

      {structuredToc.length > 0 ? (
        <div style={{ background: "var(--sg-bg)", borderBottom: "1px solid var(--sg-border)" }}>
          <div className="sg-editorial-shell article-toc-strip">
            <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
              <div className="mono" style={{ fontSize: 9, letterSpacing: "0.2em", color: "var(--sg-text-muted)", whiteSpace: "nowrap" }}>IN THIS PIECE</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {structuredToc.map((item, i) => (
                  <a key={item.id} href={`#${item.id}`} className="chip"
                    style={{ cursor: "pointer", fontSize: 10, textDecoration: "none", borderColor: "var(--sg-border)" }}>
                    <span style={{ color: accent, marginRight: 4 }}>{String(i + 1).padStart(2, "0")}</span>
                    {item.text.length > 30 ? `${item.text.slice(0, 30)}…` : item.text}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : enriched.length > 0 ? (
        <div style={{ background: "var(--sg-bg)", borderBottom: "1px solid var(--sg-border)" }}>
          <div className="sg-editorial-shell article-toc-strip">
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
      ) : null}

      <div className="sg-editorial-shell article-page-body">
        <div className="article-page-main">
          {sections && sections.length > 0 ? (
            <div className="article-v2" style={{ fontSize: 18, lineHeight: 1.65, color: "var(--sg-text-secondary)", marginBottom: 56 }}>
              <SectionsJsonBody sections={sections} accent={accent} />
            </div>
          ) : displayContent && stripHtml(displayContent) ? (
            <div className="article-v2" style={{ fontSize: 18, lineHeight: 1.65, color: "var(--sg-text-secondary)", marginBottom: 56 }}>
              {isHtml ? <ArticleHtmlWithPlayerEmbeds html={displayContent} /> : <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>{displayContent}</ReactMarkdown>}
            </div>
          ) : null}
          {enriched.map((player, i) => (
            <div key={player.name} id={`player-${i + 1}`}>
              <NumberedPlayerEntry player={player} rank={i + 1} accent={accent} />
            </div>
          ))}

          {row.youtube_query_1?.trim() && (
            <div style={{ marginTop: 48, paddingTop: 48, borderTop: "1px solid var(--sg-border)" }}>
              <div className="eyebrow" style={{ color: accent, marginBottom: 20 }}>
                VIDEO · {row.youtube_query_1.trim().toUpperCase()}
              </div>
              {youtubeVideos1 === null ? (
                <p className="mono" style={{ fontSize: 11, color: "var(--sg-text-muted)" }}>Loading…</p>
              ) : youtubeVideos1.length === 0 ? null : (
                <div className="yt-thumb-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
                  {youtubeVideos1.map(v => (
                    <a key={v.videoId} href={`https://www.youtube.com/watch?v=${v.videoId}`} target="_blank" rel="noopener noreferrer"
                      className="lift" style={{ textDecoration: "none", background: "var(--sg-surface)", borderRadius: 4, overflow: "hidden" }}>
                      <div style={{ aspectRatio: "16/9", overflow: "hidden" }}>
                        <img src={v.thumbnail} alt={v.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      </div>
                      <div style={{ padding: "10px 12px" }}>
                        <p style={{ fontSize: 12, fontWeight: 500, lineHeight: 1.3, color: "var(--sg-text-primary)", margin: 0,
                          display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                          {v.title}
                        </p>
                        <p style={{ fontSize: 10, color: "var(--sg-text-muted)", marginTop: 4 }}>{v.channelTitle}</p>
                      </div>
                    </a>
                  ))}
                </div>
              )}
            </div>
          )}

          {row.youtube_query_2?.trim() && youtubeVideos2 && youtubeVideos2.length > 0 && (
            <div style={{ marginTop: 40 }}>
              <div className="eyebrow" style={{ color: accent, marginBottom: 20 }}>VIDEO · {row.youtube_query_2.trim().toUpperCase()}</div>
              <div className="yt-thumb-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
                {youtubeVideos2.map(v => (
                  <a key={v.videoId} href={`https://www.youtube.com/watch?v=${v.videoId}`} target="_blank" rel="noopener noreferrer"
                    className="lift" style={{ textDecoration: "none", background: "var(--sg-surface)", borderRadius: 4, overflow: "hidden" }}>
                    <div style={{ aspectRatio: "16/9", overflow: "hidden" }}>
                      <img src={v.thumbnail} alt={v.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    </div>
                    <div style={{ padding: "10px 12px" }}>
                      <p style={{ fontSize: 12, fontWeight: 500, lineHeight: 1.3, color: "var(--sg-text-primary)", margin: 0,
                        display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                        {v.title}
                      </p>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        <aside className="article-v2-sidebar" style={{ position: "sticky", top: 88 }}>
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
                <Link key={item.id} href={`/lists/${item.slug}`} style={{ padding: "12px 0", borderBottom: "1px solid var(--sg-border)", textDecoration: "none", display: "block" }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "var(--sg-text-primary)", lineHeight: 1.35, marginBottom: 4 }}>{item.title_en || item.title}</div>
                  <div className="mono" style={{ fontSize: 9, color: "var(--sg-text-muted)", letterSpacing: "0.1em" }}>{new Date(item.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}</div>
                </Link>
              ))}
            </div>
          )}
          <div style={{ marginTop: 24 }}>
            <Link href="/lists" className="btn" style={{ display: "block", textAlign: "center", fontSize: 11 }}>← All Lists</Link>
          </div>
        </aside>
      </div>

      <SiteFooter maxWidth="max-w-7xl" />
    </main>
  );
}

type Props = {
  slug: string;
  article: ContentRow;
};

export default function ListDetailClient({ article }: Props) {
  return <ListLayout row={article} />;
}
