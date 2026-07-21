import type { Metadata } from "next";
import ArticleIndexLinks from "../components/article-index-links";

export const metadata: Metadata = {
  title: "Radar | Scout Gamer",
  description: "Player-focused scout analysis — young talent profiles, positional breakdowns, and watchlist reports.",
  alternates: { canonical: "https://www.scoutgamer.com/radar" },
};

export default function RadarLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      {/* Server-rendered crawl path — the page itself lists articles client-side only */}
      <ArticleIndexLinks category="radar" basePath="/radar" heading="All Radar Reports" />
    </>
  );
}
