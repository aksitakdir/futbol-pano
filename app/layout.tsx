import type { Metadata } from "next";
import { Space_Grotesk, Inter_Tight, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import SmoothScrollProvider from "./components/smooth-scroll-provider";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const interTight = Inter_Tight({
  variable: "--font-inter-tight",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-ibm-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://scoutgamer.com"),
  title: "Scout Gamer",
  description: "Futbol × Oyun Kültürü. Avrupa'nın en parlak genç yeteneklerini keşfet.",
  openGraph: {
    images: [{ url: "https://scoutgamer.com/og-image.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body className={`${spaceGrotesk.variable} ${interTight.variable} ${ibmPlexMono.variable} antialiased`}>
        <SmoothScrollProvider>
          {children}
        </SmoothScrollProvider>
      </body>
    </html>
  );
}
