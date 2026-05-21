"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { WC_TEAMS, type WcTeam } from "@/lib/wc-2026-teams";
import { supabase } from "@/lib/supabase";

type TeamWithCount = WcTeam & { playerCount: number };

/**
 * Groups WC teams by confederation and fetches squad player counts.
 * Used on homepage for SEO-rich squad section.
 */
export default function HomeWcSquads() {
  const [teams, setTeams] = useState<TeamWithCount[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from("wc_squad_players")
        .select("team_slug", { count: "exact" });

      const countMap: Record<string, number> = {};
      if (data) {
        for (const row of data as { team_slug: string }[]) {
          countMap[row.team_slug] = (countMap[row.team_slug] ?? 0) + 1;
        }
      }

      const enriched = WC_TEAMS.map((t) => ({
        ...t,
        playerCount: countMap[t.slug] ?? 0,
      }));
      setTeams(enriched);
      setLoading(false);
    }
    load();
  }, []);

  const seeded = teams.filter((t) => t.playerCount > 0);
  const unseeded = teams.filter((t) => t.playerCount === 0);

  return (
    <section className="sg-editorial-shell" style={{ paddingTop: 80, paddingBottom: 80 }}>
      {/* Header */}
      <div style={{ marginBottom: 40 }}>
        <div className="eyebrow" style={{ color: "var(--sg-secondary)" }}>FIFA WORLD CUP 2026</div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginTop: 8, gap: 16, flexWrap: "wrap" }}>
          <h2 className="display" style={{ fontSize: "clamp(24px, 4vw, 36px)", fontWeight: 700, letterSpacing: "-0.03em", margin: 0 }}>
            All 48 Squad Pages
          </h2>
          <Link href="/wc-2026" className="mono u-link" style={{ fontSize: 12, letterSpacing: "0.14em", color: "var(--sg-text-muted)", whiteSpace: "nowrap" }}>
            VIEW HUB →
          </Link>
        </div>
        <p style={{ marginTop: 12, fontSize: 15, color: "var(--sg-text-muted)", maxWidth: "60ch" }}>
          Explore rosters for all 48 World Cup 2026 nations. Squads are updated as official selections are announced.
        </p>
      </div>

      {loading ? (
        <div style={{ display: "flex", gap: 8, alignItems: "center", padding: "32px 0", color: "var(--sg-text-muted)" }}>
          <span className="h-4 w-4 animate-spin rounded-full border-2" style={{ borderColor: "var(--accent)", borderTopColor: "transparent" }} />
          <span className="mono" style={{ fontSize: 12, letterSpacing: "0.14em" }}>LOADING SQUADS...</span>
        </div>
      ) : (
        <>
          {/* Seeded teams — compact grid */}
          {seeded.length > 0 && (
            <div style={{ marginBottom: 40 }}>
              <div className="mono" style={{ fontSize: 11, letterSpacing: "0.12em", color: "var(--sg-text-muted)", marginBottom: 16 }}>
                SQUADS AVAILABLE — {seeded.length} TEAMS
              </div>
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
                gap: 10,
              }}>
                {seeded.map((team) => (
                  <TeamCard key={team.slug} team={team} />
                ))}
              </div>
            </div>
          )}

          {/* Coming soon teams */}
          {unseeded.length > 0 && (
            <div>
              <div className="mono" style={{ fontSize: 11, letterSpacing: "0.12em", color: "var(--sg-text-muted)", marginBottom: 16 }}>
                COMING SOON — {unseeded.length} TEAMS
              </div>
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))",
                gap: 8,
              }}>
                {unseeded.map((team) => (
                  <TeamCard key={team.slug} team={team} dimmed />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </section>
  );
}

function TeamCard({ team, dimmed = false }: { team: TeamWithCount; dimmed?: boolean }) {
  const card = (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 10,
        padding: "12px 14px",
        borderRadius: 12,
        border: "1px solid var(--sg-border)",
        background: "var(--sg-surface-low)",
        opacity: dimmed ? 0.45 : 1,
        transition: "opacity 0.2s, border-color 0.2s, transform 0.15s",
        cursor: dimmed ? "default" : "pointer",
        userSelect: "none",
      }}
      onMouseEnter={(e) => {
        if (!dimmed) {
          (e.currentTarget as HTMLDivElement).style.borderColor = team.primary;
          (e.currentTarget as HTMLDivElement).style.transform = "translateY(-2px)";
        }
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.borderColor = "var(--sg-border)";
        (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
      }}
    >
      {/* Colour accent */}
      <div style={{ height: 3, borderRadius: 2, background: `linear-gradient(90deg, ${team.primary}, ${team.secondary})` }} />
      {/* Team name */}
      <span style={{ fontFamily: "var(--font-headline)", fontWeight: 700, fontSize: 13, letterSpacing: "0.02em", lineHeight: 1.3 }}>
        {team.nameEn}
      </span>
      {/* Confederation + count */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span className="mono" style={{ fontSize: 10, letterSpacing: "0.08em", color: "var(--sg-text-muted)" }}>
          {team.confederation}
        </span>
        {!dimmed && (
          <span className="mono" style={{ fontSize: 10, letterSpacing: "0.08em", color: "var(--accent)", fontWeight: 600 }}>
            {team.playerCount}P
          </span>
        )}
      </div>
    </div>
  );

  if (dimmed) return card;
  return <Link href={`/wc-2026/${team.slug}`} style={{ textDecoration: "none", color: "inherit" }}>{card}</Link>;
}
