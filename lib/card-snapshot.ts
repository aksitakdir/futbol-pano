/**
 * Frozen player cards.
 *
 * An article's text and its player cards were written against one version of
 * the game. The cards used to be a live fc_players lookup, so every dataset
 * refresh silently changed them: the text said 68, the card said 74. A
 * snapshot records what each card showed on the day it was frozen, and the
 * renderers use it before any live lookup.
 *
 * `scripts/freeze-cards.mjs` writes `data/card-snapshots.json`. Run it BEFORE
 * importing a new fc_players dataset; it only adds articles it has not seen,
 * so earlier freezes are never overwritten.
 *
 * Per name, an entry is either:
 * - `{ tier, row }` — the fc_players row the card resolved to, and which match
 *   tier found it. Freezes since 2026-11-28 use lib/fc-name-match.mjs and record
 *   its rules ("exact" | "folded" | "tokens" | "initial" | "mononym", plus
 *   `ambiguous` when namesakes shared the name). Older freezes recorded the
 *   substring tiers ("exact" | "two" | "last"); their wrong-person rows (16:
 *   8 in published articles, 8 in rejected ones) were set to null by hand on
 *   2026-11-28 (see the matcher's header for why). The two legacy fuzzy rows
 *   left are the right person (Junior Kroupi, Christ Inao Oulaï).
 * - `null` — fc_players had no match when frozen (or only another person's).
 *   Renderers skip fc_players, so a player the old game did not carry does not
 *   suddenly gain a card his article says he does not have. They still show a
 *   player_cache row that already exists, but never ask /api/players/resolve to
 *   build a new one from BSD match stats.
 * - missing — the article was not frozen; render live, as before.
 */

export type FrozenFcRow = {
  name: string;
  overall: number;
  pace: number;
  shooting: number;
  passing: number;
  dribbling: number;
  defending: number;
  physical: number;
  position?: string | null;
  club?: string | null;
  league?: string | null;
  age?: number | null;
  photo_url?: string | null;
};

/** Legacy substring tiers ("two", "last") and the lib/fc-name-match.mjs rules. */
export type FrozenTier = "exact" | "two" | "last" | "folded" | "tokens" | "initial" | "mononym";

export type FrozenCard = { tier: FrozenTier; row: FrozenFcRow; ambiguous?: boolean } | null;

/** name key → frozen card, for one article */
export type ArticleCardSnapshot = Record<string, FrozenCard>;

export function cardKey(name: string): string {
  return name.replace(/\s+/g, " ").trim().toLowerCase();
}

/**
 * Look a name up in an article's snapshot.
 * - `undefined` → not frozen, do the live lookup
 * - `null`      → frozen as "no fc_players card"
 * - row         → use it
 *
 * `maxTier` exists because renderers used to resolve differently: some tried
 * exact → first-two-words → last name, some stopped after first-two-words. A
 * card frozen through a tier a renderer never tried counts as "no card" for
 * that renderer, so freezing changes nothing it displayed. It only concerns the
 * legacy "last" tier: every renderer now resolves through lib/fc-name-match.mjs,
 * so a card frozen by one of its rules is one they all would have found.
 */
export function frozenRow(
  snapshot: ArticleCardSnapshot | null | undefined,
  name: string,
  maxTier: "two" | "last" = "last",
): FrozenFcRow | null | undefined {
  if (!snapshot) return undefined;
  const key = cardKey(name);
  if (!(key in snapshot)) return undefined;
  const entry = snapshot[key];
  if (!entry) return null;
  if (maxTier === "two" && entry.tier === "last") return null;
  return entry.row;
}
