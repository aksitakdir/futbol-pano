import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Scouting Lists",
  description: "Curated scouting lists: best young centre-backs, hidden gems, breakout players and more.",
  openGraph: {
    title: "Scouting Lists | Scout Gamer",
    description: "Curated scouting lists: best young centre-backs, hidden gems, breakout players and more.",
    url: "https://scoutgamer.com/en/listeler",
    type: "website",
    locale: "en_US",
  },
  alternates: { canonical: "https://scoutgamer.com/en/listeler" },
};

export default function EnListelerLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
