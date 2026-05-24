"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import ArticleLayoutEn from "../../components/article-layout-en";
import type { SectionBlock } from "@/lib/section-blocks";
import { redirectToCanonicalArticle } from "@/lib/article-route-guard";

type ContentRow = {
  id: string; title: string; title_en?: string;
  slug: string; category: string;
  content: string; content_en?: string; created_at: string;
  youtube_id?: string; cover_image?: string;
  youtube_query_1?: string; youtube_query_2?: string;
  news_query?: string; player_name?: string;
  hero_variant?: string; accent?: string;
  sections_json?: SectionBlock[] | null;
  players_json?: string | null;
  hub_tags?: string[] | null;
};

export default function TaktikLabDetailClient({ slug }: { slug: string }) {
  const [article, setArticle] = useState<ContentRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    if (!slug) return;
    supabase.from("contents").select("*").eq("slug", slug).eq("status", "yayinda").single()
      .then(({ data, error }) => {
        if (error || !data) {
          setNotFound(true);
          setLoading(false);
          return;
        }
        const row = data as ContentRow;
        if (redirectToCanonicalArticle(row.category, row.slug, "taktik-lab")) {
          setRedirecting(true);
          setLoading(false);
          return;
        }
        setArticle(row);
        setLoading(false);
      });
  }, [slug]);

  if (loading || redirecting) return (
    <main className="flex min-h-screen items-center justify-center" style={{ background: "var(--sg-bg)" }}>
      <span className="h-5 w-5 animate-spin rounded-full border-2" style={{ borderColor: "var(--cyan)", borderTopColor: "transparent" }} />
    </main>
  );

  if (notFound || !article) return (
    <main className="flex min-h-screen flex-col items-center justify-center" style={{ background: "var(--sg-bg)", color: "var(--sg-text-primary)" }}>
      <h1 className="mb-2 text-2xl font-bold">404</h1>
      <Link href="/tactics-lab" style={{ color: "var(--cyan)", fontSize: 13 }}>← Back to Tactics Lab</Link>
    </main>
  );

  const hasEnglish = !!(article.title_en && article.content_en);

  return (
    <ArticleLayoutEn
      title={article.title_en || article.title}
      content={hasEnglish ? article.content_en! : ""}
      excerptContent={article.content_en || article.content}
      category={article.category}
      date={article.created_at}
      slug={article.slug}
      activeNav="tactics-lab"
      backHref="/tactics-lab"
      backLabel="Back to Tactics Lab"
      youtubeId={article.youtube_id}
      coverImage={article.cover_image}
      newsQuery={article.news_query}
      youtubeQuery1={article.youtube_query_1}
      youtubeQuery2={article.youtube_query_2}
      playerName={article.player_name}
      isPending={!hasEnglish}
      heroVariant={article.hero_variant ?? "pitch-diagram"}
      accentOverride={article.accent ?? "cyan"}
      sectionsJson={Array.isArray(article.sections_json) ? article.sections_json : null}
      playersJson={article.players_json}
      hubId={undefined}
    />
  );
}
