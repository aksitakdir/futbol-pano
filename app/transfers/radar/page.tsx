import HubFeedPage from "@/app/components/hub-feed-page";

export const metadata = { title: "Transfer Radar | Scout Gamer" };

export default function TransferRadarPage() {
  return <HubFeedPage hubId="transfer" feed="radar" />;
}
