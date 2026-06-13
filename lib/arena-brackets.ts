/**
 * Arena — Supabase-backed bracket tournament games.
 */

// ─── Supabase types ───────────────────────────────────────────────────────────

export type ArenaGameStatus = "published" | "draft";
export type ArenaGameType = "random_4" | "random_8" | "random_16" | "random_32" | "random_64" | "random_128" | "fixed_8";
export type ArenaCardColor = "primary" | "secondary" | "tertiary" | "amber" | "rose";

export type ArenaParticipant = {
  name: string;
  subtitle?: string;
  photo_url?: string;
  vs?: string; // fixed_8 only
};

export type ArenaGame = {
  id: string;
  slug: string;
  status: ArenaGameStatus;
  title_en: string;
  description_en: string;
  hero_title_en: string;
  hero_teaser_en: string;
  card_color: ArenaCardColor;
  participants: ArenaParticipant[];
  game_type: ArenaGameType;
  hub_tags?: string[];
  team_slug?: string | null;
  created_at: string;
};

// ─── Color map ────────────────────────────────────────────────────────────────

export const CARD_COLOR_MAP: Record<ArenaCardColor, string> = {
  primary:   "var(--sg-primary)",
  secondary: "var(--sg-secondary)",
  tertiary:  "var(--sg-tertiary)",
  amber:     "var(--sg-amber)",
  rose:      "var(--sg-rose, #fb7185)",
};

export const CARD_COLOR_OPTIONS: { value: ArenaCardColor; label: string; css: string }[] = [
  { value: "primary",   label: "Primary (Green)",  css: "var(--sg-primary)" },
  { value: "secondary", label: "Secondary (Blue)", css: "var(--sg-secondary)" },
  { value: "tertiary",  label: "Tertiary (Purple)",css: "var(--sg-tertiary)" },
  { value: "amber",     label: "Amber (Yellow)",   css: "var(--sg-amber)" },
  { value: "rose",      label: "Rose (Pink)",      css: "var(--sg-rose, #fb7185)" },
];

/** Detail URL for a single arena game. */
export function arenaPath(slug: string): string {
  const s = String(slug ?? "")
    .trim()
    .replace(/^\/+|\/+$/g, "");
  return `/arena/${s}`;
}

// ─── Participant count ───────────────────────────────────────────────────────

export function bracketParticipantCount(gameType: ArenaGameType): number {
  switch (gameType) {
    case "random_4":
      return 4;
    case "fixed_8":
    case "random_8":
      return 8;
    case "random_32":
      return 32;
    case "random_64":
      return 64;
    case "random_128":
      return 128;
    default:
      return 16;
  }
}

/** Bracket size for UI round labels (fixed_8 maps to 16-player structure). */
export function bracketLabelSize(gameType: ArenaGameType, normalizedRandomCount: number): number {
  if (gameType === "fixed_8") return 16;
  return normalizedRandomCount;
}

// ─── Round labels ─────────────────────────────────────────────────────────────

export function arenaRoundNames(bracketSize: 16 | 32 | 64): string[] {
  const NAMES: Record<16 | 32 | 64, string[]> = {
    64: ["Round of 64", "Round of 32", "Round of 16", "Quarter-Final", "Semi-Final", "Final"],
    32: ["Round of 32", "Round of 16", "Quarter-Final", "Semi-Final", "Final"],
    16: ["Round of 16", "Quarter-Final", "Semi-Final", "Final"],
  };
  return NAMES[bracketSize];
}

export function arenaNextRoundHeading(roundNames: string[], roundIndex: number): string {
  const next = roundNames[roundIndex + 1];
  if (!next) return "";
  return `${next} begins!`;
}

/** Round labels for a given participant count (power of 2; 4–128). */
export function arenaRoundNamesForCount(n: number): string[] {
  if (n >= 128) return ["Round of 128", ...arenaRoundNames(64)];
  if (n >= 64) return arenaRoundNames(64);
  if (n >= 32) return arenaRoundNames(32);
  if (n >= 16) return arenaRoundNames(16);
  if (n >= 8) return ["Quarter-Final", "Semi-Final", "Final"];
  if (n >= 4) return ["Semi-Final", "Final"];
  return ["Final"];
}

export type ArenaParticipantInput = {
  name?: string;
  subtitle?: string;
  photo_url?: string;
  vs?: string;
};

/** Normalized bracket list (fixed_8: max 8 rows; random*: trimmed to power of 2). */
export function normalizeArenaParticipants(participants: ArenaParticipantInput[], gameType: ArenaGameType): ArenaParticipantInput[] {
  const cap = bracketParticipantCount(gameType);
  const filtered = participants.filter((p) => String(p.name ?? "").trim());
  if (gameType === "fixed_8") return filtered.slice(0, 8);
  const raw = filtered.slice(0, cap);
  if (raw.length < 2) return raw;
  let pow2 = 1;
  while (pow2 * 2 <= raw.length) pow2 *= 2;
  return raw.slice(0, pow2);
}
