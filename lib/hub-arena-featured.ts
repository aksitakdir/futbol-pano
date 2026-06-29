export const WC_2026_ARENA_SLUG = "dk-2026-sampiyonu";

/** Popular clubs — matched to arena_games via team_slug (create in admin) */
export const TRANSFER_TEAM_ARENA_SLUGS: {
  teamSlug: string;
  nameEn: string;
  fallbackTitleEn: string;
}[] = [
  {
    teamSlug: "real-madrid",
    nameEn: "Real Madrid",
    fallbackTitleEn: "Who should Real Madrid sign?",
  },
  {
    teamSlug: "barcelona",
    nameEn: "Barcelona",
    fallbackTitleEn: "Who should Barcelona sign?",
  },
  {
    teamSlug: "manchester-city",
    nameEn: "Manchester City",
    fallbackTitleEn: "Who should Man City sign?",
  },
  {
    teamSlug: "liverpool",
    nameEn: "Liverpool",
    fallbackTitleEn: "Who should Liverpool sign?",
  },
  {
    teamSlug: "arsenal",
    nameEn: "Arsenal",
    fallbackTitleEn: "Who should Arsenal sign?",
  },
  {
    teamSlug: "bayern-munich",
    nameEn: "Bayern München",
    fallbackTitleEn: "Who should Bayern sign?",
  },
];

export function featuredArenaSlug(hubId: string): string | null {
  if (hubId === "wc-2026") return WC_2026_ARENA_SLUG;
  return null;
}
