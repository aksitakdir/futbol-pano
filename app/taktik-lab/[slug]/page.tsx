"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import ArticleLayout from "../../components/article-layout";

type ContentRow = {
  id: string;
  title: string;
  slug: string;
  category: string;
  content: string;
  created_at: string;
  youtube_id?: string;
  cover_image?: string;
  youtube_query_1?: string;
  youtube_query_2?: string;
  news_query?: string;
};

export default function TaktikLabDetailPage() {
  const params = useParams<{ slug: string }>();
  const slug = params?.slug;

  const [article, setArticle] = useState<ContentRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) return;

    async function fetchArticle() {
      const { data, error } = await supabase
        .from("contents")
        .select("*")
        .eq("slug", slug)
        .eq("status", "yayinda")
        .single();

      if (error || !data) {
        setNotFound(true);
      } else {
        setArticle(data);
      }
      setLoading(false);
    }
    fetchArticle();
  }, [slug]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100">
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-emerald-400 border-t-transparent" />
          Yükleniyor...
        </div>
      </main>
    );
  }

  if (notFound || !article) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100">
        <h1 className="mb-2 text-2xl font-extrabold">404</h1>
        <p className="mb-6 text-sm text-slate-400">Bu içerik bulunamadı veya henüz yayınlanmadı.</p>
        <Link
          href="/taktik-lab"
          className="inline-flex rounded-full border border-slate-700/80 bg-slate-900/70 px-5 py-2 text-xs font-medium text-slate-200 transition hover:border-emerald-500/70 hover:text-emerald-200"
        >
          ← Taktik Lab&apos;a Dön
        </Link>
      </main>
    );
  }

  return (
    <ArticleLayout
      title={article.title}
      content={article.content}
      category={article.category}
      date={article.created_at}
      slug={article.slug}
      activeNav="taktik-lab"
      backHref="/taktik-lab"
      backLabel="Taktik Lab'a Dön"
      youtubeId={article.youtube_id}
      coverImage={article.cover_image}
      youtubeQuery1={article.youtube_query_1}
      youtubeQuery2={article.youtube_query_2}
      newsQuery={article.news_query}
    />
  );
}
