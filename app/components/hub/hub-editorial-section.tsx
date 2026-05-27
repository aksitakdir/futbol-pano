"use client";

import { useEffect, useState } from "react";
import EditorialContentFeed from "@/app/components/editorial-content-feed";
import PageShell from "@/app/components/page-shell";
import type { EditorialArticle } from "@/lib/editorial-article";
import { supabase } from "@/lib/supabase";
import type { ContentCategory } from "@/lib/category-config";
import type { CoverStoryScope } from "@/lib/cover-story";
import { EDITORIAL_ARTICLE_SELECT } from "@/lib/cover-story-store";

const PAGE_SIZE = 12;

type Props = {
  hubId: ContentCategory;
  locale?: string;
  accent: string;
  category?: string;
  limit?: number;
  compact?: boolean;
};

export default function HubEditorialSection({ hubId, accent, category, limit, compact = false }: Props) {
  const tag = hubId;
  const [articles, setArticles] = useState<EditorialArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);

  const copy = {
    eyebrow: "SCOUT ARTICLES",
    empty: "No hub-tagged articles yet. Add hub_tags in admin.",
    gridEyebrow: category === "radar" ? "ALL ANALYSES" : category ? "ALL LISTS" : "ALL ARTICLES",
  };

  const pageSize = limit ?? (compact ? 6 : PAGE_SIZE);

  useEffect(() => {
    setLoading(true);
    void (async () => {
      const pinsRes = await fetch("/api/cover-stories", { cache: "no-store" });
      const pinsJson = pinsRes.ok
        ? ((await pinsRes.json()) as { pins?: Partial<Record<CoverStoryScope, string>> })
        : { pins: {} };
      const pinnedId = pinsJson.pins?.[hubId as CoverStoryScope];

      let pinned: EditorialArticle | null = null;
      if (pinnedId) {
        const { data: pinnedRow } = await supabase
          .from("contents")
          .select(EDITORIAL_ARTICLE_SELECT)
          .eq("id", pinnedId)
          .eq("status", "published")
          .maybeSingle();
        pinned = (pinnedRow as EditorialArticle | null) ?? null;
      }

      let query = supabase
        .from("contents")
        .select(EDITORIAL_ARTICLE_SELECT)
        .eq("status", "published")
        .or(`category.eq.${hubId},hub_tags.cs.{${tag}}`)
        .order("created_at", { ascending: false })
        .range(0, pageSize - 1);

      if (category) query = query.eq("category", category);
      if (pinnedId) query = query.neq("id", pinnedId);

      const { data, error } = await query;

      if (!error) {
        const list = (data ?? []) as EditorialArticle[];
        const items = pinned ? [pinned, ...list] : list;
        setArticles(items.slice(0, pageSize));
        setHasMore(!compact && list.length === pageSize);
      }
      setLoading(false);
    })();
  }, [tag, hubId, category, pageSize, compact]);

  async function handleLoadMore() {
    if (compact) return;
    setLoadingMore(true);

    const pinsRes = await fetch("/api/cover-stories", { cache: "no-store" });
    const pinsJson = pinsRes.ok
      ? ((await pinsRes.json()) as { pins?: Partial<Record<CoverStoryScope, string>> })
      : { pins: {} };
    const pinnedId = pinsJson.pins?.[hubId as CoverStoryScope];

    const listCount = pinnedId ? articles.filter((a) => a.id !== pinnedId).length : articles.length;

    let query = supabase
      .from("contents")
      .select(EDITORIAL_ARTICLE_SELECT)
      .eq("status", "published")
      .or(`category.eq.${hubId},hub_tags.cs.{${tag}}`)
      .order("created_at", { ascending: false })
      .range(listCount, listCount + PAGE_SIZE - 1);

    if (category) query = query.eq("category", category);
    if (pinnedId) query = query.neq("id", pinnedId);

    const { data } = await query;
    const items = (data ?? []) as EditorialArticle[];
    setArticles((prev) => [...prev, ...items]);
    setHasMore(items.length === PAGE_SIZE);
    setLoadingMore(false);
  }

  return (
    <PageShell
      as="section"
      className={compact ? "sg-page-shell--section" : ""}
      style={{ paddingTop: compact ? undefined : "clamp(32px, 5vw, 48px)", paddingBottom: compact ? undefined : 0 }}
    >
      <div className="eyebrow" style={{ marginBottom: compact ? 20 : 24, color: accent }}>{copy.eyebrow}</div>
      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: compact ? 32 : 64 }}>
          <span className="h-5 w-5 animate-spin rounded-full border-2" style={{ borderColor: accent, borderTopColor: "transparent" }} />
        </div>
      ) : (
        <EditorialContentFeed
          articles={articles}
          accent={accent}
          emptyMessage={copy.empty}
          gridEyebrow={copy.gridEyebrow}
          onLoadMore={compact ? undefined : handleLoadMore}
          hasMore={compact ? false : hasMore}
          loadingMore={loadingMore}
        />
      )}
    </PageShell>
  );
}
