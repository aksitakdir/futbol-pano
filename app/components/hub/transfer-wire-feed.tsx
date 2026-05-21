"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import PageShell from "@/app/components/page-shell";
import { categoryArticlePath } from "@/lib/hub-config";
import { supabase } from "@/lib/supabase";
import { rowToCompleted } from "@/lib/hub-types";
import type { HubCompletedTransfer, HubCompletedTransferRow } from "@/lib/hub-types";
import { editorialBody, editorialTitle, type EditorialArticle } from "@/lib/editorial-article";
import { stripHtml, estimateReadMinutes } from "@/lib/utils";
import type { TransferWireHeadline } from "@/lib/transfer-wire-cache";
import type { WireSource } from "@/lib/transfer-wire-rss";

const SOURCE_COLORS: Record<WireSource, string> = {
  bbc: "#bb1919",
  sky: "#0082ca",
  espn: "#d00",
  google: "var(--transfer-cyan)",
  other: "var(--sg-text-muted)",
};

type Props = { initialLimit?: number };

export default function TransferWireFeed({ initialLimit = 24 }: Props) {
  const [headlines, setHeadlines] = useState<TransferWireHeadline[]>([]);
  const [wireLoading, setWireLoading] = useState(true);
  const [wireUpdated, setWireUpdated] = useState<string | null>(null);
  const [showCount, setShowCount] = useState(initialLimit);

  const [articles, setArticles] = useState<EditorialArticle[]>([]);
  const [deals, setDeals] = useState<HubCompletedTransfer[]>([]);

  useEffect(() => {
    fetch("/api/transfer-wire")
      .then((r) => r.json())
      .then((d) => {
        setHeadlines(d.headlines ?? []);
        setWireUpdated(d.updatedAt ?? null);
      })
      .catch(() => setHeadlines([]))
      .finally(() => setWireLoading(false));
  }, []);

  useEffect(() => {
    Promise.all([
      supabase
        .from("contents")
        .select("id,title,title_en,slug,category,content,content_en,created_at")
        .eq("status", "yayinda")
        .contains("hub_tags", ["transfer"])
        .order("created_at", { ascending: false })
        .limit(6),
      supabase
        .from("hub_completed_transfers")
        .select("*")
        .eq("is_published", true)
        .order("sort_order", { ascending: false })
        .order("transfer_date", { ascending: false })
        .limit(8),
    ]).then(([artRes, dealsRes]) => {
      if (!artRes.error && artRes.data) setArticles(artRes.data as EditorialArticle[]);
      if (!dealsRes.error && dealsRes.data) {
        setDeals((dealsRes.data as HubCompletedTransferRow[]).map(rowToCompleted));
      }
    });
  }, []);

  const visible = headlines.slice(0, showCount);

  return (
    <PageShell as="section" id="transfer-wire" className="sg-page-shell--section transfer-wire">
      <div className="transfer-wire__header">
        <div className="eyebrow transfer-eyebrow">TRANSFER WIRE</div>
        <h2 className="display transfer-wire__title">Rumors, deals & scout takes</h2>
        <p className="transfer-wire__intro">
          Headlines aggregated from public sources (Google News, BBC Sport, Sky Sports). Not confirmed transfers.
          Scout Gamer analysis and confirmed deals are marked below.
        </p>
      </div>

      {/* Scout analysis */}
      {articles.length > 0 ? (
        <div className="transfer-wire__block">
          <div className="transfer-wire__block-label mono">SCOUT GAMER</div>
          <ul className="transfer-wire-scout-list">
            {articles.map((a) => {
              const title = editorialTitle(a, "en");
              const body = editorialBody(a, "en");
              const href = categoryArticlePath(a.category, a.slug);
              const cat = a.category === "radar" ? "Radar" : a.category === "listeler" ? "Lists" : "Tactics";
              return (
                <li key={a.id}>
                  <Link href={href} className="transfer-wire-scout-card lift">
                    <span className="transfer-wire-scout-card__bar" />
                    <span className="mono transfer-wire-scout-card__tag">{cat}</span>
                    <h3 className="display transfer-wire-scout-card__title">{title}</h3>
                    <p className="transfer-wire-scout-card__teaser">
                      {stripHtml(body).replace(/\s+/g, " ").trim().slice(0, 140)}
                      …
                    </p>
                    <span className="mono transfer-wire-scout-card__meta">
                      {estimateReadMinutes(body)} min · READ →
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}

      {/* Done deals */}
      {deals.length > 0 ? (
        <div className="transfer-wire__block">
          <div className="transfer-wire__block-label mono">CONFIRMED DEALS</div>
          <ul className="transfer-wire-deals">
            {deals.map((t) => (
              <li key={t.id} className="transfer-wire-deals__item">
                <span className="transfer-wire-deals__player display">{t.playerName}</span>
                <span className="transfer-wire-deals__route mono">
                  {t.fromClub} → {t.toClub}
                </span>
                <span className="transfer-wire-deals__meta mono">
                  {t.feeEn}
                  <span className="transfer-wire-deals__sep">·</span>
                  {t.date}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {/* Live wire */}
      <div className="transfer-wire__block">
        <div className="transfer-wire__block-head">
          <div className="transfer-wire__block-label mono">LIVE WIRE</div>
          {wireUpdated ? (
            <span className="mono transfer-wire__updated">
              Updated {new Date(wireUpdated).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })}
            </span>
          ) : null}
        </div>

        {wireLoading ? (
          <div className="transfer-wire__loading">
            <span className="h-4 w-4 animate-spin rounded-full border-2" style={{ borderColor: "var(--transfer-cyan)", borderTopColor: "transparent" }} />
            <span className="mono">LOADING HEADLINES…</span>
          </div>
        ) : visible.length === 0 ? (
          <p className="transfer-wire__empty mono">No headlines available right now. Try again shortly.</p>
        ) : (
          <ul className="transfer-wire-list">
            {visible.map((h) => (
              <li key={h.id}>
                <a
                  href={h.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transfer-wire-list__item lift"
                >
                  <span
                    className="transfer-wire-list__source mono"
                    style={{ ["--wire-source-color" as string]: SOURCE_COLORS[h.source] }}
                  >
                    {h.sourceLabel}
                  </span>
                  <h3 className="transfer-wire-list__title">{h.title}</h3>
                  <span className="mono transfer-wire-list__time">{h.timeLabel}</span>
                  <span className="mono transfer-wire-list__ext" aria-hidden>
                    ↗
                  </span>
                </a>
              </li>
            ))}
          </ul>
        )}

        {showCount < headlines.length ? (
          <div className="transfer-wire__more">
            <button type="button" className="btn" onClick={() => setShowCount((n) => n + 20)}>
              LOAD MORE HEADLINES →
            </button>
          </div>
        ) : null}
      </div>

      <p className="transfer-wire__disclaimer mono">
        External links open third-party sites. Rumors are not verified by Scout Gamer. Confirmed deals are curated in admin.
      </p>
    </PageShell>
  );
}
