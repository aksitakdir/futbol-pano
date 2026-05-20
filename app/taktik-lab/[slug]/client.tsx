"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import ArticleLayout from "../../components/article-layout";
import { primaryHubId } from "@/lib/hub-from-tags";

type SectionBlock =
  | { type: "intro"; html: string }
  | { type: "section"; heading: string; html: string }
  | { type: "pullquote"; text: string }
  | { type: "callout"; html: string };

type ContentRow = {
  id: string; title: string; slug: string; category: string;
  content: string; content_en?: string | null; created_at: string;
  youtube_id?: string; cover_image?: string;
  youtube_query_1?: string; youtube_query_2?: string;
  news_query?: string; player_name?: string;
  hero_variant?: string; accent?: string;
  sections_json?: SectionBlock[] | null;
  hub_tags?: string[] | null;
};

export default function TaktikLabDetailClient({ slug }: { slug: string }) {
  const [article, setArticle] = useState<ContentRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) return;
    supabase.from("contents").select("*")
      .eq("slug", slug).eq("category", "taktik-lab").eq("status", "yayinda")
      .maybeSingle()
      .then(({ data, error }) => {
        if (error || !data) { setNotFound(true); } else { setArticle(data as ContentRow); }
        setLoading(false);
      });
  }, [slug]);

  if (loading) return (
    <main className="flex min-h-screen items-center justify-center" style={{ background: "var(--sg-bg)" }}>
      <span className="h-5 w-5 animate-spin rounded-full border-2"
        style={{ borderColor: "var(--cyan)", borderTopColor: "transparent" }} />
    </main>
  );

  if (notFound || !article) return (
    <main className="flex min-h-screen flex-col items-center justify-center" style={{ background: "var(--sg-bg)", color: "var(--sg-text-primary)" }}>
      <h1 className="mb-2 text-2xl font-extrabold">404</h1>
      <p className="mb-6 text-sm" style={{ color: "var(--sg-text-muted)" }}>Bu Taktik Lab içeriği bulunamadı.</p>
      <Link href="/taktik-lab" style={{ color: "var(--cyan)", fontSize: 13 }}>← Taktik Lab&apos;a Dön</Link>
    </main>
  );

  return (
    <ArticleLayout
      title={article.title}
      content={article.content ?? ""}
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
      playerName={article.player_name}
      heroVariant={article.hero_variant ?? "pitch-diagram"}
      accentOverride={article.accent ?? "cyan"}
      sectionsJson={Array.isArray(article.sections_json) ? article.sections_json : null}
      hubId={primaryHubId(article.hub_tags)}
    />
  );
}
