"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import PlayerCard, { type PlayerCardData } from "./player-card";
import PlayerRatingBars from "./player-rating-bars";
import { formatPlayerMetaLine } from "@/lib/player-meta-line";

async function fetchPlayerStats(name: string): Promise<Partial<PlayerCardData> | null> {
  const { data: exact } = await supabase
    .from("fc_players")
    .select("overall,pace,shooting,passing,dribbling,defending,physical,position,club,league,age,photo_url")
    .ilike("name", name)
    .limit(1)
    .maybeSingle();
  if (exact?.overall) return exact;
  const two = name.split(" ").slice(0, 2).join(" ");
  const { data: fuzzy } = await supabase
    .from("fc_players")
    .select("overall,pace,shooting,passing,dribbling,defending,physical,position,club,league,age,photo_url")
    .ilike("name", `%${two}%`)
    .order("overall", { ascending: false })
    .limit(1)
    .maybeSingle();
  return fuzzy?.overall ? fuzzy : null;
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
    return () => {
      cancelled = true;
    };
  }, [playerName]);

  const tmBase =
    locale === "en"
      ? "https://www.transfermarkt.com/schnellsuche/ergebnis/schnellsuche?query="
      : "https://www.transfermarkt.com.tr/schnellsuche/ergebnis/schnellsuche?query=";
  const gq = locale === "en" ? " footballer" : " futbolcu";

  if (loading) {
    return (
      <div
        className="article-player-embed my-10 flex justify-center"
        style={{ clear: "both" }}
        data-scout-embed={playerName.trim()}
      >
        <div
          style={{
            width: "100%",
            maxWidth: 680,
            minHeight: 200,
            borderRadius: 16,
            border: "1px solid var(--sg-border)",
            background: "var(--sg-surface-low)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span
            className="h-6 w-6 animate-spin rounded-full border-2 border-t-transparent"
            style={{ borderColor: "var(--accent)", borderTopColor: "transparent" }}
          />
        </div>
      </div>
    );
  }

  if (!card) {
    return (
      <div
        className="article-player-embed my-10 flex justify-center"
        style={{ clear: "both" }}
        data-scout-embed={playerName.trim()}
      >
        <div
          style={{
            width: "100%",
            maxWidth: 420,
            padding: "16px 20px",
            borderRadius: 8,
            border: "1px dashed var(--sg-border)",
            background: "var(--sg-surface-low)",
            fontSize: 14,
            color: "var(--sg-text-muted)",
            textAlign: "center",
          }}
        >
          Player not found in EA FC database:{" "}
          <strong style={{ color: "var(--sg-text-primary)" }}>{playerName.trim()}</strong>
        </div>
      </div>
    );
  }

  const metaLine = formatPlayerMetaLine(card, locale);
  const tmLink = `${tmBase}${encodeURIComponent(card.name)}`;
  const gLink = `https://www.google.com/search?q=${encodeURIComponent(card.name + gq)}`;
  const radarLink = `/radar?q=${encodeURIComponent(card.name)}`;

  return (
    <div
      className="article-player-embed my-10"
      style={{ clear: "both" }}
      data-scout-embed={playerName.trim()}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 240px) 1fr",
          gap: 32,
          alignItems: "start",
          padding: "28px 24px",
          borderRadius: 16,
          border: "1px solid var(--sg-border)",
          background: "var(--sg-surface-low)",
        }}
        className="article-player-panel"
      >
        <PlayerCard
          player={card}
          compact
          animated={false}
          showScoutNote={false}
          tmLink={tmLink}
          gLink={gLink}
        />

        <div style={{ minWidth: 0 }}>
          <div
            className="mono"
            style={{
              fontSize: 10,
              letterSpacing: "0.14em",
              color: "var(--accent, var(--sg-text-muted))",
              marginBottom: 8,
              textTransform: "uppercase",
            }}
          >
            PLAYER PROFILE
          </div>

          <h3
            className="display"
            style={{
              fontSize: "clamp(22px, 3vw, 32px)",
              fontWeight: 700,
              letterSpacing: "-0.03em",
              margin: "0 0 6px",
              color: "var(--sg-text-primary)",
            }}
          >
            {card.name}
          </h3>

          <p
            className="mono"
            style={{
              fontSize: 11,
              letterSpacing: "0.08em",
              color: "var(--sg-text-muted)",
              margin: "0 0 20px",
              lineHeight: 1.5,
            }}
          >
            {metaLine}
          </p>

          <PlayerRatingBars player={card} locale={locale} />

          <div
            style={{
              marginTop: 20,
              paddingTop: 16,
              borderTop: "1px solid var(--sg-border)",
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              gap: 10,
            }}
          >
            <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
              <span
                className="mono"
                style={{ fontSize: 10, letterSpacing: "0.1em", color: "var(--sg-text-muted)" }}
              >
                OVR
              </span>
              <span
                className="display tabular-nums"
                style={{ fontSize: 28, fontWeight: 800, color: "var(--accent)", lineHeight: 1 }}
              >
                {card.overall}
              </span>
            </div>

            <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
              <a
                href={radarLink}
                className="btn"
                style={{ fontSize: 10, padding: "7px 14px", letterSpacing: "0.1em" }}
              >
                RADAR →
              </a>
              <a
                href={tmLink}
                target="_blank"
                rel="noopener noreferrer"
                className="btn"
                style={{ fontSize: 10, padding: "7px 12px", letterSpacing: "0.1em" }}
              >
                TM
              </a>
              <a
                href={gLink}
                target="_blank"
                rel="noopener noreferrer"
                className="btn"
                style={{ fontSize: 10, padding: "7px 12px", letterSpacing: "0.1em" }}
              >
                GOOGLE
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
