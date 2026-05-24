"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import ArticleLayoutEn from "../../components/article-layout-en";
import RadarPlayerFocusPanel from "../../components/radar-player-focus-panel";
import { type PlayerCardData } from "../../components/player-card";
import { stripHtml } from "@/lib/utils";
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
  stat_pace?: number; stat_shooting?: number; stat_passing?: number;
  stat_dribbling?: number; stat_defending?: number; stat_physical?: number;
  stat_overall?: number;
  hub_tags?: string[] | null;
};

const FC_SELECT = "overall,pace,shooting,passing,dribbling,defending,physical,position,club,league,age,photo_url";

async function lookupFcPlayer(name: string): Promise<Partial<PlayerCardData> | null> {
  const { data: exact } = await supabase.from("fc_players").select(FC_SELECT).ilike("name", name).limit(1).maybeSingle();
  if (exact?.overall) return exact;
  const two = name.split(" ").slice(0, 2).join(" ");
  const { data: fuzzy } = await supabase.from("fc_players").select(FC_SELECT).ilike("name", `%${two}%`).order("overall", { ascending: false }).limit(1).maybeSingle();
  return fuzzy?.overall ? fuzzy : null;
}

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

export default function RadarDetailClient({ slug }: { slug: string }) {
  const [article, setArticle] = useState<ContentRow | null>(null);
  const [playerCard, setPlayerCard] = useState<PlayerCardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    if (!slug) return;
    supabase.from("contents").select("*")
      .eq("slug", slug).eq("status", "yayinda").single()
      .then(async ({ data, error }) => {
        if (error || !data) { setNotFound(true); setLoading(false); return; }
        const row = data as ContentRow;
        if (redirectToCanonicalArticle(row.category, row.slug, "radar")) {
          setRedirecting(true);
          setLoading(false);
          return;
        }
        setArticle(row);

        if (row.player_name) {
          const hasStored = !!(row.stat_overall || row.stat_pace);
          const fcRow = await lookupFcPlayer(row.player_name);
          const stats = hasStored
            ? { overall: row.stat_overall, pace: row.stat_pace, shooting: row.stat_shooting, passing: row.stat_passing, dribbling: row.stat_dribbling, defending: row.stat_defending, physical: row.stat_physical, club: fcRow?.club, league: fcRow?.league, position: fcRow?.position, age: fcRow?.age, photo_url: fcRow?.photo_url }
            : fcRow;

          if (stats?.overall) {
            setPlayerCard({
              name: row.player_name,
              club: stats.club ?? "", league: stats.league ?? "",
              position: stats.position ?? "", age: stats.age ?? "",
              overall: stats.overall, pace: stats.pace ?? 0,
              shooting: stats.shooting ?? 0, passing: stats.passing ?? 0,
              dribbling: stats.dribbling ?? 0, defending: stats.defending ?? 0,
              physical: stats.physical ?? 0, photo_url: stats.photo_url,
            });
          }
        }
        setLoading(false);
      });
  }, [slug]);

  if (loading || redirecting) return (
    <main className="flex min-h-screen items-center justify-center" style={{ background: "var(--sg-bg)" }}>
      <span className="h-5 w-5 animate-spin rounded-full border-2" style={{ borderColor: "var(--sg-primary)", borderTopColor: "transparent" }} />
    </main>
  );

  if (notFound || !article) return (
    <main className="flex min-h-screen flex-col items-center justify-center" style={{ background: "var(--sg-bg)", color: "var(--sg-text-primary)" }}>
      <h1 className="mb-2 text-2xl font-bold">404</h1>
      <Link href="/radar" style={{ color: "var(--sg-primary)", fontSize: 13 }}>← Back to Radar</Link>
    </main>
  );

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
          locale="en"
          description={description || undefined}
          scoutQuote={scoutQuote}
        />
      ) : null}
    </ArticleLayoutEn>
  );
}
