import type { Metadata } from "next";
import { createClient } from "@/lib/supabase";
import type { ArenaGame } from "@/lib/arena-brackets";
import SiteHeader from "../components/site-header";
import SiteFooter from "../components/site-footer";
import CategoryHero from "../components/category-hero";
import ArenaGameGrid from "./arena-game-grid";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Arena — Turnuva Oyna & Paylaş | Scout Gamer",
  description:
    "Favori futbolcularını, teknik direktörleri ve efsaneleri turnuvada karşılaştır. Her açılışta yeni eşleşmeler — şampiyonunu seç, paylaş.",
  alternates: {
    canonical: "https://scoutgamer.com/arena",
    languages: {
      tr: "https://scoutgamer.com/arena",
      en: "https://scoutgamer.com/en/arena",
    },
  },
  openGraph: {
    title: "Arena — Turnuva Oyna & Paylaş | Scout Gamer",
    description:
      "Favori futbolcularını, teknik direktörleri ve efsaneleri turnuvada karşılaştır. Şampiyonunu belirle ve paylaş.",
    url: "https://scoutgamer.com/arena",
    siteName: "Scout Gamer",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Arena | Scout Gamer",
    description: "Favori futbolcularını turnuvada karşılaştır. Şampiyonunu seç ve paylaş.",
  },
};

export default async function ArenaHomePage() {
  const supabase = createClient();
  const { data } = await supabase
    .from("arena_games")
    .select("id,slug,status,title_tr,title_en,description_tr,description_en,card_color,game_type,participants,created_at")
    .eq("status", "published")
    .order("created_at", { ascending: true });

  const games = (data as ArenaGame[]) ?? [];

  // JSON-LD: ItemList of game pages
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "Scout Gamer Arena Turnuvaları",
    "description": "Favori futbolcularını turnuvada karşılaştır",
    "url": "https://scoutgamer.com/arena",
    "numberOfItems": games.length,
    "itemListElement": games.map((g, i) => ({
      "@type": "ListItem",
      "position": i + 1,
      "name": g.title_tr,
      "url": `https://scoutgamer.com/arena/${g.slug}`,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main style={{ background: "var(--sg-bg)", color: "var(--sg-text-primary)", minHeight: "100vh" }}>
        <SiteHeader activeNav="arena" maxWidth="max-w-7xl" />

        <div className="pt-[72px]">
          <CategoryHero accent="var(--sg-amber)">
            <div className="max-w-3xl">
              <div className="flex items-center gap-3 mb-5">
                <div className="h-[2px] w-12" style={{ background: "var(--sg-amber)" }} />
                <span
                  className="text-[10px] font-bold uppercase tracking-[0.3em]"
                  style={{ color: "var(--sg-amber)", fontFamily: "var(--font-headline)" }}
                >
                  Arena Turnuvası
                </span>
              </div>
              <h1
                className="font-bold tracking-tighter leading-none mb-5"
                style={{ fontFamily: "var(--font-headline)", fontSize: "clamp(2.5rem, 6vw, 4.5rem)" }}
              >
                Player <span style={{ color: "var(--sg-amber)" }}>Arena</span>
              </h1>
              <p className="text-base leading-relaxed max-w-xl" style={{ color: "var(--sg-text-secondary)" }}>
                Bir bracket seç, kazananları işaretle, şampiyonunu paylaş. Her açılışta eşleşmeler yeniden karışır.
              </p>
            </div>
          </CategoryHero>
        </div>

        <div className="max-w-7xl mx-auto px-8 pt-16 pb-20">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-px flex-1" style={{ background: "rgba(26,58,92,0.5)" }} />
            <p
              className="text-[10px] font-bold uppercase tracking-[0.25em]"
              style={{ color: "var(--sg-amber)", fontFamily: "var(--font-headline)" }}
            >
              Turnuva Formatları
            </p>
            <div className="h-px flex-1" style={{ background: "rgba(26,58,92,0.5)" }} />
          </div>

          <ArenaGameGrid games={games} lang="tr" />
        </div>

        <SiteFooter maxWidth="max-w-7xl" />
      </main>
    </>
  );
}
