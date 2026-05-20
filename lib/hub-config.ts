export type HubId = "wc-2026" | "transfer";

export type HubLocale = "tr" | "en";

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
  tr: HubLocaleConfig;
  en: HubLocaleConfig;
};

export const HUBS: Record<HubId, HubConfig> = {
  "wc-2026": {
    id: "wc-2026",
    tag: "wc-2026",
    accent: "var(--amber)",
    navKey: "wc-2026",
    tr: {
      basePath: "/dunya-kupasi-2026",
      navLabel: "DK 2026",
      pillarTitle: "Dünya Kupası 2026",
      pillarEyebrow: "TURNUVA MERKEZİ",
      pillarDescription:
        "Kadrolar, scout analizleri ve turnuva odaklı listeler. Haber değil, scout raporu.",
      radarPath: "/dunya-kupasi-2026/radar",
      listelerPath: "/dunya-kupasi-2026/listeler",
      kadrolarPath: "/dunya-kupasi-2026/kadrolar",
      taktikPath: "/taktik-lab",
    },
    en: {
      basePath: "/en/world-cup-2026",
      navLabel: "WC 2026",
      pillarTitle: "World Cup 2026",
      pillarEyebrow: "TOURNAMENT HUB",
      pillarDescription:
        "Squads, scout analysis, and tournament lists — not headlines, scout reports.",
      radarPath: "/en/world-cup-2026/radar",
      listelerPath: "/en/world-cup-2026/lists",
      kadrolarPath: "/en/world-cup-2026/squads",
      taktikPath: "/en/taktik-lab",
    },
  },
  transfer: {
    id: "transfer",
    tag: "transfer",
    accent: "var(--cyan)",
    navKey: "transfer",
    tr: {
      basePath: "/transfer",
      navLabel: "TRANSFER HABERLERİ",
      pillarTitle: "Transferler",
      pillarEyebrow: "TRANSFER MERKEZİ",
      pillarDescription:
        "Gerçekleşen hamleler, scout analizleri ve kulüp Arena oyunları — transfer gündemine scout bakışı.",
      radarPath: "/transfer/radar",
      listelerPath: "/transfer/listeler",
      kadrolarPath: "/transfer",
      taktikPath: "/taktik-lab",
      transferPollPath: "/transfer/gidecek-mi",
    },
    en: {
      basePath: "/en/transfers",
      navLabel: "TRANSFER NEWS",
      pillarTitle: "Transfers",
      pillarEyebrow: "TRANSFER HUB",
      pillarDescription:
        "Done deals, scout analysis, and club Arena games — the transfer window through a scout lens.",
      radarPath: "/en/transfers/radar",
      listelerPath: "/en/transfers/lists",
      kadrolarPath: "/en/transfers",
      taktikPath: "/en/taktik-lab",
      transferPollPath: "/en/transfers/will-they-go",
    },
  },
};

export function getHubConfig(hubId: HubId, locale: HubLocale): HubLocaleConfig & { id: HubId; tag: string; accent: string } {
  const hub = HUBS[hubId];
  return { ...hub[locale], id: hub.id, tag: hub.tag, accent: hub.accent };
}

export function categoryArticlePath(category: string, slug: string, locale: HubLocale): string {
  const base = locale === "en" ? "/en" : "";
  if (category === "listeler") return `${base}/listeler/${slug}`;
  if (category === "radar") return `${base}/radar/${slug}`;
  if (category === "taktik-lab") return `${base}/taktik-lab/${slug}`;
  return `${base}/listeler/${slug}`;
}

export const CAT_LABEL: Record<HubLocale, Record<string, string>> = {
  tr: { listeler: "Listeler", radar: "Radar", "taktik-lab": "Taktik Lab" },
  en: { listeler: "Lists", radar: "Radar", "taktik-lab": "Tactics Lab" },
};
