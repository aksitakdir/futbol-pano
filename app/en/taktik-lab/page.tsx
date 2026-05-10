"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import SiteHeader from "../../components/site-header";
import SiteFooter from "../../components/site-footer";
import { supabase } from "@/lib/supabase";
import { stripHtml } from "@/lib/utils";

type Content = {
  id: string; title: string; title_en?: string; slug: string;
  content: string; content_en?: string; created_at: string;
};

type Archetype = { name: string; slug: string; description: string; position: string; color: string; icon: string };

const ARCHETYPES: Archetype[] = [
  { name: "Box-to-Box Engine", slug: "box-to-box-engine", description: "High-intensity dynamism covering every blade of grass—the link between defensive graft and attacking transitions.", position: "Midfield", color: "var(--sg-secondary)", icon: "⚡" },
  { name: "Ball-Playing CB", slug: "ball-playing-cb", description: "Builds from the back: breaks the press with vertical passes and steers how the team progresses the ball.", position: "Defence", color: "var(--sg-primary)", icon: "🏗️" },
  { name: "Inverted Winger", slug: "inverted-winger", description: "Cuts inside to overload half-spaces, combining creativity and finishing from wide into central zones.", position: "Attack", color: "var(--sg-rose)", icon: "↩" },
  { name: "Inverted Full-back", slug: "inverted-fullback", description: "Steps into midfield from the back line, acting as an extra playmaker when the team has possession.", position: "Defence", color: "var(--sg-primary)", icon: "⇄" },
  { name: "False 9", slug: "false-9", description: "Drops deep to connect midfield and attack, pulling centre-backs out of shape and opening lanes.", position: "Attack", color: "var(--sg-rose)", icon: "9" },
  { name: "High Press Striker", slug: "high-press-striker", description: "The first line of defence: aggressive pressing without the ball sets the team's defensive rhythm.", position: "Attack", color: "var(--sg-rose)", icon: "↑" },
];

const posColor: Record<string, string> = {
  Midfield: "var(--sg-secondary)", Defence: "var(--sg-primary)", Attack: "var(--sg-rose, #fb7185)",
};

export default function EnTaktikLabPage() {
  const [dbContents, setDbContents] = useState<Content[]>([]);

  useEffect(() => {
    supabase.from("contents")
      .select("id,title,title_en,slug,content,content_en,created_at")
      .eq("status", "yayinda").eq("category", "taktik-lab")
      .order("created_at", { ascending: false })
      .then(({ data }) => { if (data?.length) setDbContents(data); });
  }, []);

  return (
    <main style={{ background: "var(--sg-bg)", color: "var(--sg-text-primary)", minHeight: "100vh" }}>
      <SiteHeader activeNav="taktik-lab" />
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
            <div className="eyebrow" style={{ color: "var(--sky)", marginBottom: 14 }}>TACTICAL ANALYSIS</div>
            <h1 className="display" style={{
              fontSize: "clamp(3rem, 6vw, 5rem)", fontWeight: 700,
              letterSpacing: "-0.04em", lineHeight: 0.92, margin: "0 0 20px",
            }}>
              Tactics<br />
              <span style={{
                background: "linear-gradient(120deg, var(--sky) 0%, var(--cyan) 100%)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
              }}>Lab</span>
            </h1>
            <p style={{ fontSize: 18, lineHeight: 1.6, color: "var(--sg-text-secondary)", maxWidth: 440, margin: "0 0 28px" }}>
              Position archetypes, tactical systems and game plan analyses from a scout&apos;s perspective.
            </p>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {["Box-to-Box", "Ball-Playing CB", "Inverted Winger", "False 9"].map((tag) => (
                <span key={tag} className="chip" style={{ fontSize: 10 }}>{tag}</span>
              ))}
            </div>
          </div>
          {/* Right — SVG Pitch */}
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <svg viewBox="0 0 240 340" width="240" height="340" style={{ opacity: 0.85 }}>
              <rect x="10" y="10" width="220" height="320" rx="4" fill="none" stroke="var(--sky)" strokeWidth="1.5" strokeOpacity="0.4" />
              <line x1="10" y1="170" x2="230" y2="170" stroke="var(--sky)" strokeWidth="1" strokeOpacity="0.3" />
              <circle cx="120" cy="170" r="32" fill="none" stroke="var(--sky)" strokeWidth="1" strokeOpacity="0.3" />
              <circle cx="120" cy="170" r="2" fill="var(--sky)" fillOpacity="0.4" />
              <rect x="60" y="10" width="120" height="52" rx="2" fill="none" stroke="var(--sky)" strokeWidth="1" strokeOpacity="0.25" />
              <rect x="60" y="278" width="120" height="52" rx="2" fill="none" stroke="var(--sky)" strokeWidth="1" strokeOpacity="0.25" />
              <circle cx="120" cy="40" r="8" fill="var(--sky)" fillOpacity="0.7" />
              {[60, 90, 150, 180].map((x) => <circle key={x} cx={x} cy="90" r="7" fill="var(--accent)" fillOpacity="0.7" />)}
              {[75, 120, 165].map((x) => <circle key={x} cx={x} cy="140" r="7" fill="var(--accent-2)" fillOpacity="0.7" />)}
              {[70, 120, 170].map((x) => <circle key={x} cx={x} cy="185" r="7" fill="var(--rose)" fillOpacity="0.7" />)}
              <text x="120" y="28" textAnchor="middle" fontSize="8" fill="var(--sky)" fillOpacity="0.6" fontFamily="monospace">GK</text>
              <text x="120" y="108" textAnchor="middle" fontSize="8" fill="var(--accent)" fillOpacity="0.6" fontFamily="monospace">DEF</text>
              <text x="120" y="157" textAnchor="middle" fontSize="8" fill="var(--accent-2)" fillOpacity="0.6" fontFamily="monospace">MID</text>
              <text x="120" y="202" textAnchor="middle" fontSize="8" fill="var(--rose)" fillOpacity="0.6" fontFamily="monospace">FWD</text>
              <text x="120" y="280" textAnchor="middle" fontSize="11" fill="var(--sky)" fillOpacity="0.5" fontFamily="monospace" letterSpacing="3">4-3-3</text>
            </svg>
          </div>
        </div>
      </section>

      {/* ── Content Grid ── */}
      <div style={{ maxWidth: 1440, margin: "0 auto", padding: "60px 32px 80px" }}>

        {dbContents.length > 0 && (
          <section style={{ marginBottom: 64 }}>
            <div style={{ marginBottom: 32 }}>
              <div className="eyebrow" style={{ color: "var(--sky)" }}>LATEST ANALYSES</div>
              <h2 className="display" style={{ fontSize: 28, fontWeight: 700, letterSpacing: "-0.03em", margin: "6px 0 0" }}>
                Recent Articles
              </h2>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
              {dbContents.map((item) => (
                <Link key={item.id} href={`/en/taktik-lab/${item.slug}`}
                  className="lift" style={{
                    background: "var(--sg-surface)", border: "1px solid var(--sg-border)",
                    borderRadius: 4, overflow: "hidden", display: "flex", flexDirection: "column",
                  }}>
                  <div style={{ height: 2, background: "var(--sky)" }} />
                  <div style={{ padding: "20px 24px 24px", flex: 1, display: "flex", flexDirection: "column" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                      <span className="mono" style={{ fontSize: 9, letterSpacing: "0.2em", color: "var(--sky)" }}>ANALYSIS</span>
                      <span className="mono" style={{ fontSize: 9, letterSpacing: "0.14em", color: "var(--sg-text-muted)" }}>
                        {new Date(item.created_at).toLocaleDateString("en-US", { day: "numeric", month: "short" })}
                      </span>
                    </div>
                    <h2 className="display" style={{ fontSize: 18, fontWeight: 600, lineHeight: 1.2, letterSpacing: "-0.02em", margin: "0 0 10px", textWrap: "balance" }}>
                      {item.title_en || item.title}
                    </h2>
                    <p style={{ fontSize: 13, lineHeight: 1.5, color: "var(--sg-text-secondary)", flex: 1, margin: "0 0 16px" }}>
                      {stripHtml(item.content_en || item.content).trim().slice(0, 120)}…
                    </p>
                    <div className="mono" style={{ fontSize: 10, letterSpacing: "0.14em", color: "var(--sky)" }}>READ →</div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        <section>
          <div style={{ marginBottom: 32 }}>
            <div className="eyebrow">POSITION ARCHETYPES</div>
            <h2 className="display" style={{ fontSize: 28, fontWeight: 700, letterSpacing: "-0.03em", margin: "6px 0 0" }}>
              Game Functions
            </h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
            {ARCHETYPES.map((arch) => (
              <Link key={arch.slug} href={`/en/taktik-lab/${arch.slug}`}
                className="lift" style={{
                  background: "var(--sg-surface)", border: "1px solid var(--sg-border)",
                  borderRadius: 4, overflow: "hidden", display: "flex", flexDirection: "column", position: "relative",
                }}>
                <div style={{ height: 2, background: arch.color }} />
                <div style={{ padding: "24px", flex: 1, display: "flex", flexDirection: "column", position: "relative", overflow: "hidden" }}>
                  <div style={{
                    position: "absolute", right: -8, top: -8, fontSize: 80, opacity: 0.04,
                    pointerEvents: "none", fontFamily: "var(--font-headline)", color: arch.color,
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
                  <div className="mono" style={{ fontSize: 10, letterSpacing: "0.14em", color: posColor[arch.position] ?? arch.color, marginBottom: 8 }}>
                    {arch.position.toUpperCase()}
                  </div>
                  <h2 className="display" style={{ fontSize: 16, fontWeight: 700, letterSpacing: "-0.01em", margin: "0 0 10px" }}>
                    {arch.name}
                  </h2>
                  <p style={{ fontSize: 13, lineHeight: 1.5, color: "var(--sg-text-secondary)", flex: 1 }}>
                    {arch.description}
                  </p>
                  <div className="mono" style={{ fontSize: 10, letterSpacing: "0.14em", color: arch.color, marginTop: 16 }}>
                    EXPLORE →
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <div className="grain" style={{
          marginTop: 64, padding: "48px", position: "relative", overflow: "hidden",
          background: "linear-gradient(120deg, var(--sg-surface) 0%, color-mix(in oklch, var(--sky) 20%, var(--sg-surface)) 100%)",
          border: "1px solid var(--sg-border)", borderRadius: 6,
          display: "grid", gridTemplateColumns: "1fr auto", gap: 32, alignItems: "center",
        }}>
          <div>
            <h2 className="display" style={{ fontSize: 28, fontWeight: 700, letterSpacing: "-0.03em", margin: "0 0 10px" }}>
              Ready to build your own tactic?
            </h2>
            <p style={{ fontSize: 16, color: "var(--sg-text-secondary)", margin: 0 }}>
              Use archetype models to filter your player pool and find the right piece in seconds.
            </p>
          </div>
          <Link href="/en/listeler" className="btn btn-solid" style={{ background: "var(--sky)", borderColor: "var(--sky)", whiteSpace: "nowrap" }}>
            START SYSTEM ANALYSIS →
          </Link>
        </div>
      </div>

      <SiteFooter maxWidth="max-w-7xl" />
    </main>
  );
}
