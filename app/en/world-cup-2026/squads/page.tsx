"use client";

import Link from "next/link";
import SiteHeader from "../../../components/site-header";
import SiteFooter from "../../../components/site-footer";
import WcTeamGrid from "../../../components/wc/wc-team-grid";
import PageShell from "../../../components/page-shell";
import { getHubConfig } from "@/lib/hub-config";
import { WC_2026_TEAM_COUNT } from "@/lib/wc-2026-teams";

export default function SquadsIndexPage() {
  const hub = getHubConfig("wc-2026", "en");

  return (
    <main className="theme-wc-2026" style={{ background: "var(--sg-bg)", color: "var(--sg-text-primary)", minHeight: "100vh" }}>
      <SiteHeader activeNav="wc-2026" forceEn />
      <div style={{ paddingTop: "68px" }} />
      <PageShell className="sg-page-shell--section">
        <Link href={hub.basePath} className="mono wc-squad-back">
          ← {hub.pillarTitle}
        </Link>
        <h1 className="display" style={{ fontSize: "clamp(40px, 6vw, 56px)", fontWeight: 700, letterSpacing: "-0.04em", margin: "24px 0 8px" }}>
          {WC_2026_TEAM_COUNT} Team Squads
        </h1>
        <p style={{ color: "var(--sg-text-secondary)", marginBottom: 40, maxWidth: 520 }}>
          Scout view by position — from goalkeepers to forwards.
        </p>
        <WcTeamGrid locale="en" kadrolarBasePath={hub.kadrolarPath} />
      </PageShell>
      <SiteFooter maxWidth="max-w-7xl" />
    </main>
  );
}
