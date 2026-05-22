export type HeroSliderSettings = {
  radar: boolean;
  listeler: boolean;
  "taktik-lab": boolean;
  "wc-2026": boolean;
  transfer: boolean;
  wcPromo: boolean;
  arena: boolean;
};

export type RecentCountSettings = { count: number };

export const DEFAULT_HERO_SLIDER: HeroSliderSettings = {
  radar: true,
  listeler: true,
  "taktik-lab": true,
  "wc-2026": true,
  transfer: true,
  wcPromo: true,
  arena: true,
};

export const HERO_SLIDER_TOGGLES: { key: keyof HeroSliderSettings; label: string; hint?: string }[] = [
  { key: "radar", label: "Radar" },
  { key: "listeler", label: "Lists" },
  { key: "taktik-lab", label: "Tactics Lab" },
  { key: "wc-2026", label: "WC 2026 articles" },
  { key: "transfer", label: "Transfers articles" },
  { key: "wcPromo", label: "WC 2026 promo slide", hint: "Static hub promo — not an article" },
  { key: "arena", label: "Arena promo slide", hint: "Random published arena game" },
];

export function normalizeHeroSlider(raw: unknown): HeroSliderSettings {
  if (!raw || typeof raw !== "object") return { ...DEFAULT_HERO_SLIDER };
  const o = raw as Record<string, unknown>;
  const out = { ...DEFAULT_HERO_SLIDER };
  for (const key of Object.keys(out) as (keyof HeroSliderSettings)[]) {
    if (key in o) out[key] = o[key] !== false;
  }
  return out;
}

export function normalizeRecentCount(raw: unknown): number {
  if (!raw || typeof raw !== "object") return 6;
  const n = Number((raw as RecentCountSettings).count);
  return n === 3 || n === 6 || n === 9 ? n : 6;
}

export function enabledHeroCategories(settings: HeroSliderSettings): string[] {
  return (["radar", "listeler", "taktik-lab", "wc-2026", "transfer"] as const).filter((k) => settings[k]);
}
