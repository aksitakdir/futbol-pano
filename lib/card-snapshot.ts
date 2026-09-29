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
 *   tier found it ("exact" | "two" | "last");
 * - `null` — fc_players had no match when frozen. Renderers skip fc_players and
 *   fall through to their other sources, so a player the old game did not
 *   carry does not suddenly gain a card his article says he does not have.
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

export type FrozenCard = { tier: "exact" | "two" | "last"; row: FrozenFcRow } | null;

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
 * `maxTier` exists because renderers resolve differently: some try exact →
 * first-two-words → last name, some stop after first-two-words. A card frozen
 * through a tier a renderer never tries counts as "no card" for that renderer,
 * so freezing changes nothing it displays.
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
