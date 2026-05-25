import WcSchedulePage from "../../components/wc-schedule-page";
import type { Metadata } from "next";
import Script from "next/script";

export const metadata: Metadata = {
  title: "World Cup 2026 Schedule & Fixtures — All 104 Matches | Scout Gamer",
  description:
    "Complete FIFA World Cup 2026 match schedule with kick-off times in your local timezone. All 104 fixtures from June 11 to July 19, 2026 — group stage, round of 32, quarterfinals, and the final at MetLife Stadium. 48 teams, 16 venues across USA, Mexico & Canada.",
  alternates: {
    canonical: "https://www.scoutgamer.com/world-cup-2026/schedule",
  },
  openGraph: {
    title: "World Cup 2026 Match Schedule — All 104 Fixtures",
    description:
      "Complete FIFA World Cup 2026 fixture list with dates, venues, groups and kick-off times. Filter by team, browse by date, group or knockout round.",
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
    "world cup 2026 kick off times",
    "world cup 2026 group stage",
    "world cup 2026 knockout bracket",
    "world cup 2026 round of 32",
    "world cup 2026 final",
    "world cup 2026 metlife stadium",
  ],
};

const FAQ_ITEMS = [
  {
    q: "When does the FIFA World Cup 2026 start and end?",
    a: "The FIFA World Cup 2026 starts on June 11, 2026 with the opening match in Mexico City and ends on July 19, 2026 with the final at MetLife Stadium in New York/New Jersey.",
  },
  {
    q: "How many teams and matches are in World Cup 2026?",
    a: "World Cup 2026 features 48 teams divided into 12 groups, with 104 total matches — 72 group stage matches, 16 Round of 32, 8 Round of 16, 4 quarterfinals, 2 semifinals, a third-place match, and the final.",
  },
  {
    q: "Which countries host the 2026 World Cup?",
    a: "The 2026 World Cup is hosted across three countries: the United States (11 venues), Mexico (3 venues), and Canada (2 venues), spanning 16 stadiums in total.",
  },
  {
    q: "Where is the World Cup 2026 final?",
    a: "The World Cup 2026 final will be held at MetLife Stadium in East Rutherford, New Jersey (New York/NJ metro area) on July 19, 2026.",
  },
  {
    q: "What time zone are the World Cup 2026 match times shown in?",
    a: "On Scout Gamer, all kick-off times are automatically converted to your local timezone. The official schedule is published in Eastern Time (ET), but we display times adjusted to wherever you are in the world.",
  },
  {
    q: "How many matches are played per day during the group stage?",
    a: "Most group stage days feature 4 matches. On Matchday 3 (final group matches), some days have 6 simultaneous matches to ensure fair competition within each group.",
  },
];

function buildJsonLd() {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ_ITEMS.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };

  const eventSchema = {
    "@context": "https://schema.org",
    "@type": "SportsEvent",
    name: "FIFA World Cup 2026",
    description: "The 23rd FIFA World Cup, hosted across the United States, Mexico, and Canada with 48 teams and 104 matches.",
    startDate: "2026-06-11",
    endDate: "2026-07-19",
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    location: [
      { "@type": "Place", name: "MetLife Stadium", address: { "@type": "PostalAddress", addressLocality: "East Rutherford", addressRegion: "NJ", addressCountry: "US" } },
      { "@type": "Place", name: "SoFi Stadium", address: { "@type": "PostalAddress", addressLocality: "Los Angeles", addressRegion: "CA", addressCountry: "US" } },
      { "@type": "Place", name: "Estadio Azteca", address: { "@type": "PostalAddress", addressLocality: "Mexico City", addressCountry: "MX" } },
    ],
    organizer: { "@type": "Organization", name: "FIFA", url: "https://www.fifa.com" },
    competitor: { "@type": "SportsTeam", name: "48 National Teams" },
    url: "https://www.scoutgamer.com/world-cup-2026/schedule",
  };

  return [faqSchema, eventSchema];
}

export default function Page() {
  const schemas = buildJsonLd();

  return (
    <>
      {schemas.map((schema, i) => (
        <Script
          key={i}
          id={`wc-schedule-jsonld-${i}`}
          type="application/ld+json"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
      <WcSchedulePage faqItems={FAQ_ITEMS} />
    </>
  );
}
