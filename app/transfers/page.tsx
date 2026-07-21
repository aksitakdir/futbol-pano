import HubPillarPage from "../components/hub-pillar-page";
import ArticleIndexLinks from "../components/article-index-links";

export const metadata = {
  title: "Transfers | Scout Gamer",
  description: "Transfer Wire — rumors from BBC, Sky and Google News, scout analysis, and confirmed deals.",
  alternates: { canonical: "https://www.scoutgamer.com/transfers" },
};

export default function Page() {
  return (
    <>
      <HubPillarPage hubId="transfer" />
      {/* Server-rendered crawl path — the hub lists articles client-side only */}
      <ArticleIndexLinks category="transfer" basePath="/transfers" heading="All Transfer Analysis" />
    </>
  );
}
