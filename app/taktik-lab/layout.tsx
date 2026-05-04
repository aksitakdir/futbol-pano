import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Taktik Lab",
  description: "Modern futbolun taktik analizleri: pozisyon arketipleri, sistem incelemeleri ve oyun kültürü perspektifinden değerlendirmeler.",
  openGraph: {
    title: "Taktik Lab | Scout Gamer",
    description: "Modern futbolun taktik analizleri: pozisyon arketipleri, sistem incelemeleri ve oyun kültürü perspektifinden değerlendirmeler.",
    url: "https://scoutgamer.com/taktik-lab",
    type: "website",
  },
  alternates: { canonical: "https://scoutgamer.com/taktik-lab" },
};

export default function TaktikLabLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
