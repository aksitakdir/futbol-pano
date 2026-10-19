/**
 * Topic groups for the /lists section: Positions, Countries and leagues, EA FC,
 * Features, and an archive of pre-July pieces. Used by the footer index
 * (app/components/article-index-links.tsx) and the "Browse by topic" row on /lists.
 * Moved here from the footer component on 2026-10-19 so both read one rule.
 */

export type TopicItem = { href: string; label: string; title: string };
export type TopicInput = { href: string; title: string; createdAt: string };

/** Leagues are named without "the" in some titles ("in La Liga") and with it in others ("in the Premier League"). */
const LEAGUES = ["Premier League", "La Liga", "LaLiga", "Bundesliga", "Serie A", "Ligue 1", "Eredivisie", "Primeira Liga", "Liga MX", "MLS", "Saudi Pro League", "J1 League"];
/**
 * Pitch order for the Positions chips, back to front. A label takes the rank of its
 * LONGEST matching keyword, so "attacking midfielder" outranks plain "midfielder".
 * Unknown positions go last.
 */
const PITCH_RANK: [string, number][] = [
  ["goalkeeper", 0],
  ["centre-back", 1],
  ["center-back", 1],
  ["defender", 2],
  ["full-back", 3],
  ["wing-back", 3],
  ["defensive midfielder", 4],
  ["central midfielder", 5],
  ["midfielder", 5],
  ["attacking midfielder", 6],
  ["number 10", 6],
  ["playmaker", 6],
  ["winger", 7],
  ["forward", 8],
  ["striker", 8],
];
/**
 * Lists published before the July rebuild are archive, unless they are a country or
 * league list (those stay current as a topic, e.g. the Argentina piece from April).
 */
const ARCHIVE_BEFORE = "2026-07-01";
export const GROUP_ORDER = ["Positions", "Countries and leagues", "EA FC", "Features"];

export const shortTitle = (title: string) => title.split(/:| — |, and /)[0].trim();
export const pitchRank = (label: string) => {
  const l = label.toLowerCase();
  const hits = PITCH_RANK.filter(([k]) => l.includes(k)).sort((a, b) => b[0].length - a[0].length);
  return hits[0]?.[1] ?? 99;
};
export const isLeague = (label: string) => LEAGUES.includes(label);

/**
 * Sort each list into a group and give it a short label. Titles in the lists
 * section follow a few patterns ("The Best Young X in World Football…",
 * "Argentina's Best Young…", "The Best Young Players in La Liga…", "FC 27's…");
 * anything else is a feature, or, if it predates the July rebuild, archive.
 * Countries and leagues are read from the title, not a whitelist, so a new
 * country list lands in its group without a code change.
 */
export function classify(r: TopicInput): { group: string; item: TopicItem } {
  const title = r.title;
  const item = (text: string): TopicItem => ({ href: r.href, label: text, title });

  const country = title.match(/^(?:The )?([A-Z][A-Za-zÀ-ÿ .-]{1,24}?)(?:['’]s|['’]) Best Young (?:Players|Footballers)\b/)?.[1];
  if (country) return { group: "Countries and leagues", item: item(country) };

  const league = LEAGUES.find((l) => new RegExp(`Best Young (?:Players|Footballers) in (?:the )?${l}\\b`, "i").test(title));
  if (league) return { group: "Countries and leagues", item: item(league === "LaLiga" ? "La Liga" : league) };

  if (r.createdAt < ARCHIVE_BEFORE) return { group: "archive", item: item(title) };

  const edition = title.match(/\bFC (\d{2})\b/i)?.[1];
  if (edition || /\bEA FC\b/i.test(title)) {
    // Short labels only for the two series titles; anything else keeps its own words,
    // so a one-off FC piece cannot take a series chip and push the real list out.
    const text = /^FC \d{2}['’]s Biggest Rating Jumps/i.test(title)
      ? `FC ${edition} rating jumps`
      : /^The Best FC \d{2} Wonderkids/i.test(title)
        ? `FC ${edition} wonderkids`
        : shortTitle(title);
    return { group: "EA FC", item: item(text) };
  }

  const position = title.match(/^The Best Young (.+?) in World Football/i)?.[1];
  if (position) return { group: "Positions", item: item(position) };

  return { group: "Features", item: item(shortTitle(title)) };
}

/**
 * Group a section's pieces (newest first) into topic chips. Two pieces with the same
 * short label (an old and a new list on one country): the newest keeps the chip and
 * the older one goes to the archive.
 */
export function groupTopics(rows: TopicInput[]): { groups: { name: string; items: TopicItem[] }[]; archive: TopicItem[] } {
  const groups = new Map<string, TopicItem[]>();
  const archive: TopicItem[] = [];
  const seen = new Set<string>();
  for (const r of rows) {
    const { group, item } = classify(r);
    const key = `${group}:${item.label.toLowerCase()}`;
    if (group === "archive" || seen.has(key)) {
      archive.push({ ...item, label: shortTitle(item.title) });
      continue;
    }
    seen.add(key);
    groups.set(group, [...(groups.get(group) ?? []), item]);
  }
  const ordered = (g: string, items: TopicItem[]) => {
    if (g === "Positions") return [...items].sort((a, b) => pitchRank(a.label) - pitchRank(b.label) || a.label.localeCompare(b.label));
    if (g === "Countries and leagues") {
      return [...items].sort((a, b) => Number(isLeague(a.label)) - Number(isLeague(b.label)) || a.label.localeCompare(b.label));
    }
    return items; // EA FC and Features stay newest first
  };
  return {
    groups: GROUP_ORDER.filter((g) => groups.get(g)?.length).map((name) => ({ name, items: ordered(name, groups.get(name)!) })),
    archive,
  };
}
