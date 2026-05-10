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

const STATIC_LISTS = [
  { slug: "en-iyi-10-genc-stoper", title: "Top 10 Young Centre-Backs", description: "Detailed analysis of players fitting the modern CB profile under 23 across European leagues.", color: "var(--sg-primary)" },
  { slug: "super-lig-gizli-isimler", title: "Hidden Gems of the Süper Lig", description: "Names just entering the radar of major clubs, standing out on the data side.", color: "var(--sg-secondary)" },
  { slug: "surpriz-isimler-2025", title: "Surprise Performers of 2025", description: "Players who exceeded expectations in 2025, making statistical breakthroughs.", color: "var(--sg-amber)" },
];

export default function EnListelerPage() {
  const [dbLists, setDbLists] = useState<Content[]>([]);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

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

      {/* ── V2 Category Hero ── */}
      <section className="grain relative overflow-hidden" style={{
        background: "var(--sg-surface-low)", borderBottom: "1px solid var(--sg-border)",
      }}>
        <div style={{
          backgroundImage: "repeating-linear-gradient(-45deg, rgba(0,0,0,0.06) 0 1px, transparent 1px 12px)",
          position: "absolute", inset: 0, pointerEvents: "none",
        }} />
        <div style={{
          maxWidth: 1440, margin: "0 auto", padding: "72px 32px 56px",
          display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48, alignItems: "center",
        }}>
          <div>
            <div className="eyebrow" style={{ color: "var(--emerald)", marginBottom: 14 }}>CURATED LISTS</div>
            <h1 className="display" style={{
              fontSize: "clamp(3rem, 6vw, 5rem)", fontWeight: 700,
              letterSpacing: "-0.04em", lineHeight: 0.92, margin: "0 0 20px",
            }}>
              Scouting<br />
              <span style={{
                background: "linear-gradient(120deg, var(--emerald) 0%, var(--accent) 100%)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
              }}>Lists</span>
            </h1>
            <p style={{ fontSize: 18, lineHeight: 1.6, color: "var(--sg-text-secondary)", maxWidth: 440, margin: "0 0 28px" }}>
              Curated by league, position and age group. Data and scout observations combined.
            </p>
            <div style={{ display: "flex", gap: 20 }}>
              {[
                { label: "50+", desc: "Player profiles" },
                { label: "12", desc: "Active lists" },
                { label: "5", desc: "Leagues covered" },
              ].map(({ label, desc }) => (
                <div key={label}>
                  <div className="display" style={{ fontSize: 28, fontWeight: 700, color: "var(--emerald)", letterSpacing: "-0.03em" }}>{label}</div>
                  <div className="mono" style={{ fontSize: 10, letterSpacing: "0.14em", color: "var(--sg-text-muted)" }}>{desc.toUpperCase()}</div>
                </div>
              ))}
            </div>
          </div>
          {/* Right — Rank Card Stack */}
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, width: 280 }}>
              {[
                { rank: "#01", pos: "Forward", tag: "ATTACK", color: "var(--rose)" },
                { rank: "#02", pos: "Midfielder", tag: "CREATIVE", color: "var(--accent)" },
                { rank: "#03", pos: "Defender", tag: "MOBILE", color: "var(--emerald)" },
                { rank: "#04", pos: "Full-back", tag: "MODERN", color: "var(--sky)" },
              ].map(({ rank, pos, tag, color }, i) => (
                <div key={rank} style={{
                  background: "var(--sg-surface)", border: "1px solid var(--sg-border)",
                  borderLeft: `3px solid ${color}`,
                  padding: "12px 16px", display: "flex", alignItems: "center", gap: 12,
                  opacity: 1 - i * 0.12,
                }}>
                  <span className="mono" style={{ fontSize: 22, fontWeight: 700, color, letterSpacing: "-0.02em", minWidth: 44 }}>{rank}</span>
                  <div>
                    <div className="display" style={{ fontSize: 14, fontWeight: 600 }}>{pos}</div>
                    <div className="mono" style={{ fontSize: 9, letterSpacing: "0.18em", color: "var(--sg-text-muted)" }}>{tag}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Content Grid ── */}
      <div style={{ maxWidth: 1440, margin: "0 auto", padding: "60px 32px 80px" }}>

        {dbLists.length > 0 && (
          <section style={{ marginBottom: 64 }}>
            <div style={{ marginBottom: 32 }}>
              <div className="eyebrow" style={{ color: "var(--emerald)" }}>LATEST LISTS</div>
              <h2 className="display" style={{ fontSize: 28, fontWeight: 700, letterSpacing: "-0.03em", margin: "6px 0 0" }}>
                New Additions
              </h2>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
              {dbLists.map((item) => (
                <Link key={item.id} href={`/en/listeler/${item.slug}`}
                  className="lift" style={{
                    background: "var(--sg-surface)", border: "1px solid var(--sg-border)",
                    borderRadius: 4, overflow: "hidden", display: "flex", flexDirection: "column",
                  }}>
                  <div style={{ height: 2, background: "var(--emerald)" }} />
                  <div style={{ padding: "20px 24px 24px", flex: 1, display: "flex", flexDirection: "column" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                      <span className="mono" style={{ fontSize: 9, letterSpacing: "0.2em", color: "var(--emerald)" }}>LIST</span>
                      <span className="mono" style={{ fontSize: 9, letterSpacing: "0.14em", color: "var(--sg-text-muted)" }}>
                        {new Date(item.created_at).toLocaleDateString("en-US", { day: "numeric", month: "short" })}
                      </span>
                    </div>
                    <h2 className="display" style={{ fontSize: 18, fontWeight: 600, lineHeight: 1.2, letterSpacing: "-0.02em", margin: "0 0 16px", textWrap: "balance", flex: 1 }}>
                      {item.title_en || item.title}
                    </h2>
                    <div className="mono" style={{ fontSize: 10, letterSpacing: "0.14em", color: "var(--emerald)" }}>
                      VIEW LIST →
                    </div>
                  </div>
                </Link>
              ))}
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

        <section>
          <div style={{ marginBottom: 32 }}>
            <div className="eyebrow">FEATURED LISTS</div>
            <h2 className="display" style={{ fontSize: 28, fontWeight: 700, letterSpacing: "-0.03em", margin: "6px 0 0" }}>
              Curated Collections
            </h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
            {STATIC_LISTS.map((list) => (
              <Link key={list.slug} href={`/en/listeler/${list.slug}`}
                className="lift" style={{
                  background: "var(--sg-surface)", border: "1px solid var(--sg-border)",
                  borderRadius: 4, overflow: "hidden", display: "flex", flexDirection: "column",
                }}>
                <div style={{ height: 2, background: list.color }} />
                <div style={{ padding: "24px", flex: 1, display: "flex", flexDirection: "column" }}>
                  <h2 className="display" style={{ fontSize: 18, fontWeight: 600, lineHeight: 1.2, letterSpacing: "-0.02em", margin: "0 0 10px" }}>
                    {list.title}
                  </h2>
                  <p style={{ fontSize: 13, lineHeight: 1.5, color: "var(--sg-text-secondary)", flex: 1, margin: "0 0 16px" }}>
                    {list.description}
                  </p>
                  <div className="mono" style={{ fontSize: 10, letterSpacing: "0.14em", color: list.color }}>
                    VIEW LIST →
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
