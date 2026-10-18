import type { Metadata } from "next";
import ArticleIndexLinks from "../components/article-index-links";
import FooterOwner from "../components/footer-owner";

export const metadata: Metadata = {
  title: "Tactics Lab | Scout Gamer",
  description: "Tactical deep-dives — positional archetypes, pressing systems, and role analysis in modern football.",
  alternates: { canonical: "https://www.scoutgamer.com/tactics-lab" },
};

export default function TaktikLabLayout({ children }: { children: React.ReactNode }) {
  return (
    // The section's article index, server-rendered inside the footer (see FooterOwner).
    <FooterOwner index={<ArticleIndexLinks category="tactics-lab" basePath="/tactics-lab" heading="All Tactics Lab Analyses" />}>
      {children}
    </FooterOwner>
  );
}
