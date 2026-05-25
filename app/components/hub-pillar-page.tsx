"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import SiteHeader from "./site-header";
import SiteFooter from "./site-footer";
import PageShell from "./page-shell";
import WcTeamGrid from "./wc/wc-team-grid";
import HubArenaStrip from "./hub/hub-arena-strip";
import HubEditorialSection from "./hub/hub-editorial-section";
import HubFeaturedArenaBanner from "./hub/hub-featured-arena-banner";
import TransferWireFeed from "./hub/transfer-wire-feed";
import { WC_2026_HERO_BG } from "@/lib/wc-2026-brand";

const PAGE_CONFIG = {
  "wc-2026": {
    navKey: "wc-2026" as const,
    accent: "var(--wc-gold)",
    themeClass: "theme-wc-2026",
    kadrolarPath: "/world-cup-2026/squads",
    defaults: {
      pillarEyebrow: "TOURNAMENT",
      pillarTitle: "World Cup 2026",
      pillarDescription:
        "Squads, scout analysis, and tournament lists — not headlines, scout reports.",
    },
  },
  transfer: {
    navKey: "transfer" as const,
    accent: "var(--transfer-cyan)",
    themeClass: "theme-transfer",
    kadrolarPath: "/transfers",
    defaults: {
      pillarEyebrow: "TRANSFERS",
      pillarTitle: "Transfers",
      pillarDescription:
        "Transfer Wire — rumors from trusted public sources, scout analysis, and confirmed deals.",
    },
  },
};

type PillarCopy = {
  navLabel?: string;
  pillarEyebrow?: string;
  pillarTitle?: string;
  pillarDescription?: string;
};

type Props = {
  hubId: "wc-2026" | "transfer";
  locale?: string;
};

export default function HubPillarPage({ hubId }: Props) {
  const cfg = PAGE_CONFIG[hubId];
  const [copy, setCopy] = useState<PillarCopy>(cfg.defaults);

  useEffect(() => {
    fetch(`/api/hub-settings?hub=${hubId}&locale=en`)
      .then((r) => r.json())
      .then((d) => { if (d.copy) setCopy(d.copy); })
      .catch(() => {});
  }, [hubId]);

  const hub = { ...cfg.defaults, ...copy };
  const isWc = hubId === "wc-2026";

  return (
    <main className={cfg.themeClass} style={{ background: "var(--sg-bg)", color: "var(--sg-text-primary)", minHeight: "100vh" }}>
      <SiteHeader activeNav={cfg.navKey} />
      <div style={{ paddingTop: "68px" }} />

      <header
        className={`hub-pillar-hero grain${isWc ? " hub-pillar-hero--wc" : " hub-pillar-hero--transfer"}`}
        style={isWc ? { background: WC_2026_HERO_BG } : undefined}
      >
        <PageShell shellClass="sg-hero-text-block" className="sg-page-shell--hero" style={{ position: "relative" }}>
          {isWc ? <span className="wc-hero-glow" aria-hidden /> : null}
          <div className={`eyebrow ${isWc ? "wc-eyebrow" : "transfer-eyebrow"}`}>{hub.pillarEyebrow}</div>
          <h1 className={`display hub-pillar-title${isWc ? " hub-pillar-title--wc" : " hub-pillar-title--transfer"}`}>
            {hub.pillarTitle}
          </h1>
          <p className="hub-pillar-description">{hub.pillarDescription}</p>
          <div className="hub-pillar-ctas flex flex-wrap items-center gap-x-6 gap-y-3">
            {isWc ? (
              <>
                <Link href="/world-cup-2026/schedule" className="btn btn-solid" style={{ background: "var(--wc-gold)", borderColor: "var(--wc-gold)" }}>
                  Match Schedule →
                </Link>
                <Link href={cfg.kadrolarPath} className="btn btn-solid" style={{ background: "var(--wc-magenta)", borderColor: "var(--wc-magenta)" }}>
                  48 Team Squads →
                </Link>
              </>
            ) : (
              <Link href="#transfer-wire" className="btn btn-solid hub-pillar-cta">
                Transfer Wire →
              </Link>
            )}
          </div>
        </PageShell>
      </header>

      {!isWc ? (
        <div className="theme-transfer">
          <TransferWireFeed />
        </div>
      ) : null}

      {isWc ? <HubEditorialSection hubId={hubId} locale="en" accent={cfg.accent} /> : null}

      {isWc ? (
        <section style={{ borderTop: "1px solid var(--sg-border)", background: "var(--sg-surface-low)" }}>
          <PageShell as="div" className="sg-page-shell--section" style={{ paddingTop: 56, paddingBottom: 56 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
              <div>
                <div className="eyebrow" style={{ color: "var(--wc-gold)", marginBottom: 6 }}>MATCH SCHEDULE</div>
                <h2 className="display" style={{ fontSize: "clamp(22px, 3vw, 30px)", fontWeight: 700, letterSpacing: "-0.03em", margin: 0 }}>
                  104 Matches · June 11 – July 19
                </h2>
              </div>
              <Link href="/world-cup-2026/schedule" className="btn btn-solid" style={{ background: "var(--wc-gold)", borderColor: "var(--wc-gold)" }}>
                Full Schedule →
              </Link>
            </div>
            <p style={{ fontSize: 15, lineHeight: 1.55, color: "var(--sg-text-secondary)", margin: "0 0 0", maxWidth: "50ch" }}>
              Complete fixture list with kick-off times in your local timezone — group stage, Round of 32, quarterfinals, and the final at MetLife Stadium.
            </p>
          </PageShell>
        </section>
      ) : null}

      {isWc ? (
        <PageShell as="section" className="sg-page-shell--section" style={{ paddingTop: 56, paddingBottom: 56 }}>
          <div className="eyebrow" style={{ marginBottom: 24 }}>48 TEAMS</div>
          <WcTeamGrid locale="en" kadrolarBasePath={cfg.kadrolarPath} />
        </PageShell>
      ) : null}

      <HubArenaStrip hubId={hubId} locale="en" />

      <div style={{ paddingBottom: 80 }} />

      <SiteFooter maxWidth="max-w-7xl" />
    </main>
  );
}
