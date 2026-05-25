import { createClient } from "@supabase/supabase-js";
import {
  fetchAllTransferWireSources,
  relativeTimeLabel,
  safePublishedIso,
  wireItemId,
  type RawWireItem,
} from "@/lib/transfer-wire-rss";

export const TRANSFER_WIRE_CACHE_KEY = "transfer_wire_cache";

/** How long cached headlines are served to visitors without re-fetching RSS */
export const TRANSFER_WIRE_CACHE_TTL_MS = 2 * 60 * 60 * 1000; // 2 hours

/** Min gap between RSS pulls (cron + rare manual sync) — protects Vercel from traffic spikes */
export const TRANSFER_WIRE_SYNC_COOLDOWN_MS = 15 * 60 * 1000; // 15 min

export type TransferWireHeadline = {
  id: string;
  title: string;
  link: string;
  source: string;
  sourceLabel: string;
  publishedAt: string;
  timeLabel: string;
};

type CachePayload = {
  headlines: TransferWireHeadline[];
  updatedAt: string;
  lastSyncAt?: string;
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
    publishedAt: safePublishedIso(r.pubDate),
    timeLabel: relativeTimeLabel(r.pubDate),
  }));
}

async function writeCache(
  headlines: TransferWireHeadline[],
  lastSyncAt: string,
): Promise<{ updatedAt: string; ok: boolean; error?: string }> {
  const updatedAt = new Date().toISOString();
  const sb = supabaseAdmin();
  const { error } = await sb.from("site_settings").upsert(
    {
      key: TRANSFER_WIRE_CACHE_KEY,
      value: { headlines, updatedAt, lastSyncAt } satisfies CachePayload,
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
  lastSyncAt: string | null;
  stale: boolean;
}> {
  const sb = supabaseAdmin();
  const { data } = await sb
    .from("site_settings")
    .select("value")
    .eq("key", TRANSFER_WIRE_CACHE_KEY)
    .maybeSingle();

  let v = data?.value as CachePayload | string | null;
  if (typeof v === "string") {
    try { v = JSON.parse(v) as CachePayload; } catch { v = null; }
  }
  const parsed = v as CachePayload | null;
  const headlines = parsed?.headlines ?? [];
  const updatedAt = parsed?.updatedAt ?? null;
  const lastSyncAt = parsed?.lastSyncAt ?? updatedAt;
  const empty = headlines.length === 0;
  const age = updatedAt ? Date.now() - new Date(updatedAt).getTime() : Infinity;
  const stale = empty || !updatedAt || age > TRANSFER_WIRE_CACHE_TTL_MS;

  return { headlines, updatedAt, lastSyncAt, stale };
}

function canRunSync(lastSyncAt: string | null, bypassCooldown: boolean): boolean {
  if (bypassCooldown) return true;
  if (!lastSyncAt) return true;
  return Date.now() - new Date(lastSyncAt).getTime() >= TRANSFER_WIRE_SYNC_COOLDOWN_MS;
}

/** RSS pull — only cron, admin server action, or authorized sync route */
export async function syncTransferWireCache(options?: {
  bypassCooldown?: boolean;
}): Promise<{
  ok: boolean;
  count: number;
  headlines: TransferWireHeadline[];
  updatedAt: string | null;
  cacheWritten: boolean;
  skipped?: boolean;
  error?: string;
}> {
  const cached = await readTransferWireCache();
  if (!canRunSync(cached.lastSyncAt, options?.bypassCooldown ?? false)) {
    return {
      ok: true,
      count: cached.headlines.length,
      headlines: cached.headlines,
      updatedAt: cached.updatedAt,
      cacheWritten: true,
      skipped: true,
    };
  }

  try {
    const raw = await fetchAllTransferWireSources();
    const headlines = toHeadlines(raw);

    if (headlines.length === 0) {
      if (cached.headlines.length > 0) {
        return {
          ok: true,
          count: cached.headlines.length,
          headlines: cached.headlines,
          updatedAt: cached.updatedAt,
          cacheWritten: true,
          error: "RSS returned no items; kept previous cache",
        };
      }
      return {
        ok: false,
        count: 0,
        headlines: [],
        updatedAt: null,
        cacheWritten: false,
        error: "All RSS sources returned no items",
      };
    }

    const lastSyncAt = new Date().toISOString();
    const written = await writeCache(headlines, lastSyncAt);
    return {
      ok: true,
      count: headlines.length,
      headlines,
      updatedAt: written.updatedAt,
      cacheWritten: written.ok,
      error: written.ok ? undefined : written.error,
    };
  } catch (e) {
    if (cached.headlines.length > 0) {
      return {
        ok: true,
        count: cached.headlines.length,
        headlines: cached.headlines,
        updatedAt: cached.updatedAt,
        cacheWritten: true,
        error: (e as Error).message,
      };
    }
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

/**
 * Public read — never triggers RSS. Traffic-safe: 1 Supabase read per request.
 */
export async function getPublicTransferWire(): Promise<{
  headlines: TransferWireHeadline[];
  updatedAt: string | null;
  stale: boolean;
  source: "cache";
}> {
  const cached = await readTransferWireCache();
  return {
    headlines: cached.headlines,
    updatedAt: cached.updatedAt,
    stale: cached.stale,
    source: "cache",
  };
}
