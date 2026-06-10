"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import PlayerCard, { type PlayerCardData } from "./player-card";

const STAT_LABELS = ["PAC", "SHO", "PAS", "DRI", "DEF", "PHY"] as const;
const STAT_KEYS = ["pace", "shooting", "passing", "dribbling", "defending", "physical"] as const;

function statColor(val?: number) {
  if (!val) return "var(--sg-text-muted)";
  if (val >= 80) return "var(--emerald, #00d4aa)";
  if (val >= 65) return "var(--cyan, #22d3ee)";
  return "var(--sg-text-muted)";
}

async function fetchPlayerStats(name: string): Promise<Partial<PlayerCardData> | null> {
  const cols = "overall,pace,shooting,passing,dribbling,defending,physical,position,club,league,age,photo_url";

  // Tier 1: fc_players — exact
  const { data: exact } = await supabase
    .from("fc_players")
    .select(cols)
    .ilike("name", name)
    .limit(1)
    .maybeSingle();
  if (exact?.overall) return exact;

  // Tier 1b: fc_players — fuzzy (first two words)
  const two = name.split(" ").slice(0, 2).join(" ");
  const { data: fuzzy } = await supabase
    .from("fc_players")
    .select(cols)
    .ilike("name", `%${two}%`)
    .order("overall", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (fuzzy?.overall) return fuzzy;

  // Tier 1c: fc_players — last name only (handles spelling variants like Ayyub→Ayyoub)
  const parts = name.split(" ");
  if (parts.length >= 2) {
    const lastName = parts[parts.length - 1];
    if (lastName.length >= 4) {
      const { data: lastNameMatch } = await supabase
        .from("fc_players")
        .select(cols)
        .ilike("name", `%${lastName}%`)
        .order("overall", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (lastNameMatch?.overall) return lastNameMatch;
    }
  }

  // Tier 2: player_cache — exact
  const cacheCols = "overall,pace,shooting,passing,dribbling,defending,physical,position,club,league,age";
  const { data: cacheExact } = await supabase
    .from("player_cache")
    .select(cacheCols)
    .ilike("name", name)
    .limit(1)
    .maybeSingle();
  if (cacheExact?.overall) return cacheExact;

  // Tier 2b: player_cache — fuzzy
  const { data: cacheFuzzy } = await supabase
    .from("player_cache")
    .select(cacheCols)
    .ilike("name", `%${two}%`)
    .order("overall", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (cacheFuzzy?.overall) return cacheFuzzy;

  // Tier 3: server-side resolve (BSD + API-Football) via API
  try {
    const res = await fetch(`/api/players/resolve?name=${encodeURIComponent(name)}`);
    if (res.ok) {
      const data = await res.json();
      if (data?.overall) return data;
    }
  } catch { /* ignore */ }

  return null;
}

export default function ArticlePlayerEmbed({
  playerName,
  locale = "en",
}: {
  playerName: string;
  locale?: "tr" | "en";
}) {
  const [card, setCard] = useState<PlayerCardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const stats = await fetchPlayerStats(playerName.trim());
      if (cancelled) return;
      if (stats?.overall) {
        setCard({
          name: playerName.trim(),
          club: (stats as { club?: string }).club ?? "",
          league: (stats as { league?: string }).league ?? "",
          position: (stats as { position?: string }).position ?? "",
          age: (stats as { age?: number }).age ?? "",
          overall: stats.overall!,
          pace: stats.pace ?? 0,
          shooting: stats.shooting ?? 0,
          passing: stats.passing ?? 0,
          dribbling: stats.dribbling ?? 0,
          defending: stats.defending ?? 0,
          physical: stats.physical ?? 0,
          photo_url: (stats as { photo_url?: string }).photo_url,
        });
      } else {
        setCard(null);
      }
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [playerName]);

  const tmBase =
    locale === "en"
      ? "https://www.transfermarkt.com/schnellsuche/ergebnis/schnellsuche?query="
      : "https://www.transfermarkt.com.tr/schnellsuche/ergebnis/schnellsuche?query=";
  const gq = locale === "en" ? " footballer" : " futbolcu";

  if (loading) {
    return (
      <div className="article-player-embed" style={{ clear: "both", padding: "48px 0", borderTop: "1px solid var(--sg-border)" }} data-scout-embed={playerName.trim()}>
        <div style={{ display: "flex", justifyContent: "center" }}>
          <span className="h-6 w-6 animate-spin rounded-full border-2 border-t-transparent" style={{ borderColor: "var(--accent)", borderTopColor: "transparent" }} />
        </div>
      </div>
    );
  }

  if (!card) {
    return (
      <div className="article-player-embed" style={{ clear: "both", padding: "32px 0" }} data-scout-embed={playerName.trim()}>
        <div style={{ padding: "16px 20px", borderRadius: 8, border: "1px dashed var(--sg-border)", background: "var(--sg-surface-low)", fontSize: 14, color: "var(--sg-text-muted)", textAlign: "center" }}>
          Player not found: <strong style={{ color: "var(--sg-text-primary)" }}>{playerName.trim()}</strong>
        </div>
      </div>
    );
  }

  const tmLink = `${tmBase}${encodeURIComponent(card.name)}`;
  const gLink = `https://www.google.com/search?q=${encodeURIComponent(card.name + gq)}`;
  const accent = "var(--accent, var(--emerald, #00d4aa))";

  return (
    <div
      className="article-player-embed"
      style={{ clear: "both", position: "relative", overflow: "hidden", borderTop: "1px solid var(--sg-border)", padding: "48px 0 56px" }}
      data-scout-embed={playerName.trim()}
    >
      <div
        className="article-player-panel"
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 200px) 1fr",
          gap: 40,
          alignItems: "start",
          position: "relative",
        }}
      >
        <PlayerCard
          player={card}
          compact
          animated={false}
          showScoutNote={false}
          tmLink={tmLink}
          gLink={gLink}
        />

        <div style={{ paddingTop: 8 }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 14, marginBottom: 18, flexWrap: "wrap" }}>
            {card.position && (
              <span style={{ fontFamily: "var(--font-mono-stack)", fontSize: 9, fontWeight: 700, letterSpacing: "0.14em", color: accent, background: `color-mix(in oklch, var(--accent, #00d4aa) 12%, transparent)`, padding: "3px 8px", borderRadius: 3 }}>
                {String(card.position).toUpperCase()}
              </span>
            )}
            {card.club && (
              <span style={{ fontFamily: "var(--font-mono-stack)", fontSize: 9, letterSpacing: "0.12em", color: "var(--sg-text-muted)" }}>
                {card.club.toUpperCase()}
              </span>
            )}
            {card.overall > 0 && (
              <span style={{ fontFamily: "var(--font-mono-stack)", fontSize: 9, fontWeight: 700, color: "var(--sg-text-muted)" }}>
                OVR {card.overall}
              </span>
            )}
          </div>

          <h3 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(26px, 3.5vw, 44px)", fontWeight: 700, letterSpacing: "-0.035em", lineHeight: 1.0, margin: "0 0 12px", color: "var(--sg-text-primary)" }}>
            {card.name}
          </h3>

          {card.whyWatch && (
            <p style={{ fontStyle: "italic", fontSize: 15, lineHeight: 1.6, color: "var(--sg-text-secondary)", margin: "0 0 28px", maxWidth: 520 }}>
              {card.whyWatch}
            </p>
          )}

          <div style={{ display: "flex", gap: 20, marginBottom: 28, flexWrap: "wrap" }}>
            {STAT_KEYS.map((key, i) => {
              const val = card[key];
              if (!val) return null;
              return (
                <div key={key}>
                  <div style={{ fontFamily: "var(--font-mono-stack)", fontSize: 8, fontWeight: 700, letterSpacing: "0.14em", color: "var(--sg-text-muted)", marginBottom: 4 }}>
                    {STAT_LABELS[i]}
                  </div>
                  <div style={{ fontFamily: "var(--font-mono-stack)", fontSize: 22, fontWeight: 900, color: statColor(val), lineHeight: 1 }}>
                    {val}
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <Link
              href={`/radar?q=${encodeURIComponent(card.name)}`}
              style={{ fontFamily: "var(--font-mono-stack)", fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", padding: "8px 16px", borderRadius: 999, background: accent, color: "var(--ink-900, #0a0f14)", textDecoration: "none", display: "inline-block" }}
            >
              GO TO RADAR →
            </Link>
            <a
              href={tmLink}
              target="_blank"
              rel="noopener noreferrer"
              style={{ fontFamily: "var(--font-mono-stack)", fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", padding: "8px 16px", borderRadius: 999, border: "1px solid var(--sg-border)", color: "var(--sg-text-muted)", textDecoration: "none", display: "inline-block" }}
            >
              TM
            </a>
            <a
              href={gLink}
              target="_blank"
              rel="noopener noreferrer"
              style={{ fontFamily: "var(--font-mono-stack)", fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", padding: "8px 16px", borderRadius: 999, border: "1px solid var(--sg-border)", color: "var(--sg-text-muted)", textDecoration: "none", display: "inline-block" }}
            >
              GOOGLE
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
