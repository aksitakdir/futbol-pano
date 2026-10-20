import { createClient } from "@/lib/supabase";
import { categoryArticlePath, categoryPublicPath, CAT_LABEL } from "@/lib/category-config";
import { classify } from "@/lib/list-topics";

/**
 * "More in <section>": the links at the end of every article, chosen on the server.
 *
 * WHY (2026-10-19): the related blocks on article pages ("Related", "Continue
 * reading", "More lists") were filled by a client-side query, so none of their
 * links were in the HTML Googlebot reads first. A piece's only server-rendered
 * links to its siblings came from the section index in the footer. This module
 * picks them on the server, so the article body carries them.
 *
 * The rule is fixed, not random, so every page is stable between renders:
 *   1. topic: up to `limit - 2` pieces on the same subject — for lists, the same
 *      topic group (a position list next to other position lists, a country list
 *      next to other countries); elsewhere, pieces about the same player;
 *   2. neighbours: the pieces either side of it in the section's date order, always.
 *      Every piece links both neighbours, so every piece is linked by them;
 *   3. fill: the newest pieces in the section.
 * Publishing refreshes every article in the section (lib/revalidate-content.ts),
 * so neighbours and "newest" stay current without a deploy.
 */

export type RelatedItem = { id: string; href: string; title: string; dateShort: string };
export type RelatedLinks = { label: string; hubHref: string; items: RelatedItem[] };

type Row = {
  id: string | number;
  slug: string;
  title: string;
  title_en: string | null;
  category: string;
  created_at: string;
  player_name: string | null;
};

const fmt = (iso: string) => new Date(iso).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
const titleOf = (r: Pick<Row, "title" | "title_en">) => (r.title_en?.trim() || r.title).trim();

function topicGroup(r: Pick<Row, "title" | "title_en" | "created_at" | "slug">): string {
  return classify({ href: r.slug, title: titleOf(r), createdAt: r.created_at }).group;
}

export async function getMoreInSection(
  article: Pick<Row, "id" | "slug" | "title" | "title_en" | "category" | "created_at" | "player_name">,
  limit = 6,
): Promise<RelatedLinks> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("contents")
    .select("id,slug,title,title_en,category,created_at,player_name")
    .eq("status", "published")
    .eq("category", article.category)
    .order("created_at", { ascending: false });
  // Throw rather than render an empty block: an error is never cached as a page
  // whose siblings vanished (see app/components/article-index-links.tsx).
  if (error) throw error;

  const self = String(article.id);
  const pool = ((data ?? []) as Row[]).filter((r) => String(r.id) !== self);
  const picked: Row[] = [];
  const take = (r: Row | undefined) => {
    if (r && picked.length < limit && !picked.some((p) => p.id === r.id)) picked.push(r);
  };

  // 1. Topic, capped so both neighbours always fit.
  const player = article.player_name?.trim().toLowerCase();
  const group = article.category === "lists" ? topicGroup(article) : null;
  const onTopic = pool.filter((r) =>
    group ? group !== "archive" && topicGroup(r) === group : !!player && r.player_name?.trim().toLowerCase() === player,
  );
  for (const r of onTopic.slice(0, Math.max(0, limit - 2))) take(r);

  // 2. Neighbours: the pieces either side of this one in a single chain, newest first,
  // with the id breaking ties. Comparing dates alone failed for pieces imported with
  // the same timestamp: every one of them got the same "older" neighbour, and three
  // tactics-lab archetypes were linked from no sibling at all (seo-check --full).
  const byChain = (a: Row, b: Row) =>
    b.created_at.localeCompare(a.created_at) || String(b.id).localeCompare(String(a.id), undefined, { numeric: true });
  const chain = [...pool, { ...article, title_en: article.title_en ?? null, player_name: article.player_name ?? null } as Row].sort(byChain);
  const at = chain.findIndex((r) => String(r.id) === self);
  take(chain[at - 1]);
  take(chain[at + 1]);

  // 3. Fill with the newest.
  for (const r of pool) take(r);

  return {
    label: CAT_LABEL[article.category] ?? article.category,
    hubHref: categoryPublicPath(article.category),
    items: picked.map((r) => ({ id: String(r.id), href: categoryArticlePath(r.category, r.slug), title: titleOf(r), dateShort: fmt(r.created_at) })),
  };
}
