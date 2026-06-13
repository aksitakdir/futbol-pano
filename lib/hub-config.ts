/**
 * @deprecated — Use `@/lib/category-config` instead. This file is a
 * backward-compat shim kept during the hub→category migration and will be
 * removed once all consumers are updated.
 */
export {
  type ContentCategory as HubId,
  categoryArticlePath,
  CAT_LABEL,
  categoryPublicPath,
  CATEGORY_ACCENT,
} from "@/lib/category-config";

/** @deprecated kept only for backward compat during migration */
export const HUBS = {
  "wc-2026": {
    id: "wc-2026" as const,
    tag: "wc-2026",
    accent: "var(--amber)",
    navKey: "wc-2026" as const,
    en: {
      basePath: "/world-cup-2026",
      navLabel: "WC 2026",
      pillarTitle: "World Cup 2026",
      pillarEyebrow: "TOURNAMENT",
      pillarDescription:
        "Squads, scout analysis, and tournament lists — not headlines, scout reports.",
      radarPath: "/world-cup-2026/radar",
      listelerPath: "/world-cup-2026/lists",
      squadsPath: "/world-cup-2026/squads",
      taktikPath: "/tactics-lab",
    },
  },
  transfer: {
    id: "transfer" as const,
    tag: "transfer",
    accent: "var(--cyan)",
    navKey: "transfer" as const,
    en: {
      basePath: "/transfers",
      navLabel: "TRANSFERS",
      pillarTitle: "Transfers",
      pillarEyebrow: "TRANSFERS",
      pillarDescription:
        "Transfer Wire — rumors from trusted public sources, scout analysis, and confirmed deals.",
      radarPath: "/transfers/radar",
      listelerPath: "/transfers/lists",
      squadsPath: "/transfers",
      taktikPath: "/tactics-lab",
      transferPollPath: "/transfers/will-they-go",
    },
  },
};

/** @deprecated */
export function getHubConfig(hubId: "wc-2026" | "transfer") {
  const hub = HUBS[hubId];
  return { ...hub.en, id: hub.id, tag: hub.tag, accent: hub.accent };
}

/** @deprecated */
export const HUB_TAG: Record<string, string> = {
  "wc-2026": "wc-2026",
  transfer: "transfer",
};
