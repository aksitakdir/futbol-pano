import { createClient } from "@/lib/supabase";
import { extractArticleHighlights } from "@/lib/content-highlight-tags";
import { articleExcerpt } from "@/lib/article-excerpt";
import { getCategoryImage } from "@/lib/category-images";
import { categoryArticlePath } from "@/lib/category-config";
import { COVER_STORY_SETTINGS_KEY, normalizeCoverStories, orderWithCoverPin } from "@/lib/cover-story";

/**
 * Server-side data for the section hubs (/lists, /radar, /tactics-lab, /articles).
 *
 * WHY (2026-10-19): the hubs were client components that fetched in a useEffect,
 * behind a <Suspense> with no fallback around useSearchParams. In production that
 * bailed the whole page out to client rendering: the raw HTML of /lists, /radar
 * and /articles had no <main>, no <h1> and no article card, and /articles was
 * empty. The pages now render on the server from this module, so the cards, the
 * headline and the intro are in the HTML Googlebot reads first.
 *
 * Only finished strings leave this file (excerpt, pills, dates): the article
 * bodies stay on the server instead of riding along in the page payload.
 */

export type HubCard = {
  id: string;
  href: string;
  title: string;
  /** No English title yet: shown as a draft marker on the card. */
  draft: boolean;
  category: string;
  excerpt: string;
  pills: string[];
  cover: string | null;
  /** Category artwork when there is no cover. */
  image: string;
  /** Dates in UTC, so the server's rendering never depends on the reader's zone. */
  dateShort: string;
  dateLong: string;
  createdAt: string;
};

type Row = {
  id: string;
  title: string;
  title_en: string | null;
  slug: string;
  category: string;
  content: string | null;
  content_en: string | null;
  created_at: string;
  cover_image: string | null;
};

const fmt = (iso: string, opts: Intl.DateTimeFormatOptions) =>
  new Date(iso).toLocaleDateString("en-US", { ...opts, timeZone: "UTC" });

function toCard(r: Row, excerptMax: number): HubCard {
  const body = r.content_en || r.content || "";
  const title = r.title_en || r.title;
  return {
    id: r.id,
    href: categoryArticlePath(r.category, r.slug),
    title,
    draft: !r.title_en,
    category: r.category,
    excerpt: articleExcerpt(body, { max: excerptMax }),
    pills: extractArticleHighlights(body, { max: 4, seed: r.slug, titleHint: title }),
    cover: r.cover_image?.trim() || null,
    image: r.cover_image?.trim() || getCategoryImage(r.category, r.slug),
    dateShort: fmt(r.created_at, { day: "numeric", month: "short" }),
    dateLong: fmt(r.created_at, { day: "numeric", month: "short", year: "numeric" }),
    createdAt: r.created_at,
  };
}

/**
 * Every published piece in a section (or across all of them), newest first, with the
 * radar cover-story pin applied where the hub honours it. Throws on a query error so
 * an error is never cached as an empty hub.
 */
export async function getHubCards(
  category: string | null,
  { limit, excerptMax = 200, pinScope }: { limit?: number; excerptMax?: number; pinScope?: "radar" } = {},
): Promise<HubCard[]> {
  const supabase = createClient();
  let query = supabase
    .from("contents")
    .select("id,title,title_en,slug,category,content,content_en,created_at,cover_image")
    .eq("status", "published")
    .order("created_at", { ascending: false });
  if (category) query = query.eq("category", category);
  if (limit) query = query.limit(limit);

  const [{ data, error }, pin] = await Promise.all([
    query,
    pinScope
      ? supabase.from("site_settings").select("value").eq("key", COVER_STORY_SETTINGS_KEY).maybeSingle()
      : Promise.resolve(null),
  ]);
  if (error) throw error;
  let rows = (data ?? []) as Row[];
  if (pinScope && pin && !pin.error) rows = orderWithCoverPin(rows, normalizeCoverStories(pin.data?.value)[pinScope]);
  return rows.map((r) => toCard(r, excerptMax));
}
