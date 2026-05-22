import { HUBS, type HubId } from "@/lib/hub-config";

export type EditorialCategory = "listeler" | "radar" | "taktik-lab";
export type PublishScope = "main" | HubId;

export const EDITORIAL_CATEGORIES: { value: EditorialCategory; label: string }[] = [
  { value: "listeler", label: "Lists" },
  { value: "radar", label: "Radar" },
  { value: "taktik-lab", label: "Tactics Lab" },
];

export const PUBLISH_SCOPES: { value: PublishScope; label: string; desc: string }[] = [
  { value: "main", label: "Main site", desc: "Radar, Lists or Tactics Lab index pages" },
  {
    value: "wc-2026",
    label: "World Cup 2026",
    desc: `${HUBS["wc-2026"].en.basePath} hub feeds`,
  },
  {
    value: "transfer",
    label: "Transfers Hub",
    desc: `${HUBS.transfer.en.basePath} hub feeds`,
  },
];

export function isEditorialCategory(value: string | null): value is EditorialCategory {
  return value === "listeler" || value === "radar" || value === "taktik-lab";
}

export function isPublishScope(value: string | null): value is PublishScope {
  return value === "main" || value === "wc-2026" || value === "transfer";
}

export function hubTagsFromDestination(scope: PublishScope, crossPostHubs: HubId[]): string[] {
  if (scope === "main") return crossPostHubs.map((id) => HUBS[id].tag);
  return [HUBS[scope].tag];
}

export function destinationFromHubTags(tags: string[] | null | undefined): {
  scope: PublishScope;
  crossPostHubs: HubId[];
} {
  const list = Array.isArray(tags) ? tags : [];
  if (list.includes("wc-2026")) return { scope: "wc-2026", crossPostHubs: [] };
  if (list.includes("transfer")) return { scope: "transfer", crossPostHubs: [] };
  const crossPostHubs = (["wc-2026", "transfer"] as const).filter((id) => list.includes(HUBS[id].tag));
  return { scope: "main", crossPostHubs };
}

export function categoryPublicPath(category: string): string {
  if (category === "radar") return "/radar";
  if (category === "taktik-lab") return "/taktik-lab";
  return "/listeler";
}

export function destinationSummary(scope: PublishScope, category: EditorialCategory): string {
  const path = `${categoryPublicPath(category)}/your-slug`;
  if (scope === "main") return `Main site · ${path}`;
  const hub = HUBS[scope].en;
  const feed =
    category === "radar" ? hub.radarPath : category === "listeler" ? hub.listelerPath : hub.taktikPath;
  return `${hub.pillarTitle} · ${path} · hub feed ${feed}`;
}

export function adminHubPath(scope: PublishScope): string | null {
  if (scope === "wc-2026") return "/admin/hub-wc";
  if (scope === "transfer") return "/admin/hub";
  return null;
}

export function newArticlePath(scope: PublishScope, category: EditorialCategory): string {
  if (scope === "main") {
    return category === "radar" ? "/admin/yeni?category=radar" : `/admin/yeni?category=${category}`;
  }
  return `/admin/yeni?hub=${scope}&category=${category}`;
}
