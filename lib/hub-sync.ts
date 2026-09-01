import { createClient } from "@supabase/supabase-js";
import { syncTransferWireCache } from "@/lib/transfer-wire-cache";
import { TRANSFER_SCENARIOS } from "@/lib/transfer-scenarios";
import { COMPLETED_TRANSFERS } from "@/lib/completed-transfers";
import type { LiveScoreMatch } from "@/lib/wc-match";

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

/**
 * The single point where World Cup match data used to leave the site.
 *
 * The 2026 World Cup finished on 19 July 2026. Every score is final, so there is
 * nothing left to fetch: this now returns what is already stored and calls no
 * external API and writes nothing. Every caller — /api/wc-results and
 * /api/cron/hub-sync — is covered by closing this one door rather than each of
 * them separately.
 *
 * The stored results are untouched and the schedule pages still render them.
 *
 * TO REVIVE FOR A FUTURE TOURNAMENT: restore the body from git history
 * (`git log -- lib/hub-sync.ts`), which fetches football-data.org first and
 * api-football.com as a fallback, then merges the response with any finished
 * fixtures that have aged out of the API's rolling window.
 */
export async function syncWcMatchesCache(): Promise<{ ok: boolean; count: number; source: string; error?: string }> {
  const existing = await readWcMatchesCache();
  return {
    ok: true,
    count: existing.matches.length,
    source: existing.source || "stored",
  };
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
