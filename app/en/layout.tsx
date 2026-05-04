import type { Metadata } from "next";
import type { ReactNode } from "react";
import EnDocumentLang from "../components/en-document-lang";

export const metadata: Metadata = {
  description: "Football × Game Culture. Discover Europe's brightest young talents.",
  openGraph: {
    locale: "en_US",
    siteName: "Scout Gamer",
  },
  twitter: {
    card: "summary_large_image",
    site: "@scoutgamer",
    creator: "@scoutgamer",
  },
};

export default function EnLayout({ children }: { children: ReactNode }) {
  return (
    <div lang="en">
      <EnDocumentLang />
      {children}
    </div>
  );
}
