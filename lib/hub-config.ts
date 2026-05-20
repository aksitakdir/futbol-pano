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
      taktikPath: "/taktik-lab",
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
        "Done deals, scout analysis, and club Arena games — the transfer window through a scout lens.",
      radarPath: "/transfers/radar",
      listelerPath: "/transfers/lists",
      kadrolarPath: "/transfers",
      taktikPath: "/taktik-lab",
      transferPollPath: "/transfers/will-they-go",
    },
  },
};

export function getHubConfig(hubId: HubId, _locale?: HubLocale): HubLocaleConfig & { id: HubId; tag: string; accent: string } {
  const hub = HUBS[hubId];
  return { ...hub.en, id: hub.id, tag: hub.tag, accent: hub.accent };
}

export function categoryArticlePath(category: string, slug: string): string {
  if (category === "listeler") return `/listeler/${slug}`;
  if (category === "radar") return `/radar/${slug}`;
  if (category === "taktik-lab") return `/taktik-lab/${slug}`;
  return `/listeler/${slug}`;
}

export const CAT_LABEL: Record<string, string> = {
  listeler: "Lists", radar: "Radar", "taktik-lab": "Tactics Lab",
};
