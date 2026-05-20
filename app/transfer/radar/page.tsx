import HubFeedPage from "../../components/hub-feed-page";

export const metadata = { title: "Transfer Radar | Scout Gamer" };

export default function Page() {
  return <HubFeedPage hubId="transfer" locale="tr" feed="radar" />;
}
