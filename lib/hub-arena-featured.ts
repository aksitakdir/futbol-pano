export const WC_2026_ARENA_SLUG = "dk-2026-sampiyonu";

/** Popüler kulüpler — team_slug ile arena_games eşleşir (admin'de oluşturun) */
export const TRANSFER_TEAM_ARENA_SLUGS: {
  teamSlug: string;
  nameTr: string;
  nameEn: string;
  fallbackTitleTr: string;
  fallbackTitleEn: string;
}[] = [
  {
    teamSlug: "real-madrid",
    nameTr: "Real Madrid",
    nameEn: "Real Madrid",
    fallbackTitleTr: "Real Madrid kimi transfer etmeli?",
    fallbackTitleEn: "Who should Real Madrid sign?",
  },
  {
    teamSlug: "barcelona",
    nameTr: "Barcelona",
    nameEn: "Barcelona",
    fallbackTitleTr: "Barcelona kimi transfer etmeli?",
    fallbackTitleEn: "Who should Barcelona sign?",
  },
  {
    teamSlug: "manchester-city",
    nameTr: "Manchester City",
    nameEn: "Manchester City",
    fallbackTitleTr: "City kimi transfer etmeli?",
    fallbackTitleEn: "Who should Man City sign?",
  },
  {
    teamSlug: "liverpool",
    nameTr: "Liverpool",
    nameEn: "Liverpool",
    fallbackTitleTr: "Liverpool kimi transfer etmeli?",
    fallbackTitleEn: "Who should Liverpool sign?",
  },
  {
    teamSlug: "arsenal",
    nameTr: "Arsenal",
    nameEn: "Arsenal",
    fallbackTitleTr: "Arsenal kimi transfer etmeli?",
    fallbackTitleEn: "Who should Arsenal sign?",
  },
  {
    teamSlug: "bayern-munich",
    nameTr: "Bayern München",
    nameEn: "Bayern München",
    fallbackTitleTr: "Bayern kimi transfer etmeli?",
    fallbackTitleEn: "Who should Bayern sign?",
  },
];

export function featuredArenaSlug(hubId: string): string | null {
  if (hubId === "wc-2026") return WC_2026_ARENA_SLUG;
  return null;
}
