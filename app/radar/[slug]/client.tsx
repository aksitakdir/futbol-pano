"use client";

import Link from "next/link";
import ArticleLayoutEn from "../../components/article-layout-en";
import RadarPlayerFocusPanel from "../../components/radar-player-focus-panel";
import { type PlayerCardData } from "../../components/player-card";
import { stripHtml } from "@/lib/utils";
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
  stat_pace?: number; stat_shooting?: number; stat_passing?: number;
  stat_dribbling?: number; stat_defending?: number; stat_physical?: number;
  stat_overall?: number;
  hub_tags?: string[] | null;
};

function firstPullquoteText(sections: SectionBlock[] | null | undefined): string | undefined {
  if (!Array.isArray(sections)) return;
  for (const s of sections) {
    if (s.type !== "pullquote") continue;
    const t = String(s.text ?? "").trim();
    if (t) return t;
  }
  return;
}

function ledeFromHtml(html: string, maxLen = 280): string {
  const plain = stripHtml(html).replace(/\s+/g, " ").trim();
  if (plain.length <= maxLen) return plain;
  return `${plain.slice(0, maxLen - 1)}…`;
}

function radarHeroVariant(hero_variant: string | undefined, hasPlayerCard: boolean): string {
  if (!hasPlayerCard) return hero_variant ?? "text-only";
  const raw = hero_variant ?? "player-cards";
  if (raw === "cover-image" || raw === "pitch-diagram") return raw;
  return "radar-player-focus";
}

type Props = {
  slug: string;
  article: ContentRow;
  playerCard: PlayerCardData | null;
};

export default function RadarDetailClient({ article, playerCard }: Props) {
  const hasEnglish = !!(article.title_en && article.content_en);
  const scoutQuote = firstPullquoteText(article.sections_json);
  const bodyForLede = hasEnglish ? article.content_en! : article.content;
  const description = playerCard ? ledeFromHtml(bodyForLede) : "";

  return (
    <ArticleLayoutEn
      title={article.title_en || article.title}
      content={hasEnglish ? article.content_en! : ""}
      excerptContent={article.content_en || article.content}
      category={article.category}
      date={article.created_at}
      slug={article.slug}
      activeNav="radar"
      backHref="/radar"
      backLabel="Back to Radar"
      youtubeId={article.youtube_id}
      coverImage={article.cover_image}
      newsQuery={article.news_query}
      youtubeQuery1={article.youtube_query_1}
      youtubeQuery2={article.youtube_query_2}
      playerName={article.player_name}
      isPending={!hasEnglish}
      heroVariant={radarHeroVariant(article.hero_variant, !!playerCard)}
      accentOverride={article.accent ?? "sky"}
      sectionsJson={Array.isArray(article.sections_json) ? article.sections_json : null}
      playersJson={article.players_json}
      hubId={undefined}
    >
      {playerCard ? (
        <RadarPlayerFocusPanel
          player={playerCard}
          description={description || undefined}
          scoutQuote={scoutQuote}
        />
      ) : null}
    </ArticleLayoutEn>
  );
}
