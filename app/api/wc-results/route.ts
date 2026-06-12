import { NextResponse } from "next/server";
import { readWcMatchesCache } from "@/lib/hub-sync";

export type WcFinishedResult = {
  homeCode: string;
  awayCode: string;
  homeScore: number;
  awayScore: number;
};

export async function GET() {
  const cache = await readWcMatchesCache();

  const finished: WcFinishedResult[] = cache.matches
    .filter((m) => m.status === "ft")
    .map((m) => {
      const [h, a] = m.score.split("—").map((s) => parseInt(s.trim(), 10));
      return {
        homeCode: m.homeCode,
        awayCode: m.awayCode,
        homeScore: isNaN(h) ? 0 : h,
        awayScore: isNaN(a) ? 0 : a,
      };
    });

  return NextResponse.json(
    { results: finished, updatedAt: cache.updatedAt },
    { headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" } },
  );
}
