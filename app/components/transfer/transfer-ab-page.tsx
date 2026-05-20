"use client";

import Link from "next/link";
import SiteHeader from "@/app/components/site-header";
import SiteFooter from "@/app/components/site-footer";
import TransferAbPollCard from "@/app/components/transfer/transfer-ab-poll-card";
import HubArenaStrip from "@/app/components/hub/hub-arena-strip";
import HubEditorialSection from "@/app/components/hub/hub-editorial-section";
import PageShell from "@/app/components/page-shell";
import { getHubConfig } from "@/lib/hub-config";
import { TRANSFER_AB_POLLS } from "@/lib/transfer-polls";

type Props = { locale: "tr" | "en" };

export default function TransferAbPage({ locale }: Props) {
  const hub = getHubConfig("transfer", locale);

  const copy =
    locale === "tr"
      ? {
          back: `← ${hub.pillarTitle}`,
          title: "Gider mi?",
          sub: "A mı B mi — scout topluluğunun transfer tahmini. Bir seçenek işaretle, çubuklar güncellenir.",
        }
      : {
          back: `← ${hub.pillarTitle}`,
          title: "Will they go?",
          sub: "A or B — the community transfer call. Pick a side and watch the bars move.",
        };

  return (
    <main className="theme-transfer" style={{ background: "var(--sg-bg)", color: "var(--sg-text-primary)", minHeight: "100vh" }}>
      <SiteHeader activeNav="transfer" forceEn={locale === "en"} />
      <div style={{ paddingTop: "68px" }} />

      <header className="transfer-hero grain">
        <PageShell className="sg-page-shell--hero">
          <Link href={hub.basePath} className="mono transfer-squad-back">
            {copy.back}
          </Link>
          <div className="eyebrow transfer-eyebrow" style={{ marginTop: 28 }}>
            {locale === "tr" ? "TRANSFER ANKET" : "TRANSFER POLL"}
          </div>
          <h1 className="display grad-text" style={{ fontSize: "clamp(40px, 6vw, 64px)", fontWeight: 700, letterSpacing: "-0.04em", margin: "12px 0 16px" }}>
            {copy.title}
          </h1>
          <p style={{ fontSize: 17, lineHeight: 1.55, color: "var(--sg-text-secondary)", maxWidth: 560 }}>{copy.sub}</p>
        </PageShell>
      </header>

      <PageShell as="section" className="sg-page-shell--section transfer-ab-shell">
        <div className="transfer-ab-list">
          {TRANSFER_AB_POLLS.map((poll) => (
            <TransferAbPollCard key={poll.id} poll={poll} locale={locale} />
          ))}
        </div>
      </PageShell>

      <HubEditorialSection hubId="transfer" locale={locale} accent="var(--transfer-cyan)" compact />

      <HubArenaStrip hubId="transfer" locale={locale} />

      <SiteFooter maxWidth="max-w-7xl" />
    </main>
  );
}
