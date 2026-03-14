"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

type ContentResponse = {
  topic: string;
  slug: string | null;
  markdown: string;
};

function renderMarkdown(markdown: string): JSX.Element {
  const lines = markdown.split("\n");

  const elements: JSX.Element[] = [];

  lines.forEach((line, index) => {
    const key = `${index}-${line.slice(0, 10)}`;

    if (line.startsWith("### ")) {
      elements.push(
        <h3
          key={key}
          className="mt-6 text-base font-semibold text-slate-50 first:mt-0"
        >
          {line.replace(/^###\s+/, "")}
        </h3>
      );
    } else if (line.startsWith("## ")) {
      elements.push(
        <h2
          key={key}
          className="mt-6 text-lg font-semibold text-slate-50 first:mt-0"
        >
          {line.replace(/^##\s+/, "")}
        </h2>
      );
    } else if (line.startsWith("# ")) {
      elements.push(
        <h1
          key={key}
          className="mt-6 text-xl font-bold text-slate-50 first:mt-0"
        >
          {line.replace(/^#\s+/, "")}
        </h1>
      );
    } else if (line.startsWith("- ")) {
      elements.push(
        <p key={key} className="mt-1 text-sm text-slate-200">
          • {line.replace(/^-+\s+/, "")}
        </p>
      );
    } else if (line.trim() === "") {
      elements.push(
        <div key={key} className="h-3" />
      );
    } else {
      elements.push(
        <p key={key} className="mt-2 text-sm leading-relaxed text-slate-200">
          {line}
        </p>
      );
    }
  });

  return <div>{elements}</div>;
}

export default function ListDetailPage() {
  const params = useParams<{ slug: string }>();
  const slug = params?.slug;

  const [content, setContent] = useState<ContentResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const topic = useMemo(() => {
    if (!slug) return "";

    const map: Record<string, string> = {
      "en-iyi-10-genc-stoper": "En İyi 10 Genç Stoper",
      "super-lig-gizli-isimler": "Süper Lig'in Gizli İsimleri",
      "surpriz-isimler-2025": "Bu Sezonun Sürpriz İsimleri (2025)",
      "en-degerli-u20-oyuncular": "En Değerli U20 Oyuncular",
      "bundesliga-gelecek-yildizlari": "Bundesliga'nın Gelecek Yıldızları",
      "premier-lig-genc-yetenekler": "Premier Lig Genç Yetenekler",
    };

    return map[slug] ?? slug.replace(/-/g, " ");
  }, [slug]);

  useEffect(() => {
    if (!slug) return;

    let isMounted = true;

    async function loadContent() {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch("/api/content", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            topic,
            slug,
          }),
        });

        if (!res.ok) {
          const text = await res.text();
          console.error("Content API error:", text);
          if (!isMounted) return;
          setError(
            `İçerik yüklenirken bir hata oluştu (status ${res.status}).`
          );
          return;
        }

        const json = (await res.json()) as ContentResponse;
        if (!isMounted) return;
        setContent(json);
      } catch (err) {
        console.error("Unexpected content fetch error:", err);
        if (!isMounted) return;
        setError("İçerik yüklenirken beklenmeyen bir hata oluştu.");
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadContent();

    return () => {
      isMounted = false;
    };
  }, [slug, topic]);

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100">
      <div className="flex min-h-screen flex-col">
        <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-emerald-400 to-cyan-500 shadow-[0_0_40px_rgba(16,185,129,0.7)]" />
              <span className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-sky-500 bg-clip-text text-sm font-semibold tracking-[0.22em] text-transparent">
                SCOUT INTELLIGENCE
              </span>
            </Link>
            <div className="flex items-center gap-1 rounded-full border border-slate-700/80 bg-slate-900/70 p-0.5 text-xs">
              <button className="rounded-full bg-emerald-500/20 px-3 py-1 font-semibold text-emerald-200 shadow-[0_0_18px_rgba(16,185,129,0.5)]">
                TR
              </button>
              <button className="rounded-full px-3 py-1 text-slate-300 hover:text-emerald-200">
                EN
              </button>
            </div>
          </div>
        </header>

        <div className="flex-1">
          <div className="mx-auto max-w-4xl px-4 py-8 lg:py-10">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-emerald-300/90">
                  Liste İçeriği
                </p>
                <h1 className="mt-2 bg-gradient-to-r from-emerald-400 via-cyan-400 to-sky-500 bg-clip-text text-xl font-extrabold tracking-tight text-transparent md:text-2xl">
                  {topic || "Yükleniyor..."}
                </h1>
              </div>
              <Link
                href="/"
                className="rounded-full border border-slate-700/80 bg-slate-900/70 px-4 py-1.5 text-xs font-medium text-slate-200 transition hover:border-emerald-500/70 hover:text-emerald-200"
              >
                Ana sayfaya dön
              </Link>
            </div>

            {/* Skeleton / İçerik alanı */}
            <div className="rounded-2xl border border-slate-800/80 bg-slate-950/70 p-5 shadow-[0_18px_60px_rgba(15,23,42,0.9)]">
              {loading && (
                <div className="space-y-4">
                  <div className="h-4 w-24 animate-pulse rounded-full bg-slate-800/80" />
                  <div className="h-5 w-3/4 animate-pulse rounded-full bg-slate-800/80" />
                  <div className="space-y-2 pt-2">
                    <div className="h-3 w-full animate-pulse rounded-full bg-slate-800/80" />
                    <div className="h-3 w-5/6 animate-pulse rounded-full bg-slate-800/80" />
                    <div className="h-3 w-4/6 animate-pulse rounded-full bg-slate-800/80" />
                  </div>
                  <div className="space-y-2 pt-4">
                    <div className="h-3 w-2/3 animate-pulse rounded-full bg-slate-800/80" />
                    <div className="h-3 w-full animate-pulse rounded-full bg-slate-800/80" />
                    <div className="h-3 w-3/4 animate-pulse rounded-full bg-slate-800/80" />
                  </div>
                </div>
              )}

              {!loading && error && (
                <div className="rounded-xl border border-red-500/40 bg-red-500/5 px-4 py-3 text-sm text-red-200">
                  {error}
                </div>
              )}

              {!loading && !error && content && content.markdown && (
                <article className="prose prose-invert prose-sm max-w-none">
                  {renderMarkdown(content.markdown)}
                </article>
              )}

              {!loading && !error && (!content || !content.markdown) && (
                <p className="text-sm text-slate-300">
                  Henüz bu liste için içerik üretilemedi. Lütfen daha sonra
                  tekrar dene.
                </p>
              )}
            </div>
          </div>
        </div>

        <footer className="border-t border-slate-800/80 bg-slate-950/90">
          <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 py-5 text-xs text-slate-400 sm:flex-row">
            <span className="font-medium text-slate-300">
              Scout Intelligence
            </span>
            <div className="flex items-center gap-4">
              <span className="h-6 w-6 rounded-full border border-slate-700/80 bg-slate-900/80" />
              <span className="h-6 w-6 rounded-full border border-slate-700/80 bg-slate-900/80" />
              <span className="h-6 w-6 rounded-full border border-slate-700/80 bg-slate-900/80" />
            </div>
            <span className="text-[11px] text-slate-500">
              © 2026 Scout Intelligence
            </span>
          </div>
        </footer>
      </div>
    </main>
  );
}

