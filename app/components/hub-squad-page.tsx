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
import { getHubConfig, type HubLocale } from "@/lib/hub-config";
import { getWcTeam } from "@/lib/wc-2026-teams";
import { loadWcSquad, type WcSquadListPlayer } from "@/lib/wc-squad-loader";
import { WC_2026_GRADIENT } from "@/lib/wc-2026-brand";

type Props = {
  locale: HubLocale;
  countrySlug: string;
};

export default function HubSquadPage({ locale, countrySlug }: Props) {
  const hub = getHubConfig("wc-2026", locale);
  const team = getWcTeam(countrySlug);
  const [players, setPlayers] = useState<WcSquadListPlayer[]>([]);
  const [loading, setLoading] = useState(true);

  const teamName = team ? (locale === "tr" ? team.nameTr : team.nameEn) : countrySlug;
  const teamPrimary = team?.primary ?? "var(--wc-gold)";

  useEffect(() => {
    if (!team) {
      setLoading(false);
      return;
    }
    loadWcSquad(countrySlug).then((rows) => {
      setPlayers(rows);
      setLoading(false);
    });
  }, [countrySlug, team]);

  const copy =
    locale === "tr"
      ? {
          back: "← 48 takım",
          eyebrow: "KADRO · MEVKİ",
          updated: "Scout Gamer kadro görünümü — FC veritabanı ile zenginleştirilir",
        }
      : {
          back: "← 48 teams",
          eyebrow: "SQUAD · BY POSITION",
          updated: "Scout Gamer squad view — enriched from FC database",
        };

  if (!team) {
    return (
      <main className="theme-wc-2026" style={{ background: "var(--sg-bg)", minHeight: "100vh" }}>
        <SiteHeader activeNav="wc-2026" forceEn={locale === "en"} />
        <div style={{ paddingTop: 68, padding: "120px 32px", textAlign: "center" }}>404</div>
        <SiteFooter />
      </main>
    );
  }

  return (
    <main className="theme-wc-2026" style={{ background: "var(--sg-bg)", color: "var(--sg-text-primary)", minHeight: "100vh" }}>
      <SiteHeader activeNav="wc-2026" forceEn={locale === "en"} />
      <div style={{ paddingTop: "68px" }} />

      <header className="wc-squad-hero grain" style={{ borderBottom: "1px solid var(--sg-border)" }}>
        <PageShell className="sg-page-shell--hero">
          <Link href={hub.kadrolarPath} className="mono wc-squad-back">
            {copy.back}
          </Link>
          <div className="eyebrow wc-eyebrow" style={{ marginTop: 28 }}>
            {copy.eyebrow}
          </div>
          <div className="wc-squad-hero-title-row">
            <WcTeamFlag slug={countrySlug} name={teamName} size="lg" className="wc-squad-hero-flag-img" />
            <div>
              <h1
                className="display"
                style={{
                  fontSize: "clamp(36px, 5vw, 56px)",
                  fontWeight: 700,
                  letterSpacing: "-0.04em",
                  margin: "0 0 8px",
                  background: WC_2026_GRADIENT,
                  WebkitBackgroundClip: "text",
                  backgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                {teamName}
              </h1>
              <p className="mono" style={{ fontSize: 11, letterSpacing: "0.12em", color: "var(--sg-text-muted)", margin: 0 }}>
                {team.code} · {copy.updated}
              </p>
            </div>
          </div>
          <div
            className="wc-squad-hero-flag"
            style={{
              marginTop: 24,
              height: 4,
              borderRadius: 2,
              background: `linear-gradient(90deg, ${team.primary}, ${team.secondary}, ${team.primary})`,
            }}
          />
        </PageShell>
      </header>

      <PageShell as="section" className="sg-page-shell--section">
        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: 64 }}>
            <span className="h-6 w-6 animate-spin rounded-full border-2" style={{ borderColor: "var(--wc-gold)", borderTopColor: "transparent" }} />
          </div>
        ) : (
          <WcSquadDisplay players={players} locale={locale} teamName={teamName} teamPrimary={teamPrimary} />
        )}
      </PageShell>

      <HubEditorialSection hubId="wc-2026" locale={locale} accent="var(--wc-gold)" compact />

      <HubArenaStrip hubId="wc-2026" locale={locale} teamSlug={countrySlug} />

      <SiteFooter maxWidth="max-w-7xl" />
    </main>
  );
}
