import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tactics Lab | Scout Gamer",
  description: "Tactical deep-dives — positional archetypes, pressing systems, and role analysis in modern football.",
  alternates: { canonical: "https://scoutgamer.com/taktik-lab" },
};

export default function TaktikLabLayout({ children }: { children: React.ReactNode }) {
  return children;
}
