"use client";

import PlayerCard, { type PlayerCardData } from "./player-card";
import { PlayerScoutLinks } from "./player-scout-links";
import PlayerRatingBars from "./player-rating-bars";
import { formatPlayerMetaLine } from "@/lib/player-meta-line";

export type RadarPlayerFocusPanelProps = {
  player: PlayerCardData;
  description?: string | null;
  scoutQuote?: string | null;
  goals?: string | null;
  assists?: string | null;
};

export default function RadarPlayerFocusPanel({
  player,
  description,
  scoutQuote,
  goals,
  assists,
}: RadarPlayerFocusPanelProps) {
  const tm = `https://www.transfermarkt.com/schnellsuche/ergebnis/schnellsuche?query=${encodeURIComponent(player.name)}`;
  const gSearch = `https://www.google.com/search?q=${encodeURIComponent(player.name + " footballer")}`;

  const labels = {
    focus: "FOCUS PLAYER",
    scout: "SCOUT NOTE",
    overall: "OVERALL",
    goals: "GOALS",
    assists: "ASSISTS",
  };

  const metaLine = formatPlayerMetaLine(player);
  const showGoalsRow = (goals != null && goals !== "") || (assists != null && assists !== "");

  return (
    <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-[minmax(0,280px)_1fr] lg:gap-12">
      <PlayerCard
        player={player}
        showScoutNote={false}
        animated
        tmLink={tm}
        gLink={gSearch}
      />
      <div>
        <div className="eyebrow" style={{ color: "var(--accent)", marginBottom: 10 }}>
          {labels.focus}
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 12, marginBottom: 12 }}>
          <h2
            className="display grad-text"
            style={{ fontSize: "clamp(32px, 4vw, 48px)", fontWeight: 700, letterSpacing: "-0.03em", margin: 0 }}
          >
            {player.name}
          </h2>
          <PlayerScoutLinks playerName={player.name} />
        </div>
        <p
          className="mono"
          style={{
            fontSize: 11,
            letterSpacing: "0.1em",
            color: "var(--sg-text-muted)",
            marginBottom: 24,
            lineHeight: 1.5,
          }}
        >
          {metaLine}
        </p>
        {description ? (
          <p style={{ fontSize: 17, lineHeight: 1.6, color: "var(--sg-text-secondary)", maxWidth: 560, marginBottom: 28 }}>
            {description}
          </p>
        ) : null}
        <PlayerRatingBars player={player} />
        <div
          style={{
            marginTop: 28,
            paddingTop: 24,
            borderTop: "1px solid var(--sg-border)",
            display: "flex",
            flexWrap: "wrap",
            gap: 24,
            alignItems: "flex-end",
          }}
        >
          {showGoalsRow ? (
            <>
              {goals ? (
                <div>
                  <div className="eyebrow" style={{ marginBottom: 6 }}>{labels.goals}</div>
                  <div className="display tabular-nums" style={{ fontSize: 28, fontWeight: 800, color: "var(--sg-text-primary)", lineHeight: 1 }}>
                    {goals}
                  </div>
                </div>
              ) : null}
              {assists ? (
                <div>
                  <div className="eyebrow" style={{ marginBottom: 6 }}>{labels.assists}</div>
                  <div className="display tabular-nums" style={{ fontSize: 28, fontWeight: 800, color: "var(--sg-text-primary)", lineHeight: 1 }}>
                    {assists}
                  </div>
                </div>
              ) : null}
            </>
          ) : null}
          <div>
            <div className="eyebrow" style={{ marginBottom: 6 }}>{labels.overall}</div>
            <div className="display tabular-nums" style={{ fontSize: 42, fontWeight: 800, color: "var(--accent)", lineHeight: 1 }}>
              {player.overall}
            </div>
          </div>
        </div>
        {scoutQuote ? (
          <div style={{ marginTop: 28 }}>
            <div className="eyebrow" style={{ color: "var(--accent)", marginBottom: 10 }}>
              {labels.scout}
            </div>
            <blockquote
              style={{
                margin: 0,
                paddingLeft: 16,
                borderLeft: `3px solid ${"var(--accent)"}`,
                fontSize: 16,
                lineHeight: 1.65,
                color: "var(--sg-text-secondary)",
                fontStyle: "italic",
              }}
            >
              {scoutQuote}
            </blockquote>
          </div>
        ) : null}
      </div>
    </div>
  );
}
