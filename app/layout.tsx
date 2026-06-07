import type { Metadata } from "next";
import { Space_Grotesk, Inter_Tight, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import SmoothScrollProvider from "./components/smooth-scroll-provider";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { GoogleAnalytics } from "@next/third-parties/google";

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
  metadataBase: new URL("https://www.scoutgamer.com"),
  alternates: { canonical: "./" },
  title: {
    default: "Scout Gamer | Young Talent Scouting, Rising Footballers & Game Culture",
    template: "%s | Scout Gamer",
  },
  description: "Discover the brightest young football talents, World Cup 2026 squads, transfer analysis, tactical deep-dives, and interactive bracket tournaments.",
  openGraph: {
    type: "website",
    siteName: "Scout Gamer",
    locale: "en_US",
    url: "https://www.scoutgamer.com",
  },
  twitter: {
    card: "summary_large_image",
    site: "@scoutgamerx",
    creator: "@scoutgamerx",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${spaceGrotesk.variable} ${interTight.variable} ${ibmPlexMono.variable} antialiased`}>
        <SmoothScrollProvider>
          {children}
        </SmoothScrollProvider>
        <Analytics />
        <SpeedInsights />
      </body>
      <GoogleAnalytics gaId="G-R45Y11BCD1" />
    </html>
  );
}
