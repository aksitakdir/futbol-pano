"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { IconClock, IconArrowRight } from "./icons";

const ARTICLE_BODY_CLASS =
  "article-body text-[15px] leading-[1.7] [&_h1]:mb-4 [&_h1]:mt-6 [&_h1]:text-xl [&_h1]:font-extrabold [&_h1]:text-slate-50 [&_h1]:first:mt-0 [&_h2]:mb-3 [&_h2]:mt-5 [&_h2]:text-lg [&_h2]:font-bold [&_h2]:text-slate-50 [&_h3]:mb-2 [&_h3]:mt-4 [&_h3]:text-base [&_h3]:font-semibold [&_h3]:text-slate-100 [&_p]:mb-5 [&_p]:text-slate-300 [&_ul]:mb-5 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:text-slate-300 [&_ol]:mb-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:text-slate-300 [&_li]:mb-2 [&_li]:leading-[1.7] [&_strong]:font-semibold [&_strong]:text-slate-50 [&_em]:text-slate-300 [&_blockquote]:my-6 [&_blockquote]:border-l-2 [&_blockquote]:pl-5 [&_blockquote]:italic [&_blockquote]:text-slate-300 [&_a]:text-emerald-400 [&_a]:underline [&_a]:decoration-emerald-500/30 hover:[&_a]:text-emerald-300 [&_hr]:my-6 [&_hr]:border-slate-800/60 [&_code]:rounded [&_code]:bg-slate-800 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:text-xs [&_code]:text-emerald-300";

import SiteHeader from "./site-header";
import SiteFooter from "./site-footer";
import Breadcrumb from "./breadcrumb";
import { PlayerScoutLinks } from "./player-scout-links";
import { supabase } from "@/lib/supabase";
import { stripHtml } from "@/lib/utils";

type SidebarItem = { id: string; title: string; slug: string; category: string; created_at: string; };

const CATEGORY_LABEL: Record<string, string> = {
  listeler: "Listeler", radar: "Radar", "taktik-lab": "Taktik Lab",
};

const CAT_COLOR: Record<string, string> = {
  listeler: "var(--sg-secondary)",
  radar: "var(--sg-primary)",
  "taktik-lab": "var(--sg-tertiary)",
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

export type YouTubeSearchItem = { title: string; thumbnail: string; videoId: string; channelTitle: string; };
export type NewsItem = { title: string; link: string; source: string; date: string; };

function getNewsQueryFromTitle(title: string): string {
  const t = title?.trim() ?? "";
  if (!t) return "";
  const parenMatch = t.match(/^(.+?)\s*\([^)]+\)\s*$/);
  if (parenMatch) return parenMatch[1].trim();
  return t.split(/\s+/).filter(Boolean).slice(0, 2).join(" ") || t;
}

function extractPlayerNameFromTitle(title: string): string | undefined {
  const m = title?.trim()?.match(/^(.+?)\s*\(([^)]+)\)/);
  return m ? m[1].trim() || undefined : undefined;
}

type Props = {
  title: string; content: string; category: string; date: string; slug: string;
  activeNav: "listeler" | "radar" | "taktik-lab";
  backHref: string; backLabel: string;
  youtubeId?: string; coverImage?: string;
  youtubeQuery1?: string; youtubeQuery2?: string;
  newsQuery?: string; playerName?: string;
  showNewsSection?: boolean; children?: React.ReactNode;
};

export default function ArticleLayout({
  title, content, category, date, slug,
  activeNav, backHref, backLabel,
  youtubeId, coverImage, youtubeQuery1, youtubeQuery2,
  newsQuery, playerName, showNewsSection = true, children,
}: Props) {
  const [similar, setSimilar] = useState<SidebarItem[]>([]);
  const [discover, setDiscover] = useState<SidebarItem[]>([]);
  const [youtubeVideos1, setYoutubeVideos1] = useState<YouTubeSearchItem[] | null>(null);
  const [youtubeVideos2, setYoutubeVideos2] = useState<YouTubeSearchItem[] | null>(null);
  const [newsItems, setNewsItems] = useState<NewsItem[] | null>(null);

  const effectiveNewsQuery = showNewsSection ? (newsQuery?.trim() || getNewsQueryFromTitle(title)) : "";
  const effectivePlayerName = playerName?.trim() || extractPlayerNameFromTitle(title) || "";

  useEffect(() => {
    async function fetchSidebar() {
      const { data: sim } = await supabase.from("contents").select("id,title,slug,category,created_at")
        .eq("status", "yayinda").eq("category", category).neq("slug", slug)
        .order("created_at", { ascending: false }).limit(3);
      if (sim) setSimilar(sim);
      const { data: disc } = await supabase.from("contents").select("id,title,slug,category,created_at")
        .eq("status", "yayinda").neq("category", category)
        .order("created_at", { ascending: false }).limit(3);
      if (disc) setDiscover(disc);
    }
    fetchSidebar();
  }, [category, slug]);

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
    if (!q) { setNewsItems(null); return; }
    let cancelled = false;
    fetch(`/api/news?query=${encodeURIComponent(q)}`)
      .then(r => r.ok ? r.json() : [])
      .then((arr: NewsItem[]) => { if (!cancelled) setNewsItems(Array.isArray(arr) && arr.length > 0 ? arr : null); })
      .catch(() => { if (!cancelled) setNewsItems(null); });
    return () => { cancelled = true; };
  }, [effectiveNewsQuery]);

  const formattedDate = new Date(date).toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" });
  const contentForReadTime = content.replace(/<[^>]+>/g, " ").replace(/[#*_`>]/g, " ").replace(/\s+/g, " ").trim();
  const minutes = readTime(contentForReadTime);
  const catLabel = CATEGORY_LABEL[category] ?? category;
  const catColor = CAT_COLOR[category] ?? "var(--sg-primary)";
  const tags = CATEGORY_TAGS[category] ?? ["Analiz", "Scout"];
  const description = stripHtml(content).replace(/[#*_\n]/g, " ").trim().slice(0, 160);
  const shareUrl = typeof window !== "undefined" ? window.location.href : "";
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(title + " | Scout Gamer")}&url=${encodeURIComponent(shareUrl)}`;
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(title + " " + shareUrl)}`;

  return (
    <main style={{ background: "var(--sg-bg)", color: "var(--sg-text-primary)", minHeight: "100vh" }}>
      <title>{title} | Scout Gamer</title>
      <meta name="description" content={description} />
      <meta property="og:title" content={`${title} | Scout Gamer`} />
      <meta property="og:description" content={description} />

      <SiteHeader activeNav={activeNav} maxWidth="max-w-7xl" />

      {/* ── Hero bölümü ─────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden pt-[72px]" style={{ minHeight: "380px" }}>
        {/* Arka plan görsel */}
        <div className="absolute inset-0 z-0">
          {coverImage ? (
            <img src={coverImage} alt="" className="w-full h-full object-cover" style={{ filter: "brightness(0.3) saturate(0.7)" }} />
          ) : (
            <img src="https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=1400&q=70" alt=""
              className="w-full h-full object-cover" style={{ filter: "brightness(0.2) saturate(0.6)" }} />
          )}
          <div className="absolute inset-0" style={{ background: "linear-gradient(to top, var(--sg-bg) 30%, rgba(6,15,30,0.6) 70%, transparent 100%)" }} />
          <div className="absolute inset-0" style={{ background: "linear-gradient(to right, var(--sg-bg) 0%, transparent 60%)" }} />
        </div>

        {/* İçerik */}
        <div className="relative z-10 max-w-7xl mx-auto px-8 pb-16 pt-24 flex flex-col justify-end">
          <div className="flex items-center gap-3 mb-5">
            <span className="px-3 py-1 text-[10px] font-bold tracking-[0.2em] uppercase border-l-2"
              style={{ background: `${catColor}15`, color: catColor, borderLeftColor: catColor, fontFamily: "var(--font-headline)" }}>
              {catLabel}
            </span>
            <span className="text-[11px]" style={{ color: "var(--sg-text-muted)" }}>{formattedDate}</span>
            <span className="flex items-center gap-1 text-[11px]" style={{ color: "var(--sg-text-muted)" }}>
              <IconClock /> {minutes} dk
            </span>
          </div>

          <h1 className="font-bold tracking-tighter leading-none mb-4 max-w-4xl"
            style={{ fontFamily: "var(--font-headline)", fontSize: "clamp(2rem, 5vw, 4rem)", color: "var(--sg-text-primary)" }}>
            {title}
          </h1>

          {effectivePlayerName && (
            <div className="mt-2">
              <PlayerScoutLinks playerName={effectivePlayerName} />
            </div>
          )}

          <Link href={backHref} className="mt-4 inline-flex items-center gap-1.5 text-xs transition-all hover:opacity-80"
            style={{ color: "var(--sg-text-muted)", fontFamily: "var(--font-headline)" }}>
            ← {backLabel}
          </Link>
        </div>
      </section>

      {/* ── İki kolon içerik ─────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-8 py-12">
        <div className="mb-5">
          <Breadcrumb items={[{ label: catLabel, href: backHref }, { label: title }]} />
        </div>

        <div className="flex flex-col gap-10 lg:flex-row">
          {/* Sol — %65 */}
          <div className="min-w-0 lg:w-[65%]">

            {/* YouTube embed */}
            {!coverImage && youtubeId && (
              <div className="mb-8 overflow-hidden" style={{ border: "1px solid rgba(26,58,92,0.5)" }}>
                <iframe width="100%" height="380" src={`https://www.youtube.com/embed/${youtubeId}`}
                  frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen className="block" />
              </div>
            )}

            {/* Makale içeriği */}
            <article className={`mb-10 ${ARTICLE_BODY_CLASS} [&_.table-wrapper]:mb-5 [&_.table-wrapper]:overflow-x-auto [&_table]:w-full [&_table]:border-collapse [&_table]:text-[14px] [&_thead]:border-b [&_th]:px-3 [&_th]:py-2 [&_th]:text-left [&_th]:text-[11px] [&_th]:font-semibold [&_th]:uppercase [&_th]:tracking-wider [&_tr]:border-b [&_td]:px-3 [&_td]:py-2`}
              style={{ borderLeft: `2px solid ${catColor}` , paddingLeft: "24px" }}>
              <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
                {content}
              </ReactMarkdown>
            </article>

            {/* Çocuk bileşenler (oyuncu kartları vb.) */}
            {children}

            {/* YouTube — query 1 */}
            {youtubeQuery1?.trim() && (
              <div className="mb-10">
                <h2 className="mb-4 text-base font-bold" style={{ fontFamily: "var(--font-headline)" }}>
                  <a href={`https://www.youtube.com/results?search_query=${encodeURIComponent(youtubeQuery1.trim())}`}
                    target="_blank" rel="noopener noreferrer"
                    className="transition hover:opacity-80" style={{ color: "var(--sg-primary)" }}>
                    {youtubeQuery1.trim()} — YouTube&apos;da İzle
                  </a>
                </h2>
                {youtubeVideos1 === null ? (
                  <div className="flex items-center gap-2 py-6" style={{ color: "var(--sg-text-muted)" }}>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-t-transparent" style={{ borderColor: "var(--sg-primary)", borderTopColor: "transparent" }} />
                    <span className="text-sm">Videolar yükleniyor...</span>
                  </div>
                ) : youtubeVideos1.length === 0 ? (
                  <p className="text-sm" style={{ color: "var(--sg-text-muted)" }}>Video bulunamadı.</p>
                ) : (
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {youtubeVideos1.map(v => (
                      <a key={v.videoId} href={`https://www.youtube.com/watch?v=${v.videoId}`} target="_blank" rel="noopener noreferrer"
                        className="group flex flex-col overflow-hidden transition hover:-translate-y-0.5"
                        style={{ background: "var(--sg-surface)" }}>
                        <div className="aspect-video overflow-hidden" style={{ background: "var(--sg-surface-low)" }}>
                          <img src={v.thumbnail} alt="" className="h-full w-full object-cover transition group-hover:scale-105" />
                        </div>
                        <div className="p-2.5">
                          <p className="line-clamp-2 text-xs font-medium transition" style={{ color: "var(--sg-text-primary)" }}>{v.title}</p>
                          <p className="text-[10px] mt-1" style={{ color: "var(--sg-text-muted)" }}>{v.channelTitle}</p>
                        </div>
                      </a>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* YouTube — query 2 */}
            {youtubeQuery2?.trim() && (
              <div className="mb-10">
                <h2 className="mb-4 text-base font-bold" style={{ fontFamily: "var(--font-headline)" }}>
                  <a href={`https://www.youtube.com/results?search_query=${encodeURIComponent(youtubeQuery2.trim())}`}
                    target="_blank" rel="noopener noreferrer"
                    className="transition hover:opacity-80" style={{ color: "var(--sg-primary)" }}>
                    {youtubeQuery2.trim()} — YouTube&apos;da İzle
                  </a>
                </h2>
                {youtubeVideos2 === null ? (
                  <div className="flex items-center gap-2 py-6" style={{ color: "var(--sg-text-muted)" }}>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-t-transparent" style={{ borderColor: "var(--sg-primary)", borderTopColor: "transparent" }} />
                    <span className="text-sm">Videolar yükleniyor...</span>
                  </div>
                ) : youtubeVideos2.length === 0 ? (
                  <p className="text-sm" style={{ color: "var(--sg-text-muted)" }}>Video bulunamadı.</p>
                ) : (
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {youtubeVideos2.map(v => (
                      <a key={v.videoId} href={`https://www.youtube.com/watch?v=${v.videoId}`} target="_blank" rel="noopener noreferrer"
                        className="group flex flex-col overflow-hidden transition hover:-translate-y-0.5"
                        style={{ background: "var(--sg-surface)" }}>
                        <div className="aspect-video overflow-hidden" style={{ background: "var(--sg-surface-low)" }}>
                          <img src={v.thumbnail} alt="" className="h-full w-full object-cover transition group-hover:scale-105" />
                        </div>
                        <div className="p-2.5">
                          <p className="line-clamp-2 text-xs font-medium" style={{ color: "var(--sg-text-primary)" }}>{v.title}</p>
                          <p className="text-[10px] mt-1" style={{ color: "var(--sg-text-muted)" }}>{v.channelTitle}</p>
                        </div>
                      </a>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Güncel Haberler */}
            {showNewsSection && newsItems && newsItems.length > 0 && (
              <div className="mb-10">
                <h2 className="mb-4 text-base font-bold" style={{ fontFamily: "var(--font-headline)" }}>Güncel Haberler</h2>
                <div style={{ background: "var(--sg-surface)" }}>
                  {newsItems.map((item, i) => (
                    <a key={i} href={item.link} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-4 px-4 py-3 transition hover:opacity-80"
                      style={{ borderBottom: i < newsItems.length - 1 ? "1px solid rgba(26,58,92,0.4)" : "none" }}>
                      <span className="w-20 shrink-0 text-[10px] font-bold uppercase tracking-wider" style={{ color: "var(--sg-text-muted)" }}>{item.source || "—"}</span>
                      <span className="flex-1 min-w-0 text-sm font-medium line-clamp-1" style={{ color: "var(--sg-text-primary)" }}>{item.title}</span>
                      {item.date && <span className="shrink-0 text-[10px]" style={{ color: "var(--sg-text-muted)" }}>{item.date}</span>}
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Etiketler */}
            <div className="mb-8">
              <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: "var(--sg-text-muted)", fontFamily: "var(--font-headline)" }}>Etiketler</p>
              <div className="flex flex-wrap gap-2">
                {tags.map(t => (
                  <span key={t} className="px-3 py-1 text-[11px] font-medium"
                    style={{ background: "var(--sg-surface)", color: "var(--sg-text-secondary)", border: "1px solid rgba(26,58,92,0.5)" }}>
                    {t}
                  </span>
                ))}
              </div>
            </div>

            {/* Paylaş */}
            <div className="mb-8 flex items-center gap-3">
              <span className="text-[11px] font-semibold" style={{ color: "var(--sg-text-muted)" }}>Paylaş:</span>
              <a href={twitterUrl} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold transition hover:opacity-80"
                style={{ background: "var(--sg-surface)", color: "var(--sg-text-secondary)", border: "1px solid rgba(26,58,92,0.5)" }}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
                Twitter
              </a>
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold transition hover:opacity-80"
                style={{ background: "var(--sg-surface)", color: "var(--sg-text-secondary)", border: "1px solid rgba(26,58,92,0.5)" }}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
                WhatsApp
              </a>
            </div>

            {/* Yazar */}
            <div className="overflow-hidden" style={{ background: "var(--sg-surface)", borderLeft: `2px solid ${catColor}` }}>
              <div className="flex items-center gap-3 p-5">
                <div className="flex h-10 w-10 items-center justify-center text-sm font-black shrink-0"
                  style={{ background: "var(--sg-primary)", color: "#060f1e", fontFamily: "var(--font-headline)" }}>SG</div>
                <div>
                  <p className="text-sm font-bold" style={{ fontFamily: "var(--font-headline)" }}>Scout Gamer Analiz Ekibi</p>
                  <p className="text-[11px] mt-0.5" style={{ color: "var(--sg-text-muted)" }}>Futbol × oyun kültürü perspektifinden scout analizleri.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Sağ — %35 sidebar */}
          <aside className="shrink-0 lg:w-[35%]">
            <div className="lg:sticky lg:top-24 space-y-5">

              {/* Benzer içerikler */}
              {similar.length > 0 && (
                <div style={{ background: "var(--sg-surface)" }}>
                  <div className="h-[2px]" style={{ background: `linear-gradient(90deg, ${catColor}, transparent)` }} />
                  <div className="p-4">
                    <h3 className="mb-3 text-[10px] font-bold uppercase tracking-[0.22em]"
                      style={{ color: "var(--sg-text-muted)", fontFamily: "var(--font-headline)" }}>Benzer İçerikler</h3>
                    <div className="space-y-2">
                      {similar.map(item => (
                        <Link key={item.id} href={`${categoryPath(item.category)}/${item.slug}`}
                          className="group block p-3 transition hover:opacity-80"
                          style={{ background: "var(--sg-surface-low)" }}>
                          <p className="text-xs font-semibold line-clamp-2" style={{ fontFamily: "var(--font-headline)", color: "var(--sg-text-primary)" }}>{item.title}</p>
                          <p className="text-[10px] mt-1" style={{ color: "var(--sg-text-muted)" }}>
                            {new Date(item.created_at).toLocaleDateString("tr-TR", { day: "numeric", month: "short" })}
                          </p>
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Radar CTA */}
              <div style={{ background: "var(--sg-surface)" }}>
                <div className="h-[2px]" style={{ background: "linear-gradient(90deg, var(--sg-primary), transparent)" }} />
                <Link href="/radar" className="group block p-5 transition hover:opacity-80">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] mb-1" style={{ color: "var(--sg-primary)", fontFamily: "var(--font-headline)" }}>Haftalık Radar</p>
                  <p className="text-sm font-bold mb-2" style={{ fontFamily: "var(--font-headline)" }}>Tüm Scout Analizleri</p>
                  <p className="text-xs mb-3" style={{ color: "var(--sg-text-muted)" }}>Her hafta güncellenen radar yazılarını keşfet.</p>
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold" style={{ color: "var(--sg-primary)", fontFamily: "var(--font-headline)" }}>
                    Tümünü Gör <IconArrowRight className="transition-transform group-hover:translate-x-0.5" />
                  </span>
                </Link>
              </div>

              {/* Öne çıkan listeler */}
              <div style={{ background: "var(--sg-surface)" }}>
                <div className="h-[2px]" style={{ background: "linear-gradient(90deg, var(--sg-secondary), transparent)" }} />
                <div className="p-4">
                  <h3 className="mb-3 text-[10px] font-bold uppercase tracking-[0.22em]"
                    style={{ color: "var(--sg-text-muted)", fontFamily: "var(--font-headline)" }}>Öne Çıkan Listeler</h3>
                  <div className="space-y-2">
                    {[
                      { title: "En İyi 10 Genç Stoper", slug: "en-iyi-10-genc-stoper" },
                      { title: "Süper Lig'in Gizli İsimleri", slug: "super-lig-gizli-isimler" },
                      { title: "Sürpriz İsimler 2025", slug: "surpriz-isimler-2025" },
                    ].map(l => (
                      <Link key={l.slug} href={`/listeler/${l.slug}`}
                        className="group flex items-center justify-between p-3 transition hover:opacity-80"
                        style={{ background: "var(--sg-surface-low)" }}>
                        <span className="text-xs font-semibold line-clamp-1" style={{ fontFamily: "var(--font-headline)", color: "var(--sg-text-primary)" }}>{l.title}</span>
                        <IconArrowRight className="shrink-0 ml-2 transition-transform group-hover:translate-x-0.5" />
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>

        {/* Daha fazla keşfet */}
        {discover.length > 0 && (
          <section className="mt-16 pt-10" style={{ borderTop: "1px solid rgba(26,58,92,0.4)" }}>
            <p className="mb-6 text-[10px] font-bold uppercase tracking-[0.25em]" style={{ color: "var(--sg-text-muted)", fontFamily: "var(--font-headline)" }}>Daha Fazla Keşfet</p>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {discover.map(item => {
                const cc = CAT_COLOR[item.category] ?? "var(--sg-primary)";
                return (
                  <Link key={item.id} href={`${categoryPath(item.category)}/${item.slug}`}
                    className="group flex flex-col transition hover:-translate-y-0.5"
                    style={{ background: "var(--sg-surface)" }}>
                    <div className="h-[2px]" style={{ background: `linear-gradient(90deg, ${cc}, transparent)` }} />
                    <div className="p-4 flex flex-col flex-1">
                      <span className="text-[9px] font-bold uppercase tracking-[0.18em] mb-2" style={{ color: cc, fontFamily: "var(--font-headline)" }}>
                        {CATEGORY_LABEL[item.category] ?? item.category}
                      </span>
                      <p className="text-sm font-semibold line-clamp-2 transition" style={{ fontFamily: "var(--font-headline)", color: "var(--sg-text-primary)" }}>{item.title}</p>
                      <span className="mt-auto pt-3 text-[10px]" style={{ color: "var(--sg-text-muted)" }}>
                        {new Date(item.created_at).toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" })}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}
      </div>

      <SiteFooter maxWidth="max-w-7xl" />
    </main>
  );
}
