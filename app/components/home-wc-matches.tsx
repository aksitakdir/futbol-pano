"use client";

import { useMemo } from "react";
import Link from "next/link";
import WcTeamFlag from "./wc/wc-team-flag";
import {
  WC_SCHEDULE,
  getTeamName,
  teamCodeToSlug,
  type WcMatch,
} from "@/lib/wc-2026-schedule";

const SCHEDULE_PATH = "/world-cup-2026/schedule";

/** Day-month label, e.g. "Jun 11". */
function dayLabel(date: string): string {
  const d = new Date(`${date}T00:00:00`);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

/** Whole days from today until the tournament opener (>=0). */
function daysUntil(date: string): number {
  const target = new Date(`${date}T00:00:00`).getTime();
  const now = Date.now();
  return Math.max(0, Math.ceil((target - now) / 86_400_000));
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

function MatchCard({ match }: { match: WcMatch }) {
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
          {dayLabel(match.date)}
          {match.time ? ` · ${match.time} ET` : ""}
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

export default function HomeWcMatches() {
  // Chronological openers — the first matches of the group stage.
  const upcoming = useMemo(() => {
    return [...WC_SCHEDULE]
      .sort((a, b) => (a.date === b.date ? (a.time ?? "").localeCompare(b.time ?? "") : a.date.localeCompare(b.date)))
      .slice(0, 6);
  }, []);

  const opener = upcoming[0];
  const countdown = opener ? daysUntil(opener.date) : 0;

  return (
    <section className="sg-editorial-shell" style={{ paddingTop: 72, paddingBottom: 72 }}>
      <div style={{ marginBottom: 32 }}>
        <div className="eyebrow" style={{ color: "var(--wc-gold)" }}>FIFA WORLD CUP 2026</div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginTop: 8, gap: 16, flexWrap: "wrap" }}>
          <h2 className="display" style={{ fontSize: "clamp(24px, 4vw, 36px)", fontWeight: 700, letterSpacing: "-0.03em", margin: 0 }}>
            {countdown > 0 ? "Opening Matches" : "Upcoming Matches"}
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
          The 2026 World Cup kicks off June 11 across the USA, Mexico &amp; Canada. Here are the first matches of the group stage.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12 }}>
        {upcoming.map((m) => (
          <MatchCard key={m.id} match={m} />
        ))}
      </div>
    </section>
  );
}
