import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import SmoothScrollProvider from "./components/smooth-scroll-provider";
import PageTransitionProvider from "./components/page-transition-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Scout Intelligence",
  description: "Avrupa'nın en parlak genç yeteneklerini takip eden futbol keşif platformu.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <SmoothScrollProvider>
          <PageTransitionProvider>
            {children}
          </PageTransitionProvider>
        </SmoothScrollProvider>
      </body>
    </html>
  );
}
