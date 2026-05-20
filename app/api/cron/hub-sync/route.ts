import { NextRequest, NextResponse } from "next/server";
import { syncAllHubData } from "@/lib/hub-sync";

export async function GET(request: NextRequest) {
  const secret = request.headers.get("authorization")?.replace("Bearer ", "");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || secret !== cronSecret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await syncAllHubData();
  return NextResponse.json({ ok: true, ...result });
}
