import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "World Cup 2026 Squads | Scout Gamer",
  description: "All 48 national team squads for the 2026 FIFA World Cup — scout view by position.",
  alternates: { canonical: "https://www.scoutgamer.com/world-cup-2026/squads" },
};

export default function SquadsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
