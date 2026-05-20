import HubFeedPage from "@/app/components/hub-feed-page";

export const metadata = { title: "Transfer Lists | Scout Gamer" };

export default function TransferListsPage() {
  return <HubFeedPage hubId="transfer" feed="listeler" />;
}
