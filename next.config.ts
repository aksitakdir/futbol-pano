import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "cdn.sofifa.net" },
      { protocol: "https", hostname: "*.supabase.co" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "i.ytimg.com" },
      { protocol: "https", hostname: "flagcdn.com" },
    ],
  },
  async redirects() {
    return [
      // EN prefix redirects — strip /en
      { source: "/en", destination: "/", permanent: true },
      { source: "/en/radar/:path*", destination: "/radar/:path*", permanent: true },
      { source: "/en/listeler/:path*", destination: "/lists/:path*", permanent: true },
      { source: "/en/lists/:path*", destination: "/lists/:path*", permanent: true },
      { source: "/en/taktik-lab/:path*", destination: "/tactics-lab/:path*", permanent: true },
      { source: "/en/tactics-lab/:path*", destination: "/tactics-lab/:path*", permanent: true },
      { source: "/en/arena/:path*", destination: "/arena/:path*", permanent: true },
      { source: "/en/world-cup-2026/:path*", destination: "/world-cup-2026/:path*", permanent: true },
      { source: "/en/transfers/:path*", destination: "/transfers/:path*", permanent: true },
      // Turkish root redirects
      { source: "/tr", destination: "/", permanent: true },
      { source: "/tr/:path*", destination: "/:path*", permanent: true },
      // Turkish hub paths
      { source: "/dunya-kupasi-2026/:path*", destination: "/world-cup-2026/:path*", permanent: true },
      { source: "/dunya-kupasi-2026", destination: "/world-cup-2026", permanent: true },
      { source: "/transfer/:path*", destination: "/transfers/:path*", permanent: true },
      { source: "/transfer", destination: "/transfers", permanent: true },
      // Deleted arena games → arena index
      { source: "/arena/super-lig-efsaneleri", destination: "/arena", permanent: true },
      { source: "/arena/turkiyede-en-iyi-yabancilar", destination: "/arena", permanent: true },
      { source: "/arena/dk-2026-sampiyonu", destination: "/arena", permanent: true },
      // Deleted Turkish-slug radar articles → radar index
      { source: "/radar/avrupa-liglerinde-one-cikan-genc-oyuncular-scouting", destination: "/radar", permanent: true },
      { source: "/radar/avrupa-gizli-cevherleri-genç-yildizlar", destination: "/radar", permanent: true },
      { source: "/radar/avrupa-yukselen-cevher-genc-yildizlar", destination: "/radar", permanent: true },
      { source: "/radar/avrupa-liglerinde-2025-26-sezonunun-en-parlak-genc-yetenekleri", destination: "/radar", permanent: true },
      { source: "/radar/avrupa-yeni-yuz-parlayan-gencler", destination: "/radar", permanent: true },
      // Turkish category slugs → English
      { source: "/kadrolar/:path*", destination: "/world-cup-2026/squads/:path*", permanent: true },
      { source: "/listeler/:path*", destination: "/lists/:path*", permanent: true },
      { source: "/listeler", destination: "/lists", permanent: true },
      { source: "/taktik-lab/:path*", destination: "/tactics-lab/:path*", permanent: true },
      { source: "/taktik-lab", destination: "/tactics-lab", permanent: true },
    ];
  },
};

export default nextConfig;
