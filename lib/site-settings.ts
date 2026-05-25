export type HeroSliderSettings = {
  radar: boolean;
  listeler: boolean;
  "taktik-lab": boolean;
  "wc-2026": boolean;
  transfer: boolean;
  wcPromo: boolean;
  arena: boolean;
  sliderCount: number;
};

export type RecentCountSettings = { count: number };

export type CustomHeroSlide = {
  id: string;
  title: string;
  teaser: string;
  href: string;
  eyebrow: string;
  image?: string;
  accentColor?: string;
  enabled: boolean;
};

/** Safely parse a Supabase value that may be a JSON string or already parsed. */
function parseValue<T>(raw: unknown): T | null {
  if (raw === null || raw === undefined) return null;
  if (typeof raw === "object") return raw as T;
  if (typeof raw === "string") {
    try { return JSON.parse(raw) as T; } catch { return null; }
  }
  return null;
}

export function normalizeCustomSlides(raw: unknown): CustomHeroSlide[] {
  const parsed = parseValue<CustomHeroSlide[]>(raw);
  if (!Array.isArray(parsed)) return [];
  return parsed.filter(
    (s): s is CustomHeroSlide => s && typeof s === "object" && typeof s.title === "string" && typeof s.href === "string",
  );
}

export const DEFAULT_HERO_SLIDER: HeroSliderSettings = {
  radar: true,
  listeler: true,
  "taktik-lab": true,
  "wc-2026": true,
  transfer: true,
  wcPromo: true,
  arena: true,
  sliderCount: 5,
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
  const o = parseValue<Record<string, unknown>>(raw);
  if (!o || typeof o !== "object") return { ...DEFAULT_HERO_SLIDER };
  const out = { ...DEFAULT_HERO_SLIDER };
  for (const key of Object.keys(out) as (keyof HeroSliderSettings)[]) {
    if (key === "sliderCount") {
      const n = Number(o[key]);
      out.sliderCount = n >= 1 && n <= 12 ? n : DEFAULT_HERO_SLIDER.sliderCount;
    } else if (key in o) {
      (out as Record<string, boolean | number>)[key] = o[key] !== false;
    }
  }
  return out;
}

export function normalizeRecentCount(raw: unknown): number {
  const o = parseValue<RecentCountSettings>(raw);
  if (!o || typeof o !== "object") return 6;
  const n = Number(o.count);
  return n === 3 || n === 6 || n === 9 ? n : 6;
}

export function enabledHeroCategories(settings: HeroSliderSettings): string[] {
  return (["radar", "listeler", "taktik-lab", "wc-2026", "transfer"] as const).filter((k) => settings[k]);
}
