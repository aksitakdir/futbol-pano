"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import SiteHeader from "../components/site-header";
import SiteFooter from "../components/site-footer";
import { ContentHighlightPills } from "../components/content-highlight-pills";
import { supabase } from "@/lib/supabase";
import { stripHtml } from "@/lib/utils";
import { extractArticleHighlights, HIGHLIGHT_CARD_ACCENTS_CYCLE } from "@/lib/content-highlight-tags";
import { getCategoryImage } from "@/lib/category-images";


type Content = {
  id: string; title: string; title_en?: string; slug: string;
  content: string; content_en?: string; created_at: string;
  cover_image?: string | null;
};

type Archetype = { name: string; slug: string; description: string; position: string; color: string; exemplars: string[]; };

const ARCHETYPES: Archetype[] = [
  { name: "Box-to-Box Engine", slug: "box-to-box-engine", description: "High-intensity dynamism covering every blade of grass—the link between defensive graft and attacking transitions.", position: "Midfield", color: "var(--accent-2)", exemplars: ["Kimmich", "Caicedo", "Pedri"] },
  { name: "Ball-Playing CB", slug: "ball-playing-cb", description: "Builds from the back: breaks the press with vertical passes and steers how the team progresses the ball.", position: "Defence", color: "var(--sky)", exemplars: ["Rúben Dias", "Saliba", "Timber"] },
  { name: "Inverted Winger", slug: "inverted-winger", description: "Cuts inside to overload half-spaces, combining creativity and finishing from wide into central zones.", position: "Attack", color: "var(--rose)", exemplars: ["Saka", "Foden", "Vinícius"] },
  { name: "Inverted Full-back", slug: "inverted-fullback", description: "Steps into midfield from the back line, acting as an extra playmaker when the team has possession.", position: "Defence", color: "var(--emerald)", exemplars: ["Robertson", "Trent", "Grimaldo"] },
  { name: "False 9", slug: "false-9", description: "Drops deep to connect midfield and attack, pulling centre-backs out of shape and opening lanes.", position: "Attack", color: "var(--amber)", exemplars: ["De Bruyne", "Messi", "Arda Güler"] },
  { name: "High Press Striker", slug: "high-press-striker", description: "The first line of defence: aggressive pressing without the ball sets the team's defensive rhythm.", position: "Attack", color: "var(--rose)", exemplars: ["Nunez", "Højlund", "Isak"] },
];

export default function TaktikLabPage() {
  const [dbContents, setDbContents] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);

  const highlightsBySlug = useMemo(() => {
    const m = new Map<string, string[]>();
    for (const item of dbContents) {
      const body = item.content_en || item.content;
      const ttl = item.title_en || item.title;
      m.set(item.slug, extractArticleHighlights(body, { max: 4, seed: item.slug, titleHint: ttl }));
    }
    return m;
  }, [dbContents]);

  useEffect(() => {
    supabase.from("contents")
      .select("id,title,title_en,slug,content,content_en,created_at,cover_image")
      .eq("status", "published").eq("category", "tactics-lab")
      .order("created_at", { ascending: false })
      .then(({ data }) => { setDbContents(data ?? []); setLoading(false); });
  }, []);

  const featured = dbContents[0];
  const recentRest = dbContents.slice(1);
  const featuredHighlights = featured ? highlightsBySlug.get(featured.slug) : undefined;

  return (
    <main style={{ background: "var(--sg-bg)", color: "var(--sg-text-primary)", minHeight: "100vh" }}>
      <SiteHeader activeNav="tactics-lab" />
      <div style={{ paddingTop: "68px" }} />

      <div className="sg-hero-text-block sg-page-shell--hero" style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 32, alignItems: "end" }}>
        <div>
          <div className="eyebrow" style={{ color: "var(--sky)" }}>POSITION ARCHETYPES</div>
          <h1 className="display" style={{ fontSize: "clamp(56px, 7vw, 84px)", fontWeight: 700, letterSpacing: "-0.04em", lineHeight: 0.9, margin: "8px 0 0" }}>
            Tactics Lab
          </h1>
        </div>
        <p style={{ fontSize: 18, color: "var(--sg-text-secondary)", lineHeight: 1.5, margin: 0 }}>
          {"Modern football's position archetypes. Each is a role — who plays it best?"}
        </p>
      </div>

      <div className="sg-page-shell" style={{ paddingBottom: 80 }}>
        {!loading && featured && (
          <Link href={`/tactics-lab/${featured.slug}`} className="lift" style={{ display: "block", position: "relative", overflow: "hidden", background: "linear-gradient(135deg, oklch(0.18 0.02 20) 0%, oklch(0.12 0.012 250) 70%)", border: "1px solid var(--sg-border)", borderRadius: 16, marginBottom: 64, minHeight: 320, textDecoration: "none" }}>
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: "var(--sky)" }} />
            <div style={{ position: "absolute", top: -160, right: -120, width: 480, height: 480, borderRadius: "50%", background: "radial-gradient(circle, var(--sky) 0%, transparent 65%)", opacity: 0.15, pointerEvents: "none" }} />
            <div style={{ position: "absolute", inset: 0, opacity: 0.04, pointerEvents: "none", backgroundImage: "repeating-linear-gradient(-45deg, rgba(255,255,255,0.5) 0 1px, transparent 1px 22px)" }} />
            <svg viewBox="0 0 200 120" preserveAspectRatio="none" style={{ position: "absolute", right: 0, top: 0, height: "100%", width: "42%", opacity: 0.32, pointerEvents: "none" }}>
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
                <span className="chip solid" style={{ background: "var(--sky)", borderColor: "var(--sky)", color: "var(--ink-900)", fontSize: 10 }}>COVER ANALYSIS</span>
                <span className="mono" style={{ fontSize: 10, letterSpacing: "0.18em", color: "var(--sg-text-muted)" }}>
                  TACTICS · {new Date(featured.created_at).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })}
                </span>
                {!featured.title_en && <span className="mono" style={{ fontSize: 9, color: "var(--amber)" }}>DRAFT</span>}
              </div>
              <h2 className="display" style={{ fontSize: "clamp(32px, 4.4vw, 56px)", fontWeight: 700, letterSpacing: "-0.04em", margin: 0, lineHeight: 0.95, textWrap: "balance", color: "var(--sg-text-primary)" }}>
                <span className="grad-text">{featured.title_en || featured.title}</span>
              </h2>
              <p style={{ fontSize: 16, color: "var(--sg-text-secondary)", lineHeight: 1.55, marginTop: 18, maxWidth: 580 }}>
                {stripHtml(featured.content_en || featured.content).replace(/\s+/g, " ").trim().slice(0, 200)}…
              </p>
              {featuredHighlights?.length ? (
                <div style={{ marginTop: 22 }}>
                  <ContentHighlightPills tags={featuredHighlights.slice(0, 4)} accent="var(--sky)" label="HIGHLIGHTS" />
                </div>
              ) : null}
              <div style={{ marginTop: 24 }}>
                <span className="btn btn-solid" style={{ background: "var(--sky)", borderColor: "var(--sky)" }}>READ ANALYSIS →</span>
              </div>
            </div>
          </Link>
        )}

        {!loading && recentRest.length > 0 && (
          <section style={{ marginBottom: 80 }}>
            <div className="eyebrow" style={{ marginBottom: 20 }}>RECENT ANALYSES</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 260px), 1fr))", gap: 16 }}>
              {recentRest.map((item, i) => {
                const accent = HIGHLIGHT_CARD_ACCENTS_CYCLE[(i + 1) % HIGHLIGHT_CARD_ACCENTS_CYCLE.length]!;
                const pills = highlightsBySlug.get(item.slug) ?? [];
                const coverImg = item.cover_image?.trim() || getCategoryImage("tactics-lab", item.slug);
                return (
                  <Link key={item.id} href={`/tactics-lab/${item.slug}`}
                    className="lift" style={{ background: "var(--sg-surface)", border: "1px solid var(--sg-border)", borderRadius: 12, overflow: "hidden", cursor: "pointer", textDecoration: "none", display: "flex", flexDirection: "column" }}>
                    <div style={{ position: "relative", height: 140, overflow: "hidden" }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={coverImg} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", filter: "brightness(0.65) saturate(0.85)" }} loading="lazy" />
                      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, var(--sg-surface) 0%, transparent 60%)" }} />
                    </div>
                    <div style={{ padding: "16px 20px 24px", flex: 1, display: "flex", flexDirection: "column" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                        <span className="mono" style={{ fontSize: 9, letterSpacing: "0.2em", color: accent }}>
                          TACTICS{!item.title_en ? " · DRAFT" : ""}
                        </span>
                        <span className="mono" style={{ fontSize: 9, letterSpacing: "0.14em", color: "var(--sg-text-muted)" }}>
                          {new Date(item.created_at).toLocaleDateString("en-US", { day: "numeric", month: "short" })}
                        </span>
                      </div>
                      <h3 className="display" style={{ fontSize: 18, fontWeight: 600, lineHeight: 1.2, letterSpacing: "-0.02em", margin: 0, textWrap: "balance", color: "var(--sg-text-primary)", flex: 1 }}>
                        {item.title_en || item.title}
                      </h3>
                      <div style={{ marginTop: "auto", paddingTop: 16, borderTop: "1px solid var(--sg-border)" }}>
                        {pills.length > 0 ? <ContentHighlightPills tags={pills.slice(0, 4)} accent={accent} label="HIGHLIGHTS" /> : null}
                        <span className="mono u-link" style={{ fontSize: 11, letterSpacing: "0.16em", color: accent, display: "block", marginTop: pills.length ? 12 : 0 }}>READ →</span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        <section>
          <div className="eyebrow" style={{ marginBottom: 20 }}>ARCHETYPES</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
            {ARCHETYPES.map((arch) => {
              const c = arch.color;
              const fromContent = highlightsBySlug.get(arch.slug);
              const pillTags = fromContent && fromContent.length > 0 ? fromContent.slice(0, 4) : arch.exemplars;
              return (
                <Link key={arch.slug} href={`/tactics-lab/${arch.slug}`}
                  className="lift" style={{ position: "relative", cursor: "pointer", background: "var(--sg-surface)", border: "1px solid var(--sg-border)", borderRadius: 12, padding: 32, minHeight: 280, display: "flex", flexDirection: "column", justifyContent: "space-between", gap: 24, overflow: "hidden", textDecoration: "none" }}>
                  <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: c }} />
                  <div style={{ position: "absolute", right: -40, top: -40, width: 200, height: 200, borderRadius: "50%", background: `radial-gradient(circle, ${c} 0%, transparent 70%)`, opacity: 0.15 }} />
                  <div>
                    <div className="mono" style={{ fontSize: 10, letterSpacing: "0.18em", color: c }}>{arch.position.toUpperCase()}</div>
                    <h3 className="display" style={{ fontSize: 28, fontWeight: 700, letterSpacing: "-0.03em", margin: "12px 0 0", lineHeight: 1.05, textWrap: "balance", color: "var(--sg-text-primary)" }}>{arch.name}</h3>
                    <p style={{ fontSize: 14, color: "var(--sg-text-secondary)", marginTop: 12, lineHeight: 1.5 }}>{arch.description}</p>
                  </div>
                  <div>
                    <div className="mono" style={{ fontSize: 9, letterSpacing: "0.14em", color: "var(--sg-text-muted)", marginBottom: 8 }}>BEST PRACTITIONERS</div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                      {pillTags.map((ex, pi) => (
                        <span key={`${ex}-${pi}`} className="chip" style={{ borderColor: c, color: c, fontSize: 10, background: "transparent" }}>{ex}</span>
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
