import { NextRequest, NextResponse } from "next/server";
import {
  getPublicTransferWire,
  syncTransferWireCache,
} from "@/lib/transfer-wire-cache";

/** Public GET is cache-only. RSS sync runs on cron / authorized sync only. */
export const dynamic = "force-dynamic";

const CDN_CACHE =
  "public, s-maxage=300, stale-while-revalidate=300, max-age=60";

function wireJson(
  body: Record<string, unknown>,
  status = 200,
  noStore = false,
) {
  return NextResponse.json(body, {
    status,
    headers: {
      "Cache-Control": noStore || !((body.total as number) > 0) ? "no-store" : CDN_CACHE,
    },
  });
}

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  // Authorized force-sync (cron / secret holder) bypasses the cooldown.
  const forceSync = params.get("refresh") === "1" || params.get("sync") === "1";
  // Public live sync (Reload button + stale auto-refresh): runs a real RSS pull but
  // is rate-limited by the 15-min cooldown, so visitor traffic can never spike RSS.
  const liveSync = params.get("live") === "1";

  if (forceSync || liveSync) {
    let bypassCooldown = false;

    if (forceSync) {
      const secret = request.headers.get("authorization")?.replace("Bearer ", "");
      const cronSecret = process.env.CRON_SECRET;
      if (!cronSecret || secret !== cronSecret) {
        const cached = await getPublicTransferWire();
        return wireJson({
          headlines: cached.headlines,
          updatedAt: cached.updatedAt,
          source: cached.source,
          stale: cached.stale,
          total: cached.headlines.length,
          sourceCounts: countSources(cached.headlines),
          syncRejected: true,
          message: "Unauthorized force-sync — use ?live=1 for the rate-limited public refresh.",
        });
      }
      bypassCooldown = true;
    }

    const synced = await syncTransferWireCache({ bypassCooldown });
    return wireJson(
      {
        headlines: synced.headlines,
        updatedAt: synced.updatedAt,
        source: synced.skipped ? "cache" : "live",
        total: synced.headlines.length,
        sourceCounts: countSources(synced.headlines),
        skipped: synced.skipped,
        error: synced.error,
      },
      200,
      true, // never CDN-cache a sync response
    );
  }

  const cached = await getPublicTransferWire();
  return wireJson({
    headlines: cached.headlines,
    updatedAt: cached.updatedAt,
    source: cached.source,
    stale: cached.stale,
    total: cached.headlines.length,
    sourceCounts: countSources(cached.headlines),
  });
}

function countSources(
  headlines: { source: string }[],
): Record<string, number> {
  const c: Record<string, number> = {};
  for (const h of headlines) {
    c[h.source] = (c[h.source] ?? 0) + 1;
  }
  return c;
}
