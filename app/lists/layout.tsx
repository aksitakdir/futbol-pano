import type { Metadata } from "next";
import ArticleIndexLinks from "../components/article-index-links";

export const metadata: Metadata = {
  title: "Young Talents — Best Young Footballers in World Football | Scout Gamer",
  description: "The best young footballers in world football — scouting reports by country, league and position, with stats, game-vs-reality reads and deep-cut picks.",
  alternates: { canonical: "https://www.scoutgamer.com/lists" },
};

export default function ListelerLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <ArticleIndexLinks category="lists" basePath="/lists" heading="All Young Talent Lists" />
    </>
  );
}
