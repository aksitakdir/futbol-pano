import { NextRequest, NextResponse } from "next/server";
import {
  getPublicTransferWire,
  syncTransferWireCache,
} from "@/lib/transfer-wire-cache";

/** Public GET is cache-only. RSS sync runs on cron / authorized sync only. */
export const dynamic = "force-dynamic";

const CDN_CACHE =
  "public, s-maxage=3600, stale-while-revalidate=86400, max-age=300";

function wireJson(
  body: Record<string, unknown>,
  status = 200,
) {
  return NextResponse.json(body, {
    status,
    headers: {
      "Cache-Control": (body.total as number) > 0 ? CDN_CACHE : "no-store",
    },
  });
}

export async function GET(request: NextRequest) {
  const wantsSync =
    request.nextUrl.searchParams.get("refresh") === "1" ||
    request.nextUrl.searchParams.get("sync") === "1";

  if (wantsSync) {
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
        message: "Public refresh disabled. Feed syncs via hourly cron.",
      });
    }
    const synced = await syncTransferWireCache({ bypassCooldown: false });
    return wireJson({
      headlines: synced.headlines,
      updatedAt: synced.updatedAt,
      source: synced.skipped ? "cache" : "live",
      total: synced.headlines.length,
      sourceCounts: countSources(synced.headlines),
      skipped: synced.skipped,
      error: synced.error,
    });
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
