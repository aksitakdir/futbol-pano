import { revalidatePath } from "next/cache";
import { categoryArticlePath, categoryPublicPath } from "@/lib/category-config";

export type ContentRef = {
  category?: string | null;
  slug?: string | null;
  hub_tags?: string[] | null;
};

/** Hubs that list articles by tag as well as by category. */
const HUB_BY_TAG: Record<string, string> = { transfer: "/transfers", "wc-2026": "/world-cup-2026" };

/**
 * Refresh every page whose HTML lists the given articles: the homepage, /articles,
 * each article's section hub (and tag hubs), the article itself, and every other
 * article in its section, which carries the section index in its footer.
 *
 * WHY ONE HELPER: until 19 October 2026 the admin list's Publish, Unpublish and
 * Delete buttons revalidated nothing, createContent revalidated nothing, and
 * updateContent refreshed only the article and "/". The section hubs are
 * prerendered without a revalidate window, so a piece published from the admin
 * did not reach their server-rendered index until the next deploy. Every write
 * path now calls this, so the list of pages lives in one place.
 *
 * Checked on production the same day: revalidatePath("/lists") answered
 * REVALIDATED on the next request and the page's age reset.
 */
export function revalidateContent(refs: ContentRef[]): string[] {
  const done = new Set<string>();
  const page = (path: string, type?: "page") => {
    const key = type ? `${path} (${type})` : path;
    if (done.has(key)) return;
    done.add(key);
    revalidatePath(path, type);
  };

  page("/");
  page("/articles");
  for (const r of refs) {
    for (const tag of r.hub_tags ?? []) if (HUB_BY_TAG[tag]) page(HUB_BY_TAG[tag]);
    if (!r.category) continue;
    const hub = categoryPublicPath(r.category);
    page(hub);
    if (r.slug) page(categoryArticlePath(r.category, r.slug));
    page(`${hub}/[slug]`, "page");
  }
  return [...done];
}

/**
 * When the rows a write touched cannot be read, refresh every page rather than
 * none: over-invalidating costs some regeneration, under-invalidating brings back
 * the stale hubs this file exists to prevent.
 */
export function revalidateEverything(): string[] {
  revalidatePath("/", "layout");
  return ["/ (layout)"];
}
