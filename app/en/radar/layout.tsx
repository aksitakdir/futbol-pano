import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Radar",
  description: "Discover Europe's brightest young talents. Weekly scout reports and player analysis.",
  openGraph: {
    title: "Radar | Scout Gamer",
    description: "Discover Europe's brightest young talents. Weekly scout reports and player analysis.",
    url: "https://scoutgamer.com/en/radar",
    type: "website",
    locale: "en_US",
  },
  alternates: { canonical: "https://scoutgamer.com/en/radar" },
};

export default function EnRadarLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
