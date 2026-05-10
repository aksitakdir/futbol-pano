"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { IconShield, IconTrendUp, IconStar } from "../components/icons";
import SiteHeader from "../components/site-header";
import SiteFooter from "../components/site-footer";
import { supabase } from "@/lib/supabase";

type SupabaseContent = { id: string; title: string; slug: string; created_at: string; };

const PAGE_SIZE = 9;

const STATIC_LISTS = [
  { slug: "en-iyi-10-genc-stoper", title: "En İyi 10 Genç Stoper", description: "Avrupa liglerinde 23 yaş altı modern stoper profiline uyan oyuncuların detaylı analizi.", icon: <IconShield />, color: "var(--sg-primary)" },
  { slug: "super-lig-gizli-isimler", title: "Süper Lig'in Gizli İsimleri", description: "Büyük kulüplerin radarına yeni yeni giren, veri tarafında öne çıkan isimler.", icon: <IconTrendUp />, color: "var(--sg-secondary)" },
  { slug: "surpriz-isimler-2025", title: "Bu Sezonun Sürpriz İsimleri", description: "2025 sezonunda beklentilerin üzerine çıkan, istatistiksel olarak sıçrama yapan oyuncular.", icon: <IconStar />, color: "var(--sg-amber)" },
];

export default function ListsPage() {
  const [dbLists, setDbLists] = useState<SupabaseContent[]>([]);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    supabase.from("contents").select("id,title,slug,created_at")
      .eq("status", "yayinda").eq("category", "listeler").order("created_at", { ascending: false })
      .range(0, PAGE_SIZE - 1)
      .then(({ data }) => {
        const items = data ?? [];
        setDbLists(items);
        setHasMore(items.length === PAGE_SIZE);
      });
  }, []);

  async function handleLoadMore() {
    setLoadingMore(true);
    const { data } = await supabase.from("contents").select("id,title,slug,created_at")
      .eq("status", "yayinda").eq("category", "listeler").order("created_at", { ascending: false })
      .range(dbLists.length, dbLists.length + PAGE_SIZE - 1);
    const items = data ?? [];
    setDbLists(prev => [...prev, ...items]);
    setHasMore(items.length === PAGE_SIZE);
    setLoadingMore(false);
  }

  return (
    <main style={{ background: "var(--sg-bg)", color: "var(--sg-text-primary)", minHeight: "100vh" }}>
      <SiteHeader activeNav="listeler" />
      <div style={{ paddingTop: "68px" }} />

      {/* ── V2 Category Hero ── */}
      <section className="grain relative overflow-hidden" style={{
        background: "var(--sg-surface-low)",
        borderBottom: "1px solid var(--sg-border)",
      }}>
        <div style={{
          backgroundImage: "repeating-linear-gradient(-45deg, rgba(0,0,0,0.06) 0 1px, transparent 1px 12px)",
          position: "absolute", inset: 0, pointerEvents: "none",
        }} />
        <div style={{
          maxWidth: 1440, margin: "0 auto", padding: "72px 32px 56px",
          display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48, alignItems: "center",
        }}>
          {/* Left */}
          <div>
            <div className="eyebrow" style={{ color: "var(--emerald)", marginBottom: 14 }}>KÜRASYONLU LİSTELER</div>
            <h1 className="display" style={{
              fontSize: "clamp(3rem, 6vw, 5rem)", fontWeight: 700,
              letterSpacing: "-0.04em", lineHeight: 0.92, margin: "0 0 20px",
            }}>
              Scout&apos;un<br />
              <span style={{
                background: "linear-gradient(120deg, var(--emerald) 0%, var(--accent) 100%)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
              }}>Listeleri</span>
            </h1>
            <p style={{ fontSize: 18, lineHeight: 1.6, color: "var(--sg-text-secondary)", maxWidth: 440, margin: "0 0 28px" }}>
              Liglere, pozisyonlara ve yaş gruplarına göre kürasyonlu listeler. Veri ve scout gözlemini birleştirir.
            </p>
            <div style={{ display: "flex", gap: 20 }}>
              {[
                { label: "50+", desc: "Oyuncu profili" },
                { label: "12", desc: "Aktif liste" },
                { label: "5", desc: "Lig kapsanıyor" },
              ].map(({ label, desc }) => (
                <div key={label}>
                  <div className="display" style={{ fontSize: 28, fontWeight: 700, color: "var(--emerald)", letterSpacing: "-0.03em" }}>{label}</div>
                  <div className="mono" style={{ fontSize: 10, letterSpacing: "0.14em", color: "var(--sg-text-muted)" }}>{desc.toUpperCase()}</div>
                </div>
              ))}
            </div>
          </div>
          {/* Right — Rank Card Stack */}
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 0 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, width: 280 }}>
              {[
                { rank: "#01", pos: "Forvet", tag: "HÜCUM", color: "var(--rose)" },
                { rank: "#02", pos: "Orta Saha", tag: "KREATİF", color: "var(--accent)" },
                { rank: "#03", pos: "Defans", tag: "MOBİL", color: "var(--emerald)" },
                { rank: "#04", pos: "Bek", tag: "MODERN", color: "var(--sky)" },
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

        {/* DB Lists */}
        {dbLists.length > 0 && (
          <section style={{ marginBottom: 64 }}>
            <div style={{ marginBottom: 32 }}>
              <div className="eyebrow" style={{ color: "var(--emerald)" }}>GÜNCEL LİSTELER</div>
              <h2 className="display" style={{ fontSize: 28, fontWeight: 700, letterSpacing: "-0.03em", margin: "6px 0 0" }}>
                Son Eklenenler
              </h2>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
              {dbLists.map((item) => (
                <Link key={item.id} href={`/listeler/${item.slug}`}
                  className="lift" style={{
                    background: "var(--sg-surface)", border: "1px solid var(--sg-border)",
                    borderRadius: 4, overflow: "hidden", display: "flex", flexDirection: "column",
                  }}>
                  <div style={{ height: 2, background: "var(--emerald)" }} />
                  <div style={{ padding: "20px 24px 24px", flex: 1, display: "flex", flexDirection: "column" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                      <span className="mono" style={{ fontSize: 9, letterSpacing: "0.2em", color: "var(--emerald)" }}>LİSTE</span>
                      <span className="mono" style={{ fontSize: 9, letterSpacing: "0.14em", color: "var(--sg-text-muted)" }}>
                        {new Date(item.created_at).toLocaleDateString("tr-TR", { day: "numeric", month: "short" })}
                      </span>
                    </div>
                    <h2 className="display" style={{ fontSize: 18, fontWeight: 600, lineHeight: 1.2, letterSpacing: "-0.02em", margin: "0 0 16px", textWrap: "balance", flex: 1 }}>
                      {item.title}
                    </h2>
                    <div className="mono" style={{ fontSize: 10, letterSpacing: "0.14em", color: "var(--emerald)" }}>
                      DETAYLARI GÖR →
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            {hasMore && (
              <div style={{ marginTop: 36, display: "flex", justifyContent: "center" }}>
                <button type="button" onClick={handleLoadMore} disabled={loadingMore} className="btn" style={{ borderColor: "var(--emerald)", color: "var(--emerald)" }}>
                  {loadingMore ? "Yükleniyor..." : "DAHA FAZLA YÜKLE →"}
                </button>
              </div>
            )}
          </section>
        )}

        {/* Static featured lists */}
        <section>
          <div style={{ marginBottom: 32 }}>
            <div className="eyebrow">ÖNE ÇIKAN LİSTELER</div>
            <h2 className="display" style={{ fontSize: 28, fontWeight: 700, letterSpacing: "-0.03em", margin: "6px 0 0" }}>
              Seçilmiş Koleksiyonlar
            </h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
            {STATIC_LISTS.map((list) => (
              <Link key={list.slug} href={`/listeler/${list.slug}`}
                className="lift" style={{
                  background: "var(--sg-surface)", border: "1px solid var(--sg-border)",
                  borderRadius: 4, overflow: "hidden", display: "flex", flexDirection: "column",
                }}>
                <div style={{ height: 2, background: list.color }} />
                <div style={{ padding: "24px", flex: 1, display: "flex", flexDirection: "column" }}>
                  <div style={{
                    width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center",
                    background: `color-mix(in oklch, ${list.color} 15%, transparent)`,
                    color: list.color, marginBottom: 20,
                  }}>
                    {list.icon}
                  </div>
                  <h2 className="display" style={{ fontSize: 18, fontWeight: 600, lineHeight: 1.2, letterSpacing: "-0.02em", margin: "0 0 10px" }}>
                    {list.title}
                  </h2>
                  <p style={{ fontSize: 13, lineHeight: 1.5, color: "var(--sg-text-secondary)", flex: 1, margin: "0 0 16px" }}>
                    {list.description}
                  </p>
                  <div className="mono" style={{ fontSize: 10, letterSpacing: "0.14em", color: list.color }}>
                    DETAYLARI GÖR →
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
