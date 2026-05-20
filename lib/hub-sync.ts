import { createClient } from "@supabase/supabase-js";
import { fetchFootballDataMatches } from "@/lib/football-data-matches";
import { fetchApiFootballTransfers } from "@/lib/api-football-transfers";
import { TRANSFER_SCENARIOS } from "@/lib/transfer-scenarios";
import { COMPLETED_TRANSFERS } from "@/lib/completed-transfers";
import type { LiveScoreMatch } from "@/app/api/wc-live-scores/route";

function supabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createClient(url, key);
}

const WC_CACHE_KEY = "hub_wc_matches_cache";

export async function syncWcMatchesCache(): Promise<{ ok: boolean; count: number; source: string; error?: string }> {
  const supabase = supabaseAdmin();
  const apiKey = process.env.FOOTBALL_DATA_API_KEY;

  let matches: LiveScoreMatch[] = [];
  let source = "fallback";

  if (apiKey) {
    try {
      matches = await fetchFootballDataMatches(apiKey);
      source = "football-data.org";
    } catch (e) {
      return { ok: false, count: 0, source, error: (e as Error).message };
    }
  }

  await supabase.from("site_settings").upsert(
    {
      key: WC_CACHE_KEY,
      value: { matches, source, updatedAt: new Date().toISOString() },
      updated_at: new Date().toISOString(),
    },
    { onConflict: "key" },
  );

  return { ok: true, count: matches.length, source };
}

export async function readWcMatchesCache(): Promise<{
  matches: LiveScoreMatch[];
  source: string;
  updatedAt: string | null;
}> {
  const supabase = supabaseAdmin();
  const { data } = await supabase.from("site_settings").select("value").eq("key", WC_CACHE_KEY).maybeSingle();
  const v = data?.value as { matches?: LiveScoreMatch[]; source?: string; updatedAt?: string } | null;
  return {
    matches: v?.matches ?? [],
    source: v?.source ?? "cache",
    updatedAt: v?.updatedAt ?? null,
  };
}

export async function seedTransferScenariosIfEmpty(): Promise<number> {
  const supabase = supabaseAdmin();
  const { count } = await supabase.from("hub_transfer_scenarios").select("*", { count: "exact", head: true });
  if ((count ?? 0) > 0) return 0;

  const rows = TRANSFER_SCENARIOS.map((s) => ({
    sort_rank: s.rank,
    player_name: s.playerName,
    from_club: s.fromClub,
    to_club: s.toClub,
    likelihood: s.likelihood,
    note_tr: s.noteTr,
    note_en: s.noteEn,
    source: "seed",
    is_published: true,
  }));
  await supabase.from("hub_transfer_scenarios").insert(rows);
  return rows.length;
}

export async function seedCompletedTransfersIfEmpty(): Promise<number> {
  const supabase = supabaseAdmin();
  const { count } = await supabase.from("hub_completed_transfers").select("*", { count: "exact", head: true });
  if ((count ?? 0) > 0) return 0;

  const rows = COMPLETED_TRANSFERS.map((t, i) => ({
    player_name: t.playerName,
    from_club: t.fromClub,
    to_club: t.toClub,
    fee_tr: t.feeTr,
    fee_en: t.feeEn,
    transfer_date: t.date,
    sort_order: COMPLETED_TRANSFERS.length - i,
    source: "seed",
    is_published: true,
  }));
  await supabase.from("hub_completed_transfers").insert(rows);
  return rows.length;
}

export async function syncCompletedTransfersFromApi(): Promise<{ ok: boolean; upserted: number; error?: string }> {
  const apiKey = process.env.API_FOOTBALL_KEY;
  if (!apiKey) return { ok: false, upserted: 0, error: "API_FOOTBALL_KEY missing" };

  const supabase = supabaseAdmin();
  let parsed;
  try {
    parsed = await fetchApiFootballTransfers(apiKey);
  } catch (e) {
    return { ok: false, upserted: 0, error: (e as Error).message };
  }

  let upserted = 0;
  for (const [i, t] of parsed.entries()) {
    const row = {
      player_name: t.playerName,
      from_club: t.fromClub,
      to_club: t.toClub,
      fee_tr: t.feeTr,
      fee_en: t.feeEn,
      transfer_date: t.transferDate,
      sort_order: 1000 - i,
      source: "api",
      external_id: t.externalId,
      is_published: true,
      updated_at: new Date().toISOString(),
    };
    const { data: existing } = await supabase
      .from("hub_completed_transfers")
      .select("id")
      .eq("external_id", t.externalId)
      .maybeSingle();
    const { error } = existing
      ? await supabase.from("hub_completed_transfers").update(row).eq("id", existing.id)
      : await supabase.from("hub_completed_transfers").insert(row);
    if (!error) upserted++;
  }

  return { ok: true, upserted };
}

export async function syncAllHubData(): Promise<Record<string, unknown>> {
  await seedTransferScenariosIfEmpty();
  await seedCompletedTransfersIfEmpty();

  const [wc, transfers] = await Promise.all([syncWcMatchesCache(), syncCompletedTransfersFromApi()]);

  return {
    wc,
    transfers,
    seeded: true,
    at: new Date().toISOString(),
  };
}
