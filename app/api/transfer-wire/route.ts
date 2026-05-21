import { NextRequest, NextResponse } from "next/server";
import { getTransferWireHeadlines } from "@/lib/transfer-wire-cache";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(request: NextRequest) {
  const forceRefresh =
    request.nextUrl.searchParams.get("refresh") === "1" ||
    request.nextUrl.searchParams.get("sync") === "1";

  const result = await getTransferWireHeadlines(forceRefresh);

  const sourceCounts: Record<string, number> = {};
  for (const h of result.headlines) {
    sourceCounts[h.source] = (sourceCounts[h.source] ?? 0) + 1;
  }

  return NextResponse.json(
    {
      headlines: result.headlines,
      updatedAt: result.updatedAt,
      source: result.source,
      total: result.headlines.length,
      sourceCounts,
      error: result.error,
    },
    {
      headers: {
        "Cache-Control":
          result.headlines.length > 0
            ? "public, s-maxage=300, stale-while-revalidate=600"
            : "no-store",
      },
    },
  );
}
