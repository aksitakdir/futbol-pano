import HubPillarPage from "../components/hub-pillar-page";

export const metadata = {
  title: "Transfers | Scout Gamer",
  description: "Transfer Wire — rumors from BBC, Sky and Google News, scout analysis, and confirmed deals.",
  alternates: { canonical: "https://www.scoutgamer.com/transfers" },
};

export default function Page() {
  return <HubPillarPage hubId="transfer" locale="en" />;
}
