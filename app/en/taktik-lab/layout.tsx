import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Tactics Lab",
  description: "Tactical analysis through a football × game culture lens: position archetypes, system breakdowns, modern football concepts.",
  openGraph: {
    title: "Tactics Lab | Scout Gamer",
    description: "Tactical analysis through a football × game culture lens: position archetypes, system breakdowns, modern football concepts.",
    url: "https://scoutgamer.com/en/taktik-lab",
    type: "website",
    locale: "en_US",
  },
  alternates: { canonical: "https://scoutgamer.com/en/taktik-lab" },
};

export default function EnTaktikLabLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
