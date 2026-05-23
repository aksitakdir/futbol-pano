import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Radar | Scout Gamer",
  description: "Player-focused scout analysis — young talent profiles, positional breakdowns, and watchlist reports.",
  alternates: { canonical: "https://www.scoutgamer.com/radar" },
};

export default function RadarLayout({ children }: { children: React.ReactNode }) {
  return children;
}
