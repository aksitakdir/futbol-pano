"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import PageShell from "@/app/components/page-shell";
import type { HubTransferScenario } from "@/lib/hub-types";
import { TRANSFER_SCENARIOS_SORTED } from "@/lib/transfer-scenarios";

type Props = { locale?: string };

const STATIC: HubTransferScenario[] = TRANSFER_SCENARIOS_SORTED.map((s) => ({
  id: s.id,
  playerName: s.playerName,
  fromClub: s.fromClub,
  toClub: s.toClub,
  likelihood: s.likelihood,
  note: s.note,
}));

export default function TransferScenariosSection({ locale }: Props) {
  const [scenarios, setScenarios] = useState<HubTransferScenario[]>(STATIC);
  const [source, setSource] = useState<"database" | "static">("static");

  useEffect(() => {
    fetch("/api/transfer-hub")
      .then((r) => r.json())
      .then((d) => {
        if (d.scenarios?.length) {
          setScenarios(d.scenarios);
          setSource(d.source?.scenarios ?? "database");
        }
      })
      .catch(() => {});
  }, []);

  const copy = {
    eyebrow: "TRANSFER LIKELIHOOD",
    title: "Possible transfer scenarios",
    sub:
      source === "database"
        ? "Scout ranking — updated via admin and API."
        : "Scout ranking — exit probability and club fit.",
    likelihood: "Likelihood",
    abLink: "A or B? Community poll →",
  };

  const abHref = "/en/transfers/will-they-go";
  const sorted = [...scenarios].sort((a, b) => b.likelihood - a.likelihood);

  return (
    <PageShell as="section" id="transfer-scenarios" className="sg-page-shell--section transfer-scenarios-section">
      <div className="eyebrow transfer-eyebrow">{copy.eyebrow}</div>
      <h2 className="display transfer-scenarios-section__title">{copy.title}</h2>
      <p className="transfer-scenarios-section__sub">{copy.sub}</p>

      <ol className="transfer-scenario-rank-list">
        {sorted.map((s, idx) => (
          <li key={s.id} className="transfer-scenario-rank">
            <span className="transfer-scenario-rank__num mono">{idx + 1}</span>
            <div className="transfer-scenario-rank__main">
              <span className="transfer-scenario-rank__player display">{s.playerName}</span>
              <span className="transfer-scenario-rank__clubs mono">
                {s.fromClub} → {s.toClub}
              </span>
              <span className="transfer-scenario-rank__note">{s.note}</span>
            </div>
            <div className="transfer-scenario-rank__meter-wrap">
              <span className="mono transfer-scenario-rank__pct">{s.likelihood}%</span>
              <span className="transfer-scenario-rank__meter" role="presentation">
                <span className="transfer-scenario-rank__fill" style={{ width: `${s.likelihood}%` }} />
              </span>
              <span className="mono transfer-scenario-rank__meter-label">{copy.likelihood}</span>
            </div>
          </li>
        ))}
      </ol>

      <p style={{ marginTop: 24 }}>
        <Link href={abHref} className="mono u-link" style={{ fontSize: 11, letterSpacing: "0.14em" }}>
          {copy.abLink}
        </Link>
      </p>
    </PageShell>
  );
}
