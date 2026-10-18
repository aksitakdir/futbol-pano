import type { Metadata } from "next";
import ArticleIndexLinks from "../components/article-index-links";
import FooterOwner from "../components/footer-owner";

export const metadata: Metadata = {
  title: "Radar | Scout Gamer",
  description: "Player-focused scout analysis — young talent profiles, positional breakdowns, and watchlist reports.",
  alternates: { canonical: "https://www.scoutgamer.com/radar" },
};

export default function RadarLayout({ children }: { children: React.ReactNode }) {
  return (
    // The section's article index, server-rendered inside the footer (see FooterOwner).
    <FooterOwner index={<ArticleIndexLinks category="radar" basePath="/radar" heading="All Radar Reports" />}>
      {children}
    </FooterOwner>
  );
}
