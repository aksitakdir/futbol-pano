/**
 * Content whose public address was retired with the World Cup 2026 section
 * (closed 2026-11-26, docs/WC-SECTION-TRIAGE-2026-11-26.md).
 *
 * The rows are still `published` in the database until the bulk Reject (triage
 * step D), but their URLs no longer serve them: next.config.ts answers 308 to a
 * live page, proxy.ts answers 410. Every public listing (sitemap, feed, hubs,
 * /articles, "More in" blocks, the homepage, search) skips them, so no page on
 * the site links an address that redirects or is gone.
 *
 * Once the rows are rejected these filters match nothing, and they can go in the
 * dead-code cleanup (triage step E).
 *
 * Plain .mjs with no dependencies, so the app (TypeScript) and node scripts
 * (health-check, seo checks) share one list.
 */

/** The whole section: every row in this category lived under /world-cup-2026. */
export const RETIRED_CATEGORY = "wc-2026";

/**
 * World Cup pieces filed outside the section (lists and radar). 48, 53, 64, 82 and
 * 106 redirect to Proof, Not Projection; 83 and 102 answer 410.
 * @type {readonly number[]}
 */
export const RETIRED_IDS = Object.freeze([48, 53, 64, 82, 83, 102, 106]);

/** The same ids in PostgREST list form, for `.not("id", "in", RETIRED_IDS_FILTER)`. */
export const RETIRED_IDS_FILTER = `(${RETIRED_IDS.join(",")})`;
