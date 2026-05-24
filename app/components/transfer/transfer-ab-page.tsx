"use client";

import Link from "next/link";
import SiteHeader from "@/app/components/site-header";
import SiteFooter from "@/app/components/site-footer";
import TransferAbPollCard from "@/app/components/transfer/transfer-ab-poll-card";
import HubArenaStrip from "@/app/components/hub/hub-arena-strip";
import HubEditorialSection from "@/app/components/hub/hub-editorial-section";
import PageShell from "@/app/components/page-shell";
import { TRANSFER_AB_POLLS } from "@/lib/transfer-polls";

type Props = { locale?: string };

export default function TransferAbPage(_props: Props) {
  return (
    <main className="theme-transfer" style={{ background: "var(--sg-bg)", color: "var(--sg-text-primary)", minHeight: "100vh" }}>
      <SiteHeader activeNav="transfer" />
      <div style={{ paddingTop: "68px" }} />

      <header className="transfer-hero grain">
        <PageShell className="sg-page-shell--hero">
          <Link href="/transfers" className="mono transfer-squad-back">← Transfers</Link>
          <div className="eyebrow transfer-eyebrow" style={{ marginTop: 28 }}>TRANSFER POLL</div>
          <h1 className="display grad-text" style={{ fontSize: "clamp(40px, 6vw, 64px)", fontWeight: 700, letterSpacing: "-0.04em", margin: "12px 0 16px" }}>
            Will they go?
          </h1>
          <p style={{ fontSize: 17, lineHeight: 1.55, color: "var(--sg-text-secondary)", maxWidth: 560 }}>
            A or B — the community transfer call. Pick a side and watch the bars move.
          </p>
        </PageShell>
      </header>

      <PageShell as="section" className="sg-page-shell--section transfer-ab-shell">
        <div className="transfer-ab-list">
          {TRANSFER_AB_POLLS.map((poll) => (
            <TransferAbPollCard key={poll.id} poll={poll} locale="en" />
          ))}
        </div>
      </PageShell>

      <HubEditorialSection hubId="transfer" locale="en" accent="var(--transfer-cyan)" compact />
      <HubArenaStrip hubId="transfer" locale="en" />
      <SiteFooter maxWidth="max-w-7xl" />
    </main>
  );
}
