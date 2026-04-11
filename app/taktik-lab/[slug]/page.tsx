"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import ArticleLayout from "../../components/article-layout";
import PlayerCard, { type PlayerCardData } from "../../components/player-card";

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
  player_name?: string;
};

async function fetchPlayerStats(name: string) {
  const { data: exact } = await supabase
    .from("fc_players")
    .select("overall,pace,shooting,passing,dribbling,defending,physical,photo_url,position,club,league,age")
    .ilike("name", name)
    .limit(1)
    .maybeSingle();
  if (exact?.overall) return exact;

  const twoWords = name.split(" ").slice(0, 2).join(" ");
  const { data: two } = await supabase
    .from("fc_players")
    .select("overall,pace,shooting,passing,dribbling,defending,physical,photo_url,position,club,league,age")
    .ilike("name", `%${twoWords}%`)
    .order("overall", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (two?.overall) return two;

  return null;
}

export default function TaktikLabDetailPage() {
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
        .eq("category", "taktik-lab")
        .eq("status", "yayinda")
        .maybeSingle();

      if (error || !data) {
        setNotFound(true);
      } else {
        setArticle(data as ContentRow);

        if (data.player_name) {
          const stats = await fetchPlayerStats(data.player_name);
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
      }
      setLoading(false);
    }
    fetchArticle();
  }, [slug]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100">
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-violet-400 border-t-transparent" />
          Yükleniyor...
        </div>
      </main>
    );
  }

  if (notFound || !article) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100">
        <h1 className="mb-2 text-2xl font-extrabold">404</h1>
        <p className="mb-6 text-sm text-slate-400">Bu Taktik Lab içeriği bulunamadı.</p>
        <Link
          href="/taktik-lab"
          className="inline-flex rounded-full border border-slate-700/80 bg-slate-900/70 px-5 py-2 text-xs font-medium text-slate-200 transition hover:border-violet-500/70 hover:text-violet-200"
        >
          ← Taktik Lab&apos;a Dön
        </Link>
      </main>
    );
  }

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
    >
      {playerCardData && (
        <div className="mb-8">
          <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.2em] text-violet-400/80">Odak Oyuncu</p>
          <PlayerCard
            player={playerCardData}
            size="full"
            showScoutNote={false}
            animated={true}
            tmLink={`https://www.transfermarkt.com.tr/schnellsuche/ergebnis/schnellsuche?query=${encodeURIComponent(playerCardData.name)}`}
            gLink={`https://www.google.com/search?q=${encodeURIComponent(playerCardData.name + " footballer")}`}
          />
        </div>
      )}
    </ArticleLayout>
  );
}
