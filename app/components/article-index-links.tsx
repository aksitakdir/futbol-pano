import Link from "next/link";
import { createClient } from "@/lib/supabase";

/**
 * Server-rendered archive index for a category.
 *
 * WHY THIS EXISTS: the category pages (/radar, /lists, /tactics-lab) and the hub
 * pages render their article lists in client components that fetch from Supabase
 * in a useEffect. That means the HTML Googlebot receives on its first pass
 * contains ZERO links to any article — so new pieces got no internal links, no
 * crawl priority, and sat at 0 impressions for weeks (diagnosed 2026-07-22).
 *
 * This component fetches the same list on the SERVER so the links are present in
 * the raw HTML. It is genuine navigation that also happens to fix the crawl path,
 * so it must stay visible: never display:none or off-screen (hidden link blocks
 * are discounted and look like cloaking).
 *
 * HOW IT LOOKS (2026-10-19): it used to print every title, long and short, old and
 * new, as one wall of up to 60 links under every article — the owner's complaint,
 * and a fair one: an October position list sat at the same weight as a March
 * World Cup piece. Now:
 *   - mode "topics" (the /lists section): short chips grouped by Positions,
 *     Countries and leagues, EA FC, and Features, so a reader finds a list at a
 *     glance;
 *   - mode "latest" (everything else): the newest few as a plain list;
 *   - in both, older pieces sit in a "From the archive" <details> disclosure. That
 *     is an accordion a reader opens with one click, not hidden content: the links
 *     are in the raw HTML and followed like any other.
 * `ArticleIndexColumns` is the homepage version: three sections side by side.
 * Both are drawn inside the site footer, above its columns: wrap the route in
 * <FooterOwner index={…}> rather than rendering them after the page.
 */

type Props = {
  /** contents.category value, e.g. "radar" */
  category: string;
  /** URL prefix for article links, e.g. "/radar" */
  basePath: string;
  heading: string;
  limit?: number;
  /** "topics" groups the lists section by subject; "latest" shows the newest first. */
  mode?: "topics" | "latest";
  /** How many links stay visible in "latest" mode before the archive disclosure. */
  show?: number;
};

type Row = { id: number; title: string; title_en: string | null; slug: string; created_at: string };
type Item = { href: string; label: string; title: string };

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
const GROUP_ORDER = ["Positions", "Countries and leagues", "EA FC", "Features"];

const titleOf = (r: Row) => (r.title_en?.trim() || r.title).trim();
const shortTitle = (title: string) => title.split(/:| — |, and /)[0].trim();
const pitchRank = (label: string) => {
  const l = label.toLowerCase();
  const hits = PITCH_RANK.filter(([k]) => l.includes(k)).sort((a, b) => b[0].length - a[0].length);
  return hits[0]?.[1] ?? 99;
};
const isLeague = (label: string) => LEAGUES.includes(label);

/**
 * Sort each list into a group and give it a short label. Titles in the lists
 * section follow a few patterns ("The Best Young X in World Football…",
 * "Argentina's Best Young…", "The Best Young Players in La Liga…", "FC 27's…");
 * anything else is a feature, or, if it predates the July rebuild, archive.
 * Countries and leagues are read from the title, not a whitelist, so a new
 * country list lands in its group without a code change.
 */
function classify(r: Row, basePath: string): { group: string; item: Item } {
  const title = titleOf(r);
  const item = (text: string): Item => ({ href: `${basePath}/${r.slug}`, label: text, title });

  const country = title.match(/^(?:The )?([A-Z][A-Za-zÀ-ÿ .-]{1,24}?)(?:['’]s|['’]) Best Young (?:Players|Footballers)\b/)?.[1];
  if (country) return { group: "Countries and leagues", item: item(country) };

  const league = LEAGUES.find((l) => new RegExp(`Best Young (?:Players|Footballers) in (?:the )?${l}\\b`, "i").test(title));
  if (league) return { group: "Countries and leagues", item: item(league === "LaLiga" ? "La Liga" : league) };

  if (r.created_at < ARCHIVE_BEFORE) return { group: "archive", item: item(title) };

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

/** A grid track that never outgrows a narrow phone: min(Npx, 100%). */
const tracks = (px: number) => `repeat(auto-fill, minmax(min(${px}px, 100%), 1fr))`;

async function fetchRows(category: string, limit: number): Promise<Row[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from("contents")
    .select("id,title,title_en,slug,created_at")
    .eq("status", "published")
    .eq("category", category)
    .order("created_at", { ascending: false })
    .limit(limit);
  return (data ?? []) as Row[];
}

/** Visible label is the headline before its colon ("Max Dowman", "Nico Paz"); the full title stays in `title`. */
const toItem = (r: Row, basePath: string): Item => ({ href: `${basePath}/${r.slug}`, label: shortTitle(titleOf(r)), title: titleOf(r) });

/*
 * Styling lives in globals.css (.sg-index*), so it reads like the footer it sits
 * in: eyebrow headings, small muted links, one line per link. Links show the
 * headline before its colon, and anything still too long is cut with an
 * ellipsis on screen only; the full title is the link's title attribute.
 */

/** Drawn inside the site footer, above its columns, on the footer's own grid (see FooterOwner). */
function Shell({ label, heading, children }: { label: string; heading?: string; children: React.ReactNode }) {
  return (
    <div className="sg-site-container">
      <nav aria-label={label} className="sg-index">
        {heading && <h2 className="eyebrow sg-index-heading">{heading}</h2>}
        {children}
      </nav>
    </div>
  );
}

function LinkList({ items, columns }: { items: Item[]; columns?: boolean }) {
  return (
    <ul className="sg-index-list" style={{ gridTemplateColumns: columns ? tracks(240) : "minmax(0, 1fr)" }}>
      {items.map((it) => (
        <li key={it.href}>
          <Link href={it.href} title={it.title} className="sg-index-link">
            {it.label}
          </Link>
        </li>
      ))}
    </ul>
  );
}

function Archive({ items, columns, label = "From the archive" }: { items: Item[]; columns?: boolean; label?: string }) {
  if (items.length === 0) return null;
  return (
    <details className="sg-index-archive">
      <summary>
        {label} ({items.length})
      </summary>
      <LinkList items={items} columns={columns} />
    </details>
  );
}

export default async function ArticleIndexLinks({ category, basePath, heading, limit = 60, mode = "latest", show = 8 }: Props) {
  const rows = await fetchRows(category, limit);
  if (rows.length === 0) return null;

  if (mode === "latest") {
    const items = rows.map((r) => toItem(r, basePath));
    return (
      <Shell label={heading} heading={heading}>
        <LinkList items={items.slice(0, show)} columns />
        <Archive items={items.slice(show)} columns />
      </Shell>
    );
  }

  const groups = new Map<string, Item[]>();
  const archive: Item[] = [];
  const seen = new Set<string>();
  for (const r of rows) {
    const { group, item } = classify(r, basePath);
    // Two pieces with the same short label (an old and a new list on one country):
    // rows arrive newest first, so the newest keeps the chip and the older goes to
    // the archive.
    const key = `${group}:${item.label.toLowerCase()}`;
    if (group === "archive" || seen.has(key)) {
      archive.push({ ...item, label: shortTitle(item.title) });
      continue;
    }
    seen.add(key);
    groups.set(group, [...(groups.get(group) ?? []), item]);
  }

  const ordered = (g: string, items: Item[]) => {
    if (g === "Positions") return [...items].sort((a, b) => pitchRank(a.label) - pitchRank(b.label) || a.label.localeCompare(b.label));
    if (g === "Countries and leagues") {
      return [...items].sort((a, b) => Number(isLeague(a.label)) - Number(isLeague(b.label)) || a.label.localeCompare(b.label));
    }
    return items; // EA FC and Features stay newest first
  };

  return (
    <Shell label={heading} heading={heading}>
      <div className="sg-index-grid" style={{ gridTemplateColumns: tracks(300) }}>
        {GROUP_ORDER.filter((g) => groups.get(g)?.length).map((g) => (
          <div key={g} style={{ minWidth: 0 }}>
            <h3 className="sg-index-subheading">{g}</h3>
            <ul className="sg-index-chips">
              {ordered(g, groups.get(g) ?? []).map((it) => (
                <li key={it.href}>
                  <Link href={it.href} title={it.title} className="sg-index-chip">
                    {it.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <Archive items={archive} columns />
    </Shell>
  );
}

type Column = { category: string; basePath: string; heading: string };

/**
 * The homepage version: one block, a column per section, the newest few in each
 * plus a link to the section and the rest in a per-column disclosure. The column
 * headings are the only headings, like the footer columns below them.
 */
export async function ArticleIndexColumns({ columns, limit = 15, show = 5 }: { columns: Column[]; limit?: number; show?: number }) {
  const all = await Promise.all(columns.map((c) => fetchRows(c.category, limit)));
  const filled = columns.map((c, i) => ({ ...c, items: all[i].map((r) => toItem(r, c.basePath)) })).filter((c) => c.items.length);
  if (filled.length === 0) return null;

  return (
    <Shell label="Latest from Scout Gamer">
      <div className="sg-index-grid" style={{ gridTemplateColumns: `repeat(auto-fit, minmax(min(240px, 100%), 1fr))` }}>
        {filled.map((c) => (
          <section key={c.category} aria-label={c.heading} style={{ minWidth: 0 }}>
            <h2 className="eyebrow sg-index-heading">
              <Link href={c.basePath} className="u-link">
                {c.heading} →
              </Link>
            </h2>
            <LinkList items={c.items.slice(0, show)} />
            <Archive items={c.items.slice(show)} label="More" />
          </section>
        ))}
      </div>
    </Shell>
  );
}
