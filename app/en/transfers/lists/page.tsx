import HubFeedPage from "../../../components/hub-feed-page";

export const metadata = { title: "Transfer Lists | Scout Gamer" };

export default function Page() {
  return <HubFeedPage hubId="transfer" locale="en" feed="listeler" />;
}
