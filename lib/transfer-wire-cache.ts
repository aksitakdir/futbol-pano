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
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createClient(url, key);
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

async function writeCache(headlines: TransferWireHeadline[]): Promise<{
  updatedAt: string;
  ok: boolean;
  error?: string;
}> {
  const updatedAt = new Date().toISOString();
  const sb = supabaseAdmin();
  const { error } = await sb.from("site_settings").upsert(
    {
      key: TRANSFER_WIRE_CACHE_KEY,
      value: { headlines, updatedAt },
      updated_at: updatedAt,
    },
    { onConflict: "key" },
  );
  if (error) {
    return { updatedAt, ok: false, error: error.message };
  }
  return { updatedAt, ok: true };
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
  headlines: TransferWireHeadline[];
  updatedAt: string | null;
  cacheWritten: boolean;
  error?: string;
}> {
  try {
    const raw = await fetchAllTransferWireSources();
    const headlines = toHeadlines(raw);

    if (headlines.length === 0) {
      return {
        ok: false,
        count: 0,
        headlines: [],
        updatedAt: null,
        cacheWritten: false,
        error: "All RSS sources returned no items",
      };
    }

    const written = await writeCache(headlines);
    return {
      ok: true,
      count: headlines.length,
      headlines,
      updatedAt: written.updatedAt,
      cacheWritten: written.ok,
      error: written.ok ? undefined : written.error,
    };
  } catch (e) {
    return {
      ok: false,
      count: 0,
      headlines: [],
      updatedAt: null,
      cacheWritten: false,
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
  if (synced.ok && synced.headlines.length > 0) {
    if (synced.cacheWritten) {
      const fresh = await readTransferWireCache();
      if (fresh.headlines.length > 0) {
        return {
          headlines: fresh.headlines,
          updatedAt: fresh.updatedAt,
          source: "cache",
        };
      }
    }
    return {
      headlines: synced.headlines,
      updatedAt: synced.updatedAt,
      source: "live",
      error: synced.cacheWritten ? undefined : synced.error,
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
