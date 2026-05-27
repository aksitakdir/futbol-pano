export type TransferScenario = {
  id: string;
  rank: number;
  playerName: string;
  fromClub: string;
  toClub: string;
  likelihood: number;
  note: string;
};

export const TRANSFER_SCENARIOS: TransferScenario[] = [
  {
    id: "1",
    rank: 1,
    playerName: "Victor Osimhen",
    fromClub: "Napoli",
    toClub: "Galatasaray",
    likelihood: 72,
    note: "Talks ongoing; strong tactical fit score.",
  },
  {
    id: "2",
    rank: 2,
    playerName: "Arda Güler",
    fromClub: "Real Madrid",
    toClub: "Arsenal",
    likelihood: 38,
    note: "Loan-with-option structure rumoured.",
  },
  {
    id: "3",
    rank: 3,
    playerName: "Vinícius Júnior",
    fromClub: "Real Madrid",
    toClub: "PSG",
    likelihood: 34,
    note: "Exit tied to contract renewal talks.",
  },
  {
    id: "4",
    rank: 4,
    playerName: "Harry Kane",
    fromClub: "Bayern",
    toClub: "Manchester United",
    likelihood: 28,
    note: "Premier return rumour; fee structure heavy.",
  },
  {
    id: "5",
    rank: 5,
    playerName: "Phil Foden",
    fromClub: "Manchester City",
    toClub: "Real Madrid",
    likelihood: 22,
    note: "Minutes debate as trigger factor.",
  },
  {
    id: "6",
    rank: 6,
    playerName: "Jude Bellingham",
    fromClub: "Real Madrid",
    toClub: "Manchester City",
    likelihood: 18,
    note: "Low priority; media noise only.",
  },
  {
    id: "7",
    rank: 7,
    playerName: "Kylian Mbappé",
    fromClub: "Real Madrid",
    toClub: "Liverpool",
    likelihood: 12,
    note: "Speculative; contract stable.",
  },
  {
    id: "8",
    rank: 8,
    playerName: "Lamine Yamal",
    fromClub: "Barcelona",
    toClub: "PSG",
    likelihood: 9,
    note: "No release clause story; long-term.",
  },
];

export const TRANSFER_SCENARIOS_SORTED = [...TRANSFER_SCENARIOS].sort((a, b) => b.likelihood - a.likelihood);
