import { HUBS, type HubId } from "@/lib/hub-config";

export type EditorialCategory = "listeler" | "radar" | "taktik-lab";
export type HubCategory = HubId;
export type ContentCategory = EditorialCategory | HubCategory;

export type PublishScope = "main" | HubId;

export const EDITORIAL_CATEGORIES: { value: EditorialCategory; label: string }[] = [
  { value: "listeler", label: "Lists" },
  { value: "radar", label: "Radar" },
  { value: "taktik-lab", label: "Tactics Lab" },
];

export const HUB_CATEGORIES: HubCategory[] = ["wc-2026", "transfer"];

export const CONTENT_DESTINATIONS: { value: ContentCategory; label: string; desc: string }[] = [
  {
    value: "listeler",
    label: "Lists",
    desc: "Permanent site section · /lists/your-slug",
  },
  {
    value: "radar",
    label: "Radar",
    desc: "Permanent site section · /radar/your-slug",
  },
  {
    value: "taktik-lab",
    label: "Tactics Lab",
    desc: "Permanent site section · /tactics-lab/your-slug",
  },
  {
    value: "wc-2026",
    label: "World Cup 2026",
    desc: `Temporary hub · ${HUBS["wc-2026"].en.basePath}/your-slug`,
  },
  {
    value: "transfer",
    label: "Transfers",
    desc: `Hub · ${HUBS.transfer.en.basePath}/your-slug`,
  },
];

export const PUBLISH_SCOPES: { value: PublishScope; label: string; desc: string }[] = [
  { value: "main", label: "Main site", desc: "Radar, Lists or Tactics Lab — permanent site sections" },
  {
    value: "wc-2026",
    label: "World Cup 2026",
    desc: `Hub-only articles at ${HUBS["wc-2026"].en.basePath}/your-slug`,
  },
  {
    value: "transfer",
    label: "Transfers Hub",
    desc: `Hub-only articles at ${HUBS.transfer.en.basePath}/your-slug`,
  },
];

export function isEditorialCategory(value: string | null): value is EditorialCategory {
  return value === "listeler" || value === "radar" || value === "taktik-lab";
}

export function isHubCategory(value: string | null): value is HubCategory {
  return value === "wc-2026" || value === "transfer";
}

export function isContentCategory(value: string | null): value is ContentCategory {
  return isEditorialCategory(value) || isHubCategory(value);
}

export function isPublishScope(value: string | null): value is PublishScope {
  return value === "main" || value === "wc-2026" || value === "transfer";
}

export function publishScopeForCategory(category: ContentCategory): PublishScope {
  return isHubCategory(category) ? category : "main";
}

export function hubTagsFromDestination(scope: PublishScope, crossPostHubs: HubId[]): string[] {
  if (scope === "main") return crossPostHubs.map((id) => HUBS[id].tag);
  return [HUBS[scope].tag];
}

export function destinationFromHubTags(
  tags: string[] | null | undefined,
  category?: string | null,
): {
  scope: PublishScope;
  crossPostHubs: HubId[];
  category: ContentCategory;
} {
  const list = Array.isArray(tags) ? tags : [];
  const cat = category ?? null;
  if (isHubCategory(cat)) {
    return { scope: cat, crossPostHubs: [], category: cat };
  }
  if (list.includes("wc-2026")) {
    return { scope: "wc-2026", crossPostHubs: [], category: isEditorialCategory(cat) ? cat : "wc-2026" };
  }
  if (list.includes("transfer")) {
    return { scope: "transfer", crossPostHubs: [], category: isEditorialCategory(cat) ? cat : "transfer" };
  }
  const crossPostHubs = HUB_CATEGORIES.filter((id) => list.includes(HUBS[id].tag));
  return {
    scope: "main",
    crossPostHubs,
    category: isEditorialCategory(cat) ? cat : "radar",
  };
}

export function categoryPublicPath(category: string): string {
  if (category === "wc-2026") return HUBS["wc-2026"].en.basePath;
  if (category === "transfer") return HUBS.transfer.en.basePath;
  if (category === "radar") return "/radar";
  if (category === "taktik-lab") return "/tactics-lab";
  return "/lists";
}

export function destinationSummary(scope: PublishScope, category: ContentCategory): string {
  const path = `${categoryPublicPath(category)}/your-slug`;
  if (scope === "main") return `Main site editorial · ${path}`;
  if (scope === category) return `${HUBS[scope].en.pillarTitle} hub article · ${path} (not on Lists/Radar)`;
  return `${HUBS[scope].en.pillarTitle} hub + ${category} format · ${path}`;
}

export function adminHubPath(scope: PublishScope): string | null {
  if (scope === "wc-2026") return "/admin/hub-wc";
  if (scope === "transfer") return "/admin/hub";
  return null;
}

export function newArticlePath(scope: PublishScope, mode?: "blocks"): string {
  const params = new URLSearchParams();
  if (scope !== "main") params.set("hub", scope);
  if (mode === "blocks") params.set("mode", "blocks");
  const qs = params.toString();
  return qs ? `/admin/yeni?${qs}` : "/admin/yeni";
}
