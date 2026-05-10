"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import SiteHeader from "../../components/site-header";
import SiteFooter from "../../components/site-footer";
import { supabase } from "@/lib/supabase";

type Content = {
  id: string; title: string; title_en?: string; slug: string;
  content?: string; content_en?: string; created_at: string;
};

const PAGE_SIZE = 9;

const ACCENT_CYCLE = ["var(--cyan)", "var(--emerald)", "var(--sky)", "var(--rose)", "var(--amber)", "var(--accent)"];

const STATIC_LISTS = [
  { slug: "en-iyi-10-genc-stoper", title: "Top 10 Young Centre-Backs", description: "Detailed analysis of players fitting the modern CB profile under 23 across European leagues.", accent: "var(--cyan)" },
  { slug: "super-lig-gizli-isimler", title: "Hidden Gems of the Süper Lig", description: "Names just entering the radar of major clubs, standing out on the data side.", accent: "var(--emerald)" },
  { slug: "surpriz-isimler-2025", title: "Surprise Performers of 2025", description: "Players who exceeded expectations in 2025, making statistical breakthroughs.", accent: "var(--sky)" },
];

const FILTERS = ["ALL", "YOUNG", "TRANSFERS", "TACTICS", "TÜRKIYE"];

export default function EnListelerPage() {
  const [dbLists, setDbLists] = useState<Content[]>([]);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [activeFilter, setActiveFilter] = useState("ALL");

  useEffect(() => {
    supabase.from("contents")
      .select("id,title,title_en,slug,content,content_en,created_at")
      .eq("status", "yayinda").eq("category", "listeler")
      .order("created_at", { ascending: false }).range(0, PAGE_SIZE - 1)
      .then(({ data }) => {
        const items = data ?? [];
        setDbLists(items); setHasMore(items.length === PAGE_SIZE);
      });
  }, []);

  async function handleLoadMore() {
    setLoadingMore(true);
    const { data } = await supabase.from("contents")
      .select("id,title,title_en,slug,content,content_en,created_at")
      .eq("status", "yayinda").eq("category", "listeler")
      .order("created_at", { ascending: false })
      .range(dbLists.length, dbLists.length + PAGE_SIZE - 1);
    const items = data ?? [];
    setDbLists(prev => [...prev, ...items]);
    setHasMore(items.length === PAGE_SIZE); setLoadingMore(false);
  }

  return (
    <main style={{ background: "var(--sg-bg)", color: "var(--sg-text-primary)", minHeight: "100vh" }}>
      <SiteHeader activeNav="listeler" />
      <div style={{ paddingTop: "68px" }} />

      {/* ── Page Header ── */}
      <div style={{ maxWidth: 1440, margin: "0 auto", padding: "60px 32px 56px", display: "grid", gridTemplateColumns: "2fr 1fr", gap: 32, alignItems: "end" }}>
        <div>
          <div className="eyebrow" style={{ color: "var(--emerald)" }}>ARCHIVE</div>
          <h1 className="display" style={{
            fontSize: "clamp(56px, 7vw, 84px)", fontWeight: 700,
            letterSpacing: "-0.04em", lineHeight: 0.9, margin: "8px 0 0",
          }}>
            Lists
          </h1>
        </div>
        <p style={{ fontSize: 18, color: "var(--sg-text-secondary)", lineHeight: 1.5, margin: 0 }}>
          Curated player lists — each with scout notes, stats and comparisons.
        </p>
      </div>

      <div style={{ maxWidth: 1440, margin: "0 auto", padding: "0 32px 80px" }}>

        {/* ── Filter Bar ── */}
        <div style={{ display: "flex", gap: 8, marginBottom: 40, paddingBottom: 16, borderBottom: "1px solid var(--sg-border)" }}>
          {FILTERS.map((f) => (
            <button key={f} onClick={() => setActiveFilter(f)}
              className={`chip${activeFilter === f ? " solid" : ""}`}
              style={{ cursor: "pointer", fontSize: 10 }}>
              {f}
            </button>
          ))}
        </div>

        {/* ── DB Lists ── */}
        {dbLists.length > 0 && (
          <section style={{ marginBottom: 64 }}>
            <div className="eyebrow" style={{ color: "var(--emerald)", marginBottom: 20 }}>LATEST LISTS</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
              {dbLists.map((item, idx) => {
                const accent = ACCENT_CYCLE[idx % ACCENT_CYCLE.length];
                const hasEn = !!item.title_en;
                return (
                  <Link key={item.id} href={`/en/listeler/${item.slug}`}
                    className="lift" style={{
                      background: "var(--sg-surface)", border: "1px solid var(--sg-border)",
                      borderRadius: 4, overflow: "hidden", cursor: "pointer", textDecoration: "none",
                    }}>
                    <div style={{ height: 2, background: accent }} />
                    <div style={{ padding: 28 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
                        <span className="mono" style={{ fontSize: 10, letterSpacing: "0.18em", color: accent }}>
                          LIST{!hasEn ? " · DRAFT" : ""}
                        </span>
                        <span className="mono" style={{ fontSize: 10, letterSpacing: "0.14em", color: "var(--sg-text-muted)" }}>
                          {new Date(item.created_at).toLocaleDateString("en-US", { day: "numeric", month: "short" })}
                        </span>
                      </div>
                      <h3 className="display" style={{
                        fontSize: 22, fontWeight: 600, lineHeight: 1.1, letterSpacing: "-0.02em",
                        margin: 0, textWrap: "balance", minHeight: 72, color: "var(--sg-text-primary)",
                      }}>
                        {item.title_en || item.title}
                      </h3>
                      <div style={{ marginTop: 20, paddingTop: 16, borderTop: "1px solid var(--sg-border)" }}>
                        <span className="mono u-link" style={{ fontSize: 11, letterSpacing: "0.16em", color: accent }}>
                          READ →
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
            {hasMore && (
              <div style={{ marginTop: 36, display: "flex", justifyContent: "center" }}>
                <button type="button" onClick={handleLoadMore} disabled={loadingMore} className="btn" style={{ borderColor: "var(--emerald)", color: "var(--emerald)" }}>
                  {loadingMore ? "Loading..." : "LOAD MORE →"}
                </button>
              </div>
            )}
          </section>
        )}

        {/* ── Static Featured Lists ── */}
        <section>
          <div className="eyebrow" style={{ marginBottom: 20 }}>FEATURED LISTS</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
            {STATIC_LISTS.map((list) => (
              <Link key={list.slug} href={`/en/listeler/${list.slug}`}
                className="lift" style={{
                  background: "var(--sg-surface)", border: "1px solid var(--sg-border)",
                  borderRadius: 4, overflow: "hidden", cursor: "pointer", textDecoration: "none",
                }}>
                <div style={{ height: 2, background: list.accent }} />
                <div style={{ padding: 28 }}>
                  <div className="mono" style={{ fontSize: 10, letterSpacing: "0.18em", color: list.accent, marginBottom: 24 }}>
                    CURATED LIST
                  </div>
                  <h3 className="display" style={{
                    fontSize: 22, fontWeight: 600, lineHeight: 1.1, letterSpacing: "-0.02em",
                    margin: 0, textWrap: "balance", color: "var(--sg-text-primary)",
                  }}>
                    {list.title}
                  </h3>
                  <p style={{ fontSize: 14, color: "var(--sg-text-secondary)", marginTop: 12, lineHeight: 1.5 }}>
                    {list.description}
                  </p>
                  <div style={{ marginTop: 20, paddingTop: 16, borderTop: "1px solid var(--sg-border)" }}>
                    <span className="mono u-link" style={{ fontSize: 11, letterSpacing: "0.16em", color: list.accent }}>
                      READ →
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>

      <SiteFooter maxWidth="max-w-7xl" />
    </main>
  );
}
