export type ContentCategory =
  | "lists"
  | "radar"
  | "tactics-lab"
  | "wc-2026"
  | "transfer";

export const CAT_LABEL: Record<string, string> = {
  lists: "Lists",
  radar: "Radar",
  "tactics-lab": "Tactics Lab",
  "wc-2026": "World Cup 2026",
  transfer: "Transfers",
};

export const CATEGORY_ACCENT: Record<string, string> = {
  "wc-2026": "amber",
  transfer: "cyan",
  radar: "emerald",
  lists: "emerald",
  "tactics-lab": "emerald",
};

export const CONTENT_CATEGORIES: { value: ContentCategory; label: string; desc: string }[] = [
  { value: "lists", label: "Lists", desc: "Permanent site section · /lists/your-slug" },
  { value: "radar", label: "Radar", desc: "Permanent site section · /radar/your-slug" },
  { value: "tactics-lab", label: "Tactics Lab", desc: "Permanent site section · /tactics-lab/your-slug" },
  // No "wc-2026": the World Cup 2026 section closed on 2026-11-26 and takes no new pieces.
  // The type, label and paths stay until the remaining rows are rejected (lib/retired-content.mjs).
  { value: "transfer", label: "Transfers", desc: "Transfers section · /transfers/your-slug" },
];

export function categoryArticlePath(category: string, slug: string): string {
  if (category === "wc-2026") return `/world-cup-2026/${slug}`;
  if (category === "transfer") return `/transfers/${slug}`;
  if (category === "lists") return `/lists/${slug}`;
  if (category === "radar") return `/radar/${slug}`;
  if (category === "tactics-lab") return `/tactics-lab/${slug}`;
  return `/lists/${slug}`;
}

export function categoryPublicPath(category: string): string {
  if (category === "wc-2026") return "/world-cup-2026";
  if (category === "transfer") return "/transfers";
  if (category === "radar") return "/radar";
  if (category === "tactics-lab") return "/tactics-lab";
  return "/lists";
}

export function isContentCategory(value: string | null): value is ContentCategory {
  return (
    value === "lists" ||
    value === "radar" ||
    value === "tactics-lab" ||
    value === "wc-2026" ||
    value === "transfer"
  );
}
