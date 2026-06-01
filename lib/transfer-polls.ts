export type TransferAbPoll = {
  id: string;
  slug: string;
  playerName: string;
  clubA: string;
  clubB: string;
  labelA?: string;
  labelB?: string;
  teamSlug?: string;
  hubTags: string[];
};

export const TRANSFER_AB_POLLS: TransferAbPoll[] = [
  {
    id: "1",
    slug: "osimhen-next-club",
    playerName: "Victor Osimhen",
    clubA: "Chelsea",
    clubB: "Al-Hilal",
    hubTags: ["transfer"],
  },
  {
    id: "2",
    slug: "arda-guler-real",
    playerName: "Arda Güler",
    clubA: "Real Madrid",
    clubB: "Arsenal",
    hubTags: ["transfer"],
  },
  {
    id: "3",
    slug: "kane-bayern",
    playerName: "Harry Kane",
    clubA: "Bayern",
    clubB: "Manchester United",
    hubTags: ["transfer"],
  },
  {
    id: "4",
    slug: "vinicius-psg",
    playerName: "Vinícius Júnior",
    clubA: "Real Madrid",
    clubB: "PSG",
    hubTags: ["transfer"],
  },
  {
    id: "5",
    slug: "foden-city",
    playerName: "Phil Foden",
    clubA: "Manchester City",
    clubB: "Real Madrid",
    hubTags: ["transfer"],
  },
  {
    id: "6",
    slug: "bellingham-city",
    playerName: "Jude Bellingham",
    clubA: "Real Madrid",
    clubB: "Manchester City",
    hubTags: ["transfer"],
  },
];

export function pollsForTeam(teamSlug?: string): TransferAbPoll[] {
  if (!teamSlug) return TRANSFER_AB_POLLS;
  return TRANSFER_AB_POLLS.filter((p) => p.teamSlug === teamSlug);
}
