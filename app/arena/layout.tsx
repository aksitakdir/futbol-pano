import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Oyna & Paylaş",
  description:
    "Arena bracket’ları: genç yıldızlar, Şampiyonlar Ligi, teknik direktörler, Süper Lig efsaneleri ve yabancılar. Şampiyonunu seç ve paylaş.",
};

export default function ArenaLayout({ children }: { children: React.ReactNode }) {
  return children;
}
