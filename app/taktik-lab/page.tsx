"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import SiteHeader from "../components/site-header";
import SiteFooter from "../components/site-footer";
import { supabase } from "@/lib/supabase";
import { stripHtml } from "@/lib/utils";

type SupabaseContent = { id: string; title: string; slug: string; content: string; created_at: string; };

const PAGE_SIZE = 9;

type Archetype = { name: string; slug: string; description: string; position: string; color: string; exemplars: string[]; };

const ARCHETYPES: Archetype[] = [
  { name: "Box-to-Box Engine", slug: "box-to-box-engine", description: "Sahadaki her santimetreyi kapsayan yüksek yoğunluklu dinamizm. Savunma desteği ile hücum geçişlerini bağlayan temel dişli.", position: "Orta Saha", color: "var(--accent-2)", exemplars: ["Kimmich", "Caicedo", "Pedri"] },
  { name: "Ball-Playing CB", slug: "ball-playing-cb", description: "Modern oyunun kurucusu. Sadece savunmakla kalmaz, dikine paslarla pres hattını kırar ve oyun kurulumunu yönetir.", position: "Defans", color: "var(--sky)", exemplars: ["Rúben Dias", "Saliba", "Timber"] },
  { name: "Inverted Winger", slug: "inverted-winger", description: "İçeri kat ederek yarım alanlarda kaos yaratan, yaratıcılık ve bitiriciliği kanattan merkeze taşıyan profil.", position: "Hücum", color: "var(--rose)", exemplars: ["Saka", "Foden", "Vinícius"] },
  { name: "Inverted Full-back", slug: "inverted-fullback", description: "Savunma çizgisinden orta sahaya eklenen, topa sahipken ekstra bir oyun kurucu gibi davranan modern bek tanımı.", position: "Defans", color: "var(--emerald)", exemplars: ["Robertson", "Trent", "Grimaldo"] },
  { name: "False 9", slug: "false-9", description: "Geleneksel forvet tanımının ötesinde; derine inerek orta sahayı beşleyen ve rakip stopleri pozisyon dışına çeken beyin.", position: "Hücum", color: "var(--amber)", exemplars: ["De Bruyne", "Messi", "Arda Güler"] },
  { name: "High Press Striker", slug: "high-press-striker", description: "Savunmanın ilk hattı. Rakibi hataya zorlayan agresif pres gücüyle, topsuz oyunda takımın savunma ritmini belirleyen forvet.", position: "Hücum", color: "var(--rose)", exemplars: ["Nunez", "Højlund", "Isak"] },
];

export default function TaktikLabPage() {
  const [dbContents, setDbContents] = useState<SupabaseContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    supabase.from("contents").select("id,title,slug,content,created_at")
      .eq("status", "yayinda").eq("category", "taktik-lab").order("created_at", { ascending: false })
      .range(0, PAGE_SIZE - 1)
      .then(({ data }) => {
        const items = data ?? [];
        setDbContents(items);
        setHasMore(items.length === PAGE_SIZE);
        setLoading(false);
      });
  }, []);

  async function handleLoadMore() {
    setLoadingMore(true);
    const { data } = await supabase.from("contents").select("id,title,slug,content,created_at")
      .eq("status", "yayinda").eq("category", "taktik-lab").order("created_at", { ascending: false })
      .range(dbContents.length, dbContents.length + PAGE_SIZE - 1);
    const items = data ?? [];
    setDbContents(prev => [...prev, ...items]);
    setHasMore(items.length === PAGE_SIZE);
    setLoadingMore(false);
  }

  const featured = dbContents[0];
  const recentRest = dbContents.slice(1);

  return (
    <main style={{ background: "var(--sg-bg)", color: "var(--sg-text-primary)", minHeight: "100vh" }}>
      <SiteHeader activeNav="taktik-lab" />
      <div style={{ paddingTop: "68px" }} />

      {/* ── Page Header ── */}
      <div style={{ maxWidth: 1440, margin: "0 auto", padding: "60px 32px 56px", display: "grid", gridTemplateColumns: "2fr 1fr", gap: 32, alignItems: "end" }}>
        <div>
          <div className="eyebrow" style={{ color: "var(--sky)" }}>POZİSYON ARKETİPLERİ</div>
          <h1 className="display" style={{
            fontSize: "clamp(56px, 7vw, 84px)", fontWeight: 700,
            letterSpacing: "-0.04em", lineHeight: 0.9, margin: "8px 0 0",
          }}>
            Taktik Lab
          </h1>
        </div>
        <p style={{ fontSize: 18, color: "var(--sg-text-secondary)", lineHeight: 1.5, margin: 0 }}>
          Modern futbolun pozisyon arketipleri. Her arketip bir rol — hangi oyuncular en iyi uyguluyor?
        </p>
      </div>

      <div style={{ maxWidth: 1440, margin: "0 auto", padding: "0 32px 80px" }}>

        {/* ── Featured Cover Story (if we have db articles) ── */}
        {!loading && featured && (
          <Link href={`/taktik-lab/${featured.slug}`} className="lift" style={{
            display: "block", position: "relative", overflow: "hidden",
            background: "linear-gradient(135deg, oklch(0.18 0.02 20) 0%, oklch(0.12 0.012 250) 70%)",
            border: "1px solid var(--sg-border)", borderRadius: 6, marginBottom: 64,
            minHeight: 320, textDecoration: "none",
          }}>
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: "var(--sky)" }} />
            <div style={{
              position: "absolute", top: -160, right: -120, width: 480, height: 480, borderRadius: "50%",
              background: "radial-gradient(circle, var(--sky) 0%, transparent 65%)", opacity: 0.15, pointerEvents: "none",
            }} />
            <div style={{
              position: "absolute", inset: 0, opacity: 0.04, pointerEvents: "none",
              backgroundImage: "repeating-linear-gradient(-45deg, rgba(255,255,255,0.5) 0 1px, transparent 1px 22px)",
            }} />

            {/* Tactical pitch SVG on the right */}
            <svg viewBox="0 0 200 120" preserveAspectRatio="none" style={{
              position: "absolute", right: 0, top: 0, height: "100%", width: "42%",
              opacity: 0.32, pointerEvents: "none",
            }}>
              <rect x="0" y="0" width="200" height="120" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="0.5" />
              <line x1="100" y1="0" x2="100" y2="120" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" />
              <circle cx="100" cy="60" r="14" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" />
              <path d="M 30 90 Q 80 60 110 50" fill="none" stroke="var(--sky)" strokeWidth="1.2" strokeDasharray="3 2" />
              <path d="M 30 30 Q 80 60 110 70" fill="none" stroke="var(--sky)" strokeWidth="1.2" strokeDasharray="3 2" />
              <circle cx="30" cy="90" r="2.5" fill="var(--sky)" />
              <circle cx="30" cy="30" r="2.5" fill="var(--sky)" />
              <polygon points="110,50 106,46 106,54" fill="var(--sky)" />
              <polygon points="110,70 106,66 106,74" fill="var(--sky)" />
            </svg>

            <div style={{ position: "relative", padding: "48px", maxWidth: 760 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
                <span className="chip solid" style={{ background: "var(--sky)", borderColor: "var(--sky)", color: "var(--ink-900)", fontSize: 10 }}>
                  KAPAK ANALİZİ
                </span>
                <span className="mono" style={{ fontSize: 10, letterSpacing: "0.18em", color: "var(--sg-text-muted)" }}>
                  TAKTİK · {new Date(featured.created_at).toLocaleDateString("tr-TR", { day: "numeric", month: "short", year: "numeric" })}
                </span>
              </div>
              <h2 className="display" style={{
                fontSize: "clamp(32px, 4.4vw, 56px)", fontWeight: 700,
                letterSpacing: "-0.04em", margin: 0, lineHeight: 0.95, textWrap: "balance",
                color: "var(--sg-text-primary)",
              }}>
                <span className="grad-text">{featured.title}</span>
              </h2>
              <p style={{ fontSize: 16, color: "var(--sg-text-secondary)", lineHeight: 1.55, marginTop: 18, maxWidth: 580 }}>
                {stripHtml(featured.content).replace(/\s+/g, " ").trim().slice(0, 200)}…
              </p>
              <div style={{ marginTop: 24 }}>
                <span className="btn btn-solid" style={{ background: "var(--sky)", borderColor: "var(--sky)" }}>ANALİZİ OKU →</span>
              </div>
            </div>
          </Link>
        )}

        {/* ── Recent Analyses ── */}
        {!loading && recentRest.length > 0 && (
          <section style={{ marginBottom: 80 }}>
            <div className="eyebrow" style={{ marginBottom: 20 }}>SON ANALİZLER</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
              {recentRest.map((item) => (
                <Link key={item.id} href={`/taktik-lab/${item.slug}`}
                  className="lift" style={{
                    background: "var(--sg-surface)", border: "1px solid var(--sg-border)",
                    borderRadius: 4, padding: 28, cursor: "pointer", minHeight: 220,
                    display: "flex", flexDirection: "column", justifyContent: "space-between",
                    textDecoration: "none",
                  }}>
                  <div>
                    <div className="mono" style={{ fontSize: 10, letterSpacing: "0.18em", color: "var(--sky)" }}>
                      TAKTİK · {new Date(item.created_at).toLocaleDateString("tr-TR", { day: "numeric", month: "short" })}
                    </div>
                    <h3 className="display" style={{
                      fontSize: 22, fontWeight: 700, lineHeight: 1.1, letterSpacing: "-0.02em",
                      margin: "14px 0 0", textWrap: "balance", color: "var(--sg-text-primary)",
                    }}>
                      {item.title}
                    </h3>
                  </div>
                  <div className="mono" style={{ fontSize: 10, letterSpacing: "0.16em", color: "var(--sg-text-muted)", marginTop: 16 }}>
                    OKU →
                  </div>
                </Link>
              ))}
            </div>
            {hasMore && (
              <div style={{ marginTop: 36, display: "flex", justifyContent: "center" }}>
                <button type="button" onClick={handleLoadMore} disabled={loadingMore} className="btn" style={{ borderColor: "var(--sky)", color: "var(--sky)" }}>
                  {loadingMore ? "Yükleniyor..." : "DAHA FAZLA YÜKLE →"}
                </button>
              </div>
            )}
          </section>
        )}

        {/* ── Archetypes ── */}
        <section>
          <div className="eyebrow" style={{ marginBottom: 20 }}>ARKETİPLER</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
            {ARCHETYPES.map((arch) => {
              const c = arch.color;
              return (
                <Link key={arch.slug} href={`/taktik-lab/${arch.slug}`}
                  className="lift" style={{
                    position: "relative", cursor: "pointer",
                    background: "var(--sg-surface)", border: "1px solid var(--sg-border)",
                    borderRadius: 4, padding: 32, minHeight: 280,
                    display: "flex", flexDirection: "column", justifyContent: "space-between", gap: 24,
                    overflow: "hidden", textDecoration: "none",
                  }}>
                  <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: c }} />
                  <div style={{
                    position: "absolute", right: -40, top: -40, width: 200, height: 200,
                    borderRadius: "50%", background: `radial-gradient(circle, ${c} 0%, transparent 70%)`, opacity: 0.15,
                  }} />
                  <div>
                    <div className="mono" style={{ fontSize: 10, letterSpacing: "0.18em", color: c }}>
                      {arch.position.toUpperCase()}
                    </div>
                    <h3 className="display" style={{
                      fontSize: 28, fontWeight: 700, letterSpacing: "-0.03em",
                      margin: "12px 0 0", lineHeight: 1.05, textWrap: "balance",
                      color: "var(--sg-text-primary)",
                    }}>
                      {arch.name}
                    </h3>
                    <p style={{ fontSize: 14, color: "var(--sg-text-secondary)", marginTop: 12, lineHeight: 1.5 }}>
                      {arch.description}
                    </p>
                  </div>
                  <div>
                    <div className="mono" style={{ fontSize: 9, letterSpacing: "0.14em", color: "var(--sg-text-muted)", marginBottom: 8 }}>
                      EN İYİ UYGULAYANLAR
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                      {arch.exemplars.map(ex => (
                        <span key={ex} className="chip" style={{ borderColor: c, color: c, fontSize: 10 }}>{ex}</span>
                      ))}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      </div>

      <SiteFooter maxWidth="max-w-7xl" />
    </main>
  );
}
