import type { ContentCategory } from "@/lib/article-destination";

export const COVER_STORY_SETTINGS_KEY = "cover_stories";

export type CoverStoryScope = "homepage" | ContentCategory;

export type CoverStoriesMap = Partial<Record<CoverStoryScope, string>>;

export const COVER_STORY_SCOPE_LABELS: Record<CoverStoryScope, string> = {
  homepage: "Homepage hero — first article slide",
  listeler: "Lists index — cover story",
  radar: "Radar index — cover story",
  "taktik-lab": "Tactics Lab index — cover story",
  "wc-2026": "World Cup 2026 hub — cover story",
  transfer: "Transfers hub — cover story",
};

export function normalizeCoverStories(raw: unknown): CoverStoriesMap {
  if (!raw || typeof raw !== "object") return {};
  const out: CoverStoriesMap = {};
  for (const [key, value] of Object.entries(raw as Record<string, unknown>)) {
    if (typeof value === "string" && value.trim()) {
      out[key as CoverStoryScope] = value.trim();
    }
  }
  return out;
}

export function categoryToCoverScope(category: string): CoverStoryScope | null {
  if (
    category === "listeler" ||
    category === "radar" ||
    category === "taktik-lab" ||
    category === "wc-2026" ||
    category === "transfer"
  ) {
    return category;
  }
  return null;
}

/** Scopes this article can be pinned to (homepage + its own section). */
export function coverScopesForCategory(category: string): CoverStoryScope[] {
  const catScope = categoryToCoverScope(category);
  return catScope ? ["homepage", catScope] : ["homepage"];
}

export function isPinnedAsCoverStory(
  pins: CoverStoriesMap,
  contentId: string,
  scope: CoverStoryScope,
): boolean {
  return pins[scope] === contentId;
}

export function activeCoverScopesForContent(pins: CoverStoriesMap, contentId: string): CoverStoryScope[] {
  return (Object.entries(pins) as [CoverStoryScope, string][])
    .filter(([, id]) => id === contentId)
    .map(([scope]) => scope);
}

/** Put pinned article first; drops duplicate if already in list. */
export function orderWithCoverPin<T extends { id: string }>(
  items: T[],
  pinnedContentId: string | undefined,
): T[] {
  if (!pinnedContentId) return items;
  const pinned = items.find((item) => item.id === pinnedContentId);
  if (!pinned) return items;
  return [pinned, ...items.filter((item) => item.id !== pinnedContentId)];
}

export function buildCoverStoriesPatch(
  current: CoverStoriesMap,
  contentId: string,
  category: string,
  selectedScopes: CoverStoryScope[],
): CoverStoriesMap {
  const allowed = new Set(coverScopesForCategory(category));
  const next: CoverStoriesMap = { ...current };
  for (const scope of allowed) {
    if (selectedScopes.includes(scope)) {
      next[scope] = contentId;
    } else if (next[scope] === contentId) {
      delete next[scope];
    }
  }
  return next;
}

export function prioritizeHeroContent<T extends { id: string }>(
  items: T[],
  pinnedContentId: string | undefined,
): T[] {
  return orderWithCoverPin(items, pinnedContentId);
}
