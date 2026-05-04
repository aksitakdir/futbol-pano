import type { Metadata } from "next";
import { createClient } from "@/lib/supabase";
import type { ArenaGame } from "@/lib/arena-brackets";
import SiteHeader from "../../components/site-header";
import SiteFooter from "../../components/site-footer";
import CategoryHero from "../../components/category-hero";
import ArenaGameGrid from "../../arena/arena-game-grid";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Arena — Play & Share Tournaments | Scout Gamer",
  description:
    "Pick your favourite footballers, managers and legends in a bracket tournament. New matchups every time — choose your champion and share.",
  alternates: {
    canonical: "https://scoutgamer.com/en/arena",
    languages: {
      en: "https://scoutgamer.com/en/arena",
      tr: "https://scoutgamer.com/arena",
    },
  },
  openGraph: {
    title: "Arena — Play & Share | Scout Gamer",
    description:
      "Pick your favourite footballers and legends in a bracket tournament. Choose your champion and share.",
    url: "https://scoutgamer.com/en/arena",
    siteName: "Scout Gamer",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Arena | Scout Gamer",
    description: "Pick your favourite footballers in a bracket. Choose your champion and share.",
  },
};

export default async function EnArenaHomePage() {
  const supabase = createClient();
  const { data } = await supabase
    .from("arena_games")
    .select("id,slug,status,title_tr,title_en,description_tr,description_en,card_color,game_type,participants,created_at")
    .eq("status", "published")
    .order("created_at", { ascending: true });

  const games = (data as ArenaGame[]) ?? [];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "Scout Gamer Arena Tournaments",
    "description": "Pick your favourite footballers in a bracket tournament",
    "url": "https://scoutgamer.com/en/arena",
    "numberOfItems": games.length,
    "itemListElement": games.map((g, i) => ({
      "@type": "ListItem",
      "position": i + 1,
      "name": g.title_en || g.title_tr,
      "url": `https://scoutgamer.com/arena/${g.slug}?lang=en`,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main style={{ background: "var(--sg-bg)", color: "var(--sg-text-primary)", minHeight: "100vh" }}>
        <SiteHeader activeNav="arena" maxWidth="max-w-7xl" forceEn={true} />

        <div className="pt-[72px]">
          <CategoryHero accent="var(--sg-amber)">
            <div className="max-w-3xl">
              <div className="mb-5 flex items-center gap-3">
                <div className="h-[2px] w-12" style={{ background: "var(--sg-amber)" }} />
                <span
                  className="text-[10px] font-bold tracking-[0.3em]"
                  style={{ color: "var(--sg-amber)", fontFamily: "var(--font-headline)" }}
                >
                  Play & Share
                </span>
              </div>
              <h1
                className="mb-5 font-bold leading-none tracking-tighter"
                style={{ fontFamily: "var(--font-headline)", fontSize: "clamp(2.5rem, 6vw, 4.5rem)" }}
              >
                Player <span style={{ color: "var(--sg-amber)" }}>Arena</span>
              </h1>
              <p className="max-w-xl text-base leading-relaxed" style={{ color: "var(--sg-text-secondary)" }}>
                Choose a bracket, pick your winners, share your champion. Matchups are reshuffled every time you open a
                bracket.
              </p>
            </div>
          </CategoryHero>
        </div>

        <div className="mx-auto max-w-7xl px-8 pb-20 pt-16">
          <div className="mb-6 flex items-center gap-3">
            <div className="h-px flex-1" style={{ background: "rgba(26,58,92,0.5)" }} />
            <p
              className="text-[10px] font-bold tracking-[0.25em]"
              style={{ color: "var(--sg-amber)", fontFamily: "var(--font-headline)" }}
            >
              Tournament Formats
            </p>
            <div className="h-px flex-1" style={{ background: "rgba(26,58,92,0.5)" }} />
          </div>

          <ArenaGameGrid games={games} lang="en" />
        </div>

        <SiteFooter maxWidth="max-w-7xl" />
      </main>
    </>
  );
}
