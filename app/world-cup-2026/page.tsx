import HubPillarPage from "../components/hub-pillar-page";

export const metadata = {
  title: "World Cup 2026 — Schedule, Squads, Groups & Analysis | Scout Gamer",
  description:
    "FIFA World Cup 2026 hub — match schedule with kick-off times, 48 team squads, group standings, and scout analysis. June 11 to July 19 across USA, Mexico & Canada.",
  alternates: { canonical: "https://www.scoutgamer.com/world-cup-2026" },
  openGraph: {
    title: "World Cup 2026 — Schedule, Squads & Analysis",
    description: "Complete FIFA World Cup 2026 coverage: 104 match schedule, 48 team squads, group breakdowns, and scouting reports.",
    url: "https://www.scoutgamer.com/world-cup-2026",
  },
  keywords: [
    "world cup 2026",
    "fifa world cup 2026",
    "world cup 2026 schedule",
    "world cup 2026 squads",
    "world cup 2026 groups",
    "world cup 2026 teams",
  ],
};

export default function Page() {
  return <HubPillarPage hubId="wc-2026" locale="en" />;
}
