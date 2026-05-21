import { createClient } from "@supabase/supabase-js";
import {
  fetchAllTransferWireSources,
  relativeTimeLabel,
  wireItemId,
  type RawWireItem,
} from "@/lib/transfer-wire-rss";

export const TRANSFER_WIRE_CACHE_KEY = "transfer_wire_cache";
const CACHE_TTL_MS = 60 * 60 * 1000;

export type TransferWireHeadline = {
  id: string;
  title: string;
  link: string;
  source: string;
  sourceLabel: string;
  publishedAt: string;
  timeLabel: string;
};

function supabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}

function toHeadlines(items: RawWireItem[]): TransferWireHeadline[] {
  return items.map((r) => ({
    id: wireItemId(r.link, r.title),
    title: r.title,
    link: r.link,
    source: r.source,
    sourceLabel: r.sourceLabel,
    publishedAt: r.pubDate ? new Date(r.pubDate).toISOString() : "",
    timeLabel: relativeTimeLabel(r.pubDate),
  }));
}

async function writeCache(headlines: TransferWireHeadline[]): Promise<string> {
  const updatedAt = new Date().toISOString();
  const sb = supabaseAdmin();
  await sb.from("site_settings").upsert(
    {
      key: TRANSFER_WIRE_CACHE_KEY,
      value: { headlines, updatedAt },
      updated_at: updatedAt,
    },
    { onConflict: "key" },
  );
  return updatedAt;
}

export async function readTransferWireCache(): Promise<{
  headlines: TransferWireHeadline[];
  updatedAt: string | null;
  stale: boolean;
}> {
  const sb = supabaseAdmin();
  const { data } = await sb
    .from("site_settings")
    .select("value")
    .eq("key", TRANSFER_WIRE_CACHE_KEY)
    .maybeSingle();

  const v = data?.value as {
    headlines?: TransferWireHeadline[];
    updatedAt?: string;
  } | null;

  const headlines = v?.headlines ?? [];
  const updatedAt = v?.updatedAt ?? null;
  const empty = headlines.length === 0;
  const stale =
    empty ||
    !updatedAt ||
    Date.now() - new Date(updatedAt).getTime() > CACHE_TTL_MS;

  return { headlines, updatedAt, stale };
}

export async function syncTransferWireCache(): Promise<{
  ok: boolean;
  count: number;
  updatedAt: string | null;
  error?: string;
}> {
  try {
    const raw = await fetchAllTransferWireSources();
    const headlines = toHeadlines(raw);

    if (headlines.length === 0) {
      return {
        ok: false,
        count: 0,
        updatedAt: null,
        error: "All RSS sources returned no items",
      };
    }

    const updatedAt = await writeCache(headlines);
    return { ok: true, count: headlines.length, updatedAt };
  } catch (e) {
    return {
      ok: false,
      count: 0,
      updatedAt: null,
      error: (e as Error).message,
    };
  }
}

export async function getTransferWireHeadlines(
  forceRefresh = false,
): Promise<{
  headlines: TransferWireHeadline[];
  updatedAt: string | null;
  source: "cache" | "live";
  error?: string;
}> {
  const cached = await readTransferWireCache();
  const needFetch =
    forceRefresh || cached.stale || cached.headlines.length === 0;

  if (!needFetch) {
    return {
      headlines: cached.headlines,
      updatedAt: cached.updatedAt,
      source: "cache",
    };
  }

  const synced = await syncTransferWireCache();
  if (synced.ok && synced.count > 0) {
    const fresh = await readTransferWireCache();
    return {
      headlines: fresh.headlines,
      updatedAt: fresh.updatedAt,
      source: "live",
    };
  }

  if (cached.headlines.length > 0) {
    return {
      headlines: cached.headlines,
      updatedAt: cached.updatedAt,
      source: "cache",
      error: synced.error,
    };
  }

  return {
    headlines: [],
    updatedAt: synced.updatedAt,
    source: "live",
    error: synced.error ?? "Could not fetch transfer headlines",
  };
}
