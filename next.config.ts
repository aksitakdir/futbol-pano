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
      { source: "/en/listeler/:path*", destination: "/listeler/:path*", permanent: true },
      { source: "/en/taktik-lab/:path*", destination: "/taktik-lab/:path*", permanent: true },
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
      // Turkish category slugs
      { source: "/kadrolar/:path*", destination: "/world-cup-2026/squads/:path*", permanent: true },
    ];
  },
};

export default nextConfig;
