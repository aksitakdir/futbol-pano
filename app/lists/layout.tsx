import type { Metadata } from "next";
import ArticleIndexLinks from "../components/article-index-links";
import FooterOwner from "../components/footer-owner";

export const metadata: Metadata = {
  title: "Scouting Lists | Scout Gamer",
  description: "Curated scouting lists — best XI picks, position rankings, and transfer target shortlists.",
  alternates: { canonical: "https://www.scoutgamer.com/lists" },
};

export default function ListelerLayout({ children }: { children: React.ReactNode }) {
  return (
    // The section's article index, server-rendered inside the footer (see FooterOwner).
    <FooterOwner index={<ArticleIndexLinks category="lists" basePath="/lists" heading="All Lists" mode="topics" />}>
      {children}
    </FooterOwner>
  );
}
