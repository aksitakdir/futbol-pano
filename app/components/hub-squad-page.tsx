"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import SiteHeader from "./site-header";
import SiteFooter from "./site-footer";
import PageShell from "./page-shell";
import WcSquadDisplay from "./wc/wc-squad-display";
import WcTeamFlag from "./wc/wc-team-flag";
import HubEditorialSection from "./hub/hub-editorial-section";
import HubArenaStrip from "./hub/hub-arena-strip";
import { getWcTeam } from "@/lib/wc-2026-teams";
import { loadWcSquad, type WcSquadListPlayer } from "@/lib/wc-squad-loader";
import { WC_2026_GRADIENT } from "@/lib/wc-2026-brand";

type Props = {
  locale?: string;
  countrySlug: string;
};

export default function HubSquadPage({ countrySlug }: Props) {
  const team = getWcTeam(countrySlug);
  const [players, setPlayers] = useState<WcSquadListPlayer[]>([]);
  const [loading, setLoading] = useState(true);

  const teamName = team ? team.nameEn : countrySlug;
  const teamPrimary = team?.primary ?? "var(--wc-gold)";

  useEffect(() => {
    if (!team) { setLoading(false); return; }
    loadWcSquad(countrySlug).then((rows) => { setPlayers(rows); setLoading(false); });
  }, [countrySlug, team]);

  const copy = {
    back: "← 48 teams",
    eyebrow: "SQUAD · BY POSITION",
    updated: "Scout Gamer squad view — enriched from FC database",
  };

  if (!team) {
    return (
      <main className="theme-wc-2026" style={{ background: "var(--sg-bg)", minHeight: "100vh" }}>
        <SiteHeader activeNav="wc-2026" />
        <div style={{ paddingTop: 68, padding: "120px 32px", textAlign: "center" }}>404</div>
        <SiteFooter />
      </main>
    );
  }

  return (
    <main className="theme-wc-2026" style={{ background: "var(--sg-bg)", color: "var(--sg-text-primary)", minHeight: "100vh" }}>
      <SiteHeader activeNav="wc-2026" />
      <div style={{ paddingTop: "68px" }} />

      <header style={{ position: "relative", overflow: "hidden", borderBottom: "1px solid var(--sg-border)" }}>
        {/* WC gradient background — subdued behind dark overlay */}
        <div style={{ position: "absolute", inset: 0, background: WC_2026_GRADIENT, opacity: 0.75 }} />
        <div style={{ position: "absolute", inset: 0, background: "var(--sg-bg)", opacity: 0.15 }} />
        <PageShell className="sg-page-shell--section" style={{ position: "relative", zIndex: 1 }}>
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 12 }}>
            <Link href="/world-cup-2026/squads" className="mono wc-squad-back" style={{ color: "#fff" }}>{copy.back}</Link>
            <Link
              href={`/world-cup-2026/schedule/${countrySlug}`}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "6px 16px",
                borderRadius: 999,
                background: "var(--wc-gold)",
                color: "#0d1117",
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "0.08em",
                textDecoration: "none",
                fontFamily: "var(--font-mono-stack)",
              }}
            >
              {teamName} fixtures →
            </Link>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 20, marginTop: 20 }}>
            <WcTeamFlag slug={countrySlug} name={teamName} size="lg" />
            <div>
              <div className="eyebrow wc-eyebrow" style={{ marginBottom: 8 }}>{copy.eyebrow}</div>
              <h1 className="display hub-pillar-title hub-pillar-title--wc" style={{ fontSize: "clamp(32px, 5vw, 56px)", margin: 0 }}>
                {teamName}
              </h1>
            </div>
          </div>
          <p className="mono" style={{ fontSize: 10, color: "rgba(255,255,255,0.85)", marginTop: 16, letterSpacing: "0.12em" }}>
            {copy.updated}
          </p>
        </PageShell>
      </header>

      <PageShell as="section" className="sg-page-shell--section">
        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: "60px 0" }}>
            <span className="h-6 w-6 animate-spin rounded-full border-2" style={{ borderColor: teamPrimary, borderTopColor: "transparent" }} />
          </div>
        ) : (
          <WcSquadDisplay players={players} teamPrimary={teamPrimary} locale="en" teamName={teamName} />
        )}
      </PageShell>

      <HubEditorialSection hubId="wc-2026" locale="en" accent="var(--wc-gold)" />
      <HubArenaStrip hubId="wc-2026" locale="en" />
      <div style={{ paddingBottom: 80 }} />
      <SiteFooter maxWidth="max-w-7xl" />
    </main>
  );
}
