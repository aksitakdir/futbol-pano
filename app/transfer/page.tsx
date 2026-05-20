import HubPillarPage from "../components/hub-pillar-page";

export const metadata = {
  title: "Transfer Haberleri | Scout Gamer",
  description: "Gerçekleşen hamleler, scout analizleri ve kulüp Arena oyunları — transfer gündemine scout bakışı.",
};

export default function TransferPage() {
  return <HubPillarPage hubId="transfer" locale="tr" />;
}
