import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

type PillarCopy = {
  navLabel?: string;
  pillarEyebrow?: string;
  pillarTitle?: string;
  pillarDescription?: string;
};

const DEFAULTS: Record<string, PillarCopy> = {
  "wc-2026": {
    navLabel: "WC 2026",
    pillarEyebrow: "TOURNAMENT",
    pillarTitle: "World Cup 2026",
    pillarDescription: "Squads, scout analysis, and tournament lists — not headlines, scout reports.",
  },
  transfer: {
    navLabel: "TRANSFERS",
    pillarEyebrow: "TRANSFERS",
    pillarTitle: "Transfers",
    pillarDescription: "Transfer Wire — rumors from trusted public sources, scout analysis, and confirmed deals.",
  },
};

function settingsKey(id: string, locale: string) {
  return `hub_copy_${id}_${locale}`;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const hubId = url.searchParams.get("hub");
  const locale = url.searchParams.get("locale") === "en" ? "en" : "en";

  if (!hubId || !DEFAULTS[hubId]) {
    return NextResponse.json({ error: "Invalid hub" }, { status: 400 });
  }

  const defaults = DEFAULTS[hubId];
  const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
  const { data } = await sb.from("site_settings").select("value").eq("key", settingsKey(hubId, locale)).maybeSingle();

  const override = (data?.value ?? {}) as PillarCopy;

  return NextResponse.json({
    hubId,
    locale,
    copy: {
      navLabel: override.navLabel ?? defaults.navLabel,
      pillarEyebrow: override.pillarEyebrow ?? defaults.pillarEyebrow,
      pillarTitle: override.pillarTitle ?? defaults.pillarTitle,
      pillarDescription: override.pillarDescription ?? defaults.pillarDescription,
    },
  });
}
