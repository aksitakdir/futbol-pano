/**
 * Dictumus, the owner's score-prediction game (dictumus.com), promoted on Scout Gamer
 * from 17 Nov 2026. Its links, copy and the rule for where the end-of-article card
 * appears all live here, so every placement says the same thing.
 *
 * Checked against dictumus.com on 17 Nov 2026:
 * - 11 competitions, 8 languages; Android on Google Play, the App Store listing is
 *   still waiting for approval (never link Apple until it exists); the web app at
 *   app.dictumus.com runs in any browser, iPhone included.
 * - Every tournament is free until its league's second half (and for at least its
 *   first three match weeks); then one person in the group buys a one-off pack.
 *   No ads, nothing renews, and no money changes hands between players.
 *   So the copy says "no betting" and "no money between players", never just
 *   "free" or "no money": the second-half pack is real.
 * - Players must be 16 or over (dictumus.com/terms and /privacy); the app asks the age
 *   at sign-up. The parked card and page say 16+; the banners do not (owner, 18 Nov
 *   2026: no age or betting line on the banner or around it).
 *
 * Placements, first test (docs/dictumus/BANNER-SLOTS.md): an animated banner made in
 * the Dictumus project, in three slots: inside the article (phones), at its end (phones
 * and tablets) and at the top of the sidebar (desktop). The end-of-article card, the
 * /dictumus page, the header item and the footer line were built first and are parked
 * in git stash ("dictumus-placements"); the card helpers below stay for them.
 */

export const DICTUMUS_SITE_URL = "https://dictumus.com/";
/** From dictumus.com/terms: "You must be 16 or over." */
export const DICTUMUS_MIN_AGE = 16;
const WEB_APP_URL = "https://app.dictumus.com/";
const PLAY_STORE_URL = "https://play.google.com/store/apps/details?id=com.dictumus.app";

/** The banner slots; each is sent as utm_content. */
export type DictumusSlot = "in-content" | "article-end" | "sidebar";

/** Where on Scout Gamer a click came from; sent as utm_content. */
export type DictumusPlacement = "article-card" | "prediction-card" | "page" | DictumusSlot;

const SLOTS = new Set<string>(["in-content", "article-end", "sidebar"]);

function utm(placement: DictumusPlacement, term?: string): URLSearchParams {
  const params = new URLSearchParams({
    // Dictumus stores only utm_source, so a banner's slot rides in it too
    // (scoutgamer-in-content, scoutgamer-article-end, scoutgamer-sidebar; owner, 18 Nov 2026).
    utm_source: SLOTS.has(placement) ? `scoutgamer-${placement}` : "scoutgamer",
    utm_medium: "referral",
    utm_campaign: "scoutgamer_promo",
    utm_content: placement,
  });
  // The article the reader came from, so the test can tell which pieces send players.
  if (term) params.set("utm_term", term);
  return params;
}

/** The web app with UTM tags. The primary button: it works on every phone, iPhone included. */
export function dictumusWebAppUrl(placement: DictumusPlacement, term?: string): string {
  return `${WEB_APP_URL}?${utm(placement, term).toString()}`;
}

/** Google Play with the same tags as an install referrer, so installs are attributed too. */
export function dictumusPlayStoreUrl(placement: DictumusPlacement): string {
  const params = new URLSearchParams({ hl: "en", referrer: utm(placement).toString() });
  return `${PLAY_STORE_URL}&${params.toString()}`;
}

export const DICTUMUS_COMPETITIONS = [
  "Premier League",
  "Championship",
  "LaLiga",
  "Serie A",
  "Bundesliga",
  "Ligue 1",
  "Eredivisie",
  "Primeira Liga",
  "Süper Lig",
  "Brasileirão",
  "Champions League",
] as const;

/** Each language under its own name, with its BCP-47 code so screen readers switch voice. */
export const DICTUMUS_LANGUAGES = [
  { label: "English", lang: "en" },
  { label: "Deutsch", lang: "de" },
  { label: "Español", lang: "es" },
  { label: "Français", lang: "fr" },
  { label: "Italiano", lang: "it" },
  { label: "Português", lang: "pt" },
  { label: "Türkçe", lang: "tr" },
  { label: "العربية", lang: "ar", dir: "rtl" },
] as const;

/**
 * Pieces where we put our own call on record (the Golden Boy ballot and its receipt).
 * They get the "we called it" version of the card.
 */
const PREDICTION_SLUGS = new Set<string>([
  "golden-boy-2026-our-ballot-and-the-race-behind-cubarsi",
  "golden-boy-2026-cubarsi-wins-and-how-our-ballot-did",
]);

/**
 * No card on the World Cup 2026 archive: national-team football, which Dictumus does
 * not cover. Add a slug to NO_CARD_SLUGS to switch the card off for a single piece.
 */
const NO_CARD_CATEGORIES = new Set<string>(["wc-2026"]);
const NO_CARD_SLUGS = new Set<string>([]);

export type DictumusCardCopy = {
  placement: DictumusPlacement;
  title: string;
  body: string;
};

/** The card for an article, or null where it should not appear. */
export function dictumusCardFor(category: string | null | undefined, slug: string | null | undefined): DictumusCardCopy | null {
  if (!slug || (category && NO_CARD_CATEGORIES.has(category)) || NO_CARD_SLUGS.has(slug)) return null;
  if (PREDICTION_SLUGS.has(slug)) {
    return {
      placement: "prediction-card",
      title: "We put our picks on record. Now put yours.",
      body:
        "Dictumus is a score-prediction game built on the same idea as this piece: make the call before it happens and keep the proof. Your group calls every match, the picks open together before kick-off, and the table shows who read it best.",
    };
  }
  return {
    placement: "article-card",
    title: "You read the players. Now call the scores.",
    body:
      "Dictumus is a score-prediction game for you and your friends. Call every match, the picks open together before kick-off, and the table settles who reads football best. Eleven competitions, eight languages.",
  };
}


/**
 * The banner: one design for every slot, made in the Dictumus project
 * (tools/social/src/ScoutgamerBanner.tsx, approved 17 Nov 2026) and rendered here by
 * video/out/dictumus-banner-src/render.mjs. A still from frame 0, and a 5 s clip
 * that starts and ends on that same frame. Change the folder when the design changes,
 * so no browser keeps an old copy.
 */
const BANNER_DIR = "/dictumus/2026-11";
export const DICTUMUS_BANNER = {
  width: 960,
  height: 480,
  /**
   * One 960 px palette PNG for every screen: 13.7 KB, smaller than WebP or any
   * downscaled copy of this flat design (measured 18 Nov 2026).
   */
  still: `${BANNER_DIR}/dictumus-960.png`,
  video: `${BANNER_DIR}/dictumus-960.mp4`,
  /**
   * Every word the banner shows, in order. No age or betting line: the owner's call
   * (18 Nov 2026), since the app has no betting and asks the age at sign-up.
   */
  alt:
    "Dictumus: Call the scores. Say \u201cI told you so.\u201d 11 leagues, every match. Your friends, your tournament. " +
    "Start a tournament in your browser (opens in a new tab).",
  label: "From the makers of Scout Gamer",
} as const;

/** Whether an article shows the banners. Same exclusions as the card. */
export function dictumusBannersFor(category: string | null | undefined, slug: string | null | undefined): boolean {
  return Boolean(slug) && !(category && NO_CARD_CATEGORIES.has(category)) && !NO_CARD_SLUGS.has(slug as string);
}
