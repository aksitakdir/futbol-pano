/** Shared shape for category index + hub editorial feeds */
export type EditorialArticle = {
  id: string;
  title: string;
  title_en?: string | null;
  slug: string;
  category: string;
  content: string;
  content_en?: string | null;
  created_at: string;
  cover_image?: string | null;
};

export function editorialBody(article: EditorialArticle, locale: "tr" | "en"): string {
  if (locale === "en" && article.content_en?.trim()) return article.content_en;
  return article.content;
}

export function editorialTitle(article: EditorialArticle, locale: "tr" | "en"): string {
  if (locale === "en" && article.title_en?.trim()) return article.title_en.trim();
  return article.title;
}
