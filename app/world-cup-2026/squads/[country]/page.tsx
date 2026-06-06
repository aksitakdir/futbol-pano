import { notFound } from "next/navigation";
import HubSquadPage from "../../../components/hub-squad-page";
import { getWcTeam } from "@/lib/wc-2026-teams";
import { getAllTeamSlugs } from "@/lib/wc-2026-schedule";
import { loadWcSquad } from "@/lib/wc-squad-loader";

type Props = { params: Promise<{ country: string }> };

const BASE = "https://www.scoutgamer.com";

export async function generateStaticParams() {
  return getAllTeamSlugs().map((slug) => ({ country: slug }));
}

export const revalidate = 86400; // ISR — refresh every 24 h

export async function generateMetadata({ params }: Props) {
  const { country } = await params;
  const team = getWcTeam(country);
  if (!team) return { title: "Squad | Scout Gamer" };
  const name = team.nameEn;
  const title = `${name} National Football Team — World Cup 2026 Squad & Roster | Scout Gamer`;
  const description = `${name} national football team's full FIFA World Cup 2026 squad: confirmed roster by position with clubs and scout ratings. ${name} player list for the 2026 World Cup.`;
  const url = `${BASE}/world-cup-2026/squads/${country}`;
  return {
    title,
    description,
    alternates: { canonical: url },
    keywords: [
      `${name.toLowerCase()} national football team`,
      `${name.toLowerCase()} world cup 2026`,
      `${name.toLowerCase()} world cup 2026 squad`,
      `${name.toLowerCase()} squad roster`,
      `${name.toLowerCase()} players world cup`,
      "world cup 2026 squads",
    ],
    openGraph: { title: `${name} National Football Team — World Cup 2026 Squad`, description, url, type: "article" },
    twitter: { card: "summary_large_image", title: `${name} National Football Team — World Cup 2026 Squad`, description },
  };
}

/** SportsTeam + athlete ItemList JSON-LD for rich results. */
function buildSquadJsonLd(
  teamName: string,
  country: string,
  players: { name: string; club: string; position: string }[],
) {
  const url = `${BASE}/world-cup-2026/squads/${country}`;
  const team = {
    "@context": "https://schema.org",
    "@type": "SportsTeam",
    name: `${teamName} national football team`,
    sport: "Football",
    url,
    memberOf: {
      "@type": "SportsEvent",
      name: "FIFA World Cup 2026",
      description: "The 23rd FIFA World Cup, hosted across the United States, Mexico, and Canada with 48 teams.",
      startDate: "2026-06-11",
      endDate: "2026-07-19",
      eventStatus: "https://schema.org/EventScheduled",
      location: { "@type": "Place", name: "United States, Mexico & Canada" },
      organizer: { "@type": "Organization", name: "FIFA", url: "https://www.fifa.com" },
      image: `${BASE}/world-cup-2026/opengraph-image`,
    },
    athlete: players.slice(0, 30).map((p) => ({
      "@type": "Person",
      name: p.name,
      ...(p.club ? { affiliation: { "@type": "SportsTeam", name: p.club } } : {}),
      ...(p.position ? { jobTitle: p.position } : {}),
    })),
  };

  const itemList = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `${teamName} World Cup 2026 Squad`,
    numberOfItems: players.length,
    itemListElement: players.slice(0, 30).map((p, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: p.name,
    })),
  };

  return [team, itemList];
}

export default async function CountrySquadPage({ params }: Props) {
  const { country } = await params;
  const team = getWcTeam(country);
  if (!team) notFound();

  // Server-side fetch so the structured data is in the initial HTML for crawlers.
  let players: { name: string; club: string; position: string }[] = [];
  try {
    const rows = await loadWcSquad(country);
    players = rows.map((r) => ({ name: r.name, club: r.club, position: r.position }));
  } catch {
    players = [];
  }

  const schemas = players.length > 0 ? buildSquadJsonLd(team.nameEn, country, players) : [];

  return (
    <>
      {schemas.map((schema, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
      <HubSquadPage locale="en" countrySlug={country} />
    </>
  );
}
