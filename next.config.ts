import type { NextConfig } from "next";

/**
 * World Cup 2026 section closed on 2026-11-26 (docs/WC-SECTION-TRIAGE-2026-11-26.md).
 * Proof, Not Projection (#140) moved from the section to /lists and is the one page
 * left that answers "World Cup 2026" for the site's young-talent focus, so the hub
 * and the pre-tournament "young players to watch" pieces point at it.
 *
 * Every WC rule below points at a live page in one hop. Everything else under the
 * section (articles, schedule and squad pages, legacy aliases) answers 410 from
 * proxy.ts. These redirects run before the proxy, so their sources never reach it.
 * The Proof rule is safe only while #140 is in category "lists": moved back to
 * wc-2026, its page route would redirect to the old URL and loop
 * (scripts/seo-check.mjs checks every target answers 200).
 */
const PROOF = "/lists/proof-not-projection-2026-world-cup-breakout-young-players";

const nextConfig: NextConfig = {
  /**
   * Turbopack's build cache is on by default in Next 16.3, and Vercel restores
   * .next/cache between deploys. On 2026-10-19 a globals.css change shipped with
   * the previous deploy's CSS bundle: new markup, three-day-old stylesheet. The
   * same stale CSS survived a dev-server restart locally until the cache was
   * cleared. Builds take longer without it; they are also correct.
   */
  experimental: {
    turbopackFileSystemCacheForBuild: false,
    // Pages now throw on a Supabase error instead of caching an empty or 404 page
    // (2026-10-19), so one network blip during prerender would fail the deploy.
    // Retry each page a few times, with backoff, before giving up.
    staticGenerationRetryCount: 3,
  },
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
  /**
   * Security headers (2026-09-26). Until now only HSTS was served.
   *
   * Deliberately NOT a full Content-Security-Policy: the site loads GA, Vercel
   * Analytics, YouTube embeds and Supabase-hosted images, and a script-src
   * policy written without testing each would break one of them silently.
   * `frame-ancestors` is the one CSP directive taken here — it controls who may
   * embed *us*, not what we embed, so the YouTube iframes are unaffected — and
   * it is what stops /admin being framed for a clickjacking attempt.
   */
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Content-Security-Policy", value: "frame-ancestors 'self'" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
      {
        // The Dictumus banner files live in a dated folder that changes whenever the
        // design does (lib/dictumus.ts), so they can be cached for good.
        source: "/dictumus/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
    ];
  },
  async redirects() {
    return [
      // World Cup 2026 closure (2026-11-26): exact sources, one hop each (see PROOF above).
      // The hub and its legacy aliases.
      { source: "/world-cup-2026", destination: PROOF, permanent: true },
      { source: "/en/world-cup-2026", destination: PROOF, permanent: true },
      // Ahead of the /tr/:path* catch-all below, which would add a hop through the old hub.
      { source: "/tr/world-cup-2026", destination: PROOF, permanent: true },
      { source: "/tr/dunya-kupasi-2026", destination: PROOF, permanent: true },
      // #140's own old address.
      { source: "/world-cup-2026/proof-not-projection-2026-world-cup-breakout-young-players", destination: PROOF, permanent: true },
      // Young-talent pieces from the section (#129, #121, #94): Proof is their post-tournament verdict.
      { source: "/world-cup-2026/beyond-endrick-and-yamal-the-underrated-teenagers-changing-the-world-cup-narrati", destination: PROOF, permanent: true },
      { source: "/world-cup-2026/young-talents-world-cup-round-1", destination: PROOF, permanent: true },
      { source: "/world-cup-2026/hidden-gems-shine-tournament-world-cup-2026", destination: PROOF, permanent: true },
      // "Young players to watch at the World Cup" pieces filed outside the section (#48, #53, #64, #82, #106).
      { source: "/lists/world-cup-2026-scouting-top-10-debutants", destination: PROOF, permanent: true },
      { source: "/lists/world-cup-2026-scouting-top-10-prospects-analysis", destination: PROOF, permanent: true },
      { source: "/lists/world-cup-2026-top-10-wonderkids-tactical-analysis", destination: PROOF, permanent: true },
      { source: "/radar/rising-stars-scouts-world-cup", destination: PROOF, permanent: true },
      // Not the kept Argentina list's old address (/lists/argentina-under-20-players-2026-world-cup, below).
      { source: "/lists/under-20-players-2026-world-cup", destination: PROOF, permanent: true },
      // #116 → Argentina's Next Messi (#131): covers Nico Paz and Almada and the Argentina frame.
      { source: "/world-cup-2026/nico-paz-thiago-almada-world-cup-breakout", destination: "/radar/argentina-s-next-messi-the-real-contenders-to-inherit-the-no-10", permanent: true },
      // #81 → The Best Young Strikers (#145), whose Endrick section tells the same story.
      { source: "/world-cup-2026/endrick-brazil-elite-forwards", destination: "/lists/the-best-young-strikers-in-world-football-right-now", permanent: true },
      // EN prefix redirects — strip /en
      { source: "/en", destination: "/", permanent: true },
      { source: "/en/radar/:path*", destination: "/radar/:path*", permanent: true },
      { source: "/en/listeler/:path*", destination: "/lists/:path*", permanent: true },
      { source: "/en/lists/:path*", destination: "/lists/:path*", permanent: true },
      { source: "/en/taktik-lab/:path*", destination: "/tactics-lab/:path*", permanent: true },
      { source: "/en/tactics-lab/:path*", destination: "/tactics-lab/:path*", permanent: true },
      { source: "/en/arena/:path*", destination: "/arena/:path*", permanent: true },
      { source: "/en/transfers/:path*", destination: "/transfers/:path*", permanent: true },
      // Turkish root redirects
      { source: "/tr", destination: "/", permanent: true },
      { source: "/tr/:path*", destination: "/:path*", permanent: true },
      // Turkish hub paths. The old WC hub goes straight to PROOF, not through /world-cup-2026.
      { source: "/dunya-kupasi-2026", destination: PROOF, permanent: true },
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
      // Argentina pillar reslugged to match search intent (2026-07-20).
      // The old URL said "under-20 / 2026 world cup" while the demand is the
      // evergreen "argentina young players" — 3,136 impressions at 1.75% CTR.
      { source: "/lists/argentina-under-20-players-2026-world-cup", destination: "/lists/argentina-s-best-young-players-the-wonderkids-carrying-the-next-generation", permanent: true },
      // Straight to the Brazil pillar since 2026-11-25 (was the April list, now redirected below): no chain.
      { source: "/lists/brezilya-2026-genc-oyuncular", destination: "/lists/brazil-s-best-young-players-the-wonderkids-and-the-deep-cut-to-watch", permanent: true },
      { source: "/lists/arjantin-20-yas-alti-oyuncular-2026-liste", destination: "/lists/argentina-s-best-young-players-the-wonderkids-carrying-the-next-generation", permanent: true },
      { source: "/lists/premier-lig-goz-actirtan-15-genc-yetenek", destination: "/lists/premier-league-15-young-talents-to-watch", permanent: true },
      { source: "/lists/bundesliga-en-potansiyelii-10-gen-futbolcu", destination: "/lists/bundesliga-top-10-young-talents", permanent: true },
      { source: "/lists/u20-transfer-hareketi-buyuk-kuluplerle", destination: "/lists/u20-transfer-moves-top-clubs", permanent: true },
      { source: "/lists/turkiyenin-en-degerli-oyunculari-arda-kenan-yildiz", destination: "/lists/turkey-s-best-young-footballers-and-where-they-are-getting-their-minutes", permanent: true },
      // #39 (March 2026, thin) consolidated into #170 (2026-11-16): carries the
      // rising "most valuable turkish players" query signal to the new page.
      { source: "/lists/turkey-most-valuable-players-arda-kenan", destination: "/lists/turkey-s-best-young-footballers-and-where-they-are-getting-their-minutes", permanent: true },
      // #46 (April, World Cup framed) consolidated into the Brazil pillar #135 (2026-11-25).
      // Both aimed at "brazil young players"; the July pillar had sat unindexed since
      // publication, most likely read as a duplicate of the older page. Same move as
      // Turkey #39 → #170. #46 is set to "rejected" so it leaves the sitemap and hubs.
      { source: "/lists/brazil-2026-young-players-world-cup", destination: "/lists/brazil-s-best-young-players-the-wonderkids-and-the-deep-cut-to-watch", permanent: true },
      // The pillar's slug flipped between "deep-cuts" and "deep-cut" on publish day (2026-07-09);
      // the plural URL then answered 404.
      { source: "/lists/brazil-s-best-young-players-the-wonderkids-and-the-deep-cuts-to-watch", destination: "/lists/brazil-s-best-young-players-the-wonderkids-and-the-deep-cut-to-watch", permanent: true },
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
      { source: "/listeler/:path*", destination: "/lists/:path*", permanent: true },
      { source: "/listeler", destination: "/lists", permanent: true },
      { source: "/taktik-lab/:path*", destination: "/tactics-lab/:path*", permanent: true },
      { source: "/taktik-lab", destination: "/tactics-lab", permanent: true },
      // Renamed arena games (Turkish → English slugs)
      { source: "/arena/gelecek-yildizlar", destination: "/arena/future-stars", permanent: true },
      { source: "/arena/teknik-direktor", destination: "/arena/manager-arena", permanent: true },
    ];
  },
};

export default nextConfig;
