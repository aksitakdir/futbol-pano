"use client";

import SiteHeader from "./site-header";
import SiteFooter from "./site-footer";
import CategoryPageHeader from "./category-page-header";
import HubEditorialSection from "./hub/hub-editorial-section";
import { getHubConfig, type HubId } from "@/lib/hub-config";

type FeedKind = "radar" | "listeler";

type Props = {
  hubId: HubId;
  locale?: string;
  feed: FeedKind;
};

export default function HubFeedPage({ hubId, feed }: Props) {
  const hub = getHubConfig(hubId);
  const isWc = hubId === "wc-2026";
  const accent = isWc ? "var(--wc-gold)" : "var(--transfer-cyan)";
  const themeClass = isWc ? "theme-wc-2026" : "theme-transfer";
  const navKey = isWc ? "wc-2026" : "transfer";

  const titles = {
    radar: "Radar",
    listeler: "Lists",
    back: `← ${hub.pillarTitle}`,
    desc:
      feed === "radar"
        ? "Player-focused scout pieces in this hub — same editorial layout as the main Radar."
        : "Curated lists in tournament or transfer context — same format as site Lists.",
  };

  return (
    <main className={themeClass} style={{ background: "var(--sg-bg)", color: "var(--sg-text-primary)", minHeight: "100vh" }}>
      <SiteHeader activeNav={navKey} />
      <div style={{ paddingTop: "68px" }} />

      <CategoryPageHeader
        eyebrow={hub.pillarEyebrow}
        title={
          feed === "radar" ? (
            <>
              <span className="grad-text">{hub.pillarTitle}</span>
              <span style={{ display: "block", fontSize: "0.55em", marginTop: 8, opacity: 0.85 }}>{titles[feed]}</span>
            </>
          ) : (
            <>
              {hub.pillarTitle}
              <span className="grad-text" style={{ display: "block", fontSize: "0.55em", marginTop: 8 }}>{titles[feed]}</span>
            </>
          )
        }
        description={titles.desc}
        accent={accent}
        backHref={hub.basePath}
        backLabel={titles.back}
      />

      <HubEditorialSection hubId={hubId} locale="en" accent={accent} category={feed} />

      <div style={{ paddingBottom: 80 }} />
      <SiteFooter maxWidth="max-w-7xl" />
    </main>
  );
}
