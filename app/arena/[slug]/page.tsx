import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase";
import type { ArenaGame } from "@/lib/arena-brackets";
import ArenaSlugClient from "./arena-slug-client";

const BASE = "https://scoutgamer.com";

// Yayında olan tüm slug'ları build time'da oluştur (SSG)
export async function generateStaticParams() {
  const supabase = createClient();
  const { data } = await supabase
    .from("arena_games")
    .select("slug")
    .eq("status", "published");
  return (data ?? []).map((g) => ({ slug: g.slug }));
}

// Build sonrası güncellemeler için ISR: 1 saat
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
  searchParams: Promise<{ lang?: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const { lang } = await searchParams;
  const isEn = lang === "en";
  const game = await fetchGame(slug);
  if (!game) return { title: "Arena | Scout Gamer" };

  const title = isEn ? game.title_en || game.title_tr : game.title_tr;
  const description = isEn ? game.description_en || game.description_tr : game.description_tr;
  const pageUrl = `${BASE}/arena/${slug}${isEn ? "?lang=en" : ""}`;
  const canonical = `${BASE}/arena/${slug}`;

  // Build OG image URL with all data embedded — no Supabase call inside the image route
  const names = game.participants.slice(0, 4).map((p) => p.name).join("|");
  const ogImg = new URL(`${BASE}/arena/${slug}/opengraph-image`);
  ogImg.searchParams.set("t", title);
  ogImg.searchParams.set("c", game.card_color);
  ogImg.searchParams.set("d", description.slice(0, 110));
  ogImg.searchParams.set("n", names);
  ogImg.searchParams.set("cnt", String(game.participants.length));
  const ogImgUrl = ogImg.toString();

  return {
    title: `${title} | Arena — Scout Gamer`,
    description,
    alternates: {
      canonical,
      languages: {
        "tr": `${BASE}/arena/${slug}`,
        "en": `${BASE}/arena/${slug}?lang=en`,
      },
    },
    openGraph: {
      title: `${title} | Scout Gamer Arena`,
      description,
      url: pageUrl,
      siteName: "Scout Gamer",
      type: "website",
      images: [{ url: ogImgUrl, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | Scout Gamer`,
      description,
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
  searchParams: Promise<{ lang?: string }>;
}) {
  const { slug } = await params;
  const { lang } = await searchParams;
  const game = await fetchGame(slug);

  if (!game) notFound();

  const resolvedLang = lang === "en" ? "en" : "tr";

  // JSON-LD: Game / InteractiveFeature
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Game",
    "name": resolvedLang === "en" ? game.title_en || game.title_tr : game.title_tr,
    "description": resolvedLang === "en" ? game.description_en || game.description_tr : game.description_tr,
    "url": `${BASE}/arena/${slug}`,
    "inLanguage": resolvedLang === "en" ? "en" : "tr",
    "publisher": {
      "@type": "Organization",
      "name": "Scout Gamer",
      "url": BASE,
    },
    "numberOfPlayers": {
      "@type": "QuantitativeValue",
      "minValue": 1,
      "maxValue": 1,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ArenaSlugClient
        game={game}
        lang={resolvedLang}
        canonicalUrl={`${BASE}/arena/${slug}`}
      />
    </>
  );
}
