"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import SiteHeader from "./site-header";
import SiteFooter from "./site-footer";
import ArticleHtmlWithPlayerEmbeds from "./article-html-with-player-embeds";
import { supabase } from "@/lib/supabase";
import { stripHtml, contentLooksLikeHtml } from "@/lib/utils";
import { normalizeYoutubeId } from "@/lib/youtube-id";
import HubArticleBreadcrumb from "./hub/hub-article-breadcrumb";
import type { HubId } from "@/lib/hub-config";

type SidebarItem = { id: string; title: string; slug: string; category: string; created_at: string; };
export type YouTubeSearchItem = { title: string; thumbnail: string; videoId: string; channelTitle: string; };
export type NewsItem = { title: string; link: string; source: string; date: string; };

const CATEGORY_LABEL: Record<string, string> = {
  listeler: "Listeler", radar: "Radar", "taktik-lab": "Taktik Lab",
};

const CAT_ACCENT: Record<string, string> = {
  listeler: "var(--emerald)",
  radar: "var(--accent)",
  "taktik-lab": "var(--sky)",
};

const CATEGORY_TAGS: Record<string, string[]> = {
  radar: ["Scout Radar", "Oyuncu Analizi", "Genç Yetenekler"],
  listeler: ["Kürasyonlu Liste", "Scout Notu", "Oyuncu Profili"],
  "taktik-lab": ["Taktik Analiz", "Pozisyon Arketipi", "Modern Futbol"],
};

function readTime(text: string): number {
  return Math.max(1, Math.ceil(text.trim().split(/\s+/).length / 200));
}

function categoryPath(category: string): string {
  if (category === "listeler") return "/listeler";
  if (category === "radar") return "/radar";
  if (category === "taktik-lab") return "/taktik-lab";
  return "/";
}

function extractH2Headings(html: string): { text: string; id: string }[] {
  const re = /<h2[^>]*>(.*?)<\/h2>/gi;
  const results: { text: string; id: string }[] = [];
  let match;
  while ((match = re.exec(html)) !== null) {
    const text = match[1].replace(/<[^>]+>/g, "").trim();
    if (!text) continue;
    const id = text.toLowerCase().replace(/[^a-z0-9ğüşıöç]/g, "-").replace(/-+/g, "-").slice(0, 40);
    results.push({ text, id });
  }
  return results;
}

function injectHeadingIds(html: string): string {
  const re = /<h2([^>]*)>(.*?)<\/h2>/gi;
  const seen: Record<string, number> = {};
  return html.replace(re, (_full, attrs: string, inner: string) => {
    const text = inner.replace(/<[^>]+>/g, "").trim();
    const base = text.toLowerCase().replace(/[^a-z0-9ğüşıöç]/g, "-").replace(/-+/g, "-").slice(0, 40);
    const count = seen[base] ?? 0;
    seen[base] = count + 1;
    const id = count === 0 ? base : `${base}-${count}`;
    return `<h2${attrs} id="${id}">${inner}</h2>`;
  });
}

function addDropCap(html: string, accentColor: string): string {
  const re = /<p([^>]*)>([\s\S]*?)<\/p>/;
  let done = false;
  return html.replace(re, (_full, attrs: string, inner: string) => {
    if (done) return _full;
    const stripped = inner.replace(/<[^>]+>/g, "").trim();
    if (!stripped) return _full;
    const firstChar = stripped[0];
    const rest = inner.replace(firstChar, "");
    done = true;
    return `<p${attrs}><span style="float:left;font-size:5rem;line-height:0.85;font-weight:700;color:${accentColor};margin-right:8px;margin-top:4px;letter-spacing:-0.04em;font-family:var(--font-display)">${firstChar}</span>${rest}</p>`;
  });
}

function getNewsQueryFromTitle(title: string): string {
  const t = title?.trim() ?? "";
  if (!t) return "";
  const parenMatch = t.match(/^(.+?)\s*\([^)]+\)\s*$/);
  if (parenMatch) return parenMatch[1].trim();
  return t.split(/\s+/).filter(Boolean).slice(0, 2).join(" ") || t;
}

type SectionItem =
  | { type: "intro"; html: string }
  | { type: "section"; heading: string; html: string }
  | { type: "pullquote"; text: string }
  | { type: "callout"; html: string };

type Props = {
  title: string; content: string; category: string; date: string; slug: string;
  activeNav: "listeler" | "radar" | "taktik-lab";
  backHref: string; backLabel: string;
  youtubeId?: string; coverImage?: string;
  youtubeQuery1?: string; youtubeQuery2?: string;
  newsQuery?: string; playerName?: string;
  heroVariant?: string; accentOverride?: string;
  sectionsJson?: SectionItem[] | null;
  showNewsSection?: boolean; children?: React.ReactNode;
  excerptContent?: string; isPending?: boolean;
  hubId?: HubId;
};

export default function ArticleLayout({
  title, content, category, date, slug,
  activeNav, backHref, backLabel,
  youtubeId, coverImage, playerName: _playerName,
  youtubeQuery1, youtubeQuery2,
  newsQuery, showNewsSection = true, children,
  heroVariant = "text-only", accentOverride, sectionsJson,
  excerptContent: _excerptContent, isPending: _isPending,
  hubId,
}: Props) {
  const [similar, setSimilar] = useState<SidebarItem[]>([]);
  const [youtubeVideos1, setYoutubeVideos1] = useState<YouTubeSearchItem[] | null>(null);
  const [youtubeVideos2, setYoutubeVideos2] = useState<YouTubeSearchItem[] | null>(null);
  type NewsLoadState = NewsItem[] | null | "pending";
  const [newsItems, setNewsItems] = useState<NewsLoadState>(null);
  const [tocOpen, setTocOpen] = useState(false);

  const ACCENT_MAP: Record<string, string> = {
    emerald: "var(--emerald)", cyan: "var(--cyan)", sky: "var(--sky)",
    rose: "var(--rose)", amber: "var(--amber)", lime: "var(--lime)",
  };
  const accent = accentOverride ? (ACCENT_MAP[accentOverride] ?? CAT_ACCENT[category] ?? "var(--accent)") : (CAT_ACCENT[category] ?? "var(--accent)");
  const catLabel = CATEGORY_LABEL[category] ?? category;
  const tags = CATEGORY_TAGS[category] ?? [];
  const effectiveNewsQuery = showNewsSection ? (newsQuery?.trim() || getNewsQueryFromTitle(title)) : "";

  const formattedDate = new Date(date).toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" });
  const plainText = stripHtml(content);
  const minutes = readTime(plainText);

  const { processedHtml, toc } = useMemo(() => {
    if (!contentLooksLikeHtml(content)) return { processedHtml: content, toc: [] };
    const withIds = injectHeadingIds(content);
    const withDrop = addDropCap(withIds, accent);
    return { processedHtml: withDrop, toc: extractH2Headings(content) };
  }, [content, accent]);

  const youtubeEmbedId = useMemo(() => normalizeYoutubeId(youtubeId), [youtubeId]);

  const canonicalUrl = `https://scoutgamer.com${categoryPath(category)}/${slug}`;
  const xShareUrl = `https://x.com/intent/tweet?text=${encodeURIComponent(title + " | Scout Gamer")}&url=${encodeURIComponent(canonicalUrl)}`;
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(title + " " + canonicalUrl)}`;

  const sidebarHubPromo =
    category === "taktik-lab"
      ? {
          eyebrow: "✦ TAKTİK LAB",
          title: "Pozisyon arketipleri.",
          description: "Modern futbolda roller, yapılar ve oyun kurucular.",
          href: "/taktik-lab",
          cta: "TAKTİK LAB'A GİT →",
        }
      : {
          eyebrow: "✦ HAFTALIK RADAR",
          title: "Her hafta bir oyuncu.",
          description: "Yükselen oyuncuları, taktik gözüyle ve oyun istatistikleriyle birlikte.",
          href: "/radar",
          cta: "RADAR'A GİT →",
        };

  useEffect(() => {
    supabase.from("contents").select("id,title,slug,category,created_at")
      .eq("status", "yayinda").eq("category", category).neq("slug", slug)
      .order("created_at", { ascending: false }).limit(4)
      .then(({ data }) => { if (data) setSimilar(data); });
  }, [category, slug]);

  useEffect(() => {
    if (!slug) return;
    fetch("/api/view", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ slug }) })
      .catch(() => {});
  }, [slug]);

  useEffect(() => {
    const q = youtubeQuery1?.trim();
    if (!q) { setYoutubeVideos1(null); return; }
    let cancelled = false;
    fetch(`/api/youtube?query=${encodeURIComponent(q)}`)
      .then(r => r.ok ? r.json() : [])
      .then((arr: YouTubeSearchItem[]) => { if (!cancelled) setYoutubeVideos1(Array.isArray(arr) ? arr : []); })
      .catch(() => { if (!cancelled) setYoutubeVideos1([]); });
    return () => { cancelled = true; };
  }, [youtubeQuery1]);

  useEffect(() => {
    const q = youtubeQuery2?.trim();
    if (!q) { setYoutubeVideos2(null); return; }
    let cancelled = false;
    fetch(`/api/youtube?query=${encodeURIComponent(q)}`)
      .then(r => r.ok ? r.json() : [])
      .then((arr: YouTubeSearchItem[]) => { if (!cancelled) setYoutubeVideos2(Array.isArray(arr) ? arr : []); })
      .catch(() => { if (!cancelled) setYoutubeVideos2([]); });
    return () => { cancelled = true; };
  }, [youtubeQuery2]);

  useEffect(() => {
    const q = effectiveNewsQuery?.trim();
    if (!q) {
      setNewsItems(null);
      return;
    }
    let cancelled = false;
    setNewsItems("pending");
    fetch(`/api/news?query=${encodeURIComponent(q)}&locale=en`)
      .then((r) => (r.ok ? r.json() : []))
      .then((arr: NewsItem[]) => {
        if (!cancelled) setNewsItems(Array.isArray(arr) ? arr : []);
      })
      .catch(() => {
        if (!cancelled) setNewsItems([]);
      });
    return () => {
      cancelled = true;
    };
  }, [effectiveNewsQuery]);

  return (
    <main style={{ background: "var(--sg-bg)", color: "var(--sg-text-primary)", minHeight: "100vh" }}>
      <SiteHeader activeNav={activeNav} />
      <div style={{ paddingTop: "68px" }} />

      {/* ── V2 Editorial Hero ── */}
      <header style={{
        position: "relative", overflow: "hidden",
        background: `linear-gradient(180deg, oklch(0.13 0.018 240) 0%, oklch(0.10 0.012 250) 100%)`,
        borderBottom: "1px solid var(--sg-border)",
      }}>
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: accent }} />
        <div style={{
          position: "absolute", inset: 0, opacity: 0.04, pointerEvents: "none",
          backgroundImage: "repeating-linear-gradient(90deg, rgba(255,255,255,0.5) 0 1px, transparent 1px 22px)",
        }} />
        <div style={{
          position: "absolute", bottom: -240, left: -120, width: 600, height: 600, borderRadius: "50%",
          background: `radial-gradient(circle, ${accent} 0%, transparent 65%)`, opacity: 0.12, pointerEvents: "none",
        }} />

        <div className="sg-site-container" style={{ paddingTop: 40, paddingBottom: 72, position: "relative" }}>
          {/* Back + breadcrumb */}
          <button onClick={() => window.history.back()} className="mono" style={{
            background: "transparent", border: "none", color: "var(--sg-text-muted)",
            fontSize: 11, letterSpacing: "0.14em", padding: 0, marginBottom: hubId ? 12 : 48, cursor: "pointer",
          }}>
            ← {backLabel}
          </button>
          {hubId ? (
            <div style={{ marginBottom: 36 }}>
              <HubArticleBreadcrumb hubId={hubId} />
            </div>
          ) : null}

          {heroVariant === "radar-player-focus" && children ? (
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", marginBottom: 28 }}>
                <span className="chip solid" style={{ background: accent, borderColor: accent, color: "var(--ink-900)", fontSize: 10 }}>
                  {catLabel.toUpperCase()}
                </span>
                <span className="mono" style={{ fontSize: 10, letterSpacing: "0.18em", color: accent }}>•</span>
                <span className="mono" style={{ fontSize: 10, letterSpacing: "0.14em", color: "var(--sg-text-muted)" }}>
                  HAFTANIN OYUNCUSU
                </span>
                <span className="mono" style={{ fontSize: 10, letterSpacing: "0.18em", color: "var(--sg-text-muted)" }}>
                  {formattedDate}
                </span>
              </div>

              <h1 className="display" style={{
                fontSize: "clamp(40px, 5.5vw, 80px)", fontWeight: 700,
                letterSpacing: "-0.04em", margin: 0, lineHeight: 0.92,
                textWrap: "balance", color: "var(--sg-text-primary)",
              }}>
                <span className="grad-text">{title}</span>
              </h1>

              <div style={{
                display: "flex", gap: 20, marginTop: 36, alignItems: "center",
                paddingTop: 24, borderTop: "1px solid var(--sg-border)", maxWidth: 720,
              }}>
                <div>
                  <div className="mono" style={{ fontSize: 9, letterSpacing: "0.18em", color: "var(--sg-text-muted)" }}>YAYIN</div>
                  <div className="mono" style={{ fontSize: 13, color: "var(--sg-text-primary)", marginTop: 2, letterSpacing: "0.04em" }}>{formattedDate}</div>
                </div>
                <div style={{ width: 1, height: 32, background: "var(--sg-border)" }} />
                <div>
                  <div className="mono" style={{ fontSize: 9, letterSpacing: "0.18em", color: "var(--sg-text-muted)" }}>SÜRE</div>
                  <div className="mono" style={{ fontSize: 13, color: "var(--sg-text-primary)", marginTop: 2, letterSpacing: "0.04em" }}>{minutes} DK OKUMA</div>
                </div>
                <div style={{ width: 1, height: 32, background: "var(--sg-border)" }} />
                <div>
                  <div className="mono" style={{ fontSize: 9, letterSpacing: "0.18em", color: "var(--sg-text-muted)" }}>EDİTÖR</div>
                  <div className="mono" style={{ fontSize: 13, color: "var(--sg-text-primary)", marginTop: 2, letterSpacing: "0.04em" }}>SCOUT GAMER</div>
                </div>
              </div>

              <div style={{ marginTop: 48, paddingTop: 40, borderTop: "1px solid var(--sg-border)" }}>
                {children}
              </div>
            </div>
          ) : (
          <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 56, alignItems: "end" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 28 }}>
                <span className="chip solid" style={{ background: accent, borderColor: accent, color: "var(--ink-900)", fontSize: 10 }}>
                  {catLabel.toUpperCase()}
                </span>
                <span className="mono" style={{ fontSize: 10, letterSpacing: "0.18em", color: "var(--sg-text-muted)" }}>
                  {formattedDate}
                </span>
              </div>

              <h1 className="display" style={{
                fontSize: "clamp(40px, 5.5vw, 80px)", fontWeight: 700,
                letterSpacing: "-0.04em", margin: 0, lineHeight: 0.92,
                textWrap: "balance", color: "var(--sg-text-primary)",
              }}>
                <span className="grad-text">{title}</span>
              </h1>

              <div style={{
                display: "flex", gap: 20, marginTop: 36, alignItems: "center",
                paddingTop: 24, borderTop: "1px solid var(--sg-border)", maxWidth: 600,
              }}>
                <div>
                  <div className="mono" style={{ fontSize: 9, letterSpacing: "0.18em", color: "var(--sg-text-muted)" }}>YAYIN</div>
                  <div className="mono" style={{ fontSize: 13, color: "var(--sg-text-primary)", marginTop: 2, letterSpacing: "0.04em" }}>{formattedDate}</div>
                </div>
                <div style={{ width: 1, height: 32, background: "var(--sg-border)" }} />
                <div>
                  <div className="mono" style={{ fontSize: 9, letterSpacing: "0.18em", color: "var(--sg-text-muted)" }}>SÜRE</div>
                  <div className="mono" style={{ fontSize: 13, color: "var(--sg-text-primary)", marginTop: 2, letterSpacing: "0.04em" }}>{minutes} DK OKUMA</div>
                </div>
                <div style={{ width: 1, height: 32, background: "var(--sg-border)" }} />
                <div>
                  <div className="mono" style={{ fontSize: 9, letterSpacing: "0.18em", color: "var(--sg-text-muted)" }}>EDİTÖR</div>
                  <div className="mono" style={{ fontSize: 13, color: "var(--sg-text-primary)", marginTop: 2, letterSpacing: "0.04em" }}>SCOUT GAMER</div>
                </div>
              </div>
            </div>

            {/* Right side — varies by heroVariant */}
            <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "flex-end" }}>
              {heroVariant === "player-cards" && children ? (
                <div style={{ width: "100%", maxWidth: 320 }}>{children}</div>
              ) : heroVariant === "cover-image" && coverImage ? (
                <div style={{ width: "100%", maxWidth: 380, borderRadius: 4, overflow: "hidden", border: "1px solid var(--sg-border)" }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={coverImage} alt={title} style={{ width: "100%", display: "block", objectFit: "cover", aspectRatio: "16/10" }} />
                </div>
              ) : heroVariant === "pitch-diagram" ? (
                <div style={{ width: "100%", maxWidth: 340 }}>
                  <svg viewBox="0 0 340 240" style={{ width: "100%", height: "auto", display: "block" }}>
                    <rect x="0" y="0" width="340" height="240" rx="4" fill="oklch(0.15 0.03 160)" stroke={accent} strokeWidth="1" strokeOpacity="0.4" />
                    <rect x="20" y="20" width="300" height="200" rx="2" fill="none" stroke={accent} strokeWidth="1" strokeOpacity="0.5" />
                    <line x1="170" y1="20" x2="170" y2="220" stroke={accent} strokeWidth="0.8" strokeOpacity="0.3" />
                    <circle cx="170" cy="120" r="40" fill="none" stroke={accent} strokeWidth="0.8" strokeOpacity="0.35" />
                    <circle cx="170" cy="120" r="3" fill={accent} />
                    <rect x="130" y="20" width="80" height="30" rx="1" fill="none" stroke={accent} strokeWidth="0.8" strokeOpacity="0.4" />
                    <rect x="150" y="20" width="40" height="12" rx="1" fill="none" stroke={accent} strokeWidth="0.8" strokeOpacity="0.4" />
                    <rect x="130" y="190" width="80" height="30" rx="1" fill="none" stroke={accent} strokeWidth="0.8" strokeOpacity="0.4" />
                    <rect x="150" y="208" width="40" height="12" rx="1" fill="none" stroke={accent} strokeWidth="0.8" strokeOpacity="0.4" />
                    {[{x:170,y:55},{x:100,y:90},{x:240,y:90},{x:100,y:150},{x:240,y:150},{x:170,y:185},{x:60,y:120},{x:280,y:120}].map((p,i) => (
                      <circle key={i} cx={p.x} cy={p.y} r="6" fill={accent} fillOpacity="0.7" stroke={accent} strokeWidth="1" />
                    ))}
                  </svg>
                </div>
              ) : heroVariant === "stat-focus" && children ? (
                <div style={{ width: "100%", maxWidth: 320 }}>{children}</div>
              ) : (
                <div style={{
                  width: "100%", maxWidth: 320,
                  border: "1px solid var(--sg-border)", borderRadius: 4, overflow: "hidden",
                  background: "linear-gradient(135deg, var(--sg-surface) 0%, var(--sg-surface-low) 100%)",
                  aspectRatio: "3/4", display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <div style={{ textAlign: "center" }}>
                    <div className="display" style={{
                      fontSize: 80, fontWeight: 700, color: accent, opacity: 0.15,
                      lineHeight: 1, letterSpacing: "-0.05em",
                    }}>SG</div>
                    <div className="mono" style={{ fontSize: 10, letterSpacing: "0.2em", color: "var(--sg-text-muted)", marginTop: 8 }}>
                      SCOUT GAMER
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          )}
        </div>
      </header>

      {youtubeEmbedId && (
        <section style={{ background: "var(--sg-bg)", borderBottom: "1px solid var(--sg-border)" }}>
          <div style={{ maxWidth: 960, margin: "0 auto", padding: "28px 32px 40px" }}>
            <div className="mono" style={{ fontSize: 10, letterSpacing: "0.18em", color: accent, marginBottom: 14 }}>
              ÖNE ÇIKAN VİDEO
            </div>
            <div style={{
              position: "relative",
              width: "100%",
              aspectRatio: "16 / 9",
              borderRadius: 6,
              overflow: "hidden",
              border: "1px solid var(--sg-border)",
              background: "var(--sg-surface-low)",
            }}>
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${youtubeEmbedId}`}
                title={`${title} — YouTube`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
                style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: "none" }}
              />
            </div>
          </div>
        </section>
      )}

      {/* ── TOC Strip ── */}
      {toc.length > 1 && (
        <div style={{ background: "var(--sg-bg)", borderBottom: "1px solid var(--sg-border)" }}>
          <div style={{ maxWidth: 1280, margin: "0 auto", padding: "16px 32px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
              <div className="mono" style={{ fontSize: 10, letterSpacing: "0.2em", color: "var(--sg-text-muted)", whiteSpace: "nowrap" }}>
                BU YAZIDA
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {toc.map((item, i) => (
                  <a key={item.id} href={`#${item.id}`} className="chip"
                    style={{ cursor: "pointer", borderColor: "var(--sg-border)", fontSize: 10, textDecoration: "none" }}>
                    <span style={{ color: accent, marginRight: 4 }}>{String(i + 1).padStart(2, "0")}</span>
                    {item.text.length > 30 ? item.text.slice(0, 30) + "…" : item.text}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Article Body + Sidebar ── */}
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "80px 32px 80px", display: "grid", gridTemplateColumns: "1fr 320px", gap: 64, alignItems: "start" }}>

        {/* Left — article body */}
        <article>
          {/* Content — sections_json (V2 structured) or legacy HTML */}
          <div className="article-v2" style={{ fontSize: 19, lineHeight: 1.65, color: "var(--sg-text-secondary)" }}>
            {sectionsJson && sectionsJson.length > 0 ? (
              <div>
                {sectionsJson.map((sec, i) => {
                  if (sec.type === "intro") {
                    return (
                      <ArticleHtmlWithPlayerEmbeds key={i} html={addDropCap(sec.html, accent)} locale="en" />
                    );
                  }
                  if (sec.type === "section") {
                    const headingId = sec.heading.toLowerCase().replace(/[^a-z0-9ğüşıöç]/g, "-").replace(/-+/g, "-").slice(0, 40);
                    return (
                      <div key={i}>
                        <h2 id={headingId}>{sec.heading}</h2>
                        <ArticleHtmlWithPlayerEmbeds html={sec.html} locale="en" />
                      </div>
                    );
                  }
                  if (sec.type === "pullquote") {
                    return (
                      <blockquote key={i}>
                        {sec.text}
                      </blockquote>
                    );
                  }
                  if (sec.type === "callout") {
                    return (
                      <div key={i} className="callout" dangerouslySetInnerHTML={{ __html: sec.html }} />
                    );
                  }
                  return null;
                })}
              </div>
            ) : contentLooksLikeHtml(content) ? (
              <ArticleHtmlWithPlayerEmbeds html={processedHtml} locale="en" />
            ) : (
              <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
                {content}
              </ReactMarkdown>
            )}
          </div>

          {/* YouTube sections */}
          {youtubeQuery1?.trim() && (
            <div style={{ marginTop: 48, paddingTop: 48, borderTop: "1px solid var(--sg-border)" }}>
              <div className="eyebrow" style={{ color: accent, marginBottom: 20 }}>
                VİDEO · {youtubeQuery1.trim().toUpperCase()}
              </div>
              {youtubeVideos1 === null ? (
                <p className="mono" style={{ fontSize: 11, color: "var(--sg-text-muted)" }}>Yükleniyor…</p>
              ) : youtubeVideos1.length === 0 ? (
                <p className="mono" style={{ fontSize: 11, color: "var(--sg-text-muted)" }}>Video bulunamadı.</p>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
                  {youtubeVideos1.map(v => (
                    <a key={v.videoId} href={`https://www.youtube.com/watch?v=${v.videoId}`} target="_blank" rel="noopener noreferrer"
                      className="lift" style={{ textDecoration: "none", background: "var(--sg-surface)", borderRadius: 4, overflow: "hidden" }}>
                      <div style={{ aspectRatio: "16/9", overflow: "hidden" }}>
                        <img src={v.thumbnail} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      </div>
                      <div style={{ padding: "10px 12px" }}>
                        <p style={{ fontSize: 12, fontWeight: 500, lineHeight: 1.3, color: "var(--sg-text-primary)", margin: 0,
                          display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                          {v.title}
                        </p>
                        <p style={{ fontSize: 10, color: "var(--sg-text-muted)", marginTop: 4 }}>{v.channelTitle}</p>
                      </div>
                    </a>
                  ))}
                </div>
              )}
            </div>
          )}

          {youtubeQuery2?.trim() && (
            <div style={{ marginTop: 40 }}>
              <div className="eyebrow" style={{ color: accent, marginBottom: 20 }}>
                VİDEO · {youtubeQuery2.trim().toUpperCase()}
              </div>
              {youtubeVideos2 === null ? (
                <p className="mono" style={{ fontSize: 11, color: "var(--sg-text-muted)" }}>Yükleniyor…</p>
              ) : youtubeVideos2.length === 0 ? null : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
                  {youtubeVideos2.map(v => (
                    <a key={v.videoId} href={`https://www.youtube.com/watch?v=${v.videoId}`} target="_blank" rel="noopener noreferrer"
                      className="lift" style={{ textDecoration: "none", background: "var(--sg-surface)", borderRadius: 4, overflow: "hidden" }}>
                      <div style={{ aspectRatio: "16/9", overflow: "hidden" }}>
                        <img src={v.thumbnail} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      </div>
                      <div style={{ padding: "10px 12px" }}>
                        <p style={{ fontSize: 12, fontWeight: 500, lineHeight: 1.3, color: "var(--sg-text-primary)", margin: 0,
                          display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                          {v.title}
                        </p>
                      </div>
                    </a>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* News */}
          {showNewsSection && effectiveNewsQuery.trim() && newsItems !== null && (
            <div style={{ marginTop: 48, paddingTop: 48, borderTop: "1px solid var(--sg-border)" }}>
              <div className="eyebrow" style={{ color: accent, marginBottom: 20 }}>GÜNCEL HABERLER</div>
              {newsItems === "pending" ? (
                <p className="mono" style={{ fontSize: 11, color: "var(--sg-text-muted)" }}>Yükleniyor…</p>
              ) : newsItems.length === 0 ? (
                <p className="mono" style={{ fontSize: 11, color: "var(--sg-text-muted)", lineHeight: 1.5 }}>
                  Bu anahtar kelimeyle şu an RSS kaynaklarından haber alınamadı. İstersen içerik düzenlemede Haber Arama Keyword alanını güncelleyebilirsin.
                </p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                  {newsItems.map((item, i) => (
                    <a key={i} href={item.link} target="_blank" rel="noopener noreferrer"
                      style={{
                        display: "flex", alignItems: "center", gap: 16, padding: "14px 0",
                        borderBottom: i < newsItems.length - 1 ? "1px solid var(--sg-border)" : "none",
                        textDecoration: "none",
                      }}>
                      <span className="mono" style={{ fontSize: 10, letterSpacing: "0.12em", color: accent, minWidth: 72, flexShrink: 0 }}>
                        {item.source || "—"}
                      </span>
                      <span style={{ flex: 1, fontSize: 14, fontWeight: 500, color: "var(--sg-text-primary)",
                        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {item.title}
                      </span>
                      {item.date && <span className="mono" style={{ fontSize: 10, color: "var(--sg-text-muted)", flexShrink: 0 }}>{item.date}</span>}
                    </a>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tags + Share */}
          <div style={{ marginTop: 64, paddingTop: 32, borderTop: "1px solid var(--sg-border)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
              <span className="mono" style={{ fontSize: 10, letterSpacing: "0.18em", color: "var(--sg-text-muted)", marginRight: 8 }}>ETİKETLER</span>
              {tags.map(t => <span key={t} className="chip" style={{ fontSize: 10 }}>{t}</span>)}
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <span className="mono" style={{ fontSize: 10, letterSpacing: "0.18em", color: "var(--sg-text-muted)", alignSelf: "center" }}>PAYLAŞ</span>
              <a href={xShareUrl} target="_blank" rel="noopener noreferrer" className="btn" style={{ fontSize: 10 }}>X / TWITTER</a>
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="btn" style={{ fontSize: 10 }}>WHATSAPP</a>
              <button className="btn" style={{ fontSize: 10 }} onClick={() => navigator.clipboard?.writeText(window.location.href)}>↗ KOPYALA</button>
            </div>
          </div>

          {/* Back to category */}
          <div style={{ marginTop: 48 }}>
            <Link href={backHref} className="btn btn-solid" style={{ background: accent, borderColor: accent }}>
              ← {backLabel}
            </Link>
          </div>
        </article>

        {/* Right — sticky sidebar */}
        <aside style={{ position: "sticky", top: 100 }}>
          <div style={{ marginBottom: 32, padding: "20px 20px", background: "var(--sg-surface)", borderRadius: 6, border: "1px solid var(--sg-border)" }}>
            <div className="mono" style={{ fontSize: 9, letterSpacing: "0.2em", color: "var(--sg-text-muted)", marginBottom: 14 }}>PAYLAŞ</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <a href={xShareUrl} target="_blank" rel="noopener noreferrer"
                style={{ fontSize: 11, fontWeight: 600, color: "var(--sg-text-primary)", textDecoration: "none", padding: "8px 12px", background: "var(--sg-surface-high)", borderRadius: 4 }}>
                𝕏 Twitter&apos;da Paylaş
              </a>
              <button type="button" onClick={() => navigator.clipboard?.writeText(window.location.href)}
                style={{ fontSize: 11, fontWeight: 600, color: "var(--sg-text-primary)", padding: "8px 12px", background: "var(--sg-surface-high)", borderRadius: 4, border: "none", cursor: "pointer", textAlign: "left" }}>
                🔗 Bağlantıyı Kopyala
              </button>
            </div>
          </div>

          {similar.length > 0 && (
            <div style={{ marginBottom: 32 }}>
              <div className="eyebrow" style={{ marginBottom: 16 }}>İLGİLİ İÇERİKLER</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {similar.map(item => (
                  <Link key={item.id} href={`${categoryPath(item.category)}/${item.slug}`}
                    className="lift" style={{
                      background: "var(--sg-surface)", border: "1px solid var(--sg-border)",
                      borderRadius: 4, padding: 16, textDecoration: "none",
                      display: "flex", alignItems: "flex-start", gap: 12,
                    }}>
                    <div style={{ flex: "0 0 3px", alignSelf: "stretch", background: accent, borderRadius: 2 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="display" style={{ fontSize: 14, fontWeight: 600, color: "var(--sg-text-primary)", lineHeight: 1.3,
                        display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                        {item.title}
                      </div>
                      <div className="mono" style={{ fontSize: 9, letterSpacing: "0.14em", color: "var(--sg-text-muted)", marginTop: 4 }}>
                        {new Date(item.created_at).toLocaleDateString("tr-TR", { day: "numeric", month: "short" })}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Category hub CTA */}
          <div className="grain" style={{
            background: `linear-gradient(135deg, var(--sg-surface) 0%, color-mix(in oklch, ${accent} 12%, var(--sg-surface)) 100%)`,
            border: `1px solid ${accent}`, borderRadius: 4, padding: 24, position: "relative", overflow: "hidden",
          }}>
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: accent }} />
            <div className="mono" style={{ fontSize: 10, letterSpacing: "0.2em", color: accent, marginBottom: 12 }}>
              {sidebarHubPromo.eyebrow}
            </div>
            <div className="display" style={{ fontSize: 20, fontWeight: 700, letterSpacing: "-0.02em", marginBottom: 8 }}>
              {sidebarHubPromo.title}
            </div>
            <p style={{ fontSize: 13, color: "var(--sg-text-secondary)", lineHeight: 1.5, marginBottom: 16 }}>
              {sidebarHubPromo.description}
            </p>
            <Link href={sidebarHubPromo.href} className="btn btn-solid" style={{ background: accent, borderColor: accent, fontSize: 10, display: "inline-block" }}>
              {sidebarHubPromo.cta}
            </Link>
          </div>
        </aside>
      </div>

      <SiteFooter maxWidth="max-w-7xl" />
    </main>
  );
}
