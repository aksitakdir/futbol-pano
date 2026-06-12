import { createClient } from "@supabase/supabase-js";
import { fetchFootballDataMatches } from "@/lib/football-data-matches";
import { fetchApiFootballWcMatches } from "@/lib/api-football-wc";
import { syncTransferWireCache } from "@/lib/transfer-wire-cache";
import { TRANSFER_SCENARIOS } from "@/lib/transfer-scenarios";
import { COMPLETED_TRANSFERS } from "@/lib/completed-transfers";
import type { LiveScoreMatch } from "@/app/api/wc-live-scores/route";

function supabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  // Server-only sync/seed code: prefer the service-role key so these writes
  // keep working once RLS is locked down. Falls back to anon for local dev.
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createClient(url, key);
}

const WC_CACHE_KEY = "hub_wc_matches_cache";

export async function syncWcMatchesCache(): Promise<{ ok: boolean; count: number; source: string; error?: string }> {
  const supabase = supabaseAdmin();
  const fdKey = process.env.FOOTBALL_DATA_API_KEY;
  const afKey = process.env.FOOTBALL_API_KEY;

  let freshMatches: LiveScoreMatch[] = [];
  let source = "fallback";

  if (fdKey) {
    try {
      freshMatches = await fetchFootballDataMatches(fdKey);
      source = "football-data.org";
    } catch (e) {
      return { ok: false, count: 0, source, error: (e as Error).message };
    }
  } else if (afKey) {
    try {
      freshMatches = await fetchApiFootballWcMatches(afKey);
      source = "api-football.com";
    } catch (e) {
      return { ok: false, count: 0, source: "api-football.com", error: (e as Error).message };
    }
  }

  // Merge: keep previously cached finished results that may have fallen
  // outside the API's rolling date window (-3d to +21d).
  const existing = await readWcMatchesCache();
  const existingFinished = existing.matches.filter((m) => m.status === "ft");
  const freshIds = new Set(freshMatches.map((m) => m.id));
  const preserved = existingFinished.filter((m) => !freshIds.has(m.id));
  const matches = [...freshMatches, ...preserved];

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
  const raw = data?.value;
  const v = (typeof raw === "string" ? JSON.parse(raw) : raw) as { matches?: LiveScoreMatch[]; source?: string; updatedAt?: string } | null;
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
    note_tr: s.note,
    note_en: s.note,
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

/**
 * Disabled: api-football transfer sync was never functional (env key mismatch)
 * and free plan doesn't cover 2025+ seasons. Transfer Wire (RSS) handles
 * transfer news. api-football budget reserved for content enrichment instead.
 */
export async function syncCompletedTransfersFromApi(): Promise<{ ok: boolean; upserted: number; error?: string }> {
  return { ok: true, upserted: 0, error: "Transfer sync disabled — using Transfer Wire (RSS) instead" };
}

export async function syncAllHubData(): Promise<Record<string, unknown>> {
  await seedTransferScenariosIfEmpty();
  await seedCompletedTransfersIfEmpty();

  const [wc, transfers, wire] = await Promise.all([
    syncWcMatchesCache(),
    syncCompletedTransfersFromApi(),
    syncTransferWireCache(),
  ]);

  return {
    wc,
    transfers,
    wire,
    seeded: true,
    at: new Date().toISOString(),
  };
}
