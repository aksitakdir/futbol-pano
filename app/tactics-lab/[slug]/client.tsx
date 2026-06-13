"use client";

import ArticleLayoutEn from "../../components/article-layout-en";
import type { SectionBlock } from "@/lib/section-blocks";

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

type Props = {
  slug: string;
  article: ContentRow;
};

export default function TaktikLabDetailClient({ article }: Props) {
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
