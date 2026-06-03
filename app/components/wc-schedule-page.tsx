"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import SiteHeader from "./site-header";
import SiteFooter from "./site-footer";
import PageShell from "./page-shell";
import { WC_2026_HERO_BG } from "@/lib/wc-2026-brand";
import {
  WC_SCHEDULE,
  WC_GROUPS,
  WC_ROUND_LABELS,
  WC_VENUES,
  getTeamName,
  teamCodeToSlug,
  type WcMatch,
  type WcGroupId,
  type WcRound,
} from "@/lib/wc-2026-schedule";

/* ── Team code → ISO-2 for flagcdn ── */
const CODE_TO_ISO: Record<string, string> = {
  MEX: "mx", RSA: "za", KOR: "kr", CZE: "cz", CAN: "ca", BIH: "ba",
  QAT: "qa", SUI: "ch", BRA: "br", MAR: "ma", HAI: "ht", SCO: "gb-sct",
  USA: "us", PAR: "py", AUS: "au", TUR: "tr", GER: "de", CUW: "cw",
  CIV: "ci", ECU: "ec", NED: "nl", JPN: "jp", SWE: "se", TUN: "tn",
  BEL: "be", EGY: "eg", IRN: "ir", NZL: "nz", ESP: "es", CPV: "cv",
  KSA: "sa", URU: "uy", FRA: "fr", SEN: "sn", IRQ: "iq", NOR: "no",
  ARG: "ar", ALG: "dz", AUT: "at", JOR: "jo", POR: "pt", COD: "cd",
  UZB: "uz", COL: "co", ENG: "gb-eng", CRO: "hr", GHA: "gh", PAN: "pa",
};

function flagUrl(code: string) {
  const iso = CODE_TO_ISO[code];
  if (!iso) return "";
  return `https://flagcdn.com/w80/${iso}.png`;
}

function TeamFlag({ code, size = 24 }: { code: string; size?: number }) {
  const src = flagUrl(code);
  if (!src) return null;
  return (
    <img
      src={src}
      alt=""
      width={size}
      height={Math.round(size * 0.67)}
      loading="lazy"
      decoding="async"
      style={{ objectFit: "cover", borderRadius: 2, flexShrink: 0 }}
    />
  );
}

/* ── Timezone helpers ── */

/** Convert match date + ET kick-off to a UTC Date. EDT = UTC−4 in summer. */
function matchToUtc(date: string, time?: string): Date {
  if (!time) return new Date(date + "T19:00:00Z");
  const [h, m] = time.split(":").map(Number);
  const utcH = h + 4;
  const carry = utcH >= 24 ? 1 : 0;
  const iso = `${date}T${String(utcH % 24).padStart(2, "0")}:${String(m).padStart(2, "0")}:00Z`;
  const d = new Date(iso);
  if (carry) d.setUTCDate(d.getUTCDate() + 1);
  return d;
}

/** Format kick-off in user's local timezone (e.g. "21:00", "9:00 PM"). */
function formatLocalKickoff(utc: Date): string {
  return utc.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

/** Get local date key (YYYY-MM-DD) for grouping. */
function localDateKey(utc: Date): string {
  return utc.toLocaleDateString("en-CA");
}

/** Get user's timezone abbreviation + IANA name. */
function getTimezoneLabel(): string {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const abbr = new Date("2026-06-15T12:00:00Z")
      .toLocaleTimeString("en-US", { timeZoneName: "short" })
      .split(" ")
      .pop() ?? "";
    return `${abbr} — ${tz.replace(/_/g, " ")}`;
  } catch {
    return "Local Time";
  }
}

type ViewMode = "date" | "group" | "knockout";

const ALL_GROUP_IDS: WcGroupId[] = ["A","B","C","D","E","F","G","H","I","J","K","L"];

const KNOCKOUT_ROUNDS: WcRound[] = ["r32","r16","qf","sf","third","final"];

function formatDateHeading(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
}

function daysUntilKickoff(): number {
  const kickoff = new Date("2026-06-11T00:00:00Z").getTime();
  const now = Date.now();
  return Math.max(0, Math.ceil((kickoff - now) / 86_400_000));
}

function allTeamCodes(): { code: string; name: string }[] {
  const list: { code: string; name: string }[] = [];
  for (const teams of Object.values(WC_GROUPS)) {
    for (const t of teams) list.push(t);
  }
  return list.sort((a, b) => a.name.localeCompare(b.name, "en"));
}

type FaqItem = { q: string; a: string };

export default function WcSchedulePage({ teamFilter, faqItems }: { teamFilter?: string; faqItems?: FaqItem[] }) {
  const [view, setView] = useState<ViewMode>("date");
  const [selectedTeam, setSelectedTeam] = useState<string>(teamFilter ?? "");
  const [mounted, setMounted] = useState(false);
  const [tzLabel, setTzLabel] = useState("ET — Eastern Time");

  useEffect(() => {
    setMounted(true);
    setTzLabel(getTimezoneLabel());
  }, []);

  const teams = useMemo(allTeamCodes, []);
  const days = useMemo(daysUntilKickoff, []);

  const filtered = useMemo(() => {
    if (!selectedTeam) return WC_SCHEDULE;
    return WC_SCHEDULE.filter(
      (m) => m.home === selectedTeam || m.away === selectedTeam,
    );
  }, [selectedTeam]);

  const matchesByDate = useMemo(() => {
    const map = new Map<string, WcMatch[]>();
    for (const m of filtered) {
      const utc = matchToUtc(m.date, m.time);
      const key = mounted && m.time ? localDateKey(utc) : m.date;
      const bucket = map.get(key) ?? [];
      bucket.push(m);
      map.set(key, bucket);
    }
    for (const [, arr] of map) {
      arr.sort((a, b) => matchToUtc(a.date, a.time).getTime() - matchToUtc(b.date, b.time).getTime());
    }
    return [...map.entries()].sort(([a], [b]) => a.localeCompare(b));
  }, [filtered, mounted]);

  const groupMatches = useMemo(
    () => filtered.filter((m) => m.round === "group"),
    [filtered],
  );

  const knockoutMatches = useMemo(() => {
    const map = new Map<WcRound, WcMatch[]>();
    for (const r of KNOCKOUT_ROUNDS) map.set(r, []);
    for (const m of filtered) {
      if (m.round !== "group") {
        map.get(m.round)!.push(m);
      }
    }
    return map;
  }, [filtered]);

  const selectedTeamGroup = useMemo(() => {
    if (!selectedTeam) return undefined;
    for (const [gid, teams] of Object.entries(WC_GROUPS)) {
      if (teams.some((t) => t.code === selectedTeam)) return gid as WcGroupId;
    }
    return undefined;
  }, [selectedTeam]);

  return (
    <main
      className="theme-wc-2026"
      style={{ background: "var(--sg-bg)", color: "var(--sg-text-primary)", minHeight: "100vh" }}
    >
      <SiteHeader activeNav="wc-2026" />
      <div style={{ paddingTop: 68 }} />

      {/* ── Hero ── */}
      <header
        className="grain"
        style={{
          background: WC_2026_HERO_BG,
          borderBottom: "1px solid color-mix(in oklch, var(--wc-gold) 25%, var(--sg-border))",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <span
          aria-hidden
          style={{
            position: "absolute",
            inset: "-20% -10% auto -10%",
            height: 280,
            pointerEvents: "none",
            background: "radial-gradient(ellipse at 30% 0%, color-mix(in oklch, var(--wc-magenta) 35%, transparent), transparent 70%)",
          }}
        />
        <PageShell
          shellClass="sg-hero-text-block"
          className="sg-page-shell--hero"
          style={{ position: "relative", paddingTop: 56, paddingBottom: 56 }}
        >
          <Link
            href="/world-cup-2026"
            className="mono"
            style={{ fontSize: 11, letterSpacing: "0.16em", color: "var(--wc-gold)", marginBottom: 20, display: "inline-block" }}
          >
            ← WORLD CUP 2026
          </Link>
          <div
            className="eyebrow"
            style={{ color: "var(--wc-gold)", marginBottom: 12 }}
          >
            MATCH SCHEDULE
          </div>
          <h1
            className="display"
            style={{
              fontSize: "clamp(28px, 5vw, 48px)",
              fontWeight: 700,
              letterSpacing: "-0.04em",
              lineHeight: 1.08,
              margin: "0 0 16px",
              background: "linear-gradient(135deg, var(--wc-gold) 0%, #fff 50%, var(--wc-teal) 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            World Cup 2026 Schedule & Fixtures
          </h1>
          <p style={{ fontSize: 16, lineHeight: 1.6, color: "var(--ink-200)", maxWidth: 560, margin: "0 0 24px" }}>
            Complete match schedule for FIFA World Cup 2026 — June 11 to July 19, across 16 venues in USA, Mexico & Canada.
          </p>

          {/* Quick stats */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 16 }}>
            {[
              { n: "104", l: "Matches" },
              { n: "48", l: "Teams" },
              { n: "16", l: "Venues" },
              { n: "3", l: "Countries" },
            ].map((s) => (
              <div key={s.l} style={{ textAlign: "center" }}>
                <div className="display" style={{ fontSize: 28, fontWeight: 800, color: "var(--wc-gold)", lineHeight: 1 }}>{s.n}</div>
                <div className="mono" style={{ fontSize: 9, letterSpacing: "0.14em", color: "var(--ink-300)", marginTop: 4 }}>{s.l}</div>
              </div>
            ))}
            {days > 0 && (
              <div style={{ textAlign: "center", marginLeft: 8 }}>
                <div className="display" style={{ fontSize: 28, fontWeight: 800, color: "var(--wc-magenta)", lineHeight: 1 }}>{days}</div>
                <div className="mono" style={{ fontSize: 9, letterSpacing: "0.14em", color: "var(--ink-300)", marginTop: 4 }}>Days to Go</div>
              </div>
            )}
          </div>
        </PageShell>
      </header>

      {/* ── Team Filter ── */}
      <div style={{ borderBottom: "1px solid var(--sg-border)", background: "var(--sg-surface-low)" }}>
        <PageShell style={{ paddingTop: 16, paddingBottom: 16 }}>
          <div className="mono" style={{ fontSize: 10, letterSpacing: "0.14em", color: "var(--sg-text-muted)", marginBottom: 10 }}>
            FILTER BY TEAM
          </div>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 6,
            }}
          >
            <button
              onClick={() => setSelectedTeam("")}
              className="mono"
              style={{
                padding: "6px 14px",
                borderRadius: 999,
                fontSize: 11,
                letterSpacing: "0.1em",
                cursor: "pointer",
                border: `1px solid ${!selectedTeam ? "var(--wc-gold)" : "var(--sg-border)"}`,
                background: !selectedTeam ? "color-mix(in oklch, var(--wc-gold) 15%, transparent)" : "transparent",
                color: !selectedTeam ? "var(--wc-gold)" : "var(--sg-text-muted)",
              }}
            >
              All Matches
            </button>
            {teams.map((t) => (
              <button
                key={t.code}
                onClick={() => setSelectedTeam(t.code === selectedTeam ? "" : t.code)}
                className="mono"
                style={{
                  padding: "4px 10px",
                  borderRadius: 999,
                  fontSize: 10,
                  letterSpacing: "0.08em",
                  cursor: "pointer",
                  border: `1px solid ${selectedTeam === t.code ? "var(--wc-gold)" : "var(--sg-border)"}`,
                  background: selectedTeam === t.code ? "color-mix(in oklch, var(--wc-gold) 15%, transparent)" : "transparent",
                  color: selectedTeam === t.code ? "var(--wc-gold)" : "var(--sg-text-muted)",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <TeamFlag code={t.code} size={16} />
                {t.name}
              </button>
            ))}
          </div>
        </PageShell>
      </div>

      {/* ── Timezone indicator ── */}
      <div style={{ borderBottom: "1px solid var(--sg-border)", background: "var(--sg-surface)" }}>
        <PageShell style={{ paddingTop: 10, paddingBottom: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <span style={{ fontSize: 12, color: "var(--sg-text-muted)" }}>
              🕐
            </span>
            <span className="mono" style={{ fontSize: 10, letterSpacing: "0.1em", color: "var(--sg-text-muted)" }}>
              ALL TIMES IN YOUR LOCAL TIMEZONE
            </span>
            <span
              className="mono"
              style={{
                fontSize: 10,
                letterSpacing: "0.08em",
                color: "var(--wc-teal)",
                padding: "2px 8px",
                borderRadius: 4,
                background: "color-mix(in oklch, var(--wc-teal) 10%, transparent)",
                border: "1px solid color-mix(in oklch, var(--wc-teal) 20%, transparent)",
              }}
            >
              {tzLabel}
            </span>
          </div>
        </PageShell>
      </div>

      {/* ── View Toggle ── */}
      <PageShell style={{ paddingTop: 32, paddingBottom: 0 }}>
        <div style={{ display: "flex", gap: 4, marginBottom: 32 }}>
          {([
            { key: "date", label: "By Date" },
            { key: "group", label: "By Group" },
            { key: "knockout", label: "Knockout" },
          ] as { key: ViewMode; label: string }[]).map((v) => (
            <button
              key={v.key}
              onClick={() => setView(v.key)}
              className="mono"
              style={{
                padding: "8px 18px",
                borderRadius: 8,
                fontSize: 11,
                letterSpacing: "0.12em",
                cursor: "pointer",
                border: `1px solid ${view === v.key ? "var(--wc-gold)" : "var(--sg-border)"}`,
                background: view === v.key ? "color-mix(in oklch, var(--wc-gold) 12%, var(--sg-surface))" : "var(--sg-surface)",
                color: view === v.key ? "var(--wc-gold)" : "var(--sg-text-muted)",
              }}
            >
              {v.label}
            </button>
          ))}
        </div>

        {/* Selected team group info */}
        {selectedTeam && selectedTeamGroup && (
          <div
            style={{
              marginBottom: 24,
              padding: "16px 20px",
              borderRadius: 12,
              border: "1px solid var(--sg-border)",
              background: "var(--sg-surface)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <TeamFlag code={selectedTeam} size={32} />
              <div>
                <div className="display" style={{ fontSize: 18, fontWeight: 700 }}>
                  {getTeamName(selectedTeam)}
                </div>
                <div className="mono" style={{ fontSize: 10, letterSpacing: "0.12em", color: "var(--sg-text-muted)" }}>
                  GROUP {selectedTeamGroup}
                </div>
              </div>
              <Link
                href={`/world-cup-2026/squads/${teamCodeToSlug(selectedTeam)}`}
                className="mono"
                style={{ marginLeft: "auto", fontSize: 11, letterSpacing: "0.1em", color: "var(--wc-gold)", whiteSpace: "nowrap" }}
              >
                VIEW SQUAD →
              </Link>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {WC_GROUPS[selectedTeamGroup].filter((t) => t.code !== selectedTeam).map((t) => (
                <span
                  key={t.code}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "4px 10px",
                    borderRadius: 6,
                    background: "var(--sg-surface-low)",
                    border: "1px solid var(--sg-border)",
                    fontSize: 12,
                  }}
                >
                  <TeamFlag code={t.code} size={16} />
                  {t.name}
                </span>
              ))}
            </div>
          </div>
        )}
      </PageShell>

      {/* ── Content views ── */}
      <PageShell style={{ paddingTop: 0, paddingBottom: 80 }}>
        {/* BY DATE */}
        {view === "date" && (
          <div>
            {matchesByDate.map(([date, matches]) => (
              <div key={date} style={{ marginBottom: 32 }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    marginBottom: 12,
                  }}
                >
                  <h2
                    className="display"
                    style={{ fontSize: 18, fontWeight: 700, margin: 0, whiteSpace: "nowrap" }}
                  >
                    {formatDateHeading(date)}
                  </h2>
                  <div style={{ flex: 1, height: 1, background: "var(--sg-border)" }} />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {matches.map((m) => (
                    <MatchCard key={m.id} match={m} highlight={selectedTeam} mounted={mounted} />
                  ))}
                </div>
              </div>
            ))}
            {matchesByDate.length === 0 && (
              <p className="mono" style={{ textAlign: "center", padding: 40, color: "var(--sg-text-muted)", fontSize: 12 }}>
                No matches found for the selected filter.
              </p>
            )}
          </div>
        )}

        {/* BY GROUP */}
        {view === "group" && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 340px), 1fr))",
              gap: 20,
            }}
          >
            {ALL_GROUP_IDS
              .filter((gid) => !selectedTeam || WC_GROUPS[gid].some((t) => t.code === selectedTeam))
              .map((gid) => (
                <GroupCard key={gid} groupId={gid} matches={groupMatches.filter((m) => m.group === gid)} highlight={selectedTeam} mounted={mounted} />
              ))}
          </div>
        )}

        {/* KNOCKOUT */}
        {view === "knockout" && (
          <div>
            {KNOCKOUT_ROUNDS.map((round) => {
              const matches = knockoutMatches.get(round) ?? [];
              if (!matches.length) return null;
              return (
                <div key={round} style={{ marginBottom: 40 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                    <h2
                      className="display"
                      style={{
                        fontSize: 22,
                        fontWeight: 700,
                        margin: 0,
                        color: round === "final" ? "var(--wc-gold)" : "var(--sg-text-primary)",
                      }}
                    >
                      {WC_ROUND_LABELS[round]}
                    </h2>
                    <div style={{ flex: 1, height: 1, background: "var(--sg-border)" }} />
                    <span className="mono" style={{ fontSize: 10, color: "var(--sg-text-muted)", letterSpacing: "0.12em" }}>
                      {matches.length} {matches.length === 1 ? "MATCH" : "MATCHES"}
                    </span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {matches.map((m) => (
                      <MatchCard key={m.id} match={m} highlight={selectedTeam} mounted={mounted} />
                    ))}
                  </div>
                </div>
              );
            })}
            {[...knockoutMatches.values()].every((arr) => arr.length === 0) && (
              <p className="mono" style={{ textAlign: "center", padding: 40, color: "var(--sg-text-muted)", fontSize: 12 }}>
                No knockout matches for the selected team yet.
              </p>
            )}
          </div>
        )}
      </PageShell>

      {/* ── Browse by Team (SEO internal links) ── */}
      <section style={{ borderTop: "1px solid var(--sg-border)", background: "var(--sg-bg)" }}>
        <PageShell style={{ paddingTop: 48, paddingBottom: 48 }}>
          <div className="eyebrow" style={{ color: "var(--wc-teal)", marginBottom: 8 }}>BROWSE BY TEAM</div>
          <h2 className="display" style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-0.03em", margin: "0 0 20px" }}>
            48 Team Schedules
          </h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 150px), 1fr))",
              gap: 6,
            }}
          >
            {teams.map((t) => (
              <Link
                key={t.code}
                href={`/world-cup-2026/schedule/${teamCodeToSlug(t.code)}`}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "8px 12px",
                  borderRadius: 8,
                  border: "1px solid var(--sg-border)",
                  background: selectedTeam === t.code ? "color-mix(in oklch, var(--wc-gold) 10%, var(--sg-surface))" : "var(--sg-surface)",
                  fontSize: 12,
                  fontWeight: 500,
                  color: selectedTeam === t.code ? "var(--wc-gold)" : "var(--sg-text-secondary)",
                  textDecoration: "none",
                }}
              >
                <TeamFlag code={t.code} size={16} />
                {t.name}
              </Link>
            ))}
          </div>
        </PageShell>
      </section>

      {/* ── Venues section ── */}
      <section style={{ borderTop: "1px solid var(--sg-border)", background: "var(--sg-surface-low)" }}>
        <PageShell style={{ paddingTop: 64, paddingBottom: 64 }}>
          <div className="eyebrow" style={{ color: "var(--wc-gold)", marginBottom: 8 }}>HOST CITIES</div>
          <h2 className="display" style={{ fontSize: 28, fontWeight: 700, letterSpacing: "-0.03em", margin: "0 0 32px" }}>
            16 Venues Across 3 Countries
          </h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 220px), 1fr))",
              gap: 12,
            }}
          >
            {Object.entries(WC_VENUES).map(([name, v]) => (
              <div
                key={name}
                style={{
                  padding: "14px 16px",
                  borderRadius: 10,
                  border: "1px solid var(--sg-border)",
                  background: "var(--sg-surface)",
                }}
              >
                <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 4, lineHeight: 1.3 }}>{name}</div>
                <div className="mono" style={{ fontSize: 10, color: "var(--sg-text-muted)", letterSpacing: "0.08em" }}>
                  {v.city}, {v.country} · {v.capacity}
                </div>
              </div>
            ))}
          </div>
        </PageShell>
      </section>

      {/* ── SEO Content Block ── */}
      <section style={{ borderTop: "1px solid var(--sg-border)", background: "var(--sg-bg)" }}>
        <PageShell style={{ paddingTop: 56, paddingBottom: 40 }}>
          <h2 className="display" style={{ fontSize: "clamp(20px, 3vw, 26px)", fontWeight: 700, letterSpacing: "-0.03em", margin: "0 0 16px" }}>
            About the FIFA World Cup 2026 Schedule
          </h2>
          <div style={{ fontSize: 14, lineHeight: 1.7, color: "var(--sg-text-secondary)", maxWidth: 720 }}>
            <p style={{ margin: "0 0 14px" }}>
              The FIFA World Cup 2026 is the first edition to feature 48 teams across 12 groups, expanding the tournament to 104 matches played over 39 days. The group stage runs from June 11 to June 27, followed by the Round of 32, Round of 16, quarterfinals, semifinals, and the final on July 19 at MetLife Stadium in New York/New Jersey.
            </p>
            <p style={{ margin: "0 0 14px" }}>
              Matches are spread across 16 venues in three host countries: 11 stadiums in the United States, 3 in Mexico, and 2 in Canada. Group stage matches typically kick off at four different time slots each day, with the final round of group games featuring simultaneous kick-offs to ensure fair competition.
            </p>
            <p style={{ margin: 0 }}>
              All kick-off times on this page are automatically adjusted to your local timezone. The official FIFA schedule uses Eastern Time (ET) as the reference. Use the team filter above to focus on any specific nation&apos;s path through the tournament.
            </p>
          </div>
        </PageShell>
      </section>

      {/* ── FAQ Section ── */}
      {faqItems && faqItems.length > 0 && (
        <section style={{ borderTop: "1px solid var(--sg-border)", background: "var(--sg-surface-low)" }}>
          <PageShell style={{ paddingTop: 56, paddingBottom: 56 }}>
            <div className="eyebrow" style={{ color: "var(--wc-gold)", marginBottom: 8 }}>FAQ</div>
            <h2 className="display" style={{ fontSize: "clamp(20px, 3vw, 26px)", fontWeight: 700, letterSpacing: "-0.03em", margin: "0 0 28px" }}>
              Frequently Asked Questions
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 720 }}>
              {faqItems.map((item, i) => (
                <details
                  key={i}
                  style={{
                    borderRadius: 10,
                    border: "1px solid var(--sg-border)",
                    background: "var(--sg-surface)",
                    overflow: "hidden",
                  }}
                >
                  <summary
                    style={{
                      padding: "16px 20px",
                      cursor: "pointer",
                      fontWeight: 600,
                      fontSize: 14,
                      lineHeight: 1.4,
                      color: "var(--sg-text-primary)",
                      listStyle: "none",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    {item.q}
                    <span style={{ fontSize: 18, color: "var(--wc-gold)", marginLeft: 12, flexShrink: 0 }}>+</span>
                  </summary>
                  <div
                    style={{
                      padding: "0 20px 16px",
                      fontSize: 13,
                      lineHeight: 1.65,
                      color: "var(--sg-text-secondary)",
                    }}
                  >
                    {item.a}
                  </div>
                </details>
              ))}
            </div>
          </PageShell>
        </section>
      )}

      <div style={{ paddingBottom: 40 }} />
      <SiteFooter maxWidth="max-w-7xl" />
    </main>
  );
}

/* ── Match Card ── */
function MatchCard({ match, highlight, mounted }: { match: WcMatch; highlight?: string; mounted?: boolean }) {
  const isGroup = match.round === "group";
  const isFinal = match.round === "final";
  const homeName = match.home ? getTeamName(match.home) : (match.homeLabel ?? "TBD");
  const awayName = match.away ? getTeamName(match.away) : (match.awayLabel ?? "TBD");
  const dateLabel = new Date(match.date + "T12:00:00Z").toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });

  const utc = matchToUtc(match.date, match.time);
  const localTime = match.time && mounted ? formatLocalKickoff(utc) : match.time ?? "TBC";

  return (
    <div
      style={{
        padding: "14px 16px 10px",
        borderRadius: 10,
        border: "1px solid var(--sg-border)",
        background: "var(--sg-surface)",
        borderLeft: `3px solid ${isFinal ? "var(--wc-gold)" : isGroup ? "color-mix(in oklch, var(--wc-gold) 30%, var(--sg-border))" : "var(--wc-teal)"}`,
      }}
    >
      {/* Teams row */}
      <div style={{ display: "flex", alignItems: "center", gap: 0, marginBottom: 8 }}>
        <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
          {match.home && <TeamFlag code={match.home} size={24} />}
          <span
            style={{
              fontWeight: highlight && match.home === highlight ? 700 : 500,
              fontSize: 14,
              color: highlight && match.home === highlight ? "var(--wc-gold)" : "var(--sg-text-primary)",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {homeName}
          </span>
        </div>

        <div
          style={{
            flexShrink: 0,
            padding: "0 14px",
            textAlign: "center",
            minWidth: 60,
          }}
        >
          <div
            className="mono"
            style={{
              fontSize: 15,
              fontWeight: 700,
              color: match.time ? "var(--sg-text-primary)" : "var(--sg-text-muted)",
              letterSpacing: "0.04em",
              lineHeight: 1,
            }}
          >
            {localTime}
          </div>
        </div>

        <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 8, justifyContent: "flex-end", minWidth: 0 }}>
          <span
            style={{
              fontWeight: highlight && match.away === highlight ? 700 : 500,
              fontSize: 14,
              color: highlight && match.away === highlight ? "var(--wc-gold)" : "var(--sg-text-primary)",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              textAlign: "right",
            }}
          >
            {awayName}
          </span>
          {match.away && <TeamFlag code={match.away} size={24} />}
        </div>
      </div>

      {/* Meta row */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
        <span className="mono" style={{ fontSize: 9, letterSpacing: "0.06em", color: "var(--sg-text-muted)" }}>
          {match.venue} · {match.city}
        </span>
        <div style={{ display: "flex", gap: 10, alignItems: "center", flexShrink: 0 }}>
          {match.group && (
            <span className="mono" style={{ fontSize: 9, letterSpacing: "0.1em", color: "var(--wc-gold)", opacity: 0.8 }}>
              GRP {match.group}
            </span>
          )}
          {!isGroup && (
            <span className="mono" style={{ fontSize: 9, letterSpacing: "0.1em", color: "var(--wc-teal)" }}>
              {WC_ROUND_LABELS[match.round].toUpperCase()}
            </span>
          )}
          <span className="mono" style={{ fontSize: 9, letterSpacing: "0.06em", color: "var(--sg-text-muted)", opacity: 0.5 }}>
            {dateLabel} · M{match.id}
          </span>
        </div>
      </div>
    </div>
  );
}

/* ── Group Card ── */
function GroupCard({ groupId, matches, highlight, mounted }: { groupId: WcGroupId; matches: WcMatch[]; highlight?: string; mounted?: boolean }) {
  const teams = WC_GROUPS[groupId];

  return (
    <div
      style={{
        borderRadius: 14,
        border: "1px solid var(--sg-border)",
        background: "var(--sg-surface)",
        overflow: "hidden",
      }}
    >
      {/* Group header */}
      <div
        style={{
          padding: "14px 18px",
          background: "color-mix(in oklch, var(--wc-gold) 8%, var(--sg-surface-low))",
          borderBottom: "1px solid var(--sg-border)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span
            className="display"
            style={{ fontSize: 22, fontWeight: 800, color: "var(--wc-gold)", lineHeight: 1 }}
          >
            {groupId}
          </span>
          <span className="mono" style={{ fontSize: 10, letterSpacing: "0.12em", color: "var(--sg-text-muted)" }}>
            GROUP
          </span>
        </div>
        <span className="mono" style={{ fontSize: 10, letterSpacing: "0.1em", color: "var(--sg-text-muted)" }}>
          {matches.length} MATCHES
        </span>
      </div>

      {/* Teams */}
      <div style={{ padding: "12px 18px", borderBottom: "1px solid var(--sg-border)" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {teams.map((t) => (
            <div
              key={t.code}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "6px 8px",
                borderRadius: 6,
                background: highlight === t.code ? "color-mix(in oklch, var(--wc-gold) 10%, transparent)" : "transparent",
              }}
            >
              <TeamFlag code={t.code} size={20} />
              <span
                style={{
                  fontSize: 13,
                  fontWeight: highlight === t.code ? 700 : 500,
                  color: highlight === t.code ? "var(--wc-gold)" : "var(--sg-text-primary)",
                }}
              >
                {t.name}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Matches */}
      <div style={{ padding: "8px 12px" }}>
        {matches.map((m) => {
          const utc = matchToUtc(m.date, m.time);
          const localTime = m.time && mounted ? formatLocalKickoff(utc) : m.time ?? "TBC";
          return (
            <div
              key={m.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "8px 6px",
                borderBottom: "1px solid color-mix(in oklch, var(--sg-border) 50%, transparent)",
                fontSize: 13,
              }}
            >
              <span className="mono" style={{ fontSize: 9, color: "var(--sg-text-muted)", width: 55, flexShrink: 0, letterSpacing: "0.06em" }}>
                {new Date(m.date + "T12:00:00Z").toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" })}
              </span>
              <span
                className="mono"
                style={{
                  fontSize: 10,
                  fontWeight: 600,
                  color: "var(--wc-teal)",
                  width: 42,
                  flexShrink: 0,
                  textAlign: "center",
                }}
              >
                {localTime}
              </span>
              <TeamFlag code={m.home} size={16} />
              <span
                style={{
                  flex: 1,
                  fontWeight: highlight === m.home ? 700 : 400,
                  color: highlight === m.home ? "var(--wc-gold)" : "var(--sg-text-primary)",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {getTeamName(m.home)}
              </span>
              <span className="mono" style={{ fontSize: 10, color: "var(--sg-text-muted)", padding: "0 4px" }}>v</span>
              <span
                style={{
                  flex: 1,
                  textAlign: "right",
                  fontWeight: highlight === m.away ? 700 : 400,
                  color: highlight === m.away ? "var(--wc-gold)" : "var(--sg-text-primary)",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {getTeamName(m.away)}
              </span>
              <TeamFlag code={m.away} size={16} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
