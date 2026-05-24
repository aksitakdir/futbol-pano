import {
  type ContentCategory,
  CONTENT_CATEGORIES,
  categoryArticlePath,
  categoryPublicPath,
  isContentCategory,
  CAT_LABEL,
} from "@/lib/category-config";

export type { ContentCategory };
export {
  CONTENT_CATEGORIES as CONTENT_DESTINATIONS,
  categoryArticlePath,
  categoryPublicPath,
  isContentCategory,
  CAT_LABEL,
};

export function newArticlePath(category?: ContentCategory): string {
  if (category) return `/admin/yeni?category=${category}`;
  return "/admin/yeni";
}
