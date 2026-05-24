export type ContentCategory =
  | "listeler"
  | "radar"
  | "taktik-lab"
  | "wc-2026"
  | "transfer";

export const CAT_LABEL: Record<string, string> = {
  listeler: "Lists",
  radar: "Radar",
  "taktik-lab": "Tactics Lab",
  "wc-2026": "World Cup 2026",
  transfer: "Transfers",
};

export const CATEGORY_ACCENT: Record<string, string> = {
  "wc-2026": "amber",
  transfer: "cyan",
  radar: "emerald",
  listeler: "emerald",
  "taktik-lab": "emerald",
};

export const CONTENT_CATEGORIES: { value: ContentCategory; label: string; desc: string }[] = [
  { value: "listeler", label: "Lists", desc: "Permanent site section · /lists/your-slug" },
  { value: "radar", label: "Radar", desc: "Permanent site section · /radar/your-slug" },
  { value: "taktik-lab", label: "Tactics Lab", desc: "Permanent site section · /tactics-lab/your-slug" },
  { value: "wc-2026", label: "World Cup 2026", desc: "Tournament section · /world-cup-2026/your-slug" },
  { value: "transfer", label: "Transfers", desc: "Transfers section · /transfers/your-slug" },
];

export function categoryArticlePath(category: string, slug: string): string {
  if (category === "wc-2026") return `/world-cup-2026/${slug}`;
  if (category === "transfer") return `/transfers/${slug}`;
  if (category === "listeler") return `/lists/${slug}`;
  if (category === "radar") return `/radar/${slug}`;
  if (category === "taktik-lab") return `/tactics-lab/${slug}`;
  return `/lists/${slug}`;
}

export function categoryPublicPath(category: string): string {
  if (category === "wc-2026") return "/world-cup-2026";
  if (category === "transfer") return "/transfers";
  if (category === "radar") return "/radar";
  if (category === "taktik-lab") return "/tactics-lab";
  return "/lists";
}

export function isContentCategory(value: string | null): value is ContentCategory {
  return (
    value === "listeler" ||
    value === "radar" ||
    value === "taktik-lab" ||
    value === "wc-2026" ||
    value === "transfer"
  );
}
