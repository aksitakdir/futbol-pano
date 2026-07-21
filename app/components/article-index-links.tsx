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
 * the raw HTML. It renders a real, visible archive list — deliberately NOT hidden
 * (hidden link blocks are discounted and look like cloaking); it is genuine
 * navigation that also happens to fix the crawl path.
 */

type Props = {
  /** contents.category value, e.g. "radar" */
  category: string;
  /** URL prefix for article links, e.g. "/radar" */
  basePath: string;
  heading: string;
  limit?: number;
};

type Row = { id: number; title: string; title_en: string | null; slug: string; created_at: string };

export default async function ArticleIndexLinks({ category, basePath, heading, limit = 60 }: Props) {
  const supabase = createClient();
  const { data } = await supabase
    .from("contents")
    .select("id,title,title_en,slug,created_at")
    .eq("status", "published")
    .eq("category", category)
    .order("created_at", { ascending: false })
    .limit(limit);

  const rows = (data ?? []) as Row[];
  if (rows.length === 0) return null;

  return (
    <nav
      aria-label={heading}
      style={{
        borderTop: "1px solid var(--sg-border)",
        background: "var(--sg-surface-low)",
        padding: "48px 24px 64px",
      }}
    >
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <h2
          className="mono"
          style={{
            fontSize: 11,
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            color: "var(--sg-text-muted)",
            margin: "0 0 20px",
          }}
        >
          {heading}
        </h2>
        <ul
          style={{
            listStyle: "none",
            margin: 0,
            padding: 0,
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: "10px 32px",
          }}
        >
          {rows.map((r) => (
            <li key={r.id} style={{ lineHeight: 1.45 }}>
              <Link
                href={`${basePath}/${r.slug}`}
                style={{
                  fontSize: 14,
                  color: "var(--sg-text-secondary)",
                  textDecoration: "none",
                }}
              >
                {r.title_en?.trim() || r.title}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
