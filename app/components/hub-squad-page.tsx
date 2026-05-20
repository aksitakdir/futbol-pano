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
import { getHubConfig } from "@/lib/hub-config";
import { getWcTeam } from "@/lib/wc-2026-teams";
import { loadWcSquad, type WcSquadListPlayer } from "@/lib/wc-squad-loader";
import { WC_2026_GRADIENT } from "@/lib/wc-2026-brand";

type Props = {
  locale?: string;
  countrySlug: string;
};

export default function HubSquadPage({ countrySlug }: Props) {
  const hub = getHubConfig("wc-2026");
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

      <header style={{ background: `${WC_2026_GRADIENT}, var(--sg-surface-low)`, borderBottom: "1px solid var(--sg-border)" }}>
        <PageShell className="sg-page-shell--section">
          <Link href={hub.kadrolarPath} className="mono wc-squad-back">{copy.back}</Link>
          <div style={{ display: "flex", alignItems: "center", gap: 20, marginTop: 20 }}>
            <WcTeamFlag slug={countrySlug} name={teamName} size="lg" />
            <div>
              <div className="eyebrow wc-eyebrow" style={{ marginBottom: 8 }}>{copy.eyebrow}</div>
              <h1 className="display hub-pillar-title hub-pillar-title--wc" style={{ fontSize: "clamp(32px, 5vw, 56px)", margin: 0 }}>
                {teamName}
              </h1>
            </div>
          </div>
          <p className="mono" style={{ fontSize: 10, color: "var(--sg-text-muted)", marginTop: 16, letterSpacing: "0.12em" }}>
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
