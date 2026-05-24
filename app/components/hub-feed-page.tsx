"use client";

import SiteHeader from "./site-header";
import SiteFooter from "./site-footer";
import CategoryPageHeader from "./category-page-header";
import HubEditorialSection from "./hub/hub-editorial-section";

type FeedKind = "radar" | "listeler";

type Props = {
  hubId: "wc-2026" | "transfer";
  locale?: string;
  feed: FeedKind;
};

const PAGE_CONFIG: Record<string, { title: string; accent: string; themeClass: string; navKey: string; basePath: string }> = {
  "wc-2026": { title: "World Cup 2026", accent: "var(--wc-gold)", themeClass: "theme-wc-2026", navKey: "wc-2026", basePath: "/world-cup-2026" },
  transfer: { title: "Transfers", accent: "var(--transfer-cyan)", themeClass: "theme-transfer", navKey: "transfer", basePath: "/transfers" },
};

export default function HubFeedPage({ hubId, feed }: Props) {
  const cfg = PAGE_CONFIG[hubId] ?? PAGE_CONFIG["wc-2026"];
  const titles = {
    radar: "Radar",
    listeler: "Lists",
    back: `← ${cfg.title}`,
    desc:
      feed === "radar"
        ? "Player-focused scout pieces — same editorial layout as the main Radar."
        : "Curated list articles.",
  };

  return (
    <main className={cfg.themeClass} style={{ background: "var(--sg-bg)", color: "var(--sg-text-primary)", minHeight: "100vh" }}>
      <SiteHeader activeNav={cfg.navKey} />
      <div style={{ paddingTop: "68px" }} />
      <CategoryPageHeader
        backHref={cfg.basePath}
        backLabel={titles.back}
        eyebrow={cfg.title.toUpperCase()}
        title={titles[feed]}
        description={titles.desc}
      />
      <HubEditorialSection hubId={hubId} locale="en" accent={cfg.accent} category={feed === "radar" ? "radar" : "listeler"} />
      <div style={{ paddingBottom: 80 }} />
      <SiteFooter maxWidth="max-w-7xl" />
    </main>
  );
}
