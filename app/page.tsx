import HomeClient from "./home-client";
import { ArticleIndexColumns } from "./components/article-index-links";
import FooterOwner from "./components/footer-owner";
import { loadHomeSpotlights } from "@/lib/home-spotlights";

/**
 * The homepage, as a server component wrapping the interactive one.
 *
 * WHY THIS SPLIT: the homepage used to be a single `"use client"` file. Every
 * article link on it — the hero slides, the recent carousel, the hub promos —
 * came from a Supabase fetch inside a useEffect, so the HTML Googlebot received
 * was 36KB containing no link to any article, in the markup or the RSC payload,
 * and two `LOADING...` placeholders where the article sections should be
 * (measured 2026-09-22).
 *
 * Articles were still crawlable through the server-rendered category indexes,
 * so this was never the total-invisibility case of July 2026. What it cost was
 * link equity and freshness from the strongest page on the site: a piece
 * published that morning had exactly one internal link pointing at it.
 *
 * The fix is the one the category pages already use — ArticleIndexLinks fetches
 * on the server so the links are in the raw HTML — applied here by making the
 * route a server component and rendering the interactive homepage inside it.
 * The index sits inside the site footer, above its columns (see FooterOwner).
 */

// Hourly: the point of these blocks is freshness, and a piece published this
// morning should be linked from here this morning. 24 ISR writes a day.
export const revalidate = 3600;

export default async function HomePage() {
  const spotlights = await loadHomeSpotlights();
  return (
    <FooterOwner
      index={
        <ArticleIndexColumns
          columns={[
            { category: "lists", basePath: "/lists", heading: "Lists" },
            { category: "radar", basePath: "/radar", heading: "Radar" },
            { category: "tactics-lab", basePath: "/tactics-lab", heading: "Tactics Lab" },
          ]}
        />
      }
    >
      <HomeClient spotlights={spotlights} />
    </FooterOwner>
  );
}
