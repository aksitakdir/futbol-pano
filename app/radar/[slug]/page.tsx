import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { articleMetadata } from "@/lib/article-metadata";
import { categoryArticlePath } from "@/lib/category-config";
import { articleJsonLd } from "@/lib/article-jsonld";
import RadarDetailClient from "./client";
import type { PlayerCardData } from "@/app/components/player-card";

type Props = { params: Promise<{ slug: string }> };

export const revalidate = 3600;

export async function generateStaticParams() {
  const supabase = createClient();
  const { data } = await supabase
    .from("contents")
    .select("slug")
    .eq("status", "published")
    .eq("category", "radar");
  return (data ?? []).map((r) => ({ slug: r.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return articleMetadata(slug, `/radar/${slug}`);
}

const FC_SELECT = "overall,pace,shooting,passing,dribbling,defending,physical,position,club,league,age,photo_url";

async function lookupFcPlayer(name: string): Promise<Partial<PlayerCardData> | null> {
  const supabase = createClient();
  const { data: exact } = await supabase.from("fc_players").select(FC_SELECT).ilike("name", name).limit(1).maybeSingle();
  if (exact?.overall) return exact;
  const two = name.split(" ").slice(0, 2).join(" ");
  const { data: fuzzy } = await supabase.from("fc_players").select(FC_SELECT).ilike("name", `%${two}%`).order("overall", { ascending: false }).limit(1).maybeSingle();
  return fuzzy?.overall ? fuzzy : null;
}

export default async function RadarDetailPage({ params }: Props) {
  const { slug } = await params;
  const supabase = createClient();
  const { data, error } = await supabase
    .from("contents")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (error || !data) notFound();

  if (data.category !== "radar") {
    redirect(categoryArticlePath(data.category, data.slug));
  }

  let playerCard: PlayerCardData | null = null;
  if (data.player_name) {
    const hasStored = !!(data.stat_overall || data.stat_pace);
    const fcRow = await lookupFcPlayer(data.player_name);
    const stats = hasStored
      ? { overall: data.stat_overall, pace: data.stat_pace, shooting: data.stat_shooting, passing: data.stat_passing, dribbling: data.stat_dribbling, defending: data.stat_defending, physical: data.stat_physical, club: fcRow?.club, league: fcRow?.league, position: fcRow?.position, age: fcRow?.age, photo_url: fcRow?.photo_url }
      : fcRow;

    if (stats?.overall) {
      playerCard = {
        name: data.player_name,
        club: stats.club ?? "", league: stats.league ?? "",
        position: stats.position ?? "", age: stats.age ?? "",
        overall: stats.overall, pace: stats.pace ?? 0,
        shooting: stats.shooting ?? 0, passing: stats.passing ?? 0,
        dribbling: stats.dribbling ?? 0, defending: stats.defending ?? 0,
        physical: stats.physical ?? 0, photo_url: stats.photo_url,
      };
    }
  }

  const jsonLd = articleJsonLd(data, `/radar/${slug}`);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <RadarDetailClient
        slug={slug}
        article={data}
        playerCard={playerCard}
      />
    </>
  );
}
