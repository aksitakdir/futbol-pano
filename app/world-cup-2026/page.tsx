import HubPillarPage from "../components/hub-pillar-page";

export const metadata = {
  title: "World Cup 2026 | Scout Gamer",
  description: "World Cup 2026 squads, scout analysis, and tournament lists.",
  alternates: { canonical: "https://www.scoutgamer.com/world-cup-2026" },
};

export default function Page() {
  return <HubPillarPage hubId="wc-2026" locale="en" />;
}
