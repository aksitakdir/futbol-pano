import HubFeedPage from "../../components/hub-feed-page";

export const metadata = { title: "DK 2026 Listeler | Scout Gamer" };

export default function Page() {
  return <HubFeedPage hubId="wc-2026" locale="tr" feed="listeler" />;
}
