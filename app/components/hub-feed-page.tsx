"use client";

import SiteHeader from "./site-header";
import SiteFooter from "./site-footer";
import CategoryPageHeader from "./category-page-header";
import HubEditorialSection from "./hub/hub-editorial-section";
import { getHubConfig, type HubId, type HubLocale } from "@/lib/hub-config";

type FeedKind = "radar" | "listeler";

type Props = {
  hubId: HubId;
  locale: HubLocale;
  feed: FeedKind;
};

export default function HubFeedPage({ hubId, locale, feed }: Props) {
  const hub = getHubConfig(hubId, locale);
  const isWc = hubId === "wc-2026";
  const accent = isWc ? "var(--wc-gold)" : "var(--transfer-cyan)";
  const themeClass = isWc ? "theme-wc-2026" : "theme-transfer";

  const titles =
    locale === "tr"
      ? {
          radar: "Radar",
          listeler: "Listeler",
          back: `← ${hub.pillarTitle}`,
          desc:
            feed === "radar"
              ? "Bu hub altındaki oyuncu odaklı scout analizleri — metin, vurgular ve okuma süresiyle."
              : "Turnuva veya transfer bağlamında kürasyonlu listeler — site genelindeki liste formatında.",
        }
      : {
          radar: "Radar",
          listeler: "Lists",
          back: `← ${hub.pillarTitle}`,
          desc:
            feed === "radar"
              ? "Player-focused scout pieces in this hub — same editorial layout as the main Radar."
              : "Curated lists in tournament or transfer context — same format as site Lists.",
        };

  const navKey = hubId === "wc-2026" ? "wc-2026" : "transfer";

  return (
    <main className={themeClass} style={{ background: "var(--sg-bg)", color: "var(--sg-text-primary)", minHeight: "100vh" }}>
      <SiteHeader activeNav={navKey} forceEn={locale === "en"} />
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
              <span
                className="grad-text"
                style={{ display: "block", fontSize: "0.55em", marginTop: 8 }}
              >
                {titles[feed]}
              </span>
            </>
          )
        }
        description={titles.desc}
        accent={accent}
        backHref={hub.basePath}
        backLabel={titles.back}
      />

      <HubEditorialSection hubId={hubId} locale={locale} accent={accent} category={feed} />

      <div style={{ paddingBottom: 80 }} />
      <SiteFooter maxWidth="max-w-7xl" />
    </main>
  );
}
