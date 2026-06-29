export type CompletedTransfer = {
  id: string;
  playerName: string;
  fromClub: string;
  toClub: string;
  feeTr: string;
  feeEn: string;
  date: string;
};

/** Completed transfers — editorial list (updatable via admin/cron) */
export const COMPLETED_TRANSFERS: CompletedTransfer[] = [
  {
    id: "1",
    playerName: "Antoine Semenyo",
    fromClub: "Bournemouth",
    toClub: "Manchester City",
    feeTr: "£65M",
    feeEn: "£65M",
    date: "2026-01",
  },
  {
    id: "2",
    playerName: "Marcus Rashford",
    fromClub: "Manchester United",
    toClub: "Barcelona",
    feeTr: "Loan",
    feeEn: "Loan",
    date: "2026-01",
  },
  {
    id: "3",
    playerName: "João Palhinha",
    fromClub: "Bayern",
    toClub: "Tottenham",
    feeTr: "Loan",
    feeEn: "Loan",
    date: "2025-08",
  },
  {
    id: "4",
    playerName: "Alexander Isak",
    fromClub: "Newcastle",
    toClub: "Liverpool",
    feeTr: "£125M",
    feeEn: "£125M",
    date: "2025-08",
  },
  {
    id: "5",
    playerName: "Florian Wirtz",
    fromClub: "Bayer Leverkusen",
    toClub: "Liverpool",
    feeTr: "£116M",
    feeEn: "£116M",
    date: "2025-07",
  },
  {
    id: "6",
    playerName: "Viktor Gyökeres",
    fromClub: "Sporting",
    toClub: "Arsenal",
    feeTr: "€63.5M",
    feeEn: "€63.5M",
    date: "2025-07",
  },
];
