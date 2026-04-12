"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import ArticleLayoutEn from "../../../components/article-layout-en";
import PlayerCard, { type PlayerCardData } from "../../../components/player-card";

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
};

async function fetchPlayerStats(name: string, supabaseClient: typeof supabase) {
  const { data: exact } = await supabaseClient
    .from("fc_players")
    .select("overall,pace,shooting,passing,dribbling,defending,physical,photo_url,position,club,league,age")
    .ilike("name", name)
    .limit(1)
    .maybeSingle();
  if (exact?.overall) return exact;
  const two = name.split(" ").slice(0, 2).join(" ");
  const { data: two2 } = await supabaseClient
    .from("fc_players")
    .select("overall,pace,shooting,passing,dribbling,defending,physical,photo_url,position,club,league,age")
    .ilike("name", `%${two}%`)
    .order("overall", { ascending: false })
    .limit(1)
    .maybeSingle();
  return two2?.overall ? two2 : null;
}

export default function EnTaktikLabDetailPage() {
  const params = useParams<{ slug: string }>();
  const slug = params?.slug;
  const [article, setArticle] = useState<ContentRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [playerCardData, setPlayerCardData] = useState<PlayerCardData | null>(null);

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
        setLoading(false);
        return;
      }
      setArticle(data as ContentRow);
      if (data.player_name) {
        const stats = await fetchPlayerStats(data.player_name, supabase);
        if (stats?.overall) {
          setPlayerCardData({
            name: data.player_name,
            club: stats.club ?? "",
            league: stats.league ?? "",
            position: stats.position ?? "",
            age: stats.age ?? "",
            overall: stats.overall,
            pace: stats.pace ?? 0,
            shooting: stats.shooting ?? 0,
            passing: stats.passing ?? 0,
            dribbling: stats.dribbling ?? 0,
            defending: stats.defending ?? 0,
            physical: stats.physical ?? 0,
            photo_url: stats.photo_url ?? undefined,
          });
        }
      }
      setLoading(false);
    }
    fetchArticle();
  }, [slug]);

  if (loading)
    return (
      <main className="flex min-h-screen items-center justify-center" style={{ background: "var(--sg-bg)" }}>
        <span
          className="h-5 w-5 animate-spin rounded-full border-2 border-t-transparent"
          style={{ borderColor: "var(--sg-tertiary)", borderTopColor: "transparent" }}
        />
      </main>
    );

  if (notFound || !article)
    return (
      <main
        className="flex min-h-screen flex-col items-center justify-center"
        style={{ background: "var(--sg-bg)", color: "var(--sg-text-primary)" }}
      >
        <h1 className="mb-2 text-2xl font-bold">404</h1>
        <Link href="/en/taktik-lab" className="text-sm" style={{ color: "var(--sg-tertiary)" }}>
          ← Back to Tactics Lab
        </Link>
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
      activeNav="taktik-lab"
      backHref="/en/taktik-lab"
      backLabel="Back to Tactics Lab"
      youtubeId={article.youtube_id}
      coverImage={article.cover_image}
      youtubeQuery1={article.youtube_query_1}
      youtubeQuery2={article.youtube_query_2}
      playerName={article.player_name}
      isPending={!hasEnglish}
    >
      {playerCardData && (
        <div className="mb-8">
          <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.2em]" style={{ color: "var(--sg-tertiary)", fontFamily: "var(--font-headline)" }}>
            Player Card
          </p>
          <PlayerCard
            player={playerCardData}
            size="full"
            showScoutNote={false}
            animated={true}
            tmLink={`https://www.transfermarkt.com/schnellsuche/ergebnis/schnellsuche?query=${encodeURIComponent(playerCardData.name)}`}
            gLink={`https://www.google.com/search?q=${encodeURIComponent(playerCardData.name + " footballer")}`}
          />
        </div>
      )}
    </ArticleLayoutEn>
  );
}
