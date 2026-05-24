import { categoryArticlePath } from "@/lib/category-config";

/** Redirect to the article's canonical URL when opened on the wrong section route. */
export function redirectToCanonicalArticle(category: string, slug: string, expectedCategory: string): boolean {
  if (category === expectedCategory) return false;
  if (typeof window === "undefined") return true;
  window.location.replace(categoryArticlePath(category, slug));
  return true;
}
