"use client";

import Link from "next/link";
import WcTeamFlag from "./wc/wc-team-flag";
import {
  getTeamName,
  teamCodeToSlug,
  getScheduleState,
  daysUntilKickoff,
  getTodaysMatches,
  getTomorrowsMatches,
  getUpcomingMatches,
  type WcMatch,
} from "@/lib/wc-2026-schedule";

const SCHEDULE_PATH = "/world-cup-2026/schedule";

/** Day-month label, e.g. "Jun 11". */
function dayLabel(date: string): string {
  const d = new Date(`${date}T00:00:00`);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function TeamSide({ code, align }: { code: string; align: "left" | "right" }) {
  const name = getTeamName(code);
  const slug = teamCodeToSlug(code);
  return (
    <Link
      href={`${SCHEDULE_PATH}/${slug}`}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        flexDirection: align === "right" ? "row-reverse" : "row",
        flex: 1,
        minWidth: 0,
        textDecoration: "none",
        color: "inherit",
      }}
    >
      <WcTeamFlag slug={slug} name={name} size="sm" />
      <span
        style={{
          fontFamily: "var(--font-headline)",
          fontWeight: 700,
          fontSize: 14,
          letterSpacing: "-0.01em",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {name}
      </span>
    </Link>
  );
}

function MatchCard({ match, showDay = true }: { match: WcMatch; showDay?: boolean }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 10,
        padding: "16px 16px 14px",
        borderRadius: 12,
        border: "1px solid var(--sg-border)",
        background: "var(--sg-surface)",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span className="mono" style={{ fontSize: 10, letterSpacing: "0.12em", color: "var(--wc-gold)" }}>
          {showDay ? `${dayLabel(match.date)} · ` : ""}
          {match.time ? `${match.time} ET` : ""}
        </span>
        {match.group ? (
          <span className="mono" style={{ fontSize: 10, letterSpacing: "0.1em", color: "var(--sg-text-muted)" }}>
            GROUP {match.group}
          </span>
        ) : null}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <TeamSide code={match.home} align="left" />
        <span className="mono" style={{ fontSize: 11, color: "var(--sg-text-muted)", flexShrink: 0 }}>VS</span>
        <TeamSide code={match.away} align="right" />
      </div>
      <div className="mono" style={{ fontSize: 10, letterSpacing: "0.06em", color: "var(--sg-text-muted)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
        {match.venue} · {match.city}
      </div>
    </div>
  );
}

/**
 * Server-rendered WC matches block for the homepage. Date-aware:
 *  - before the tournament: opening matches + kickoff countdown
 *  - during: today's & tomorrow's matches (falls back to next upcoming)
 *  - after: hidden (returns null)
 * Emits SportsEvent JSON-LD for the shown matches so the block is
 * crawlable / eligible for rich results.
 */
export default function HomeWcMatches() {
  const now = new Date();
  const state = getScheduleState(now);
  if (state === "post") return null;

  const today = getTodaysMatches(now);
  const tomorrow = getTomorrowsMatches(now);
  const isLive = state === "live";

  // What to show: live -> today (or next upcoming if none today); pre -> openers.
  const primary = isLive ? (today.length ? today : getUpcomingMatches(now, 6)) : getUpcomingMatches(now, 6);
  const primaryLabel = isLive ? (today.length ? "Today's Matches" : "Upcoming Matches") : "Opening Matches";
  const countdown = state === "pre" ? daysUntilKickoff(now) : 0;

  return (
    <section className="sg-editorial-shell" style={{ paddingTop: 72, paddingBottom: 72 }}>
      <div style={{ marginBottom: 32 }}>
        <div className="eyebrow" style={{ color: "var(--wc-gold)" }}>FIFA WORLD CUP 2026</div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginTop: 8, gap: 16, flexWrap: "wrap" }}>
          <h2 className="display" style={{ fontSize: "clamp(24px, 4vw, 36px)", fontWeight: 700, letterSpacing: "-0.03em", margin: 0 }}>
            {primaryLabel}
          </h2>
          <div style={{ display: "flex", gap: 16, alignItems: "baseline" }}>
            {countdown > 0 ? (
              <span className="mono" style={{ fontSize: 12, letterSpacing: "0.12em", color: "var(--wc-gold)", whiteSpace: "nowrap" }}>
                KICK-OFF IN {countdown} DAY{countdown === 1 ? "" : "S"}
              </span>
            ) : null}
            <Link href={SCHEDULE_PATH} className="mono u-link" style={{ fontSize: 12, letterSpacing: "0.14em", color: "var(--sg-text-muted)", whiteSpace: "nowrap" }}>
              FULL SCHEDULE →
            </Link>
          </div>
        </div>
        <p style={{ marginTop: 12, fontSize: 15, color: "var(--sg-text-muted)", maxWidth: "60ch" }}>
          {state === "pre"
            ? "The 2026 World Cup kicks off June 11 across the USA, Mexico & Canada. Here are the first matches of the group stage."
            : "Live during the tournament — today's fixtures with kick-off times, venues, and links to each team."}
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12 }}>
        {primary.map((m) => (
          <MatchCard key={m.id} match={m} />
        ))}
      </div>

      {isLive && tomorrow.length > 0 ? (
        <div style={{ marginTop: 32 }}>
          <div className="mono" style={{ fontSize: 11, letterSpacing: "0.12em", color: "var(--sg-text-muted)", marginBottom: 16 }}>
            TOMORROW — {dayLabel(tomorrow[0].date).toUpperCase()}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12 }}>
            {tomorrow.map((m) => (
              <MatchCard key={m.id} match={m} showDay={false} />
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}
