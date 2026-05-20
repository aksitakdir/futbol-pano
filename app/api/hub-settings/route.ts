import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { HUBS, type HubId, type HubLocale } from "@/lib/hub-config";
import type { HubPillarCopy } from "@/lib/hub-types";

function settingsKey(hubId: HubId, locale: HubLocale) {
  return `hub_copy_${hubId}_${locale}`;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const hubId = url.searchParams.get("hub") as HubId | null;
  const locale = (url.searchParams.get("locale") === "en" ? "en" : "tr") as HubLocale;

  if (!hubId || !HUBS[hubId]) {
    return NextResponse.json({ error: "Invalid hub" }, { status: 400 });
  }

  const defaults = HUBS[hubId][locale];
  const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
  const { data } = await sb.from("site_settings").select("value").eq("key", settingsKey(hubId, locale)).maybeSingle();

  const override = (data?.value ?? {}) as HubPillarCopy;

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
