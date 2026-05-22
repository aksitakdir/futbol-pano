"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import ArticleLayoutEn from "./article-layout-en";
import { HUBS, type HubId } from "@/lib/hub-config";
import type { SectionBlock } from "@/lib/section-blocks";

type ContentRow = {
  id: string;
  title: string;
  title_en?: string;
  slug: string;
  category: string;
  content: string;
  content_en?: string;
  created_at: string;
  youtube_id?: string;
  cover_image?: string;
  youtube_query_1?: string;
  youtube_query_2?: string;
  news_query?: string;
  hero_variant?: string;
  accent?: string;
  sections_json?: SectionBlock[] | null;
  hub_tags?: string[] | null;
};

const HUB_ACCENTS: Record<HubId, string> = {
  "wc-2026": "amber",
  transfer: "cyan",
};

export default function HubArticleDetailClient({
  slug,
  hubId,
}: {
  slug: string;
  hubId: HubId;
}) {
  const [article, setArticle] = useState<ContentRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const hub = HUBS[hubId].en;

  useEffect(() => {
    if (!slug) return;
    supabase
      .from("contents")
      .select("*")
      .eq("slug", slug)
      .or(`category.eq.${hubId},hub_tags.cs.{${hubId}}`)
      .eq("status", "yayinda")
      .maybeSingle()
      .then(({ data, error }) => {
        if (error || !data) setNotFound(true);
        else setArticle(data as ContentRow);
        setLoading(false);
      });
  }, [slug, hubId]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center" style={{ background: "var(--sg-bg)" }}>
        <span className="h-5 w-5 animate-spin rounded-full border-2" style={{ borderColor: "var(--sg-primary)", borderTopColor: "transparent" }} />
      </main>
    );
  }

  if (notFound || !article) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center" style={{ background: "var(--sg-bg)", color: "var(--sg-text-primary)" }}>
        <h1 className="mb-2 text-2xl font-bold">404</h1>
        <Link href={hub.basePath} style={{ color: "var(--sg-primary)", fontSize: 13 }}>
          ← Back to {hub.pillarTitle}
        </Link>
      </main>
    );
  }

  const title = article.title_en || article.title;

  return (
    <ArticleLayoutEn
      title={title}
      content={article.content_en || article.content}
      excerptContent={article.content_en || article.content}
      category={hubId}
      date={article.created_at}
      slug={article.slug}
      activeNav={hubId}
      backHref={hub.basePath}
      backLabel={`Back to ${hub.pillarTitle}`}
      youtubeId={article.youtube_id}
      coverImage={article.cover_image}
      newsQuery={article.news_query}
      youtubeQuery1={article.youtube_query_1}
      youtubeQuery2={article.youtube_query_2}
      heroVariant={article.hero_variant ?? "text-only"}
      accentOverride={article.accent ?? HUB_ACCENTS[hubId]}
      sectionsJson={Array.isArray(article.sections_json) ? article.sections_json : null}
      hubId={hubId}
    />
  );
}
