"use client";

import { useEffect, useState } from "react";
import EditorialContentFeed from "@/app/components/editorial-content-feed";
import PageShell from "@/app/components/page-shell";
import type { EditorialArticle } from "@/lib/editorial-article";
import { supabase } from "@/lib/supabase";
import type { HubId } from "@/lib/hub-config";
import { HUB_TAG } from "@/lib/hub-config";
import {
  COVER_STORY_SETTINGS_KEY,
  normalizeCoverStories,
  orderWithCoverPin,
  type CoverStoryScope,
} from "@/lib/cover-story";

const PAGE_SIZE = 12;

type Props = {
  hubId: HubId;
  locale?: string;
  accent: string;
  category?: string;
  limit?: number;
  compact?: boolean;
};

export default function HubEditorialSection({ hubId, accent, category, limit, compact = false }: Props) {
  const tag = HUB_TAG[hubId];
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
      const [{ data: pinRow }, listRes] = await Promise.all([
        supabase.from("site_settings").select("value").eq("key", COVER_STORY_SETTINGS_KEY).maybeSingle(),
        (() => {
          let query = supabase
            .from("contents")
            .select("id,title,title_en,slug,category,content,content_en,created_at,cover_image")
            .eq("status", "yayinda")
            .or(`category.eq.${hubId},hub_tags.cs.{${tag}}`)
            .order("created_at", { ascending: false })
            .range(0, pageSize - 1);
          if (category) query = query.eq("category", category);
          return query;
        })(),
      ]);

      const pins = normalizeCoverStories(pinRow?.value);
      const pinnedId = pins[hubId as CoverStoryScope];
      const { data, error } = listRes;

      if (!error && data) {
        let items = data as EditorialArticle[];
        if (pinnedId && !items.some((row) => row.id === pinnedId)) {
          const { data: pinnedRow } = await supabase
            .from("contents")
            .select("id,title,title_en,slug,category,content,content_en,created_at,cover_image")
            .eq("id", pinnedId)
            .eq("status", "yayinda")
            .maybeSingle();
          if (pinnedRow) {
            items = [pinnedRow as EditorialArticle, ...items].slice(0, pageSize);
          }
        }
        items = orderWithCoverPin(items, pinnedId);
        setArticles(items);
        setHasMore(!compact && items.length === pageSize);
      }
      setLoading(false);
    })();
  }, [tag, hubId, category, pageSize, compact]);

  async function handleLoadMore() {
    if (compact) return;
    setLoadingMore(true);
    let query = supabase
      .from("contents")
      .select("id,title,title_en,slug,category,content,content_en,created_at,cover_image")
      .eq("status", "yayinda")
      .or(`category.eq.${hubId},hub_tags.cs.{${tag}}`)
      .order("created_at", { ascending: false })
      .range(articles.length, articles.length + PAGE_SIZE - 1);

    if (category) query = query.eq("category", category);

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
