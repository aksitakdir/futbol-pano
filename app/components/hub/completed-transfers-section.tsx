"use client";

import { useEffect, useState } from "react";
import PageShell from "@/app/components/page-shell";
import type { HubCompletedTransfer } from "@/lib/hub-types";
import { COMPLETED_TRANSFERS } from "@/lib/completed-transfers";

type Props = { locale: "tr" | "en" };

const STATIC: HubCompletedTransfer[] = COMPLETED_TRANSFERS.map((t) => ({
  id: t.id,
  playerName: t.playerName,
  fromClub: t.fromClub,
  toClub: t.toClub,
  feeTr: t.feeTr,
  feeEn: t.feeEn,
  date: t.date,
}));

export default function CompletedTransfersSection({ locale }: Props) {
  const [items, setItems] = useState<HubCompletedTransfer[]>(STATIC);
  const [source, setSource] = useState<"database" | "static">("static");

  useEffect(() => {
    fetch("/api/transfer-hub")
      .then((r) => r.json())
      .then((d) => {
        if (d.completed?.length) {
          setItems(d.completed);
          setSource(d.source?.completed ?? "database");
        }
      })
      .catch(() => {});
  }, []);

  const copy =
    locale === "tr"
      ? {
          eyebrow: "GERÇEKLEŞEN",
          title: "Gerçekleşen transferler",
          sub:
            source === "database"
              ? "Resmi hareketler — API-Football ve admin ile güncellenir."
              : "Resmi açıklanan hareketler — scout özeti.",
        }
      : {
          eyebrow: "DONE DEALS",
          title: "Completed transfers",
          sub:
            source === "database"
              ? "Official moves — updated via API-Football and admin."
              : "Official moves — scout digest.",
        };

  return (
    <PageShell as="section" id="completed-transfers" className="sg-page-shell--section completed-transfers-section">
      <div className="eyebrow transfer-eyebrow">{copy.eyebrow}</div>
      <h2 className="display completed-transfers-section__title">{copy.title}</h2>
      <p className="completed-transfers-section__sub">{copy.sub}</p>

      <ul className="completed-transfers-list">
        {items.map((t) => (
          <li key={t.id} className="completed-transfers-list__item">
            <span className="completed-transfers-list__player display">{t.playerName}</span>
            <span className="completed-transfers-list__route mono">
              {t.fromClub} → {t.toClub}
            </span>
            <span className="completed-transfers-list__meta mono">
              <span>{locale === "tr" ? t.feeTr : t.feeEn}</span>
              <span className="completed-transfers-list__sep">·</span>
              <span>{t.date}</span>
            </span>
          </li>
        ))}
      </ul>
    </PageShell>
  );
}
