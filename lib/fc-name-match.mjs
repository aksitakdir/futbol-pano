/**
 * One rule for turning a WRITTEN player name into an fc_players (or player_cache) row.
 *
 * Shared by every card renderer, scripts/freeze-cards.mjs and scripts/preflight.mjs, so
 * the publish gate, the freezer and the page all agree on which card a name gets. Plain
 * .mjs with no dependencies (like lib/retired-content.mjs): the app imports it from
 * TypeScript, node scripts import it directly, and it is safe in client bundles. The
 * caller passes its own supabase-js client.
 *
 * Why: the old tiers matched SUBSTRINGS ("%Mora%" → "Morata", "%Roberto%" → "Sergi
 * Roberto") and took the highest overall, so a famous namesake won and the reader saw
 * another player's club, ratings and photo under the right name. Here a candidate is
 * accepted only when it is
 *   1. the same name (case-insensitive),
 *   2. the same name with accents, punctuation and "Jr."/"Júnior" ignored ("Julián Álvarez"
 *      = "Julián Alvarez", "Luka Modric" = "Luka Modrić", "Vinicius Jr." = "Vinícius Júnior"),
 *   (a one-word written name stops here: "Rayan" never becomes "Rayan Cherki")
 *   3. a card name that contains every written word as a whole word, ends in the written
 *      surname (or holds exactly the written words), and is the only such name
 *      ("Junior Kroupi" ⊆ "Eli Junior Kroupi"; never "Mohamed Ali" → "Mohamed-Ali Cho"),
 *   4. the only card where just the first name differs, as a spelling variant with the
 *      same initial, when no other row carries the surname ("Ayyub Bouaddi" → "Ayyoub
 *      Bouaddi"; never "Diego Costa" → "Diogo Costa", the famous namesake),
 *   5. the only one-word card carrying the surname, when no other row carries it at all
 *      ("Marc Cucurella" → "Cucurella").
 * Precision over recall: no match is a placeholder card; a wrong match is a wrong player.
 */

const SPECIAL = { ø: "o", ł: "l", đ: "d", ð: "d", ı: "i", ß: "ss", æ: "ae", œ: "oe", þ: "th" };

/** "Rúben  Dias" → "ruben dias"; "N'Golo Kanté" → "ngolo kante"; "Aït-Nouri" → "ait nouri". */
export function foldName(s) {
  return String(s ?? "")
    .normalize("NFD")
    .replace(/\p{M}+/gu, "")
    .toLowerCase()
    .replace(/[øłđðıßæœþ]/g, (c) => SPECIAL[/** @type {keyof typeof SPECIAL} */ (c)])
    .replace(/['’‘`´ʼ]/g, "")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim();
}

/** Suffix spellings that name the same word: "Vinicius Jr." is "Vinícius Júnior". */
const SUFFIX = { jr: "junior", jnr: "junior" };

/** Folded words, suffixes canonical. @param {unknown} s @returns {string[]} */
export const nameTokens = (s) =>
  foldName(s)
    .split(" ")
    .filter(Boolean)
    .map((t) => SUFFIX[/** @type {keyof typeof SUFFIX} */ (t)] ?? t);

/** @param {unknown} s */
const clean = (s) => String(s ?? "").normalize("NFC").replace(/\s+/g, " ").trim();
/** @param {unknown} s */
const rawKey = (s) => clean(s).toLowerCase();

const CONSONANT = /^[bcdfghj-np-tv-z0-9]$/i;

/** The written name as a literal LIKE pattern (% _ \ escaped). Request 1. */
export function escapeLike(s) {
  return clean(s).replace(/[\\%_]/g, (c) => "\\" + c);
}

/** Each folded letter and the accented letters that fold to it (foldName). */
const CLASS = {
  a: "aàáâãäåāăą", c: "cçćčĉċ", d: "dďđ", e: "eèéêëēėęě", g: "gğĝģ", i: "iìíîïīįı",
  l: "lłľĺļ", n: "nñńňņ", o: "oòóôõöøōő", r: "rřŕ", s: "sšśşș", t: "tťţț",
  u: "uùúûüūůűų", y: "yýÿ", z: "zžźż",
};
const APOS = "['’‘`´ʼ]?";

/**
 * The folded-name request (rule 2): an anchored POSIX regex for PostgREST `imatch` that
 * fetches every row whose folded name equals the written one's. Each letter accepts its
 * accented forms ("Modric" fetches "Modrić", "Calhanoglu" fetches "Çalhanoğlu"), an
 * apostrophe may sit between letters ("Ngolo" fetches "N'Golo"), any run of non-letters
 * separates words ("Ait Nouri" fetches "Aït-Nouri") and "junior" also reads "Jr."/"Jnr".
 * Tokens hold only letters and digits, so nothing in them is a regex operator. The JS
 * check decides. Null for an empty name.
 * @param {unknown} written
 */
export function foldedRegex(written) {
  const toks = nameTokens(written);
  if (!toks.length) return null;
  /** @param {string} t */
  const letters = (t) =>
    [...t]
      .map((ch) => {
        const cls = CLASS[/** @type {keyof typeof CLASS} */ (ch)];
        return cls ? `[${cls}${cls.toUpperCase()}]` : ch;
      })
      .join(APOS);
  /** @param {string} t */
  const tok = (t) => (t === "junior" ? `(${letters("junior")}|jr|jnr)` : letters(t));
  return `^[^[:alnum:]]*${toks.map(tok).join("[^[:alnum:]]+")}[^[:alnum:]]*$`;
}

/** ASCII letters and digits as written; accented letters and punctuation wild. */
function likeLoose(s) {
  return [...String(s ?? "")].map((c) => (/^[a-z0-9]$/i.test(c) ? c : "_")).join("");
}

/**
 * One written word as a candidate pattern: vowels wild too when 3+ consonants stay to
 * anchor it ("Kante" → "K_nt_" finds "Kanté"), otherwise only accents ("Oulaï" → "Oula_").
 */
function likeWord(word) {
  const chars = [...String(word ?? "")];
  return chars.filter((c) => CONSONANT.test(c)).length >= 3
    ? chars.map((c) => (CONSONANT.test(c) ? c : "_")).join("")
    : likeLoose(word);
}

/**
 * Candidate patterns for a 2+ word name; null for a one-word name.
 * - words:   one %word% per written word of 2+ letters, ANDed            → rule 3
 * - initial: starts with the first initial and contains the surname       → rule 4
 * - surname: or-filter, rows named just the surname or carrying it as
 *            their first or last word                                     → rule 5
 * Separate requests with their own limits, so a broad set cannot push a good row out.
 * @returns {{ words: string[], initial: string, surname: string } | null}
 */
export function candidatePatterns(written) {
  const words = clean(written).split(" ").filter(Boolean);
  if (words.length < 2) return null;
  const sur = likeWord(words[words.length - 1]);
  return {
    words: words.filter((w) => w.replace(/[^\p{L}\p{N}]/gu, "").length >= 2).map((w) => `%${likeWord(w)}%`),
    initial: `${likeLoose(words[0][0])}%${sur}%`,
    surname: `name.ilike."${sur}",name.ilike."${sur} %",name.ilike."% ${sur}"`,
  };
}

/** Edit distance, for short strings (first names). */
function lev(a, b) {
  const d = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
  for (let j = 1; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++)
    for (let j = 1; j <= b.length; j++)
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  return d[a.length][b.length];
}

/** "Ayyub"/"Ayyoub", "Vitor"/"Victor", "Alex"/"Alexander" — not "Arthur"/"Antonio". */
export function firstNameVariant(a, b) {
  if (!a || !b || a[0] !== b[0]) return false;
  if (a.length >= 3 && b.length >= 3 && (a.startsWith(b) || b.startsWith(a))) return true;
  return lev(a, b) <= (Math.min(a.length, b.length) >= 6 ? 2 : 1);
}

/** @typedef {"exact" | "folded" | "tokens" | "initial" | "mononym"} FcMatchTier */

/**
 * Rows whose name holds every written word as a whole word (rule 3).
 * @template {{ name: string }} R
 * @param {string[]} w  nameTokens of the written name
 * @param {R[]} rows
 */
function tokenHolders(w, rows) {
  return rows.filter((r) => {
    const c = new Set(nameTokens(r.name));
    return w.every((t) => c.has(t));
  });
}

/**
 * Decide among candidate rows. Pure: no I/O, so it also checks rows offline.
 * Within a rule the highest overall wins; `ambiguous` is true when 2+ rows with the
 * same name passed (namesakes: two "Samu" cards).
 * @template {{ name: string, overall?: number | null }} R
 * @param {string} written
 * @param {R[] | null | undefined} rows
 * @param {{ only?: FcMatchTier, truncated?: boolean, strictFirstName?: boolean, requireOverall?: boolean }} [opts]
 *   only: run just that rule (the lookup feeds each request to its own rule).
 *   truncated: the rows hit the request limit, so "the only one" is unproven → no match
 *     for rules 3-5.
 *   strictFirstName (default true): rule 4 also wants the first names to be spelling
 *     variants, not merely the same initial ("Arthur Dias" must not become "Antonio Dias").
 *   requireOverall (default true): skip rows without a rating and rank by overall; false
 *     for search results that carry none (BSD), kept in their given order.
 * @returns {{ row: R, tier: FcMatchTier, ambiguous: boolean } | null}
 */
export function pickFcMatch(written, rows, opts = {}) {
  const { only, truncated = false, strictFirstName = true, requireOverall = true } = opts;
  const w = nameTokens(written);
  if (!w.length) return null;
  const pool = (rows ?? []).filter((r) => r && r.name && (r.overall || !requireOverall));
  if (requireOverall) pool.sort((a, b) => (b.overall ?? 0) - (a.overall ?? 0));
  /** @param {R[]} list @param {FcMatchTier} tier */
  const hit = (list, tier) => (list.length ? { row: list[0], tier, ambiguous: list.length > 1 } : null);
  /** @param {FcMatchTier} s */
  const step = (s) => !only || only === s;

  if (step("exact")) {
    const k = rawKey(written);
    const exact = hit(pool.filter((r) => rawKey(r.name) === k), "exact");
    if (exact) return exact;
  }
  if (step("folded")) {
    const f = w.join(" ");
    const folded = hit(pool.filter((r) => nameTokens(r.name).join(" ") === f), "folded");
    if (folded) return folded;
  }
  // A one-word written name ("Rayan", "Rodri") matches only itself.
  if (w.length < 2) return null;

  const sur = w[w.length - 1];
  if (step("tokens") && !truncated) {
    // Every written word is a whole word of the card name ("Junior Kroupi" ⊆ "Eli Junior
    // Kroupi"). One way only: "Diego Andrés Ochoa" must not take the card of "Diego Ochoa",
    // another player. Two different card names that carry every written word are two
    // people: stop, with no match, rather than let a later rule pick one of them.
    const holders = tokenHolders(w, pool);
    const names = new Set(holders.map((r) => nameTokens(r.name).join(" ")));
    if (names.size > 1) return null;
    // The written surname must stay the card's surname, or the card holds exactly the
    // written words in another order ("Heung-min Son" = "Son Heung-min"): "Mohamed Ali"
    // is not "Mohamed-Ali Cho".
    const passing = holders.filter((r) => {
      const c = nameTokens(r.name);
      return c[c.length - 1] === sur || (c.length === w.length && w.every((t) => c.includes(t)));
    });
    if (passing.length) return hit(passing, "tokens");
  }

  if (step("initial") && !truncated && sur.length >= 3) {
    // Only the first name may differ: the card ends in the written surname, any middle
    // word is a whole non-first word, the first initial agrees, and exactly one row
    // passes. lookupFcByName also refuses it when another row carries the surname.
    const rest = w.slice(1);
    const init = pool.filter((r) => {
      const c = nameTokens(r.name);
      if (c.length < 2 || c[0][0] !== w[0][0] || c[c.length - 1] !== sur) return false;
      if (!rest.every((t) => c.slice(1).includes(t))) return false;
      return strictFirstName ? firstNameVariant(w[0], c[0]) : true;
    });
    if (init.length === 1) return { row: init[0], tier: "initial", ambiguous: false };
  }

  if (step("mononym") && !truncated && sur.length >= 4) {
    // EA files many players under one word ("Cucurella", "Pedri"). Take the one-word card
    // only when it is the ONLY row carrying the surname at all: no "Roberto X" (then the
    // word is a first name) and no "X Roberto" (then it is someone else's surname).
    const carriers = pool.filter((r) => {
      const c = nameTokens(r.name);
      return c[0] === sur || c[c.length - 1] === sur;
    });
    if (carriers.length === 1 && nameTokens(carriers[0].name).join(" ") === sur) {
      return { row: carriers[0], tier: "mononym", ambiguous: false };
    }
  }
  return null;
}

const LIMIT = 25;

/**
 * Look a written name up in fc_players (or another table with name + overall).
 * Request 1: the literal name. Only when it finds nothing: one parallel batch (the
 * folded regex; for a 2+ word name also the candidates for rules 3-5). Query errors
 * are thrown, so a failed request is never read as "no card".
 * @param {any} client  any supabase-js client (anon, server or script)
 * @param {string} written
 * @param {{ table?: string, cols?: string }} [opts]  cols must include name and overall
 * @returns {Promise<{ row: any, tier: FcMatchTier, ambiguous: boolean } | null>}
 */
export async function lookupFcByName(client, written, opts = {}) {
  const table = opts.table ?? "fc_players";
  const cols = opts.cols ?? "name,overall";
  const name = clean(written);
  if (!name) return null;
  /** @param {(q: any) => any} build @param {number} limit @returns {Promise<any[]>} */
  const run = async (build, limit) => {
    const { data, error } = await build(client.from(table).select(cols))
      .order("overall", { ascending: false })
      .limit(limit);
    if (error) throw error;
    return data ?? [];
  };

  const exact = pickFcMatch(name, await run((q) => q.ilike("name", escapeLike(name)), 10), { only: "exact" });
  if (exact) return exact;

  const rx = foldedRegex(name);
  const p = candidatePatterns(name);
  const none = Promise.resolve([]);
  const [f, a, b, c] = await Promise.all([
    rx ? run((q) => q.filter("name", "imatch", rx), 10) : none,
    // repeated filters on one column are ANDed
    p && p.words.length ? run((q) => p.words.reduce((qq, w) => qq.ilike("name", w), q), LIMIT + 1) : none,
    p ? run((q) => q.ilike("name", p.initial), LIMIT + 1) : none,
    p ? run((q) => q.or(p.surname), 6) : none,
  ]);
  const folded = pickFcMatch(name, f, { only: "folded" });
  if (folded) return folded;
  const tokens = pickFcMatch(name, a.slice(0, LIMIT), { only: "tokens", truncated: a.length > LIMIT });
  if (tokens) return tokens;
  // Two different card names carry every written word: two people, so no later rule picks one.
  const w = nameTokens(name);
  if (w.length > 1 && new Set(tokenHolders(w, a.filter((r) => r?.name && r.overall)).map((r) => nameTokens(r.name).join(" "))).size > 1) {
    return null;
  }
  // Rule 4 needs proof that the variant is the only row carrying the surname: the
  // surname request (c) holds the rows ending in it. Another carrier, or a full page of
  // them, means a namesake ("Diego Costa" next to "Diogo Costa"), so no match at all.
  const initial = pickFcMatch(name, b.slice(0, LIMIT), { only: "initial", truncated: b.length > LIMIT || c.length > 5 });
  if (initial) {
    const sur = w[w.length - 1];
    const key = nameTokens(initial.row.name).join(" ");
    const carriers = c.filter((r) => r?.name && nameTokens(r.name).slice(-1)[0] === sur);
    return carriers.length <= 1 && carriers.every((r) => nameTokens(r.name).join(" ") === key) ? initial : null;
  }
  return pickFcMatch(name, c.slice(0, 5), { only: "mononym", truncated: c.length > 5 });
}
