import type { Metadata } from "next";

export const metadata: Metadata = {
  // Absolute: the root template would append "| Scout Gamer" a second time. Defining a
  // title here also resets the template for this section's articles, which keep their
  // bare headline as before (a sitewide decision, not part of this fix).
  title: { absolute: "Scouting Lists | Scout Gamer" },
  description: "Curated scouting lists — best XI picks, position rankings, and transfer target shortlists.",
  alternates: { canonical: "https://www.scoutgamer.com/lists" },
};

/**
 * Metadata only since 2026-10-19. The section's article index used to wrap every page
 * here, inside the footer (FooterOwner). The hub now lists every piece in its own
 * body, and each article links its siblings from an in-body "More in" block
 * (lib/related-articles.ts), so every page in the section has a standard footer.
 */
export default function ListelerLayout({ children }: { children: React.ReactNode }) {
  return children;
}
