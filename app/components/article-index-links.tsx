import Link from "next/link";
import { createClient } from "@/lib/supabase";
import { groupTopics, shortTitle } from "@/lib/list-topics";

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
 * It is drawn inside the site footer, above its columns: wrap the route in
 * <FooterOwner index={…}> rather than rendering it after the page. Since P3
 * (2026-10-20) only the Transfers and World Cup hubs still use it.
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

const titleOf = (r: Row) => (r.title_en?.trim() || r.title).trim();

/** A grid track that never outgrows a narrow phone: min(Npx, 100%). */
const tracks = (px: number) => `repeat(auto-fill, minmax(min(${px}px, 100%), 1fr))`;

async function fetchRows(category: string, limit: number): Promise<Row[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("contents")
    .select("id,title,title_en,slug,created_at")
    .eq("status", "published")
    .eq("category", category)
    .order("created_at", { ascending: false })
    .limit(limit);
  // Throw rather than render an empty index: an error is never cached as a crawl path
  // with no links in it (a timed regeneration keeps the last good page; a request
  // right after an on-demand revalidation gets an uncached error).
  if (error) throw error;
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

  const { groups, archive } = groupTopics(
    rows.map((r) => ({ href: `${basePath}/${r.slug}`, title: titleOf(r), createdAt: r.created_at })),
  );

  return (
    <Shell label={heading} heading={heading}>
      <div className="sg-index-grid" style={{ gridTemplateColumns: tracks(300) }}>
        {groups.map(({ name: g, items }) => (
          <div key={g} style={{ minWidth: 0 }}>
            <h3 className="sg-index-subheading">{g}</h3>
            <ul className="sg-index-chips">
              {items.map((it) => (
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
