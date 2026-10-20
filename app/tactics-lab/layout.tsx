import type { Metadata } from "next";

export const metadata: Metadata = {
  // Absolute: the root template would append "| Scout Gamer" a second time. Defining a
  // title here also resets the template for this section's articles, which keep their
  // bare headline as before (a sitewide decision, not part of this fix).
  title: { absolute: "Tactics Lab | Scout Gamer" },
  description: "Tactical deep-dives — positional archetypes, pressing systems, and role analysis in modern football.",
  alternates: { canonical: "https://www.scoutgamer.com/tactics-lab" },
};

/**
 * Metadata only since 2026-10-19. The section's article index used to wrap every page
 * here, inside the footer (FooterOwner). The hub now lists every piece in its own
 * body, and each article links its siblings from an in-body "More in" block
 * (lib/related-articles.ts), so every page in the section has a standard footer.
 */
export default function TaktikLabLayout({ children }: { children: React.ReactNode }) {
  return children;
}
