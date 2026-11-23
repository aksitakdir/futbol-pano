/**
 * The two dates of an article, one source for every surface that shows them:
 * article:published_time / article:modified_time (lib/article-metadata.ts), JSON-LD
 * datePublished / dateModified (lib/article-jsonld.ts), the sitemap <lastmod>
 * (app/sitemap.ts) and the visible "Published" / "Updated" line on the page.
 *
 * Google reads all of these and wants them to agree. It also trusts a site's
 * lastmod all or nothing, so the modified date only moves on a real change:
 * content_updated_at is set explicitly by the writers, never by a trigger (see
 * supabase/migrations/contents_content_updated_at.sql). Added 2026-11-24.
 */

export type ArticleDateRow = {
  created_at: string;
  /** Absent until the migration has run, null for articles never updated. */
  content_updated_at?: string | null;
};

export type ArticleDates = {
  /** ISO string, the go-live moment. */
  published: string;
  /** ISO string; equals `published` until the article has had a real update. */
  modified: string;
  /** True when the update falls on a later calendar day (UTC) than publication: show "Updated". */
  showUpdated: boolean;
};

const utcDay = (iso: string) => new Date(iso).toISOString().slice(0, 10);

export function articleDates(row: ArticleDateRow): ArticleDates {
  const published = row.created_at;
  const updated = row.content_updated_at;
  const later = !!updated && !Number.isNaN(Date.parse(updated)) && Date.parse(updated) > Date.parse(published);
  const modified = later ? (updated as string) : published;
  return { published, modified, showUpdated: later && utcDay(modified) !== utcDay(published) };
}

/**
 * "23 November 2026", always in UTC. The article pages are client components, so
 * without a fixed time zone the server and the reader's browser could render
 * different days around midnight, and the visible date could disagree with the
 * JSON-LD it has to match.
 */
export function formatArticleDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
}
