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
import CompletedTransfersSection from "./hub/completed-transfers-section";
import HubTransferTeamArenas from "./hub/hub-transfer-team-arenas";
import { getHubConfig, type HubId, type HubLocale } from "@/lib/hub-config";
import { WC_2026_HERO_BG } from "@/lib/wc-2026-brand";
import type { HubPillarCopy } from "@/lib/hub-types";

type Props = {
  hubId: HubId;
  locale: HubLocale;
};

export default function HubPillarPage({ hubId, locale }: Props) {
  const defaults = getHubConfig(hubId, locale);
  const [copy, setCopy] = useState<HubPillarCopy>({
    navLabel: defaults.navLabel,
    pillarEyebrow: defaults.pillarEyebrow,
    pillarTitle: defaults.pillarTitle,
    pillarDescription: defaults.pillarDescription,
  });

  useEffect(() => {
    fetch(`/api/hub-settings?hub=${hubId}&locale=${locale}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.copy) setCopy(d.copy);
      })
      .catch(() => {});
  }, [hubId, locale]);

  const hub = { ...defaults, ...copy };
  const isWc = hubId === "wc-2026";
  const themeClass = isWc ? "theme-wc-2026" : "theme-transfer";

  const cta =
    locale === "tr"
      ? { kadrolar: "48 Takım Kadroları", completed: "Gerçekleşen Transferler" }
      : { kadrolar: "48 Team Squads", completed: "Done Deals" };

  const navKey = hubId === "wc-2026" ? "wc-2026" : "transfer";
  const accent = isWc ? "var(--wc-gold)" : "var(--transfer-cyan)";

  return (
    <main className={themeClass} style={{ background: "var(--sg-bg)", color: "var(--sg-text-primary)", minHeight: "100vh" }}>
      <SiteHeader activeNav={navKey} forceEn={locale === "en"} />
      <div style={{ paddingTop: "68px" }} />

      <header
        className={`hub-pillar-hero grain${isWc ? " hub-pillar-hero--wc" : " hub-pillar-hero--transfer"}`}
        style={isWc ? { background: WC_2026_HERO_BG } : undefined}
      >
        <PageShell className="sg-page-shell--hero" style={{ position: "relative" }}>
          {isWc ? <span className="wc-hero-glow" aria-hidden /> : null}
          <div className={`eyebrow ${isWc ? "wc-eyebrow" : "transfer-eyebrow"}`}>{hub.pillarEyebrow}</div>
          <h1 className={`display hub-pillar-title${isWc ? " hub-pillar-title--wc" : " hub-pillar-title--transfer"}`}>
            {hub.pillarTitle}
          </h1>
          <p className="hub-pillar-description">{hub.pillarDescription}</p>
          <div className="hub-pillar-ctas flex flex-wrap items-center gap-x-6 gap-y-3">
            {isWc ? (
              <Link
                href={defaults.kadrolarPath}
                className="btn btn-solid"
                style={{ background: "var(--wc-magenta)", borderColor: "var(--wc-magenta)" }}
              >
                {cta.kadrolar} →
              </Link>
            ) : (
              <Link href="#completed-transfers" className="btn btn-solid hub-pillar-cta">
                {cta.completed} →
              </Link>
            )}
          </div>
        </PageShell>
      </header>

      {!isWc ? (
        <>
          <CompletedTransfersSection locale={locale} />
          <HubTransferTeamArenas locale={locale} />
        </>
      ) : null}

      <HubEditorialSection hubId={hubId} locale={locale} accent={accent} />

      {isWc ? (
        <PageShell as="section" className="sg-page-shell--section" style={{ paddingTop: 0 }}>
          <div className="eyebrow" style={{ marginBottom: 24 }}>
            {locale === "tr" ? "48 TAKIM" : "48 TEAMS"}
          </div>
          <WcTeamGrid locale={locale} kadrolarBasePath={defaults.kadrolarPath} />
        </PageShell>
      ) : null}

      {isWc ? <HubFeaturedArenaBanner hubId={hubId} locale={locale} /> : null}

      <HubArenaStrip hubId={hubId} locale={locale} />

      <div style={{ paddingBottom: 80 }} />

      <SiteFooter maxWidth="max-w-7xl" />
    </main>
  );
}
