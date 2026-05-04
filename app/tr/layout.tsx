import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Scout Gamer — Futbol × Oyun Kültürü",
  description: "Avrupa'nın en parlak genç yeteneklerini keşfet. Haftalık scout analizleri, oyuncu radar raporları ve taktik incelemeleri.",
  alternates: {
    canonical: "https://scoutgamer.com/tr",
    languages: {
      tr: "https://scoutgamer.com/tr",
      en: "https://scoutgamer.com/en",
    },
  },
  openGraph: {
    title: "Scout Gamer — Futbol × Oyun Kültürü",
    description: "Avrupa'nın en parlak genç yeteneklerini keşfet. Haftalık scout analizleri, oyuncu radar raporları ve taktik incelemeleri.",
    url: "https://scoutgamer.com/tr",
    type: "website",
    siteName: "Scout Gamer",
    locale: "tr_TR",
    images: [{ url: "https://scoutgamer.com/og-image.png", width: 1200, height: 630, alt: "Scout Gamer" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Scout Gamer — Futbol × Oyun Kültürü",
    description: "Avrupa'nın en parlak genç yeteneklerini keşfet.",
    site: "@scoutgamer",
  },
};

export default function TrLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
