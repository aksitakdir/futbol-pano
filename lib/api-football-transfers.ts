/** API-Football (api-sports.io) — ücretsiz plan: günlük kota, transfers endpoint */
const API_BASE = "https://v3.football.api-sports.io";

/** Popüler kulüp ID'leri — transfer sync için */
export const API_FOOTBALL_TEAM_IDS = [
  33, 40, 42, 49, 50, 47, // PL top
  529, 541, 530, // La Liga
  157, 165, 168, // Bundesliga
  85, 81, // Ligue 1
  645, 611, // TR
];

type ApiTransferEntry = {
  date: string;
  type: string;
  teams: { in: { name: string }; out: { name: string } };
};

type ApiTransferBlock = {
  player: { id: number; name: string };
  update: string;
  transfers: ApiTransferEntry[];
};

export type ParsedCompletedTransfer = {
  externalId: string;
  playerName: string;
  fromClub: string;
  toClub: string;
  feeEn: string;
  feeTr: string;
  transferDate: string;
};

function feeLabel(type: string): { tr: string; en: string } {
  const t = type.toLowerCase();
  if (t.includes("loan")) return { tr: "Kiralık", en: "Loan" };
  if (t.includes("free")) return { tr: "Serbest", en: "Free" };
  return { tr: "Bonservis", en: "Fee undisclosed" };
}

export async function fetchApiFootballTransfers(apiKey: string, season = 2025): Promise<ParsedCompletedTransfer[]> {
  const all: ParsedCompletedTransfer[] = [];
  const seen = new Set<string>();

  for (const teamId of API_FOOTBALL_TEAM_IDS) {
    const url = `${API_BASE}/transfers?team=${teamId}&season=${season}`;
    const res = await fetch(url, {
      headers: { "x-apisports-key": apiKey },
      next: { revalidate: 3600 },
    });
    if (!res.ok) continue;

    const json = (await res.json()) as { response?: ApiTransferBlock[] };
    for (const block of json.response ?? []) {
      const latest = block.transfers?.[0];
      if (!latest) continue;
      const externalId = `${block.player.id}-${latest.date}-${latest.teams.in.name}-${latest.teams.out.name}`;
      if (seen.has(externalId)) continue;
      seen.add(externalId);

      const fee = feeLabel(latest.type);
      all.push({
        externalId,
        playerName: block.player.name,
        fromClub: latest.teams.out.name,
        toClub: latest.teams.in.name,
        feeEn: fee.en,
        feeTr: fee.tr,
        transferDate: latest.date.slice(0, 7),
      });
    }
  }

  all.sort((a, b) => b.transferDate.localeCompare(a.transferDate));
  return all.slice(0, 40);
}
