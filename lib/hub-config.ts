export type HubId = "wc-2026" | "transfer";

export type HubLocale = "en";

export type HubNavKey = "wc-2026" | "transfer";

export const HUB_TAG: Record<HubId, string> = {
  "wc-2026": "wc-2026",
  transfer: "transfer",
};

type HubLocaleConfig = {
  basePath: string;
  navLabel: string;
  pillarTitle: string;
  pillarEyebrow: string;
  pillarDescription: string;
  radarPath: string;
  listelerPath: string;
  kadrolarPath: string;
  taktikPath: string;
  transferPollPath?: string;
};

export type HubConfig = {
  id: HubId;
  tag: string;
  accent: string;
  navKey: HubNavKey;
  en: HubLocaleConfig;
};

export const HUBS: Record<HubId, HubConfig> = {
  "wc-2026": {
    id: "wc-2026",
    tag: "wc-2026",
    accent: "var(--amber)",
    navKey: "wc-2026",
    en: {
      basePath: "/world-cup-2026",
      navLabel: "WC 2026",
      pillarTitle: "World Cup 2026",
      pillarEyebrow: "TOURNAMENT HUB",
      pillarDescription:
        "Squads, scout analysis, and tournament lists — not headlines, scout reports.",
      radarPath: "/world-cup-2026/radar",
      listelerPath: "/world-cup-2026/lists",
      kadrolarPath: "/world-cup-2026/squads",
      taktikPath: "/tactics-lab",
    },
  },
  transfer: {
    id: "transfer",
    tag: "transfer",
    accent: "var(--cyan)",
    navKey: "transfer",
    en: {
      basePath: "/transfers",
      navLabel: "TRANSFERS",
      pillarTitle: "Transfers",
      pillarEyebrow: "TRANSFER HUB",
      pillarDescription:
        "Transfer Wire — rumors from trusted public sources, scout analysis, and confirmed deals.",
      radarPath: "/transfers/radar",
      listelerPath: "/transfers/lists",
      kadrolarPath: "/transfers",
      taktikPath: "/tactics-lab",
      transferPollPath: "/transfers/will-they-go",
    },
  },
};

export function getHubConfig(hubId: HubId, _locale?: HubLocale): HubLocaleConfig & { id: HubId; tag: string; accent: string } {
  const hub = HUBS[hubId];
  return { ...hub.en, id: hub.id, tag: hub.tag, accent: hub.accent };
}

export function categoryArticlePath(category: string, slug: string): string {
  if (category === "wc-2026") return `${HUBS["wc-2026"].en.basePath}/${slug}`;
  if (category === "transfer") return `${HUBS.transfer.en.basePath}/${slug}`;
  if (category === "listeler") return `/lists/${slug}`;
  if (category === "radar") return `/radar/${slug}`;
  if (category === "taktik-lab") return `/tactics-lab/${slug}`;
  return `/lists/${slug}`;
}

export const CAT_LABEL: Record<string, string> = {
  listeler: "Lists",
  radar: "Radar",
  "taktik-lab": "Tactics Lab",
  "wc-2026": "World Cup 2026",
  transfer: "Transfers",
};
