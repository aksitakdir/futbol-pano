"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import SiteHeader from "../components/site-header";
import SiteFooter from "../components/site-footer";
import { supabase } from "@/lib/supabase";
import { stripHtml } from "@/lib/utils";

type SupabaseContent = { id: string; title: string; slug: string; content: string; created_at: string; };

const PAGE_SIZE = 9;

type Archetype = { name: string; slug: string; description: string; position: string; color: string; icon: string; };

const ARCHETYPES: Archetype[] = [
  { name: "Box-to-Box Engine", slug: "box-to-box-engine", description: "Sahadaki her santimetreyi kapsayan yüksek yoğunluklu dinamizm. Savunma desteği ile hücum geçişlerini bağlayan temel dişli.", position: "Orta Saha", color: "var(--sg-secondary)", icon: "⚡" },
  { name: "Ball-Playing CB", slug: "ball-playing-cb", description: "Modern oyunun kurucusu. Sadece savunmakla kalmaz, dikine paslarla pres hattını kırar ve oyun kurulumunu yönetir.", position: "Defans", color: "var(--sg-primary)", icon: "🏗️" },
  { name: "Inverted Winger", slug: "inverted-winger", description: "İçeri kat ederek yarım alanlarda kaos yaratan, yaratıcılık ve bitiriciliği kanattan merkeze taşıyan profil.", position: "Hücum", color: "var(--sg-rose)", icon: "↩" },
  { name: "Inverted Full-back", slug: "inverted-fullback", description: "Savunma çizgisinden orta sahaya eklenlenen, topa sahipken ekstra bir oyun kurucu gibi davranan modern bek tanımı.", position: "Defans", color: "var(--sg-primary)", icon: "⇄" },
  { name: "False 9", slug: "false-9", description: "Geleneksel forvet tanımının ötesinde; derine inerek orta sahayı beşleyen ve rakip stopleri pozisyon dışına çeken beyin.", position: "Hücum", color: "var(--sg-rose)", icon: "9" },
  { name: "High Press Striker", slug: "high-press-striker", description: "Savunmanın ilk hattı. Rakibi hataya zorlayan agresif pres gücüyle, topsuz oyunda takımın savunma ritmini belirleyen forvet.", position: "Hücum", color: "var(--sg-rose)", icon: "↑" },
];

const posColor: Record<string, string> = {
  "Orta Saha": "var(--sg-secondary)",
  "Defans": "var(--sg-primary)",
  "Hücum": "var(--sg-rose, #fb7185)",
};

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

  return (
    <main style={{ background: "var(--sg-bg)", color: "var(--sg-text-primary)", minHeight: "100vh" }}>
      <SiteHeader activeNav="taktik-lab" />
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
            <div className="eyebrow" style={{ color: "var(--sky)", marginBottom: 14 }}>ANALİZ MOTORU</div>
            <h1 className="display" style={{
              fontSize: "clamp(3rem, 6vw, 5rem)", fontWeight: 700,
              letterSpacing: "-0.04em", lineHeight: 0.92, margin: "0 0 20px",
            }}>
              Taktik<br />
              <span style={{
                background: "linear-gradient(120deg, var(--sky) 0%, var(--cyan) 100%)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
              }}>Lab</span>
            </h1>
            <p style={{ fontSize: 18, lineHeight: 1.6, color: "var(--sg-text-secondary)", maxWidth: 440, margin: "0 0 28px" }}>
              Ham veriyi sahadaki gerçekliğe dönüştürürüz. Oyuncu profillerini pozisyonel arketip modelleriyle tanımlıyoruz.
            </p>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {["Box-to-Box", "Ball-Playing CB", "Inverted Winger", "False 9"].map((tag) => (
                <span key={tag} className="chip" style={{ fontSize: 10 }}>{tag}</span>
              ))}
            </div>
          </div>
          {/* Right — SVG Pitch Diagram */}
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <svg viewBox="0 0 240 340" width="240" height="340" style={{ opacity: 0.85 }}>
              {/* Pitch outline */}
              <rect x="10" y="10" width="220" height="320" rx="4" fill="none" stroke="var(--sky)" strokeWidth="1.5" strokeOpacity="0.4" />
              {/* Halfway line */}
              <line x1="10" y1="170" x2="230" y2="170" stroke="var(--sky)" strokeWidth="1" strokeOpacity="0.3" />
              {/* Center circle */}
              <circle cx="120" cy="170" r="32" fill="none" stroke="var(--sky)" strokeWidth="1" strokeOpacity="0.3" />
              <circle cx="120" cy="170" r="2" fill="var(--sky)" fillOpacity="0.4" />
              {/* Penalty box top */}
              <rect x="60" y="10" width="120" height="52" rx="2" fill="none" stroke="var(--sky)" strokeWidth="1" strokeOpacity="0.25" />
              {/* Penalty box bottom */}
              <rect x="60" y="278" width="120" height="52" rx="2" fill="none" stroke="var(--sky)" strokeWidth="1" strokeOpacity="0.25" />
              {/* 4-3-3 formation — top team */}
              {/* GK */}
              <circle cx="120" cy="40" r="8" fill="var(--sky)" fillOpacity="0.7" />
              {/* DEF 4 */}
              {[60, 90, 150, 180].map((x) => <circle key={x} cx={x} cy="90" r="7" fill="var(--accent)" fillOpacity="0.7" />)}
              {/* MID 3 */}
              {[75, 120, 165].map((x) => <circle key={x} cx={x} cy="140" r="7" fill="var(--accent-2)" fillOpacity="0.7" />)}
              {/* FWD 3 */}
              {[70, 120, 170].map((x) => <circle key={x} cx={x} cy="185" r="7" fill="var(--rose)" fillOpacity="0.7" />)}
              {/* Labels */}
              <text x="120" y="28" textAnchor="middle" fontSize="8" fill="var(--sky)" fillOpacity="0.6" fontFamily="monospace">GK</text>
              <text x="120" y="108" textAnchor="middle" fontSize="8" fill="var(--accent)" fillOpacity="0.6" fontFamily="monospace">DEF</text>
              <text x="120" y="157" textAnchor="middle" fontSize="8" fill="var(--accent-2)" fillOpacity="0.6" fontFamily="monospace">MID</text>
              <text x="120" y="202" textAnchor="middle" fontSize="8" fill="var(--rose)" fillOpacity="0.6" fontFamily="monospace">FWD</text>
              {/* Formation label */}
              <text x="120" y="280" textAnchor="middle" fontSize="11" fill="var(--sky)" fillOpacity="0.5" fontFamily="monospace" letterSpacing="3">4-3-3</text>
            </svg>
          </div>
        </div>
      </section>

      {/* ── Content Grid ── */}
      <div style={{ maxWidth: 1440, margin: "0 auto", padding: "60px 32px 80px" }}>

        {/* DB articles */}
        {!loading && dbContents.length > 0 && (
          <section style={{ marginBottom: 64 }}>
            <div style={{ marginBottom: 32 }}>
              <div className="eyebrow" style={{ color: "var(--sky)" }}>GÜNCEL ANALİZLER</div>
              <h2 className="display" style={{ fontSize: 28, fontWeight: 700, letterSpacing: "-0.03em", margin: "6px 0 0" }}>
                Son Yazılar
              </h2>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
              {dbContents.map((item) => (
                <Link key={item.id} href={`/taktik-lab/${item.slug}`}
                  className="lift" style={{
                    background: "var(--sg-surface)", border: "1px solid var(--sg-border)",
                    borderRadius: 4, overflow: "hidden", display: "flex", flexDirection: "column",
                  }}>
                  <div style={{ height: 2, background: "var(--sky)" }} />
                  <div style={{ padding: "20px 24px 24px", flex: 1, display: "flex", flexDirection: "column" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                      <span className="mono" style={{ fontSize: 9, letterSpacing: "0.2em", color: "var(--sky)" }}>TAKTİK</span>
                      <span className="mono" style={{ fontSize: 9, letterSpacing: "0.14em", color: "var(--sg-text-muted)" }}>
                        {new Date(item.created_at).toLocaleDateString("tr-TR", { day: "numeric", month: "short" })}
                      </span>
                    </div>
                    <h2 className="display" style={{ fontSize: 18, fontWeight: 600, lineHeight: 1.2, letterSpacing: "-0.02em", margin: "0 0 10px", textWrap: "balance" }}>
                      {item.title}
                    </h2>
                    <p style={{ fontSize: 13, lineHeight: 1.5, color: "var(--sg-text-secondary)", flex: 1, margin: "0 0 16px" }}>
                      {stripHtml(item.content).trim().slice(0, 120)}…
                    </p>
                    <div className="mono" style={{ fontSize: 10, letterSpacing: "0.14em", color: "var(--sky)" }}>
                      DETAYLARI GÖR →
                    </div>
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

        {/* Archetypes */}
        <section>
          <div style={{ marginBottom: 32 }}>
            <div className="eyebrow">POZİSYON ARKETİPLERİ</div>
            <h2 className="display" style={{ fontSize: 28, fontWeight: 700, letterSpacing: "-0.03em", margin: "6px 0 0" }}>
              Oyun Fonksiyonları
            </h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
            {ARCHETYPES.map((arch) => (
              <Link key={arch.slug} href={`/taktik-lab/${arch.slug}`}
                className="lift" style={{
                  background: "var(--sg-surface)", border: "1px solid var(--sg-border)",
                  borderRadius: 4, overflow: "hidden", display: "flex", flexDirection: "column", position: "relative",
                }}>
                <div style={{ height: 2, background: arch.color }} />
                <div style={{ padding: "24px", flex: 1, display: "flex", flexDirection: "column", position: "relative", overflow: "hidden" }}>
                  <div style={{
                    position: "absolute", right: -8, top: -8, fontSize: 80,
                    opacity: 0.04, pointerEvents: "none", fontFamily: "var(--font-headline)", color: arch.color,
                  }}>
                    {arch.icon}
                  </div>
                  <div style={{
                    width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center",
                    background: `color-mix(in oklch, ${arch.color} 15%, transparent)`,
                    color: arch.color, fontSize: 18, marginBottom: 20,
                  }}>
                    {arch.icon}
                  </div>
                  <div className="mono" style={{ fontSize: 10, letterSpacing: "0.14em", color: arch.color, marginBottom: 8 }}>
                    {posColor[arch.position] ? arch.position.toUpperCase() : arch.position.toUpperCase()}
                  </div>
                  <h2 className="display" style={{ fontSize: 16, fontWeight: 700, letterSpacing: "-0.01em", margin: "0 0 10px" }}>
                    {arch.name}
                  </h2>
                  <p style={{ fontSize: 13, lineHeight: 1.5, color: "var(--sg-text-secondary)", flex: 1 }}>
                    {arch.description}
                  </p>
                  <div className="mono" style={{ fontSize: 10, letterSpacing: "0.14em", color: arch.color, marginTop: 16 }}>
                    İNCELE →
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* CTA */}
        <div className="grain" style={{
          marginTop: 64, padding: "48px", position: "relative", overflow: "hidden",
          background: "linear-gradient(120deg, var(--sg-surface) 0%, color-mix(in oklch, var(--sky) 20%, var(--sg-surface)) 100%)",
          border: "1px solid var(--sg-border)", borderRadius: 6,
          display: "grid", gridTemplateColumns: "1fr auto", gap: 32, alignItems: "center",
        }}>
          <div>
            <h2 className="display" style={{ fontSize: 28, fontWeight: 700, letterSpacing: "-0.03em", margin: "0 0 10px" }}>
              Kendi taktiğini oluşturmaya hazır mısın?
            </h2>
            <p style={{ fontSize: 16, color: "var(--sg-text-secondary)", margin: 0 }}>
              Arketip modellerini kullanarak sistemine en uygun oyuncuyu bul.
            </p>
          </div>
          <Link href="/listeler" className="btn btn-solid" style={{ background: "var(--sky)", borderColor: "var(--sky)", whiteSpace: "nowrap" }}>
            SİSTEM ANALİZİNE BAŞLA →
          </Link>
        </div>
      </div>

      <SiteFooter maxWidth="max-w-7xl" />
    </main>
  );
}
