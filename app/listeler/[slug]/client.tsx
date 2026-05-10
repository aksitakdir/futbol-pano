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

/* ─── Types ──────────────────────────────────────────────────────── */
type SupabaseRow = {
  id: string;
  title: string;
  slug: string;
  category: string;
  content: string;
  content_en?: string | null;
  created_at: string;
  youtube_id?: string;
  cover_image?: string;
  player_name?: string;
  players_json?: string | null;
  hero_variant?: string;
  accent?: string;
};

type PlayerJsonEntry = {
  name: string;
  overall: number;
  position: string;
  club: string;
  photo_url?: string;
  scout_note: string;
};

type PlayerWithStats = PlayerJsonEntry & {
  pace?: number;
  shooting?: number;
  passing?: number;
  dribbling?: number;
  defending?: number;
  physical?: number;
  league?: string;
  age?: number;
};

/* ─── Position → gradient colour ────────────────────────────────── */
function posGradient(pos: string): string {
  const p = pos?.split(" ")[0]?.toUpperCase() ?? "";
  const map: Record<string, [string, string]> = {
    GK:  ["oklch(0.22 0.04 260)", "oklch(0.11 0.02 260)"],
    CB:  ["oklch(0.20 0.06 240)", "oklch(0.10 0.03 240)"],
    LB:  ["oklch(0.18 0.06 220)", "oklch(0.10 0.03 220)"],
    RB:  ["oklch(0.18 0.06 220)", "oklch(0.10 0.03 220)"],
    CDM: ["oklch(0.20 0.07 200)", "oklch(0.10 0.04 200)"],
    CM:  ["oklch(0.18 0.08 180)", "oklch(0.10 0.04 180)"],
    CAM: ["oklch(0.24 0.09 150)", "oklch(0.12 0.05 150)"],
    LM:  ["oklch(0.20 0.07 130)", "oklch(0.12 0.04 130)"],
    RM:  ["oklch(0.20 0.07 130)", "oklch(0.12 0.04 130)"],
    LW:  ["oklch(0.24 0.10 130)", "oklch(0.12 0.05 130)"],
    RW:  ["oklch(0.24 0.10 130)", "oklch(0.12 0.05 130)"],
    ST:  ["oklch(0.22 0.10 20)",  "oklch(0.12 0.05 20)"],
    CF:  ["oklch(0.22 0.09 30)",  "oklch(0.12 0.05 30)"],
  };
  const [from, to] = map[p] ?? ["oklch(0.18 0.06 240)", "oklch(0.10 0.03 240)"];
  return `linear-gradient(160deg, ${from} 0%, ${to} 100%)`;
}

function statColor(val?: number): string {
  if (!val) return "var(--sg-text-muted)";
  if (val >= 80) return "var(--emerald)";
  if (val >= 65) return "var(--cyan)";
  return "var(--ink-300)";
}

const STAT_LABELS = ["PAC", "SHO", "PAS", "DRI", "DEF", "PHY"] as const;
const STAT_KEYS   = ["pace", "shooting", "passing", "dribbling", "defending", "physical"] as const;

function readTime(t: string) { return Math.max(1, Math.ceil(t.trim().split(/\s+/).length / 200)); }

/* ─── V2 Silhouette Card ─────────────────────────────────────────── */
function V2SilhouetteCard({ player }: { player: PlayerWithStats }) {
  const initials = player.name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
  const hasStats = !!(player.pace || player.shooting);

  return (
    <div style={{
      position: "relative", width: "100%", aspectRatio: "2/3",
      borderRadius: 8, overflow: "hidden",
      background: posGradient(player.position),
      border: "1px solid oklch(1 0 0 / 0.08)",
      flexShrink: 0,
    }}>
      {/* Diagonal stripe texture */}
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: "repeating-linear-gradient(-45deg, oklch(1 0 0 / 0.04) 0 1px, transparent 1px 12px)",
        pointerEvents: "none",
      }} />

      {/* Background large initials */}
      <div style={{
        position: "absolute", bottom: hasStats ? 44 : 28, right: -6,
        fontFamily: "var(--font-display)", fontSize: 96, fontWeight: 900,
        letterSpacing: "-0.07em", lineHeight: 1,
        color: "oklch(1 0 0 / 0.07)", userSelect: "none", pointerEvents: "none",
      }}>
        {initials}
      </div>

      {/* Photo if available */}
      {player.photo_url ? (
        <div style={{
          position: "absolute", bottom: hasStats ? 48 : 28,
          left: "50%", transform: "translateX(-50%)",
        }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`/api/player-image?url=${encodeURIComponent(player.photo_url)}`}
            alt={player.name}
            style={{ height: 110, objectFit: "contain", objectPosition: "bottom" }}
            onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
          />
        </div>
      ) : (
        /* Silhouette placeholder — large centred initials */
        <div style={{
          position: "absolute", top: "50%", left: "50%",
          transform: "translate(-50%, -62%)",
          fontFamily: "var(--font-display)", fontSize: 56, fontWeight: 900,
          color: "oklch(1 0 0 / 0.20)", letterSpacing: "-0.04em", lineHeight: 1,
        }}>
          {initials}
        </div>
      )}

      {/* Overall — top right */}
      <div style={{
        position: "absolute", top: 10, right: 10,
        fontFamily: "var(--font-mono-stack)", fontSize: 28, fontWeight: 900,
        color: "oklch(1 0 0 / 0.90)", lineHeight: 1,
        textShadow: "0 2px 10px oklch(0 0 0 / 0.6)",
      }}>
        {player.overall || "—"}
      </div>

      {/* Position pill — top left */}
      <div style={{
        position: "absolute", top: 10, left: 8,
        fontFamily: "var(--font-mono-stack)", fontSize: 8, fontWeight: 700,
        letterSpacing: "0.14em", color: "oklch(1 0 0 / 0.60)",
        background: "oklch(0 0 0 / 0.32)", padding: "3px 6px", borderRadius: 3,
      }}>
        {player.position}
      </div>

      {/* Name + club gradient strip */}
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0,
        background: "linear-gradient(to top, oklch(0 0 0 / 0.80) 0%, transparent 100%)",
        padding: hasStats ? "48px 10px 4px" : "32px 10px 10px",
      }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: "oklch(1 0 0 / 0.92)", lineHeight: 1.15 }}>
          {player.name}
        </div>
        <div style={{ fontSize: 9, color: "oklch(1 0 0 / 0.44)", letterSpacing: "0.04em", marginTop: 2 }}>
          {player.club}
        </div>
      </div>

      {/* Stat strip — bottom */}
      {hasStats && (
        <div style={{
          position: "absolute", bottom: 0, left: 0, right: 0,
          background: "oklch(0 0 0 / 0.55)",
          display: "grid", gridTemplateColumns: "repeat(6, 1fr)",
          padding: "6px 6px 8px",
        }}>
          {STAT_KEYS.map((key, i) => {
            const val = player[key];
            return (
              <div key={key} style={{ textAlign: "center" }}>
                <div style={{ fontSize: 10, fontWeight: 900, color: statColor(val), lineHeight: 1 }}>
                  {val ?? "—"}
                </div>
                <div style={{ fontSize: 7, color: "oklch(1 0 0 / 0.30)", letterSpacing: "0.05em", marginTop: 1 }}>
                  {STAT_LABELS[i]}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ─── Numbered player entry ──────────────────────────────────────── */
function NumberedPlayerEntry({ player, rank, accent }: {
  player: PlayerWithStats; rank: number; accent: string;
}) {
  const ordinal = String(rank).padStart(2, "0");
  const isEven  = rank % 2 === 0;

  return (
    <div style={{
      position: "relative", overflow: "hidden",
      borderTop: "1px solid var(--sg-border)",
      padding: "48px 0 56px",
    }}>
      {/* Large watermark ordinal */}
      <div style={{
        position: "absolute", top: -16, left: isEven ? "auto" : -6, right: isEven ? -6 : "auto",
        fontFamily: "var(--font-display)", fontSize: 140, fontWeight: 900,
        letterSpacing: "-0.07em", lineHeight: 1,
        color: `color-mix(in oklch, ${accent} 10%, transparent)`,
        userSelect: "none", pointerEvents: "none",
      }}>
        {ordinal}
      </div>

      <div style={{
        display: "grid",
        gridTemplateColumns: isEven ? "1fr 180px" : "180px 1fr",
        gap: 40, alignItems: "start",
        position: "relative",
      }}>
        {/* Silhouette card — alternates sides */}
        {isEven ? (
          <>
            <PlayerInfo player={player} rank={rank} accent={accent} />
            <V2SilhouetteCard player={player} />
          </>
        ) : (
          <>
            <V2SilhouetteCard player={player} />
            <PlayerInfo player={player} rank={rank} accent={accent} />
          </>
        )}
      </div>
    </div>
  );
}

function PlayerInfo({ player, rank, accent }: { player: PlayerWithStats; rank: number; accent: string }) {
  const hasStats = !!(player.pace || player.shooting);
  return (
    <div style={{ paddingTop: 8 }}>
      {/* Rank + meta row */}
      <div style={{ display: "flex", alignItems: "baseline", gap: 14, marginBottom: 18, flexWrap: "wrap" }}>
        <span style={{
          fontFamily: "var(--font-display)", fontSize: "clamp(28px, 4vw, 48px)",
          fontWeight: 900, lineHeight: 1, letterSpacing: "-0.05em",
          color: accent,
        }}>
          {String(rank).padStart(2, "0")}
        </span>
        {player.position && (
          <span style={{
            fontFamily: "var(--font-mono-stack)", fontSize: 9, fontWeight: 700,
            letterSpacing: "0.14em", color: accent,
            background: `color-mix(in oklch, ${accent} 12%, transparent)`,
            padding: "3px 8px", borderRadius: 3,
          }}>
            {player.position.toUpperCase()}
          </span>
        )}
        {player.club && (
          <span style={{
            fontFamily: "var(--font-mono-stack)", fontSize: 9,
            letterSpacing: "0.12em", color: "var(--sg-text-muted)",
          }}>
            {player.club.toUpperCase()}
          </span>
        )}
        {player.overall > 0 && (
          <span style={{
            fontFamily: "var(--font-mono-stack)", fontSize: 9,
            fontWeight: 700, color: "var(--sg-text-muted)",
          }}>
            OVR {player.overall}
          </span>
        )}
      </div>

      {/* Player name */}
      <h3 style={{
        fontFamily: "var(--font-display)",
        fontSize: "clamp(26px, 3.5vw, 44px)",
        fontWeight: 700, letterSpacing: "-0.035em", lineHeight: 1.0,
        margin: "0 0 12px", color: "var(--sg-text-primary)",
      }}>
        {player.name}
      </h3>

      {/* Scout note */}
      {player.scout_note && (
        <p style={{
          fontStyle: "italic", fontSize: 15, lineHeight: 1.6,
          color: "var(--sg-text-secondary)", margin: "0 0 28px",
          maxWidth: 520,
        }}>
          {player.scout_note}
        </p>
      )}

      {/* Inline stat row */}
      {hasStats && (
        <div style={{ display: "flex", gap: 20, marginBottom: 28, flexWrap: "wrap" }}>
          {STAT_KEYS.map((key, i) => {
            const val = player[key];
            if (!val) return null;
            return (
              <div key={key}>
                <div style={{
                  fontFamily: "var(--font-mono-stack)", fontSize: 8, fontWeight: 700,
                  letterSpacing: "0.14em", color: "var(--sg-text-muted)", marginBottom: 4,
                }}>
                  {STAT_LABELS[i]}
                </div>
                <div style={{
                  fontFamily: "var(--font-mono-stack)", fontSize: 22, fontWeight: 900,
                  color: statColor(val), lineHeight: 1,
                }}>
                  {val}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Action buttons */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <Link href={`/radar?q=${encodeURIComponent(player.name)}`} style={{
          fontFamily: "var(--font-mono-stack)", fontSize: 10, fontWeight: 700,
          letterSpacing: "0.12em", padding: "8px 16px", borderRadius: 999,
          background: accent, color: "var(--ink-900)",
          textDecoration: "none", display: "inline-block",
        }}>
          RADAR&apos;A GİT →
        </Link>
        <a
          href={`https://www.transfermarkt.com.tr/schnellsuche/ergebnis/schnellsuche?query=${encodeURIComponent(player.name)}`}
          target="_blank" rel="noopener noreferrer"
          style={{
            fontFamily: "var(--font-mono-stack)", fontSize: 10, fontWeight: 700,
            letterSpacing: "0.12em", padding: "8px 16px", borderRadius: 999,
            border: "1px solid var(--sg-border)", color: "var(--sg-text-muted)",
            textDecoration: "none", display: "inline-block",
          }}>
          TM
        </a>
        <a
          href={`https://www.google.com/search?q=${encodeURIComponent(player.name + " footballer")}`}
          target="_blank" rel="noopener noreferrer"
          style={{
            fontFamily: "var(--font-mono-stack)", fontSize: 10, fontWeight: 700,
            letterSpacing: "0.12em", padding: "8px 16px", borderRadius: 999,
            border: "1px solid var(--sg-border)", color: "var(--sg-text-muted)",
            textDecoration: "none", display: "inline-block",
          }}>
          GOOGLE
        </a>
      </div>
    </div>
  );
}

/* ─── Hook: enrich players with fc_players stats ─────────────────── */
function usePlayersWithStats(players: PlayerJsonEntry[]) {
  const [enriched, setEnriched] = useState<PlayerWithStats[]>(players.map(p => ({ ...p })));

  useEffect(() => {
    if (!players.length) return;
    let cancelled = false;

    async function fetchAll() {
      const out: PlayerWithStats[] = [];
      for (const p of players) {
        const { data: exact } = await supabase
          .from("fc_players")
          .select("overall,pace,shooting,passing,dribbling,defending,physical,photo_url,position,club,league,age")
          .ilike("name", p.name)
          .limit(1)
          .maybeSingle();

        if (exact?.overall) { out.push({ ...p, ...exact }); continue; }

        const two = p.name.split(" ").slice(0, 2).join(" ");
        const { data: fuzzy } = await supabase
          .from("fc_players")
          .select("overall,pace,shooting,passing,dribbling,defending,physical,photo_url,position,club,league,age")
          .ilike("name", `%${two}%`)
          .order("overall", { ascending: false })
          .limit(1)
          .maybeSingle();

        out.push(fuzzy?.overall ? { ...p, ...fuzzy } : p);
      }
      if (!cancelled) setEnriched(out);
    }

    fetchAll();
    return () => { cancelled = true; };
  }, [players]);

  return enriched;
}

/* ─── Accent helper ──────────────────────────────────────────────── */
const ACCENT_CSS: Record<string, string> = {
  emerald: "var(--emerald)", cyan: "var(--cyan)", sky: "var(--sky)",
  rose: "var(--rose)", amber: "var(--amber)", lime: "var(--lime)",
};
function resolveAccent(a?: string | null) { return ACCENT_CSS[a ?? ""] ?? "var(--emerald)"; }

/* ─── Full List Layout ───────────────────────────────────────────── */
function ListLayout({
  title, content, date, slug, accent,
  players, similarItems,
}: {
  title: string; content: string; date: string; slug: string; accent: string;
  players: PlayerJsonEntry[]; similarItems: { id: string; title: string; slug: string; category: string; created_at: string }[];
}) {
  const enriched = usePlayersWithStats(players);
  const formattedDate = new Date(date).toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" });
  const minutes = readTime(stripHtml(content));
  const isHtml = contentLooksLikeHtml(content);

  const xUrl = typeof window !== "undefined"
    ? `https://x.com/intent/tweet?text=${encodeURIComponent(title + " | Scout Gamer")}&url=${encodeURIComponent(window.location.href)}`
    : "#";

  return (
    <main style={{ background: "var(--sg-bg)", color: "var(--sg-text-primary)", minHeight: "100vh" }}>
      <SiteHeader activeNav="listeler" />
      <div style={{ paddingTop: "68px" }} />

      {/* ── Hero ──────────────────────────────────────────────────── */}
      <header style={{
        position: "relative", overflow: "hidden",
        background: "linear-gradient(180deg, oklch(0.13 0.018 240) 0%, oklch(0.10 0.012 250) 100%)",
        borderBottom: "1px solid var(--sg-border)",
      }}>
        {/* Accent top bar */}
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: accent }} />
        {/* Grid texture */}
        <div style={{
          position: "absolute", inset: 0, opacity: 0.04, pointerEvents: "none",
          backgroundImage: "repeating-linear-gradient(90deg, rgba(255,255,255,0.5) 0 1px, transparent 1px 22px)",
        }} />
        {/* Glow */}
        <div style={{
          position: "absolute", bottom: -200, left: -100, width: 500, height: 500, borderRadius: "50%",
          background: `radial-gradient(circle, ${accent} 0%, transparent 65%)`, opacity: 0.12, pointerEvents: "none",
        }} />

        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "40px 32px 60px", position: "relative" }}>
          <button onClick={() => window.history.back()} className="mono" style={{
            background: "transparent", border: "none", color: "var(--sg-text-muted)",
            fontSize: 11, letterSpacing: "0.14em", padding: 0, marginBottom: 40, cursor: "pointer",
          }}>
            ← Listelere Dön
          </button>

          {/* Category + date */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
            <span className="chip solid" style={{ background: accent, borderColor: accent, color: "var(--ink-900)", fontSize: 10 }}>
              LİSTE
            </span>
            <span className="mono" style={{ fontSize: 10, letterSpacing: "0.18em", color: "var(--sg-text-muted)" }}>
              {formattedDate}
            </span>
          </div>

          {/* Title */}
          <h1 className="display grad-text" style={{
            fontSize: "clamp(36px, 5vw, 72px)", fontWeight: 700,
            letterSpacing: "-0.04em", margin: 0, lineHeight: 0.92,
            textWrap: "balance", maxWidth: 800,
          }}>
            {title}
          </h1>

          {/* Meta strip */}
          <div style={{
            display: "flex", gap: 20, marginTop: 32, alignItems: "center",
            paddingTop: 20, borderTop: "1px solid var(--sg-border)", maxWidth: 560,
          }}>
            <div>
              <div className="mono" style={{ fontSize: 9, letterSpacing: "0.18em", color: "var(--sg-text-muted)" }}>OYUNCU</div>
              <div className="mono" style={{ fontSize: 13, color: "var(--sg-text-primary)", marginTop: 2 }}>{players.length}</div>
            </div>
            <div style={{ width: 1, height: 28, background: "var(--sg-border)" }} />
            <div>
              <div className="mono" style={{ fontSize: 9, letterSpacing: "0.18em", color: "var(--sg-text-muted)" }}>OKUMA</div>
              <div className="mono" style={{ fontSize: 13, color: "var(--sg-text-primary)", marginTop: 2 }}>{minutes} DK</div>
            </div>
            <div style={{ width: 1, height: 28, background: "var(--sg-border)" }} />
            <div>
              <div className="mono" style={{ fontSize: 9, letterSpacing: "0.18em", color: "var(--sg-text-muted)" }}>EDİTÖR</div>
              <div className="mono" style={{ fontSize: 13, color: "var(--sg-text-primary)", marginTop: 2 }}>SCOUT GAMER</div>
            </div>
          </div>
        </div>
      </header>

      {/* ── Player name TOC strip ─────────────────────────────────── */}
      {enriched.length > 0 && (
        <div style={{ background: "var(--sg-bg)", borderBottom: "1px solid var(--sg-border)" }}>
          <div style={{ maxWidth: 1280, margin: "0 auto", padding: "14px 32px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
              <div className="mono" style={{ fontSize: 9, letterSpacing: "0.2em", color: "var(--sg-text-muted)", whiteSpace: "nowrap" }}>
                BU YAZIDA
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {enriched.map((p, i) => (
                  <button
                    key={p.name}
                    onClick={() => { document.getElementById(`player-${i + 1}`)?.scrollIntoView({ behavior: "smooth", block: "start" }); }}
                    className="chip"
                    style={{ cursor: "pointer", borderColor: "var(--sg-border)", fontSize: 10, background: "transparent", border: "1px solid var(--sg-border)", padding: "4px 10px", borderRadius: 999 }}>
                    <span style={{ color: accent, marginRight: 4 }}>{String(i + 1).padStart(2, "0")}</span>
                    {p.name.split(" ").slice(-1)[0]}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Body grid ─────────────────────────────────────────────── */}
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "64px 32px 80px", display: "grid", gridTemplateColumns: "1fr 280px", gap: 56, alignItems: "start" }}>

        {/* Left — intro + numbered list */}
        <div>
          {/* Intro text */}
          {content && (
            <div className="article-v2" style={{ fontSize: 18, lineHeight: 1.65, color: "var(--sg-text-secondary)", marginBottom: 56 }}>
              {isHtml ? (
                <div dangerouslySetInnerHTML={{ __html: content }} />
              ) : (
                <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
                  {content}
                </ReactMarkdown>
              )}
            </div>
          )}

          {/* Numbered player entries */}
          {enriched.length > 0 && (
            <div>
              {enriched.map((player, i) => (
                <div key={player.name} id={`player-${i + 1}`}>
                  <NumberedPlayerEntry player={player} rank={i + 1} accent={accent} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right — sidebar */}
        <aside style={{ position: "sticky", top: 88 }}>
          {/* Share */}
          <div style={{ marginBottom: 32, padding: "20px 20px", background: "var(--sg-surface)", borderRadius: 6, border: "1px solid var(--sg-border)" }}>
            <div className="mono" style={{ fontSize: 9, letterSpacing: "0.2em", color: "var(--sg-text-muted)", marginBottom: 14 }}>PAYLAŞ</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <a href={xUrl} target="_blank" rel="noopener noreferrer"
                style={{ fontSize: 11, fontWeight: 600, color: "var(--sg-text-primary)", textDecoration: "none", padding: "8px 12px", background: "var(--sg-surface-high)", borderRadius: 4 }}>
                𝕏 Twitter&apos;da Paylaş
              </a>
              <button onClick={() => { if (typeof navigator !== "undefined") navigator.clipboard.writeText(window.location.href); }}
                style={{ fontSize: 11, fontWeight: 600, color: "var(--sg-text-primary)", padding: "8px 12px", background: "var(--sg-surface-high)", borderRadius: 4, border: "none", cursor: "pointer", textAlign: "left" }}>
                🔗 Bağlantıyı Kopyala
              </button>
            </div>
          </div>

          {/* Similar */}
          {similarItems.length > 0 && (
            <div style={{ padding: "20px", background: "var(--sg-surface)", borderRadius: 6, border: "1px solid var(--sg-border)" }}>
              <div className="mono" style={{ fontSize: 9, letterSpacing: "0.2em", color: "var(--sg-text-muted)", marginBottom: 16 }}>BENZER LİSTELER</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                {similarItems.map((item) => (
                  <Link key={item.id} href={`/listeler/${item.slug}`}
                    style={{
                      padding: "12px 0", borderBottom: "1px solid var(--sg-border)",
                      textDecoration: "none", display: "block",
                    }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "var(--sg-text-primary)", lineHeight: 1.35, marginBottom: 4 }}>
                      {item.title}
                    </div>
                    <div className="mono" style={{ fontSize: 9, color: "var(--sg-text-muted)", letterSpacing: "0.1em" }}>
                      {new Date(item.created_at).toLocaleDateString("tr-TR", { day: "numeric", month: "short" })}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Back */}
          <div style={{ marginTop: 24 }}>
            <Link href="/listeler" className="btn" style={{ display: "block", textAlign: "center", fontSize: 11 }}>
              ← Tüm Listeler
            </Link>
          </div>
        </aside>
      </div>

      <SiteFooter maxWidth="max-w-7xl" />
    </main>
  );
}

/* ─── Wrapper that fetches similar items ─────────────────────────── */
function ListLayoutWrapper({ row }: { row: SupabaseRow }) {
  const [similar, setSimilar] = useState<{ id: string; title: string; slug: string; category: string; created_at: string }[]>([]);

  useEffect(() => {
    supabase.from("contents").select("id,title,slug,category,created_at")
      .eq("status", "yayinda").eq("category", "listeler").neq("slug", row.slug)
      .order("created_at", { ascending: false }).limit(4)
      .then(({ data }) => { if (data) setSimilar(data); });

    // view tracking
    fetch("/api/view", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ slug: row.slug }) })
      .catch(() => {});
  }, [row.slug]);

  const players: PlayerJsonEntry[] = useMemo(() => {
    if (!row.players_json) return [];
    try { return JSON.parse(row.players_json); } catch { return []; }
  }, [row.players_json]);

  const accent = resolveAccent(row.accent);
  const displayContent = row.content?.trim() ? row.content : (row.content_en ?? "");

  return (
    <ListLayout
      title={row.title}
      content={displayContent}
      date={row.created_at}
      slug={row.slug}
      accent={accent}
      players={players}
      similarItems={similar}
    />
  );
}

/* ─── Static fallback config ─────────────────────────────────────── */
type StaticPlayer = { name: string; club: string; age: number; position: string; strengths: string; };
type PageConfig = { title: string; intro: string; players: StaticPlayer[]; };

const STATIC_CONTENT: Record<string, PageConfig> = {
  "en-iyi-10-genc-stoper": {
    title: "2025-26 Avrupa'nın En İyi 10 Genç Stoperi",
    intro: "2025-26 sezonunda Avrupa genelinde savunma hattını domine eden genç stoperler, sadece fiziksel güçleriyle değil, oyun kurulumuna katkılarıyla da ön plana çıkıyor.",
    players: [
      { name: "Pau Cubarsí",    club: "FC Barcelona",       age: 18, position: "CB",  strengths: "Pas kalitesi, pozisyon alma, baskı altında sakinlik; geriden oyun kurarken dikine paslarıyla Barça'nın yapı taşı." },
      { name: "Leny Yoro",      club: "Manchester United",  age: 19, position: "CB",  strengths: "Hava hakimiyeti, ikili mücadele sertliği ve ceza sahası içi pozisyon alışlarında üst düzey sezgi." },
      { name: "Ousmane Diomandé", club: "Sporting CP",      age: 21, position: "CB",  strengths: "Fiziksel dominasyon, geniş alan savunma becerisi ve agresif öne çıkışlarıyla Sporting'in savunma çizgisini öne taşıyor." },
      { name: "Castello Lukeba", club: "RB Leipzig",        age: 22, position: "CB",  strengths: "Sol ayaklı stoper olarak pas açılarını iyi kullanıyor; agresif öne çıkış zamanlamasıyla öne çıkıyor." },
      { name: "Maxence Lacroix", club: "VfL Wolfsburg",     age: 24, position: "CB",  strengths: "Hızlı geri koşuları ve açık alandaki sprintleriyle derin savunma arkası koşuları süpürmede çok etkili." },
      { name: "Murillo",         club: "Nottingham Forest", age: 22, position: "CB",  strengths: "Topla çıkarken dripling tehditi ve çizgiye yakın alanlarda pas kalitesi." },
      { name: "Micky van de Ven",club: "Tottenham Hotspur", age: 24, position: "CB",  strengths: "Çok yüksek hız, geniş alan savunmasında atletizm ve geriden oyun kurarken dikine koşuları desteklemesiyle fark yaratıyor." },
      { name: "Dean Huijsen",    club: "Juventus",          age: 20, position: "CB",  strengths: "Uzun boyuna rağmen topla rahat, oyun görüşü yüksek; yarı alanın ortasına kadar çıkarak pas opsiyonu yaratıyor." },
      { name: "Ezri Konsa",      club: "Aston Villa",       age: 27, position: "CB",  strengths: "Satıh savunması ve bire birlerde sakinlik; hata yapmama istikrarıyla Villa'nın kilit ismi." },
      { name: "Giorgio Scalvini",club: "Atalanta",          age: 21, position: "CDM", strengths: "Hem stoper hem altı numara oynayabilen hibrit profil; pas açıları ve taktik esneklik." },
    ],
  },
  "super-lig-gizli-isimler": {
    title: "Süper Lig'in Gizli İsimleri — Radar Notları",
    intro: "Süper Lig, yalnızca manşetlere çıkan yıldızlardan ibaret değil. Henüz uluslararası radarın tamamına takılmamış genç isimler, gelecek sezonların transfer hikâyelerini yazıyor.",
    players: [
      { name: "Görkem Sağlam",  club: "Fatih Karagümrük", age: 26, position: "CAM", strengths: "Ara pas zamanlaması, duran top etkinliği ve ceza sahası yay çevresinde şut tehdidiyle öne çıkıyor." },
      { name: "Metehan Baltacı", club: "Galatasaray",      age: 22, position: "CB",  strengths: "Uzun boyuna rağmen çevik; duran toplarda hem savunmada hem hücumda tehdit." },
      { name: "Emirhan İlkhan",  club: "Beşiktaş",         age: 21, position: "CM",  strengths: "Baskı altında dikine dönme becerisi ve topu üçüncü bölgeye taşıyan progresif paslar." },
      { name: "Berkay Vardar",   club: "Beşiktaş",         age: 21, position: "CM",  strengths: "Kısa pas istikrarı ve alan kapatma; savunma dengesini koruyan profil." },
      { name: "Yusuf Sarı",      club: "Adana Demirspor",  age: 26, position: "RW",  strengths: "Çizgiye inip orta tehdidiyle birlikte iç koridora dripling; geçiş hücumlarında etkili." },
    ],
  },
  "surpriz-isimler-2025": {
    title: "Bu Sezonun Sürpriz İsimleri",
    intro: "Her sezon beklenmedik çıkışlar hikâyeyi değiştirir. 2025-26'da birçok genç oyuncu kilit role evrilerek verileri ve oyunun algısını yukarı taşıdı.",
    players: [
      { name: "Lamine Yamal",       club: "FC Barcelona",         age: 17, position: "RW",  strengths: "Çok genç yaşına rağmen üçüncü bölgede karar kalitesi, içe kat eden driplingleri ve gol/assist öncesi aksiyon sayısı." },
      { name: "Kobbie Mainoo",       club: "Manchester United",    age: 19, position: "CM",  strengths: "Dar alanda top saklama, baskı kıran dönüşler ve savunma katkısını aynı potada birleştiriyor." },
      { name: "Warren Zaïre-Emery",  club: "Paris Saint-Germain", age: 19, position: "CM",  strengths: "Oyunun iki yönünü de oynayabilen nadir gençlerden; koşu mesafesi, pres yoğunluğu ve pas kalitesi." },
      { name: "Arda Güler",          club: "Real Madrid",          age: 20, position: "CAM", strengths: "Sınırlı dakikaya rağmen şut kalitesi, son pas ve set hücumlarında dar alanda çözüm üretme." },
      { name: "Cole Palmer",         club: "Chelsea",              age: 23, position: "CAM", strengths: "Chelsea'nin üretim merkezi; penaltılar, duran toplar ve açık oyun içinde çift haneli skor." },
    ],
  },
};

/* ─── Main export ────────────────────────────────────────────────── */
export default function ListDetailClient({ slug }: { slug: string }) {
  const [dbContent, setDbContent] = useState<SupabaseRow | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) { setLoading(false); return; }
    supabase.from("contents").select("*")
      .eq("slug", slug).eq("status", "yayinda")
      .single()
      .then(({ data }) => { if (data) setDbContent(data); setLoading(false); });
  }, [slug]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center" style={{ background: "var(--sg-bg)" }}>
        <span className="h-5 w-5 animate-spin rounded-full border-2"
          style={{ borderColor: "var(--emerald)", borderTopColor: "transparent" }} />
      </main>
    );
  }

  if (dbContent) return <ListLayoutWrapper row={dbContent} />;

  const staticConfig = STATIC_CONTENT[slug];
  if (staticConfig) {
    const staticRow: SupabaseRow = {
      id: slug, title: staticConfig.title, slug, category: "listeler",
      content: `<p class="lead">${staticConfig.intro}</p>`,
      created_at: "2026-03-01T00:00:00Z",
      players_json: JSON.stringify(staticConfig.players.map(p => ({
        name: p.name, overall: 0, position: p.position, club: p.club, scout_note: p.strengths,
      }))),
      accent: "emerald",
    };
    return <ListLayoutWrapper row={staticRow} />;
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center" style={{ background: "var(--sg-bg)", color: "var(--sg-text-primary)" }}>
      <h1 className="mb-2 text-2xl font-extrabold">404</h1>
      <p className="mb-6 text-sm" style={{ color: "var(--sg-text-muted)" }}>Bu liste bulunamadı.</p>
      <Link href="/listeler" style={{ color: "var(--emerald)", fontSize: 13 }}>← Listelere Dön</Link>
    </main>
  );
}
