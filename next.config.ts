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
      // Turkish article slugs → English (migrated 2025-06-05)
      { source: "/world-cup-2026/adidas-trionda-teknik-analiz-2026-dunya-kupasi-topu", destination: "/world-cup-2026/adidas-trionda-tech-analysis-2026-world-cup-ball", permanent: true },
      { source: "/world-cup-2026/2026-dunya-kupasi-48-takim-format-analiz", destination: "/world-cup-2026/2026-world-cup-48-team-format-analysis", permanent: true },
      { source: "/lists/brezilya-2026-genc-oyuncular", destination: "/lists/brazil-2026-young-players-world-cup", permanent: true },
      { source: "/lists/arjantin-20-yas-alti-oyuncular-2026-liste", destination: "/lists/argentina-under-20-players-2026-world-cup", permanent: true },
      { source: "/lists/premier-lig-goz-actirtan-15-genc-yetenek", destination: "/lists/premier-league-15-young-talents-to-watch", permanent: true },
      { source: "/lists/bundesliga-en-potansiyelii-10-gen-futbolcu", destination: "/lists/bundesliga-top-10-young-talents", permanent: true },
      { source: "/lists/u20-transfer-hareketi-buyuk-kuluplerle", destination: "/lists/u20-transfer-moves-top-clubs", permanent: true },
      { source: "/lists/turkiyenin-en-degerli-oyunculari-arda-kenan-yildiz", destination: "/lists/turkey-most-valuable-players-arda-kenan", permanent: true },
      { source: "/lists/u21-parlayan-yildizlar-hizli-yukselen-gencler", destination: "/lists/u21-rising-stars-fast-tracking-youngsters", permanent: true },
      { source: "/tactics-lab/big-six-savunma-hatasi-premier-league-taktik", destination: "/tactics-lab/big-six-defensive-failures-premier-league-tactical", permanent: true },
      { source: "/tactics-lab/pressing-baskisi-modern-futbolun-silahi", destination: "/tactics-lab/pressing-intensity-modern-football-weapon", permanent: true },
      { source: "/tactics-lab/yuksek-pressing-sistemleri-2025-26", destination: "/tactics-lab/high-pressing-systems-2025-26", permanent: true },
      { source: "/tactics-lab/modern-futbolda-pozisyon-devrimleri-2025-26", destination: "/tactics-lab/positional-revolutions-modern-football-2025-26", permanent: true },
      { source: "/tactics-lab/pivot-pozisyonu-orta-sahinin-yeni-mimari", destination: "/tactics-lab/pivot-role-midfield-new-architecture", permanent: true },
      { source: "/tactics-lab/inverted-winger-kanat-devrim", destination: "/tactics-lab/inverted-winger-revolution", permanent: true },
      { source: "/radar/transfer-pazarinda-buyuk-oyunlar-bu-ay", destination: "/radar/transfer-market-big-moves-this-month", permanent: true },
      { source: "/radar/roma-bologna-2025-26-sezonunun-anahtar-oyunculari", destination: "/radar/roma-bologna-2025-26-key-players", permanent: true },
      { source: "/radar/Radardabirdefansoyuncusu", destination: "/radar/jair-cunha-defensive-colossus-scouting-report", permanent: true },
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
