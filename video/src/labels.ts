/** Small text helpers the vertical and wide templates share. */

/** "scoutgamer.com/lists/…" → "LISTS", the section a reader will land in. */
export const section = (url: string) => (url.split("/")[1] ?? "").replace(/-/g, " ").toUpperCase();

/** A detail row's label, short enough for a mono caption. */
export const shortLabel = (l: string) => (/world cup/i.test(l) ? "WORLD CUP" : /20\d\d-\d\d/.test(l) ? (l.match(/20\d\d-\d\d/)![0] + " SEASON") : l.toUpperCase());

/** "On Monday 26 October 2026, at the … London Palladium, …" → its date and venue. */
export const whenParts = (when = "") => ({
  date: when.match(/\d{1,2} [A-Z][a-z]+/)?.[0],
  venue: when.match(/at the ([A-Z][\w' ]+?(?: Palladium| Stadium| Theatre| Arena)?)(?:,|\.|$)/)?.[1],
});

/** The card's caption: the game's order, not ours, said on every card. */
export const rankCaption = (rank: string, edition: string, jump: boolean) => {
  const n = rank.replace("=", "");
  const tied = rank.startsWith("=") ? " (TIED)" : "";
  if (jump) return n === "1" ? "THE BIGGEST JUMP" : `JUMP RANK ${n}${tied}`;
  return n === "1" ? `FC ${edition}'S No. 1` : `FC ${edition} RANK ${n}${tied}`;
};
