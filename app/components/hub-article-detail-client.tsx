"use client";

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
  article,
}: {
  slug: string;
  hubId: string;
  article: ContentRow;
}) {
  const config = BACK_CONFIG[hubId] ?? { path: "/", title: "Home", navKey: "radar" as NavKey };

  // The World Cup ended on 19 July 2026. A "latest news" strip and a video strip
  // under a finished tournament's articles fetch on every page view and return
  // stale or unrelated results — a cost with a negative return. Withholding the
  // queries here stops both fetches at the source; the stored values stay in the
  // database for whenever the next tournament starts.
  const isFinishedEvent = hubId === "wc-2026";
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
      newsQuery={isFinishedEvent ? undefined : article.news_query}
      youtubeQuery1={isFinishedEvent ? undefined : article.youtube_query_1}
      youtubeQuery2={isFinishedEvent ? undefined : article.youtube_query_2}
      playerName={article.player_name}
      heroVariant={article.hero_variant ?? "text-only"}
      accentOverride={article.accent ?? CATEGORY_ACCENT[hubId] ?? "emerald"}
      sectionsJson={Array.isArray(article.sections_json) ? article.sections_json : null}
      playersJson={article.players_json}
    />
  );
}
