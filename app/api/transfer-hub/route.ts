import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { rowToCompleted, rowToScenario } from "@/lib/hub-types";
import type { HubCompletedTransferRow, HubTransferScenarioRow } from "@/lib/hub-types";
import { TRANSFER_SCENARIOS_SORTED } from "@/lib/transfer-scenarios";
import { COMPLETED_TRANSFERS } from "@/lib/completed-transfers";
import { seedCompletedTransfersIfEmpty, seedTransferScenariosIfEmpty, syncCompletedTransfersFromApi } from "@/lib/hub-sync";

const CACHE_TTL_MS = 60 * 60 * 1000;

function supabase() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
}

export async function GET(request: Request) {
  const forceSync = new URL(request.url).searchParams.get("sync") === "1";
  const sb = supabase();

  await seedTransferScenariosIfEmpty();
  await seedCompletedTransfersIfEmpty();

  const { data: syncMeta } = await sb.from("site_settings").select("value").eq("key", "hub_transfers_sync_at").maybeSingle();
  const lastSync = (syncMeta?.value as { at?: string } | null)?.at;
  const stale = !lastSync || Date.now() - new Date(lastSync).getTime() > CACHE_TTL_MS;

  if ((forceSync || stale) && process.env.API_FOOTBALL_KEY) {
    await syncCompletedTransfersFromApi();
    await sb.from("site_settings").upsert(
      { key: "hub_transfers_sync_at", value: { at: new Date().toISOString() }, updated_at: new Date().toISOString() },
      { onConflict: "key" },
    );
  }

  const [{ data: scenarios }, { data: completed }] = await Promise.all([
    sb
      .from("hub_transfer_scenarios")
      .select("*")
      .eq("is_published", true)
      .order("likelihood", { ascending: false })
      .order("sort_rank", { ascending: false }),
    sb
      .from("hub_completed_transfers")
      .select("*")
      .eq("is_published", true)
      .order("sort_order", { ascending: false })
      .order("transfer_date", { ascending: false })
      .limit(30),
  ]);

  const scenarioList =
    (scenarios as HubTransferScenarioRow[] | null)?.length
      ? (scenarios as HubTransferScenarioRow[]).map(rowToScenario)
      : TRANSFER_SCENARIOS_SORTED.map((s) => ({
          id: s.id,
          playerName: s.playerName,
          fromClub: s.fromClub,
          toClub: s.toClub,
          likelihood: s.likelihood,
          noteTr: s.noteTr,
          noteEn: s.noteEn,
        }));

  const completedList =
    (completed as HubCompletedTransferRow[] | null)?.length
      ? (completed as HubCompletedTransferRow[]).map(rowToCompleted)
      : COMPLETED_TRANSFERS.map((t) => ({
          id: t.id,
          playerName: t.playerName,
          fromClub: t.fromClub,
          toClub: t.toClub,
          feeTr: t.feeTr,
          feeEn: t.feeEn,
          date: t.date,
        }));

  return NextResponse.json(
    {
      scenarios: scenarioList,
      completed: completedList,
      source: {
        scenarios: (scenarios?.length ?? 0) > 0 ? "database" : "static",
        completed: (completed?.length ?? 0) > 0 ? "database" : "static",
      },
    },
    { headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" } },
  );
}
