/** Olası transfer ihtimalleri — scout sıralaması (statik; cron ile genişletilebilir) */
export type TransferScenario = {
  id: string;
  rank: number;
  playerName: string;
  fromClub: string;
  toClub: string;
  likelihood: number;
  noteTr: string;
  noteEn: string;
};

export const TRANSFER_SCENARIOS: TransferScenario[] = [
  {
    id: "1",
    rank: 1,
    playerName: "Victor Osimhen",
    fromClub: "Napoli",
    toClub: "Galatasaray",
    likelihood: 72,
    noteTr: "Kulüp görüşmeleri sürüyor; scout uyumu yüksek.",
    noteEn: "Talks ongoing; strong tactical fit score.",
  },
  {
    id: "2",
    rank: 2,
    playerName: "Arda Güler",
    fromClub: "Real Madrid",
    toClub: "Arsenal",
    likelihood: 38,
    noteTr: "Kiralık + satın alma senaryosu konuşuluyor.",
    noteEn: "Loan-with-option structure rumoured.",
  },
  {
    id: "3",
    rank: 3,
    playerName: "Vinícius Júnior",
    fromClub: "Real Madrid",
    toClub: "PSG",
    likelihood: 34,
    noteTr: "Sözleşme uzatma pazarlığına bağlı çıkış ihtimali.",
    noteEn: "Exit tied to contract renewal talks.",
  },
  {
    id: "4",
    rank: 4,
    playerName: "Harry Kane",
    fromClub: "Bayern",
    toClub: "Manchester United",
    likelihood: 28,
    noteTr: "Premier geri dönüş spekülasyonu; maliyet yüksek.",
    noteEn: "Premier return rumour; fee structure heavy.",
  },
  {
    id: "5",
    rank: 5,
    playerName: "Phil Foden",
    fromClub: "Manchester City",
    toClub: "Real Madrid",
    likelihood: 22,
    noteTr: "Oyun süresi tartışması tetikleyici faktör.",
    noteEn: "Minutes debate as trigger factor.",
  },
  {
    id: "6",
    rank: 6,
    playerName: "Jude Bellingham",
    fromClub: "Real Madrid",
    toClub: "Manchester City",
    likelihood: 18,
    noteTr: "Düşük öncelikli ama medya gündemi.",
    noteEn: "Low priority; media noise only.",
  },
  {
    id: "7",
    rank: 7,
    playerName: "Kylian Mbappé",
    fromClub: "Real Madrid",
    toClub: "Liverpool",
    likelihood: 12,
    noteTr: "Spekülatif; sözleşme stabil.",
    noteEn: "Speculative; contract stable.",
  },
  {
    id: "8",
    rank: 8,
    playerName: "Lamine Yamal",
    fromClub: "Barcelona",
    toClub: "PSG",
    likelihood: 9,
    noteTr: "Çıkış maddesi yok; uzun vadeli.",
    noteEn: "No release clause story; long-term.",
  },
];

export const TRANSFER_SCENARIOS_SORTED = [...TRANSFER_SCENARIOS].sort((a, b) => b.likelihood - a.likelihood);
