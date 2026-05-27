export type HubTransferScenarioRow = {
  id: string;
  sort_rank: number;
  player_name: string;
  from_club: string;
  to_club: string;
  likelihood: number;
  note_tr: string;
  note_en: string;
  is_published: boolean;
  source: string;
  external_id: string | null;
  updated_at: string;
};

export type HubCompletedTransferRow = {
  id: string;
  player_name: string;
  from_club: string;
  to_club: string;
  fee_tr: string;
  fee_en: string;
  transfer_date: string;
  sort_order: number;
  is_published: boolean;
  source: string;
  external_id: string | null;
  updated_at: string;
};

export type HubTransferScenario = {
  id: string;
  playerName: string;
  fromClub: string;
  toClub: string;
  likelihood: number;
  note: string;
};

export type HubCompletedTransfer = {
  id: string;
  playerName: string;
  fromClub: string;
  toClub: string;
  feeTr: string;
  feeEn: string;
  date: string;
};

export type HubPillarCopy = {
  navLabel?: string;
  pillarEyebrow?: string;
  pillarTitle?: string;
  pillarDescription?: string;
};

export function rowToScenario(r: HubTransferScenarioRow): HubTransferScenario {
  return {
    id: r.id,
    playerName: r.player_name,
    fromClub: r.from_club,
    toClub: r.to_club,
    likelihood: r.likelihood,
    note: r.note_en ?? r.note_tr ?? "",
  };
}

export function rowToCompleted(r: HubCompletedTransferRow): HubCompletedTransfer {
  return {
    id: r.id,
    playerName: r.player_name,
    fromClub: r.from_club,
    toClub: r.to_club,
    feeTr: r.fee_tr ?? "",
    feeEn: r.fee_en ?? "",
    date: r.transfer_date,
  };
}
