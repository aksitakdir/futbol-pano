"use client";

import { useEffect, useMemo, useState } from "react";
import PageShell from "@/app/components/page-shell";
import EditorialContentFeed from "@/app/components/editorial-content-feed";
import { supabase } from "@/lib/supabase";
import { rowToCompleted } from "@/lib/hub-types";
import type { HubCompletedTransfer, HubCompletedTransferRow } from "@/lib/hub-types";
import type { EditorialArticle } from "@/lib/editorial-article";
import type { TransferWireHeadline } from "@/lib/transfer-wire-cache";
import {
  WIRE_SOURCE_LABELS,
  groupHeadlinesByTime,
  relativeTimeLabel,
  resolveWireSource,
  wireItemId,
  type WireSource,
} from "@/lib/transfer-wire-rss";

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

type SourceFilter = "all" | WireSource;
type SortMode = "newest" | "oldest";

const SOURCE_TABS: { id: SourceFilter; label: string; short: string }[] = [
  { id: "all", label: "All sources", short: "All" },
  { id: "bbc", label: WIRE_SOURCE_LABELS.bbc, short: "BBC" },
  { id: "sky", label: WIRE_SOURCE_LABELS.sky, short: "Sky" },
  { id: "guardian", label: WIRE_SOURCE_LABELS.guardian, short: "Guardian" },
  { id: "espn", label: WIRE_SOURCE_LABELS.espn, short: "ESPN" },
  { id: "google", label: WIRE_SOURCE_LABELS.google, short: "Google" },
];

/** Single lightweight fallback if cache empty (never 6 parallel /api/news calls) */
async function fetchMinimalNewsFallback(): Promise<TransferWireHeadline[]> {
  try {
    const res = await fetch("/api/news?query=transfer+rumors&locale=en&limit=8");
    if (!res.ok) return [];
    const items = (await res.json()) as {
      title: string;
      link: string;
      source: string;
      date: string;
      publishedAt?: string;
    }[];
    if (!Array.isArray(items)) return [];
    return items.map((n) => {
      const { source, sourceLabel } = resolveWireSource(n.title, n.link, n.source);
      return {
        id: wireItemId(n.link, n.title),
        title: n.title,
        link: n.link,
        source,
        sourceLabel: sourceLabel || WIRE_SOURCE_LABELS[source],
        publishedAt: n.publishedAt ?? "",
        timeLabel: n.publishedAt ? relativeTimeLabel(n.publishedAt) : n.date || "recent",
      };
    });
  } catch {
    return [];
  }
}

type Props = { initialLimit?: number };

export default function TransferWireFeed({ initialLimit = 40 }: Props) {
  const [headlines, setHeadlines] = useState<TransferWireHeadline[]>([]);
  const [wireLoading, setWireLoading] = useState(true);
  const [wireUpdated, setWireUpdated] = useState<string | null>(null);
  const [showCount, setShowCount] = useState(initialLimit);
  const [sourceFilter, setSourceFilter] = useState<SourceFilter>("all");
  const [sortMode, setSortMode] = useState<SortMode>("newest");
  const [wireRefreshing, setWireRefreshing] = useState(false);
  const [articles, setArticles] = useState<EditorialArticle[]>([]);
  const [deals, setDeals] = useState<HubCompletedTransfer[]>([]);

  async function loadWire(reloadCache = false) {
    if (reloadCache) setWireRefreshing(true);
    else setWireLoading(true);
    try {
      const res = await fetch(
        `/api/transfer-wire${reloadCache ? `?_=${Date.now()}` : ""}`,
        reloadCache ? { cache: "no-store" } : undefined,
      );
      const data = await res.json();
      let list: TransferWireHeadline[] = data.headlines ?? [];
      if (list.length === 0) {
        list = await fetchMinimalNewsFallback();
      }
      setHeadlines(list);
      setWireUpdated(data.updatedAt ?? null);
    } catch {
      const fallback = await fetchMinimalNewsFallback();
      setHeadlines(fallback);
    } finally {
      setWireLoading(false);
      setWireRefreshing(false);
    }
  }

  useEffect(() => {
    loadWire();
  }, []);

  const filtered = useMemo(() => {
    let list =
      sourceFilter === "all"
        ? [...headlines]
        : headlines.filter((h) => h.source === sourceFilter);
    if (sortMode === "oldest") {
      list = [...list].reverse();
    }
    return list;
  }, [headlines, sourceFilter, sortMode]);

  const sourceCounts = useMemo(() => {
    const c: Record<string, number> = { all: headlines.length };
    for (const h of headlines) {
      c[h.source] = (c[h.source] ?? 0) + 1;
    }
    return c;
  }, [headlines]);

  const visible = filtered.slice(0, showCount);
  const timeGroups = useMemo(() => groupHeadlinesByTime(visible), [visible]);

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
        Headlines from BBC, Sky, Guardian, ESPN and Google News (public RSS). Updated hourly from cache — not confirmed by Scout Gamer.
      </div>

      {/* LIVE WIRE — primary feed */}
      <div style={{ marginBottom: 56 }}>
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "baseline", gap: 12, marginBottom: 16 }}>
          <div>
            <div className="eyebrow transfer-eyebrow">LIVE WIRE</div>
            <h2 className="display" style={{ fontSize: "clamp(22px, 3.5vw, 32px)", fontWeight: 700, letterSpacing: "-0.03em", margin: "8px 0 0" }}>
              Transfer rumors
            </h2>
            {!wireLoading && headlines.length > 0 ? (
              <p className="mono" style={{ fontSize: 10, letterSpacing: "0.1em", color: "var(--sg-text-muted)", marginTop: 8 }}>
                {filtered.length} headlines
                {sourceFilter !== "all" ? ` · ${WIRE_SOURCE_LABELS[sourceFilter]}` : ""}
                {visible.length < filtered.length ? ` · showing ${visible.length}` : ""}
              </p>
            ) : null}
          </div>
          {wireUpdated ? (
            <span className="mono" style={{ fontSize: 10, letterSpacing: "0.1em", color: "var(--sg-text-muted)" }}>
              Updated {new Date(wireUpdated).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })}
            </span>
          ) : null}
        </div>

        {/* Source filter + sort */}
        <div style={{ marginBottom: 16 }}>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 10,
              marginBottom: 10,
            }}
          >
            <span className="mono" style={{ fontSize: 10, letterSpacing: "0.14em", color: "var(--sg-text-muted)" }}>
              FILTER BY SOURCE
            </span>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <select
                value={sortMode}
                onChange={(e) => setSortMode(e.target.value as SortMode)}
                aria-label="Sort headlines"
                className="mono"
                style={{
                  padding: "8px 14px",
                  borderRadius: 999,
                  border: "1px solid var(--sg-border)",
                  background: "var(--sg-surface-low)",
                  color: "var(--sg-text-primary)",
                  fontSize: 10,
                  letterSpacing: "0.1em",
                  cursor: "pointer",
                }}
              >
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
              </select>
              <button
                type="button"
                className="btn"
                disabled={wireLoading || wireRefreshing}
                onClick={() => loadWire(true)}
                title="Reload cached headlines (RSS syncs automatically every hour)"
                style={{ padding: "8px 14px", fontSize: 10, letterSpacing: "0.1em" }}
              >
                {wireRefreshing ? "Loading…" : "Reload"}
              </button>
            </div>
          </div>
          <div
            role="tablist"
            aria-label="News source filter"
            style={{
              display: "flex",
              gap: 8,
              overflowX: "auto",
              paddingBottom: 4,
              WebkitOverflowScrolling: "touch",
              scrollbarWidth: "none",
            }}
          >
            {SOURCE_TABS.map((opt) => {
              const count = sourceCounts[opt.id] ?? 0;
              const active = sourceFilter === opt.id;
              const accent =
                opt.id === "all" ? "var(--transfer-cyan)" : SOURCE_COLORS[opt.id] ?? SOURCE_COLORS.other;
              return (
                <button
                  key={opt.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => {
                    setSourceFilter(opt.id);
                    setShowCount(initialLimit);
                  }}
                  style={{
                    flex: "0 0 auto",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "10px 16px",
                    borderRadius: 999,
                    border: `1px solid ${active ? accent : "var(--sg-border)"}`,
                    background: active ? `color-mix(in oklch, ${accent} 18%, transparent)` : "var(--sg-surface-low)",
                    color: active ? accent : "var(--sg-text-primary)",
                    fontSize: 12,
                    fontWeight: active ? 600 : 500,
                    letterSpacing: "0.02em",
                    cursor: "pointer",
                    transition: "border-color 0.15s, background 0.15s",
                  }}
                >
                  <span
                    aria-hidden
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background: accent,
                      flexShrink: 0,
                    }}
                  />
                  {opt.short}
                  {count > 0 ? (
                    <span className="mono" style={{ fontSize: 10, opacity: 0.75 }}>
                      {count}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>

        <div style={shell.panel}>
          <div style={shell.panelAccent} />
          {wireLoading ? (
            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: 40, color: "var(--sg-text-muted)" }}>
              <span className="h-4 w-4 animate-spin rounded-full border-2" style={{ borderColor: "var(--transfer-cyan)", borderTopColor: "transparent" }} />
              <span className="mono" style={{ fontSize: 11, letterSpacing: "0.12em" }}>LOADING…</span>
            </div>
          ) : visible.length === 0 ? (
            <div style={{ padding: 40, textAlign: "center" }}>
              <p className="mono" style={{ fontSize: 12, color: "var(--sg-text-muted)", margin: "0 0 16px" }}>
                {headlines.length === 0
                  ? "No headlines right now."
                  : `No ${SOURCE_TABS.find((t) => t.id === sourceFilter)?.short ?? "matching"} headlines — try another source.`}
              </p>
              {headlines.length === 0 ? (
                <button type="button" className="btn btn-solid" onClick={() => loadWire(true)}>
                  Reload feed
                </button>
              ) : (
                <button
                  type="button"
                  className="btn"
                  onClick={() => {
                    setSourceFilter("all");
                    setShowCount(initialLimit);
                  }}
                >
                  Show all sources
                </button>
              )}
            </div>
          ) : (
            <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
              {timeGroups.map((group, gi) => (
                <li key={group.bucket} style={{ listStyle: "none" }}>
                  <div
                    className="mono"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      padding: gi === 0 ? "16px 20px 10px" : "20px 20px 10px",
                      fontSize: 10,
                      letterSpacing: "0.14em",
                      color: "var(--transfer-cyan)",
                      background: "var(--sg-surface-low)",
                      borderBottom: "1px solid var(--sg-border)",
                    }}
                  >
                    <span style={{ flex: 1, height: 1, background: "var(--sg-border)", opacity: 0.6 }} />
                    {group.label}
                    <span style={{ flex: 1, height: 1, background: "var(--sg-border)", opacity: 0.6 }} />
                  </div>
                  <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
                    {group.items.map((h, i) => {
                      const accent = SOURCE_COLORS[h.source] ?? SOURCE_COLORS.other;
                      const isLastInGroup = i === group.items.length - 1;
                      const isLastGroup = gi === timeGroups.length - 1;
                      return (
                        <li
                          key={h.id}
                          style={{
                            borderBottom:
                              isLastInGroup && isLastGroup ? "none" : "1px solid var(--sg-border)",
                          }}
                        >
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
                            <button
                              type="button"
                              className="mono"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                const src = h.source as WireSource;
                                if (src in WIRE_SOURCE_LABELS) {
                                  setSourceFilter(src);
                                  setShowCount(initialLimit);
                                }
                              }}
                              title={`Filter by ${h.sourceLabel}`}
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
                                cursor: "pointer",
                              }}
                            >
                              {h.sourceLabel}
                            </button>
                            <span className="display" style={{ fontSize: 15, fontWeight: 500, lineHeight: 1.35, margin: 0 }}>
                              {h.title}
                            </span>
                            <span
                              className="mono"
                              style={{
                                fontSize: 10,
                                letterSpacing: "0.08em",
                                color: "var(--sg-text-muted)",
                                whiteSpace: "nowrap",
                              }}
                            >
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
                </li>
              ))}
            </ul>
          )}
        </div>

        {showCount < filtered.length ? (
          <div style={{ display: "flex", justifyContent: "center", marginTop: 24 }}>
            <button type="button" className="btn" onClick={() => setShowCount((n) => n + 25)}>
              LOAD MORE ({filtered.length - showCount} left) →
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
