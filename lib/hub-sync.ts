import { createClient } from "@supabase/supabase-js";
import { syncTransferWireCache } from "@/lib/transfer-wire-cache";
import { TRANSFER_SCENARIOS } from "@/lib/transfer-scenarios";
import { COMPLETED_TRANSFERS } from "@/lib/completed-transfers";

function supabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  // Server-only sync/seed code: prefer the service-role key so these writes
  // keep working once RLS is locked down. Falls back to anon for local dev.
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createClient(url, key);
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

  // No World Cup entry any more: the 2026 tournament is over and its results are
  // frozen in lib/wc-2026-results.ts, so there is nothing left to sync.
  const [transfers, wire] = await Promise.all([
    syncCompletedTransfersFromApi(),
    syncTransferWireCache(),
  ]);

  return {
    transfers,
    wire,
    seeded: true,
    at: new Date().toISOString(),
  };
}
