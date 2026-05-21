import { NextRequest, NextResponse } from "next/server";
import { getTransferWireHeadlines } from "@/lib/transfer-wire-cache";

export async function GET(request: NextRequest) {
  const forceRefresh = request.nextUrl.searchParams.get("refresh") === "1";
  const result = await getTransferWireHeadlines(forceRefresh);

  return NextResponse.json(
    {
      headlines: result.headlines,
      updatedAt: result.updatedAt,
      source: result.source,
    },
    {
      headers: {
        "Cache-Control": "public, s-maxage=600, stale-while-revalidate=1800",
      },
    },
  );
}
