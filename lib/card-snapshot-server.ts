import "server-only";
import snapshots from "@/data/card-snapshots.json";
import type { ArticleCardSnapshot } from "./card-snapshot";

type SnapshotFile = {
  articles: Record<string, { frozen_at: string; dataset: string; cards: ArticleCardSnapshot }>;
};

/** The frozen cards for one article, by content id. Null when it was never frozen. */
export function cardSnapshotFor(contentId: number | string | null | undefined): ArticleCardSnapshot | null {
  if (contentId == null) return null;
  const entry = (snapshots as SnapshotFile).articles[String(contentId)];
  return entry?.cards ?? null;
}
