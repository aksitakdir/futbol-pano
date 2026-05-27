import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase";
import type { ArenaGame } from "@/lib/arena-brackets";
import ArenaSlugClient from "./arena-slug-client";

const BASE = "https://www.scoutgamer.com";

// Generate all published slugs at build time (SSG)
export async function generateStaticParams() {
  const supabase = createClient();
  const { data } = await supabase
    .from("arena_games")
    .select("slug")
    .eq("status", "published");
  return (data ?? []).map((g) => ({ slug: g.slug }));
}

// ISR: revalidate every hour
export const revalidate = 3600;

async function fetchGame(slug: string): Promise<ArenaGame | null> {
  const supabase = createClient();
  const { data } = await supabase
    .from("arena_games")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  return data as ArenaGame | null;
}

// ─── Dynamic metadata ─────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ lang?: string; champion?: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const { champion: championParam } = await searchParams;
  const game = await fetchGame(slug);
  if (!game) return { title: "Arena | Scout Gamer" };

  const gameTitle = game.title_en || game.title_tr;
  const gameDesc  = game.description_en || game.description_tr;
  const canonical = `${BASE}/arena/${slug}`;

  // ── Champion result share: special metadata ──────────────────────────────
  if (championParam) {
    const champion = decodeURIComponent(championParam);
    const shareTitle = `My champion in "${gameTitle}": ${champion}!`;
    const shareDesc = `Who will you pick as champion? Play on Scout Gamer Arena.`;
    const ogImg = new URL(`${BASE}/arena/${slug}/opengraph-image`);
    ogImg.searchParams.set("t", gameTitle);
    ogImg.searchParams.set("c", game.card_color);
    ogImg.searchParams.set("champion", champion);
    ogImg.searchParams.set("lang", "en");
    const ogImgUrl = ogImg.toString();

    return {
      title: `${shareTitle} | Scout Gamer`,
      description: shareDesc,
      alternates: { canonical },
      openGraph: {
        title: shareTitle,
        description: shareDesc,
        url: `${BASE}/arena/${slug}?champion=${encodeURIComponent(champion)}`,
        siteName: "Scout Gamer",
        type: "website",
        images: [{ url: ogImgUrl, width: 1200, height: 630, alt: shareTitle }],
      },
      twitter: {
        card: "summary_large_image",
        title: shareTitle,
        description: shareDesc,
        images: [ogImgUrl],
      },
    };
  }

  // ── Default game metadata ────────────────────────────────────────────────
  const pageUrl = `${BASE}/arena/${slug}`;
  const names = game.participants.slice(0, 4).map((p) => p.name).join("|");
  const ogImg = new URL(`${BASE}/arena/${slug}/opengraph-image`);
  ogImg.searchParams.set("t", gameTitle);
  ogImg.searchParams.set("c", game.card_color);
  ogImg.searchParams.set("d", gameDesc.slice(0, 110));
  ogImg.searchParams.set("n", names);
  ogImg.searchParams.set("cnt", String(game.participants.length));
  const ogImgUrl = ogImg.toString();

  return {
    title: `${gameTitle} | Arena — Scout Gamer`,
    description: gameDesc,
    alternates: { canonical },
    openGraph: {
      title: `${gameTitle} | Scout Gamer Arena`,
      description: gameDesc,
      url: pageUrl,
      siteName: "Scout Gamer",
      type: "website",
      images: [{ url: ogImgUrl, width: 1200, height: 630, alt: gameTitle }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${gameTitle} | Scout Gamer`,
      description: gameDesc,
      images: [ogImgUrl],
    },
  };
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function ArenaBracketPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ champion?: string }>;
}) {
  const { slug } = await params;
  const { champion } = await searchParams;
  const game = await fetchGame(slug);

  if (!game) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Game",
    "name": game.title_en || game.title_tr,
    "description": game.description_en || game.description_tr,
    "url": `${BASE}/arena/${slug}`,
    "inLanguage": "en",
    "publisher": { "@type": "Organization", "name": "Scout Gamer", "url": BASE },
    "numberOfPlayers": { "@type": "QuantitativeValue", "minValue": 1, "maxValue": 1 },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ArenaSlugClient
        game={game}
        canonicalUrl={`${BASE}/arena/${slug}`}
        initialChampion={champion ? decodeURIComponent(champion) : undefined}
      />
    </>
  );
}
