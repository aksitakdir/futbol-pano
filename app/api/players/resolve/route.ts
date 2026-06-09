import { NextResponse } from "next/server";
import { resolvePlayer } from "@/lib/player-resolver";

/**
 * GET /api/players/resolve?name=Erling+Haaland
 *
 * Server-side player resolver — runs the full 4-tier fallback chain:
 * fc_players → player_cache → BSD API → API-Football.
 *
 * Returns PlayerCardData or 404. Auto-caches results from API tiers.
 */
export async function GET(req: Request) {
  const name = new URL(req.url).searchParams.get("name");
  if (!name?.trim()) {
    return NextResponse.json({ error: "Missing 'name' parameter" }, { status: 400 });
  }

  try {
    const card = await resolvePlayer(name.trim(), true);
    if (!card) {
      return NextResponse.json(
        { error: "Player not found in any source", name: name.trim() },
        { status: 404 },
      );
    }
    return NextResponse.json(card);
  } catch (err) {
    console.error("[players/resolve] Error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
