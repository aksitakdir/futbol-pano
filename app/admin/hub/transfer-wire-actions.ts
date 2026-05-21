"use server";

import { syncTransferWireCache } from "@/lib/transfer-wire-cache";

/** Admin manual sync — server-only, not triggered by visitor traffic */
export async function adminSyncTransferWire(): Promise<{
  ok: boolean;
  count: number;
  skipped?: boolean;
  error?: string;
}> {
  const result = await syncTransferWireCache({ bypassCooldown: true });
  return {
    ok: result.ok,
    count: result.count,
    skipped: result.skipped,
    error: result.error,
  };
}
