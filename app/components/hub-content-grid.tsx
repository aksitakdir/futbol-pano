"use client";

/** @deprecated Use EditorialContentFeed — kept for imports */
import EditorialContentFeed from "./editorial-content-feed";
import type { EditorialArticle } from "@/lib/editorial-article";

export type HubArticle = EditorialArticle;

type Props = Parameters<typeof EditorialContentFeed>[0];

export default function HubContentGrid(props: Props) {
  return <EditorialContentFeed {...props} />;
}
