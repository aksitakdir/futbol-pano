import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Listeler",
  description: "Kürasyonlu scout listeleri: en iyi genç stoperler, gizli isimler, sürpriz çıkışlar ve daha fazlası.",
  openGraph: {
    title: "Listeler | Scout Gamer",
    description: "Kürasyonlu scout listeleri: en iyi genç stoperler, gizli isimler, sürpriz çıkışlar ve daha fazlası.",
    url: "https://scoutgamer.com/listeler",
    type: "website",
  },
  alternates: { canonical: "https://scoutgamer.com/listeler" },
};

export default function ListelerLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
