import WcSchedulePage from "../../components/wc-schedule-page";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "World Cup 2026 Schedule & Fixtures | Scout Gamer",
  description:
    "Full FIFA World Cup 2026 match schedule — all 104 fixtures, dates, venues and kick-off times. June 11 to July 19, 2026 across USA, Mexico & Canada.",
  alternates: {
    canonical: "https://www.scoutgamer.com/world-cup-2026/schedule",
  },
  openGraph: {
    title: "World Cup 2026 Match Schedule — All 104 Fixtures",
    description:
      "Complete FIFA World Cup 2026 fixture list with dates, venues and groups. Filter by team, view by date or group.",
    url: "https://www.scoutgamer.com/world-cup-2026/schedule",
  },
  keywords: [
    "world cup 2026 schedule",
    "world cup 2026 fixtures",
    "fifa world cup 2026 match schedule",
    "world cup 2026 dates",
    "world cup 2026 venues",
    "world cup 2026 groups",
    "world cup schedule usa mexico canada",
  ],
};

export default function Page() {
  return <WcSchedulePage />;
}
