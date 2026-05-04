import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Radar",
  description: "Avrupa'nın en parlak genç yeteneklerini keşfet. Her hafta güncellenen oyuncu analizleri ve scout raporları.",
  openGraph: {
    title: "Radar | Scout Gamer",
    description: "Avrupa'nın en parlak genç yeteneklerini keşfet. Her hafta güncellenen oyuncu analizleri ve scout raporları.",
    url: "https://scoutgamer.com/radar",
    type: "website",
  },
  alternates: { canonical: "https://scoutgamer.com/radar" },
};

export default function RadarLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
