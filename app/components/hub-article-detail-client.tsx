"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import ArticleLayoutEn from "./article-layout-en";
import { CATEGORY_ACCENT } from "@/lib/category-config";
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
  player_name?: string;
  hero_variant?: string;
  accent?: string;
  sections_json?: SectionBlock[] | null;
  players_json?: string | null;
};

type NavKey = "wc-2026" | "transfer" | "radar" | "lists" | "tactics-lab";

const BACK_CONFIG: Record<string, { path: string; title: string; navKey: NavKey }> = {
  "wc-2026": { path: "/world-cup-2026", title: "World Cup 2026", navKey: "wc-2026" },
  transfer: { path: "/transfers", title: "Transfers", navKey: "transfer" },
};

export default function HubArticleDetailClient({
  slug,
  hubId,
}: {
  slug: string;
  hubId: string;
}) {
  const searchParams = useSearchParams();
  const isPreview = searchParams.get("preview") === "1";
  const [article, setArticle] = useState<ContentRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const config = BACK_CONFIG[hubId] ?? { path: "/", title: "Home", navKey: "radar" as NavKey };

  useEffect(() => {
    if (!slug) return;
    let query = supabase.from("contents").select("*").eq("slug", slug);
    // preview=1 allows viewing pending articles from admin
    if (!isPreview) query = query.eq("status", "published");
    query.maybeSingle().then(({ data, error }) => {
      if (error || !data) setNotFound(true);
      else setArticle(data as ContentRow);
      setLoading(false);
    });
  }, [slug, isPreview]);

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
        <Link href={config.path} style={{ color: "var(--sg-primary)", fontSize: 13 }}>
          ← Back to {config.title}
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
      activeNav={config.navKey}
      backHref={config.path}
      backLabel={`Back to ${config.title}`}
      youtubeId={article.youtube_id}
      coverImage={article.cover_image}
      newsQuery={article.news_query}
      youtubeQuery1={article.youtube_query_1}
      youtubeQuery2={article.youtube_query_2}
      playerName={article.player_name}
      heroVariant={article.hero_variant ?? "text-only"}
      accentOverride={article.accent ?? CATEGORY_ACCENT[hubId] ?? "emerald"}
      sectionsJson={Array.isArray(article.sections_json) ? article.sections_json : null}
      playersJson={article.players_json}
    />
  );
}
