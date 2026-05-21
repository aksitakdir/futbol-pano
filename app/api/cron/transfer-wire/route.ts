import { NextRequest, NextResponse } from "next/server";
import { syncTransferWireCache } from "@/lib/transfer-wire-cache";

export const maxDuration = 60;

/** Hourly RSS sync — only Vercel cron + CRON_SECRET. Zero cost per page view. */
export async function GET(request: NextRequest) {
  const secret = request.headers.get("authorization")?.replace("Bearer ", "");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || secret !== cronSecret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await syncTransferWireCache({ bypassCooldown: false });

  return NextResponse.json({
    ok: result.ok,
    count: result.count,
    skipped: result.skipped ?? false,
    updatedAt: result.updatedAt,
    error: result.error,
    at: new Date().toISOString(),
  });
}
