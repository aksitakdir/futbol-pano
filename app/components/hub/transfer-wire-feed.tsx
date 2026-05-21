"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import PageShell from "@/app/components/page-shell";
import EditorialContentFeed from "@/app/components/editorial-content-feed";
import { categoryArticlePath } from "@/lib/hub-config";
import { supabase } from "@/lib/supabase";
import { rowToCompleted } from "@/lib/hub-types";
import type { HubCompletedTransfer, HubCompletedTransferRow } from "@/lib/hub-types";
import type { EditorialArticle } from "@/lib/editorial-article";
import type { TransferWireHeadline } from "@/lib/transfer-wire-cache";

const SOURCE_COLORS: Record<string, string> = {
  bbc: "#bb1919",
  sky: "#0082ca",
  espn: "#d00",
  guardian: "#052962",
  google: "#22d3ee",
  other: "#94a3b8",
};

const shell = {
  panel: {
    border: "1px solid var(--sg-border)",
    borderRadius: 20,
    background: "var(--sg-surface)",
    overflow: "hidden" as const,
  },
  panelAccent: {
    height: 3,
    background: "linear-gradient(90deg, var(--transfer-cyan), var(--transfer-mint))",
  },
};

function isRecentDeal(dateStr: string): boolean {
  const m = dateStr.match(/^(\d{4})-(\d{2})/);
  if (!m) return false;
  const deal = new Date(Number(m[1]), Number(m[2]) - 1, 1);
  const cutoff = new Date();
  cutoff.setMonth(cutoff.getMonth() - 4);
  return deal >= cutoff;
}

type Props = { initialLimit?: number };

export default function TransferWireFeed({ initialLimit = 20 }: Props) {
  const [headlines, setHeadlines] = useState<TransferWireHeadline[]>([]);
  const [wireLoading, setWireLoading] = useState(true);
  const [wireUpdated, setWireUpdated] = useState<string | null>(null);
  const [showCount, setShowCount] = useState(initialLimit);
  const [articles, setArticles] = useState<EditorialArticle[]>([]);
  const [deals, setDeals] = useState<HubCompletedTransfer[]>([]);

  useEffect(() => {
    async function loadWire() {
      try {
        let res = await fetch("/api/transfer-wire", { cache: "no-store" });
        let data = await res.json();
        if (!data.headlines?.length) {
          res = await fetch("/api/transfer-wire?refresh=1", { cache: "no-store" });
          data = await res.json();
        }
        if (!data.headlines?.length) {
          const newsRes = await fetch(
            "/api/news?query=football transfer rumors&locale=en",
            { cache: "no-store" },
          );
          const news = await newsRes.json();
          if (Array.isArray(news) && news.length > 0) {
            data.headlines = news.map(
              (n: { title: string; link: string; source: string; date: string }, i: number) => ({
                id: `news-fallback-${i}`,
                title: n.title,
                link: n.link,
                source: "google",
                sourceLabel: n.source || "Google News",
                publishedAt: "",
                timeLabel: n.date || "recent",
              }),
            );
            data.updatedAt = new Date().toISOString();
          }
        }
        setHeadlines(data.headlines ?? []);
        setWireUpdated(data.updatedAt ?? null);
      } catch {
        setHeadlines([]);
      } finally {
        setWireLoading(false);
      }
    }
    loadWire();
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
        .neq("source", "seed")
        .order("sort_order", { ascending: false })
        .order("transfer_date", { ascending: false })
        .limit(12),
    ]).then(([artRes, dealsRes]) => {
      if (!artRes.error && artRes.data) setArticles(artRes.data as EditorialArticle[]);
      if (!dealsRes.error && dealsRes.data) {
        const rows = (dealsRes.data as HubCompletedTransferRow[]).map(rowToCompleted);
        setDeals(rows.filter((d) => isRecentDeal(d.date)));
      }
    });
  }, []);

  const visible = headlines.slice(0, showCount);

  return (
    <PageShell
      as="section"
      id="transfer-wire"
      shellClass="sg-editorial-shell"
      className="sg-page-shell--section"
      style={{ paddingTop: "clamp(48px, 7vw, 80px)", paddingBottom: "clamp(48px, 7vw, 96px)" }}
    >
      {/* Disclaimer */}
      <div
        style={{
          marginBottom: 32,
          padding: "14px 18px",
          borderRadius: 12,
          border: "1px solid color-mix(in oklch, var(--transfer-cyan) 35%, var(--sg-border))",
          background: "color-mix(in oklch, var(--transfer-cyan) 8%, var(--sg-surface-low))",
          fontSize: 13,
          lineHeight: 1.5,
          color: "var(--sg-text-muted)",
        }}
      >
        <span className="mono" style={{ fontSize: 10, letterSpacing: "0.14em", color: "var(--transfer-cyan)", display: "block", marginBottom: 6 }}>
          AGGREGATED HEADLINES
        </span>
        Rumors from BBC, Sky, Guardian & Google News — not confirmed by Scout Gamer. External links open the original publisher.
      </div>

      {/* LIVE WIRE — primary feed */}
      <div style={{ marginBottom: 56 }}>
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "baseline", gap: 12, marginBottom: 20 }}>
          <div>
            <div className="eyebrow transfer-eyebrow">LIVE WIRE</div>
            <h2 className="display" style={{ fontSize: "clamp(22px, 3.5vw, 32px)", fontWeight: 700, letterSpacing: "-0.03em", margin: "8px 0 0" }}>
              Transfer rumors
            </h2>
          </div>
          {wireUpdated ? (
            <span className="mono" style={{ fontSize: 10, letterSpacing: "0.1em", color: "var(--sg-text-muted)" }}>
              Updated {new Date(wireUpdated).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })}
            </span>
          ) : null}
        </div>

        <div style={shell.panel}>
          <div style={shell.panelAccent} />
          {wireLoading ? (
            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: 40, color: "var(--sg-text-muted)" }}>
              <span className="h-4 w-4 animate-spin rounded-full border-2" style={{ borderColor: "var(--transfer-cyan)", borderTopColor: "transparent" }} />
              <span className="mono" style={{ fontSize: 11, letterSpacing: "0.12em" }}>LOADING…</span>
            </div>
          ) : visible.length === 0 ? (
            <p className="mono" style={{ padding: 40, textAlign: "center", fontSize: 12, color: "var(--sg-text-muted)" }}>
              No headlines right now.
            </p>
          ) : (
            <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
              {visible.map((h, i) => {
                const accent = SOURCE_COLORS[h.source] ?? SOURCE_COLORS.other;
                return (
                  <li key={h.id} style={{ borderBottom: i < visible.length - 1 ? "1px solid var(--sg-border)" : "none" }}>
                    <a
                      href={h.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="lift"
                      style={{
                        display: "grid",
                        gridTemplateColumns: "auto 1fr auto auto",
                        gap: "12px 16px",
                        alignItems: "center",
                        padding: "18px 20px",
                        textDecoration: "none",
                        color: "inherit",
                        transition: "background 0.15s",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "var(--sg-surface-low)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "transparent";
                      }}
                    >
                      <span
                        className="mono"
                        style={{
                          fontSize: 9,
                          fontWeight: 700,
                          letterSpacing: "0.1em",
                          color: accent,
                          padding: "5px 10px",
                          borderRadius: 999,
                          border: `1px solid ${accent}55`,
                          background: `${accent}18`,
                          whiteSpace: "nowrap",
                        }}
                      >
                        {h.sourceLabel}
                      </span>
                      <span className="display" style={{ fontSize: 15, fontWeight: 500, lineHeight: 1.35, margin: 0 }}>
                        {h.title}
                      </span>
                      <span className="mono" style={{ fontSize: 10, letterSpacing: "0.08em", color: "var(--sg-text-muted)", whiteSpace: "nowrap" }}>
                        {h.timeLabel}
                      </span>
                      <span className="mono" style={{ fontSize: 12, color: "var(--transfer-cyan)", opacity: 0.8 }} aria-hidden>
                        ↗
                      </span>
                    </a>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {showCount < headlines.length ? (
          <div style={{ display: "flex", justifyContent: "center", marginTop: 24 }}>
            <button type="button" className="btn" onClick={() => setShowCount((n) => n + 20)}>
              LOAD MORE →
            </button>
          </div>
        ) : null}
      </div>

      {/* Scout analysis — same feed as homepage editorial */}
      {articles.length > 0 ? (
        <div style={{ marginBottom: deals.length > 0 ? 48 : 0 }}>
          <div className="eyebrow" style={{ color: "var(--transfer-mint)", marginBottom: 20 }}>
            SCOUT ANALYSIS
          </div>
          <EditorialContentFeed
            articles={articles}
            accent="var(--transfer-cyan)"
            emptyMessage=""
            gridEyebrow="MORE ANALYSIS"
            featuredChip="SCOUT TAKE"
          />
        </div>
      ) : null}

      {/* Confirmed deals — only admin/manual, last 4 months */}
      {deals.length > 0 ? (
        <div>
          <div className="eyebrow transfer-eyebrow" style={{ marginBottom: 16 }}>
            CONFIRMED DEALS
          </div>
          <div style={{ display: "grid", gap: 10 }}>
            {deals.map((t) => (
              <div
                key={t.id}
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr auto",
                  gap: "4px 20px",
                  alignItems: "center",
                  padding: "16px 18px",
                  borderRadius: 14,
                  border: "1px solid var(--sg-border)",
                  background: "var(--sg-surface-low)",
                }}
              >
                <span className="display" style={{ fontSize: 16, fontWeight: 600 }}>
                  {t.playerName}
                </span>
                <span className="mono" style={{ fontSize: 10, color: "var(--transfer-mint)", textAlign: "right", gridRow: "1 / 3" }}>
                  {t.feeEn}
                  <span style={{ margin: "0 6px", opacity: 0.5 }}>·</span>
                  {t.date}
                </span>
                <span className="mono" style={{ fontSize: 10, letterSpacing: "0.1em", color: "var(--sg-text-muted)" }}>
                  {t.fromClub} → {t.toClub}
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </PageShell>
  );
}
