/** FIFA World Cup 2026™ inspired accent palette (host + tournament branding) */
export const WC_2026_BRAND = {
  gold: "#FFB81C",
  goldDim: "#C99200",
  violet: "#3C1470",
  violetDeep: "#1A0A32",
  magenta: "#E4007C",
  teal: "#00B4A0",
  sky: "#5BC2E7",
  lime: "#97D700",
} as const;

export const WC_2026_GRADIENT =
  `linear-gradient(135deg, ${WC_2026_BRAND.gold} 0%, ${WC_2026_BRAND.magenta} 45%, ${WC_2026_BRAND.teal} 100%)`;

export const WC_2026_HERO_BG =
  `linear-gradient(165deg, ${WC_2026_BRAND.violetDeep} 0%, oklch(0.12 0.04 290) 40%, oklch(0.10 0.02 200) 100%)`;
