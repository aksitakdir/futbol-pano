import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Scouting Lists | Scout Gamer",
  description: "Curated scouting lists — best XI picks, position rankings, and transfer target shortlists.",
  alternates: { canonical: "https://scoutgamer.com/lists" },
};

export default function ListelerLayout({ children }: { children: React.ReactNode }) {
  return children;
}
