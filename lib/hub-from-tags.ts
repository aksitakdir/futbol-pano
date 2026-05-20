import type { HubId } from "@/lib/hub-config";

/** First matching hub for article breadcrumb (wc-2026 wins if both set) */
export function primaryHubId(tags?: string[] | null): HubId | undefined {
  if (!Array.isArray(tags) || tags.length === 0) return undefined;
  if (tags.includes("wc-2026")) return "wc-2026";
  if (tags.includes("transfer")) return "transfer";
  return undefined;
}
