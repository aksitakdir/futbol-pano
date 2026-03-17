"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import {
  IconRadar,
  IconClock,
  IconArrowRight,
} from "./icons";

const ARTICLE_BODY_CLASS =
  "article-body text-[15px] leading-[1.7] [&_h1]:mb-4 [&_h1]:mt-6 [&_h1]:text-xl [&_h1]:font-extrabold [&_h1]:text-slate-50 [&_h1]:first:mt-0 [&_h2]:mb-3 [&_h2]:mt-5 [&_h2]:text-lg [&_h2]:font-bold [&_h2]:text-slate-50 [&_h3]:mb-2 [&_h3]:mt-4 [&_h3]:text-base [&_h3]:font-semibold [&_h3]:text-slate-100 [&_p]:mb-5 [&_p]:text-slate-200 [&_ul]:mb-5 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:text-slate-200 [&_ol]:mb-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:text-slate-200 [&_li]:mb-2 [&_li]:leading-[1.7] [&_strong]:font-semibold [&_strong]:text-slate-50 [&_em]:text-slate-300 [&_blockquote]:my-5 [&_blockquote]:border-l-2 [&_blockquote]:border-emerald-500/60 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-slate-300 [&_a]:text-emerald-300 [&_a]:underline [&_a]:decoration-emerald-500/30 hover:[&_a]:text-emerald-200 [&_hr]:my-6 [&_hr]:border-slate-800/60 [&_code]:rounded [&_code]:bg-slate-800 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:text-xs [&_code]:text-emerald-300";

function isHtmlContent(str: string): boolean {
  const trimmed = str?.trim() ?? "";
  return trimmed.length > 0 && trimmed.includes("<") && trimmed.includes(">");
}
import SiteHeader from "./site-header";
import Breadcrumb from "./breadcrumb";
import { supabase } from "@/lib/supabase";
import { stripHtml } from "@/lib/utils";

type SidebarItem = {
  id: string;
  title: string;
  slug: string;
  category: string;
  created_at: string;
};

const CATEGORY_LABEL: Record<string, string> = {
  listeler: "Listeler",
  radar: "Radar",
  "taktik-lab": "Taktik Lab",
};

const CATEGORY_COLOR: Record<string, string> = {
  listeler: "bg-sky-500/15 text-sky-300 border-sky-500/40",
  radar: "bg-emerald-500/15 text-emerald-300 border-emerald-500/40",
  "taktik-lab": "bg-violet-500/15 text-violet-300 border-violet-500/40",
};

const CATEGORY_TAGS: Record<string, string[]> = {
  radar: ["Scout Radar", "Haftalık Analiz", "Genç Yetenekler"],
  listeler: ["Kürasyonlu Liste", "Scout Notu", "Oyuncu Profili"],
  "taktik-lab": ["Taktik Analiz", "Pozisyon Arketipi", "Modern Futbol"],
};

function readTime(text: string): number {
  const words = text.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
}

function categoryPath(category: string): string {
  if (category === "listeler") return "/listeler";
  if (category === "radar") return "/radar";
  if (category === "taktik-lab") return "/taktik-lab";
  return "/";
}

export type YouTubeSearchItem = {
  title: string;
  thumbnail: string;
  videoId: string;
  channelTitle: string;
};

export type NewsItem = {
  title: string;
  link: string;
  source: string;
  date: string;
};

function getNewsQueryFromTitle(title: string): string {
  const t = title?.trim() ?? "";
  if (!t) return "";
  const parenMatch = t.match(/^(.+?)\s*\([^)]+\)\s*$/);
  if (parenMatch) return parenMatch[1].trim();
  const words = t.split(/\s+/).filter(Boolean);
  return words.slice(0, 2).join(" ") || t;
}

type Props = {
  title: string;
  content: string;
  category: string;
  date: string;
  slug: string;
  activeNav: "listeler" | "radar" | "taktik-lab";
  backHref: string;
  backLabel: string;
  youtubeId?: string;
  coverImage?: string;
  youtubeQuery1?: string;
  youtubeQuery2?: string;
  newsQuery?: string;
  showNewsSection?: boolean;
  children?: React.ReactNode;
};

export default function ArticleLayout({
  title,
  content,
  category,
  date,
  slug,
  activeNav,
  backHref,
  backLabel,
  youtubeId,
  coverImage,
  youtubeQuery1,
  youtubeQuery2,
  newsQuery,
  showNewsSection = true,
  children,
}: Props) {
  const [similar, setSimilar] = useState<SidebarItem[]>([]);
  const [discover, setDiscover] = useState<SidebarItem[]>([]);
  const [youtubeVideos1, setYoutubeVideos1] = useState<YouTubeSearchItem[] | null>(null);
  const [youtubeVideos2, setYoutubeVideos2] = useState<YouTubeSearchItem[] | null>(null);
  const [newsItems, setNewsItems] = useState<NewsItem[] | null>(null);

  const effectiveNewsQuery = showNewsSection ? (newsQuery?.trim() || getNewsQueryFromTitle(title)) : "";

  useEffect(() => {
    async function fetchSidebar() {
      const { data: sim } = await supabase
        .from("contents")
        .select("id, title, slug, category, created_at")
        .eq("status", "yayinda")
        .eq("category", category)
        .neq("slug", slug)
        .order("created_at", { ascending: false })
        .limit(3);

      if (sim) setSimilar(sim);

      const { data: disc } = await supabase
        .from("contents")
        .select("id, title, slug, category, created_at")
        .eq("status", "yayinda")
        .neq("category", category)
        .order("created_at", { ascending: false })
        .limit(3);

      if (disc) setDiscover(disc);
    }
    fetchSidebar();
  }, [category, slug]);

  useEffect(() => {
    const q1 = youtubeQuery1?.trim();
    if (!q1) {
      setYoutubeVideos1(null);
      return;
    }
    let cancelled = false;
    fetch(`/api/youtube?query=${encodeURIComponent(q1)}`)
      .then((r) => (r.ok ? r.json() : []))
      .then((arr: YouTubeSearchItem[]) => {
        if (!cancelled) setYoutubeVideos1(Array.isArray(arr) ? arr : []);
      })
      .catch(() => {
        if (!cancelled) setYoutubeVideos1([]);
      });
    return () => {
      cancelled = true;
    };
  }, [youtubeQuery1]);

  useEffect(() => {
    const q2 = youtubeQuery2?.trim();
    if (!q2) {
      setYoutubeVideos2(null);
      return;
    }
    let cancelled = false;
    fetch(`/api/youtube?query=${encodeURIComponent(q2)}`)
      .then((r) => (r.ok ? r.json() : []))
      .then((arr: YouTubeSearchItem[]) => {
        if (!cancelled) setYoutubeVideos2(Array.isArray(arr) ? arr : []);
      })
      .catch(() => {
        if (!cancelled) setYoutubeVideos2([]);
      });
    return () => {
      cancelled = true;
    };
  }, [youtubeQuery2]);

  useEffect(() => {
    const q = effectiveNewsQuery?.trim();
    if (!q) {
      setNewsItems(null);
      return;
    }
    let cancelled = false;
    fetch(`/api/news?query=${encodeURIComponent(q)}`)
      .then((r) => (r.ok ? r.json() : []))
      .then((arr: NewsItem[]) => {
        if (!cancelled) setNewsItems(Array.isArray(arr) && arr.length > 0 ? arr : null);
      })
      .catch(() => {
        if (!cancelled) setNewsItems(null);
      });
    return () => {
      cancelled = true;
    };
  }, [effectiveNewsQuery]);

  const formattedDate = new Date(date).toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const contentForReadTime = isHtmlContent(content)
    ? content.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim()
    : content;
  const minutes = readTime(contentForReadTime);
  const catLabel = CATEGORY_LABEL[category] ?? category;
  const catColor = CATEGORY_COLOR[category] ?? "bg-slate-500/15 text-slate-300 border-slate-500/40";
  const tags = CATEGORY_TAGS[category] ?? ["Analiz", "Scout"];
  const description = stripHtml(content).replace(/[#*_\n]/g, " ").trim().slice(0, 160);

  const shareUrl = typeof window !== "undefined" ? window.location.href : "";
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(title + " | Scout Intelligence")}&url=${encodeURIComponent(shareUrl)}`;
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(title + " " + shareUrl)}`;

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100">
      <title>{title} | Scout Intelligence</title>
      <meta name="description" content={description} />
      <meta property="og:title" content={`${title} | Scout Intelligence`} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={shareUrl} />
      <meta property="og:type" content="article" />

      <div className="flex min-h-screen flex-col">
        <SiteHeader activeNav={activeNav} maxWidth="max-w-7xl" />

        <div className="flex-1">
          <div className="mx-auto max-w-7xl px-4 py-8 lg:py-10">
            <div className="mb-5">
              <Breadcrumb items={[{ label: catLabel, href: backHref }, { label: title }]} />
            </div>
            {/* Two-column layout */}
            <div className="flex flex-col gap-8 lg:flex-row">
              {/* Left column — 65% */}
              <div className="min-w-0 lg:w-[65%]">
                {/* Meta row */}
                <div className="mb-4 flex flex-wrap items-center gap-2.5">
                  <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] ${catColor}`}>
                    {catLabel}
                  </span>
                  <span className="text-[11px] text-slate-400">{formattedDate}</span>
                  <span className="flex items-center gap-1 text-[11px] text-slate-400">
                    <IconClock /> {minutes} dk okuma
                  </span>
                  <Link href={backHref} className="ml-auto text-[11px] font-medium text-slate-400 transition hover:text-emerald-300">
                    ← {backLabel}
                  </Link>
                </div>

                {/* Title */}
                <h1 className="mb-6 bg-gradient-to-r from-emerald-400 via-cyan-400 to-sky-500 bg-clip-text text-2xl font-extrabold tracking-tight text-transparent md:text-3xl">
                  {title}
                </h1>

                {/* Cover image or YouTube embed */}
                {coverImage ? (
                  <div className="mb-6 overflow-hidden rounded-2xl border border-slate-800/80">
                    <img src={coverImage} alt={title} className="h-auto w-full object-cover" />
                  </div>
                ) : youtubeId ? (
                  <div className="mb-6 overflow-hidden rounded-2xl border border-slate-800/80">
                    <iframe
                      width="100%"
                      height="400"
                      src={`https://www.youtube.com/embed/${youtubeId}`}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="block"
                    />
                  </div>
                ) : null}

                {/* Article content — HTML from editor or legacy Markdown */}
                <article className={`prose-custom mb-8 rounded-2xl border border-slate-800/80 bg-slate-950/70 p-6 shadow-[0_18px_60px_rgba(15,23,42,0.9)] ${ARTICLE_BODY_CLASS}`}>
                  {isHtmlContent(content) ? (
                    <div dangerouslySetInnerHTML={{ __html: content }} />
                  ) : (
                    <ReactMarkdown
                      components={{
                        h1: ({ children: c }) => <h1 className="mb-4 mt-6 text-xl font-extrabold text-slate-50 first:mt-0">{c}</h1>,
                        h2: ({ children: c }) => <h2 className="mb-3 mt-5 text-lg font-bold text-slate-50">{c}</h2>,
                        h3: ({ children: c }) => <h3 className="mb-2 mt-4 text-base font-semibold text-slate-100">{c}</h3>,
                        p: ({ children: c }) => <p className="mb-5 text-[15px] leading-[1.7] text-slate-200">{c}</p>,
                      ul: ({ children: c }) => <ul className="mb-5 list-disc pl-5 text-[15px] leading-[1.7] text-slate-200">{c}</ul>,
                      ol: ({ children: c }) => <ol className="mb-5 list-decimal pl-5 text-[15px] leading-[1.7] text-slate-200">{c}</ol>,
                      li: ({ children: c }) => <li className="mb-2 leading-[1.7]">{c}</li>,
                        strong: ({ children: c }) => <strong className="font-semibold text-slate-50">{c}</strong>,
                        em: ({ children: c }) => <em className="text-slate-300">{c}</em>,
                        blockquote: ({ children: c }) => <blockquote className="my-5 border-l-2 border-emerald-500/60 pl-4 text-[15px] leading-[1.7] italic text-slate-300">{c}</blockquote>,
                        hr: () => <hr className="my-6 border-slate-800/60" />,
                        a: ({ href, children: c }) => <a href={href} className="text-emerald-300 underline decoration-emerald-500/30 transition hover:text-emerald-200" target="_blank" rel="noopener noreferrer">{c}</a>,
                        code: ({ children: c }) => <code className="rounded bg-slate-800 px-1.5 py-0.5 text-xs text-emerald-300">{c}</code>,
                      }}
                    >
                      {content}
                    </ReactMarkdown>
                  )}
                </article>

                {/* Extra children (player cards for listeler) */}
                {children}

                {/* YouTube'da İzle — query 1 */}
                {youtubeQuery1?.trim() && (
                  <div className="mb-8">
                    <h2 className="mb-4 text-lg font-bold text-slate-100">
                      <a
                        href={`https://www.youtube.com/results?search_query=${encodeURIComponent(youtubeQuery1.trim())}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-slate-100 underline decoration-emerald-500/50 transition hover:text-emerald-300 hover:decoration-emerald-400"
                      >
                        {youtubeQuery1.trim()} — YouTube&apos;da İzle
                      </a>
                    </h2>
                    {youtubeVideos1 === null ? (
                      <div className="flex items-center gap-2 rounded-2xl border border-slate-800/80 bg-slate-950/70 py-8 text-slate-400">
                        <span className="h-5 w-5 animate-spin rounded-full border-2 border-emerald-400 border-t-transparent" />
                        <span className="text-sm">Videolar yükleniyor...</span>
                      </div>
                    ) : youtubeVideos1.length === 0 ? (
                      <p className="text-sm text-slate-500">Video bulunamadı.</p>
                    ) : (
                      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                        {youtubeVideos1.map((v) => (
                          <a
                            key={v.videoId}
                            href={`https://www.youtube.com/watch?v=${v.videoId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group flex flex-col overflow-hidden rounded-xl border border-slate-800/80 bg-slate-950/70 transition hover:border-emerald-500/50"
                          >
                            <div className="aspect-video w-full shrink-0 overflow-hidden bg-slate-800">
                              <img
                                src={v.thumbnail}
                                alt=""
                                className="h-full w-full object-cover transition group-hover:scale-105"
                              />
                            </div>
                            <div className="flex flex-1 flex-col gap-0.5 p-2.5">
                              <p className="line-clamp-2 text-xs font-medium text-slate-200 group-hover:text-emerald-300">
                                {v.title}
                              </p>
                              <p className="text-[10px] text-slate-500">{v.channelTitle}</p>
                            </div>
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* YouTube'da İzle — query 2 */}
                {youtubeQuery2?.trim() && (
                  <div className="mb-8">
                    <h2 className="mb-4 text-lg font-bold text-slate-100">
                      <a
                        href={`https://www.youtube.com/results?search_query=${encodeURIComponent(youtubeQuery2.trim())}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-slate-100 underline decoration-emerald-500/50 transition hover:text-emerald-300 hover:decoration-emerald-400"
                      >
                        {youtubeQuery2.trim()} — YouTube&apos;da İzle
                      </a>
                    </h2>
                    {youtubeVideos2 === null ? (
                      <div className="flex items-center gap-2 rounded-2xl border border-slate-800/80 bg-slate-950/70 py-8 text-slate-400">
                        <span className="h-5 w-5 animate-spin rounded-full border-2 border-emerald-400 border-t-transparent" />
                        <span className="text-sm">Videolar yükleniyor...</span>
                      </div>
                    ) : youtubeVideos2.length === 0 ? (
                      <p className="text-sm text-slate-500">Video bulunamadı.</p>
                    ) : (
                      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                        {youtubeVideos2.map((v) => (
                          <a
                            key={v.videoId}
                            href={`https://www.youtube.com/watch?v=${v.videoId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group flex flex-col overflow-hidden rounded-xl border border-slate-800/80 bg-slate-950/70 transition hover:border-emerald-500/50"
                          >
                            <div className="aspect-video w-full shrink-0 overflow-hidden bg-slate-800">
                              <img
                                src={v.thumbnail}
                                alt=""
                                className="h-full w-full object-cover transition group-hover:scale-105"
                              />
                            </div>
                            <div className="flex flex-1 flex-col gap-0.5 p-2.5">
                              <p className="line-clamp-2 text-xs font-medium text-slate-200 group-hover:text-emerald-300">
                                {v.title}
                              </p>
                              <p className="text-[10px] text-slate-500">{v.channelTitle}</p>
                            </div>
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Güncel Haberler — sadece radar ve taktik-lab */}
                {showNewsSection && newsItems != null && newsItems.length > 0 && (
                  <div className="mb-8">
                    <h2 className="mb-3 text-lg font-bold text-slate-100">
                      Güncel Haberler
                    </h2>
                    <div className="rounded-xl border border-slate-800/80 bg-slate-950/70 px-4 py-1">
                      {newsItems.map((item, i) => (
                        <a
                          key={i}
                          href={item.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`flex items-center gap-4 py-3 text-left ${i < newsItems.length - 1 ? "border-b border-slate-800/60" : ""}`}
                        >
                          <span className="w-24 shrink-0 text-[10px] font-medium uppercase tracking-wider text-slate-500">
                            {item.source || "—"}
                          </span>
                          <span className="min-w-0 flex-1 text-sm font-medium text-slate-200 line-clamp-2 transition hover:text-cyan-300">
                            {item.title}
                          </span>
                          {item.date && (
                            <span className="shrink-0 text-[10px] text-slate-500">
                              {item.date}
                            </span>
                          )}
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tags */}
                <div className="mb-6">
                  <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">Etiketler</p>
                  <div className="flex flex-wrap gap-2">
                    {tags.map((t) => (
                      <span key={t} className="rounded-full border border-slate-700/60 bg-slate-900/70 px-3 py-1 text-[11px] font-medium text-slate-300">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Share */}
                <div className="mb-8 flex items-center gap-3">
                  <span className="text-[11px] font-semibold text-slate-500">Bu içeriği paylaş:</span>
                  <a href={twitterUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700/60 bg-slate-900/70 px-3 py-1.5 text-[11px] font-semibold text-slate-300 transition hover:border-sky-500/50 hover:text-sky-300">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
                    Twitter
                  </a>
                  <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700/60 bg-slate-900/70 px-3 py-1.5 text-[11px] font-semibold text-slate-300 transition hover:border-emerald-500/50 hover:text-emerald-300">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
                    WhatsApp
                  </a>
                </div>

                {/* Author */}
                <div className="rounded-2xl border border-slate-800/80 bg-slate-950/70 p-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-tr from-emerald-400 to-cyan-500 text-sm font-bold text-slate-950">SI</div>
                    <div>
                      <p className="text-sm font-semibold text-slate-100">Scout Intelligence Analiz Ekibi</p>
                      <p className="text-[11px] text-slate-400">Veri odaklı futbol analizleri, haftalık scout raporları ve genç yetenek profilleri.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right column — 35% sidebar */}
              <aside className="shrink-0 lg:w-[35%]">
                <div className="lg:sticky lg:top-6 space-y-6">
                  {/* Similar */}
                  {similar.length > 0 && (
                    <div className="rounded-2xl border border-slate-800/80 bg-slate-950/70 p-5">
                      <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">Benzer İçerikler</h3>
                      <div className="flex gap-3 overflow-x-auto pb-1 lg:flex-col lg:overflow-x-visible lg:pb-0">
                        {similar.map((item) => (
                          <Link
                            key={item.id}
                            href={`${categoryPath(item.category)}/${item.slug}`}
                            className="group block min-w-[200px] shrink-0 rounded-xl border border-slate-800/60 bg-slate-900/40 p-3 transition hover:border-emerald-500/50 lg:min-w-0 lg:shrink"
                          >
                            <p className="text-xs font-semibold text-slate-100 transition group-hover:text-emerald-300">{item.title}</p>
                            <p className="mt-1 text-[10px] text-slate-500">
                              {new Date(item.created_at).toLocaleDateString("tr-TR", { day: "numeric", month: "short" })}
                            </p>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Featured lists */}
                  <div className="rounded-2xl border border-slate-800/80 bg-slate-950/70 p-5">
                    <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">Öne Çıkan Listeler</h3>
                    <div className="space-y-3">
                      {[
                        { title: "En İyi 10 Genç Stoper", slug: "en-iyi-10-genc-stoper" },
                        { title: "Süper Lig'in Gizli İsimleri", slug: "super-lig-gizli-isimler" },
                        { title: "Sürpriz İsimler 2025", slug: "surpriz-isimler-2025" },
                      ].map((l) => (
                        <Link
                          key={l.slug}
                          href={`/listeler/${l.slug}`}
                          className="group flex items-center gap-2 rounded-xl border border-slate-800/60 bg-slate-900/40 p-3 transition hover:border-emerald-500/50"
                        >
                          <span className="text-xs font-semibold text-slate-100 transition group-hover:text-emerald-300">{l.title}</span>
                          <IconArrowRight className="ml-auto shrink-0 text-slate-600 transition group-hover:text-emerald-400" />
                        </Link>
                      ))}
                    </div>
                  </div>

                  {/* Weekly radar CTA */}
                  <Link href="/radar" className="group block rounded-2xl border border-slate-800/80 bg-gradient-to-br from-slate-950/80 to-emerald-950/30 p-5 transition hover:border-emerald-500/50">
                    <div className="mb-2 flex items-center gap-2">
                      <IconRadar className="text-emerald-300" />
                      <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-300">Haftanın Radarı</span>
                    </div>
                    <p className="text-xs text-slate-300">Her hafta güncellenen scout radar yazılarını keşfet.</p>
                    <span className="mt-3 inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-300">
                      Tümünü Gör <IconArrowRight className="transition-transform group-hover:translate-x-0.5" />
                    </span>
                  </Link>
                </div>
              </aside>
            </div>

            {/* Discover more — full width */}
            {discover.length > 0 && (
              <section className="mt-10 border-t border-slate-800/60 pt-8">
                <h2 className="mb-5 text-sm font-semibold uppercase tracking-[0.22em] text-slate-400">Daha Fazla Keşfet</h2>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {discover.map((item) => {
                    const cc = CATEGORY_COLOR[item.category] ?? "bg-slate-500/15 text-slate-300 border-slate-500/40";
                    return (
                      <Link
                        key={item.id}
                        href={`${categoryPath(item.category)}/${item.slug}`}
                        className="group flex flex-col rounded-2xl border border-slate-800/80 bg-slate-950/70 p-4 transition hover:-translate-y-1 hover:border-emerald-500/50"
                      >
                        <span className={`mb-2 inline-flex w-fit items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] ${cc}`}>
                          {CATEGORY_LABEL[item.category] ?? item.category}
                        </span>
                        <p className="text-sm font-semibold text-slate-100 transition group-hover:text-emerald-300">{item.title}</p>
                        <span className="mt-auto pt-3 text-[10px] text-slate-500">
                          {new Date(item.created_at).toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" })}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </section>
            )}
          </div>
        </div>

        {/* Footer */}
        <footer className="border-t border-slate-800/80 bg-slate-950/90">
          <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-5 text-xs text-slate-400 sm:flex-row">
            <span className="font-medium text-slate-300">Scout Intelligence</span>
            <div className="flex items-center gap-4">
              <span className="h-6 w-6 rounded-full border border-slate-700/80 bg-slate-900/80" />
              <span className="h-6 w-6 rounded-full border border-slate-700/80 bg-slate-900/80" />
              <span className="h-6 w-6 rounded-full border border-slate-700/80 bg-slate-900/80" />
            </div>
            <span className="text-[11px] text-slate-500">© 2026 Scout Intelligence</span>
          </div>
        </footer>
      </div>
    </main>
  );
}
