import { supabase } from "@/lib/supabase";
import { positionBucket, type PositionBucket } from "@/lib/position-buckets";
import { getWcTeam } from "@/lib/wc-2026-teams";
import { WC_SQUAD_SEEDS, type WcSquadSeedPlayer } from "@/lib/wc-squad-seeds";
import { fetchWcSquadFromDb } from "@/lib/wc-squad-db";
import type { PlayerCardData } from "@/app/components/player-card";

export type WcSquadListPlayer = {
  id?: string;
  name: string;
  position: string;
  club: string;
  bucket: PositionBucket;
  /** Liste chip rengi — FC veya admin override */
  overall: number | null;
  hasFcCard: boolean;
  /** For the card panel; filled in one batch on page load, written to the DOM only when opened */
  fcCard?: PlayerCardData;
};

type FcRow = {
  name: string;
  overall: number;
  pace: number | null;
  shooting: number | null;
  passing: number | null;
  dribbling: number | null;
  defending: number | null;
  physical: number | null;
  position: string | null;
  club: string | null;
  league: string | null;
  age: string | number | null;
  photo_url: string | null;
};

function normalizeName(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ı/g, "i")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .trim();
}

function fcToCard(row: FcRow): PlayerCardData {
  return {
    name: row.name,
    club: row.club ?? "",
    league: row.league ?? "",
    position: row.position ?? "",
    age: row.age ?? "",
    overall: row.overall,
    pace: row.pace ?? 0,
    shooting: row.shooting ?? 0,
    passing: row.passing ?? 0,
    dribbling: row.dribbling ?? 0,
    defending: row.defending ?? 0,
    physical: row.physical ?? 0,
    photo_url: row.photo_url ?? undefined,
  };
}

function buildFcNameMap(rows: FcRow[]): Map<string, FcRow> {
  const m = new Map<string, FcRow>();
  for (const row of rows) {
    if (!row.overall) continue;
    const key = normalizeName(row.name);
    const prev = m.get(key);
    if (!prev || row.overall > prev.overall) m.set(key, row);
  }
  return m;
}

function findFcMatch(name: string, map: Map<string, FcRow>): FcRow | undefined {
  const key = normalizeName(name);
  if (map.has(key)) return map.get(key);
  const parts = name.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    const last = normalizeName(parts[parts.length - 1]!);
    for (const [k, row] of map) {
      if (k.endsWith(last) || k.includes(last)) return row;
    }
  }
  return undefined;
}

async function loadFcPool(nationalityQuery: string): Promise<Map<string, FcRow>> {
  const { data } = await supabase
    .from("fc_players")
    .select("name,overall,pace,shooting,passing,dribbling,defending,physical,position,club,league,age,photo_url")
    .ilike("nationality", `%${nationalityQuery}%`)
    .order("overall", { ascending: false })
    .limit(120);

  return buildFcNameMap((data ?? []) as FcRow[]);
}

type BasePlayer = {
  id?: string;
  name: string;
  position: string;
  club: string;
  bucket: PositionBucket;
  overallOverride: number | null;
};

async function resolveBasePlayers(teamSlug: string): Promise<BasePlayer[]> {
  const dbRows = await fetchWcSquadFromDb(teamSlug);
  if (dbRows.length > 0) {
    return dbRows.map((r) => ({
      id: r.id,
      name: r.player_name,
      position: r.position,
      club: r.club ?? "",
      bucket: r.position_bucket,
      overallOverride: r.overall_override,
    }));
  }

  const seed = WC_SQUAD_SEEDS[teamSlug] ?? [];
  return seed.map((p: WcSquadSeedPlayer) => ({
    name: p.name,
    position: p.position,
    club: p.club ?? "",
    bucket: positionBucket(p.position),
    overallOverride: null,
  }));
}

/** Single-batch FC query — no N+1; cards are not rendered by default */
export async function loadWcSquad(teamSlug: string): Promise<WcSquadListPlayer[]> {
  const team = getWcTeam(teamSlug);
  if (!team) return [];

  const base = await resolveBasePlayers(teamSlug);
  if (base.length === 0) return [];

  const fcMap = await loadFcPool(team.nationalityQuery);

  return base.map((p) => {
    const fc = findFcMatch(p.name, fcMap);
    const overall = p.overallOverride ?? fc?.overall ?? null;
    const hasFcCard = !!fc?.overall;
    return {
      id: p.id,
      name: p.name,
      position: p.position,
      club: p.club || fc?.club || "",
      bucket: p.bucket,
      overall,
      hasFcCard,
      fcCard: hasFcCard && fc ? fcToCard(fc) : undefined,
    };
  });
}

/** @deprecated use WcSquadListPlayer */
export type WcSquadPlayer = WcSquadListPlayer & PlayerCardData;

export function groupSquadByBucket(players: WcSquadListPlayer[]): Map<PositionBucket, WcSquadListPlayer[]> {
  const map = new Map<PositionBucket, WcSquadListPlayer[]>();
  for (const p of players) {
    const list = map.get(p.bucket) ?? [];
    list.push(p);
    map.set(p.bucket, list);
  }
  return map;
}
