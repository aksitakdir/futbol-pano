import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Arena — Play & Share | Scout Gamer",
  description:
    "Bracket tournaments — young stars, Champions League legends, managers and more. Pick your champion and share.",
  alternates: { canonical: "https://www.scoutgamer.com/arena" },
};

export default function ArenaLayout({ children }: { children: React.ReactNode }) {
  return children;
}
