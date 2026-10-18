import HubPillarPage from "../components/hub-pillar-page";
import ArticleIndexLinks from "../components/article-index-links";
import FooterOwner from "../components/footer-owner";

export const metadata = {
  title: "Transfers | Scout Gamer",
  description: "Transfer Wire — rumors from BBC, Sky and Google News, scout analysis, and confirmed deals.",
  alternates: { canonical: "https://www.scoutgamer.com/transfers" },
};

export default function Page() {
  return (
    <FooterOwner themeClass="theme-transfer" index={<ArticleIndexLinks category="transfer" basePath="/transfers" heading="All Transfer Analysis" />}>
      <HubPillarPage hubId="transfer" />
    </FooterOwner>
  );
}
