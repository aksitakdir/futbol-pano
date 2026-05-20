import { notFound } from "next/navigation";
import HubSquadPage from "../../../../components/hub-squad-page";
import { getWcTeam } from "@/lib/wc-2026-teams";

type Props = { params: Promise<{ country: string }> };

export async function generateMetadata({ params }: Props) {
  const { country } = await params;
  const team = getWcTeam(country);
  if (!team) return { title: "Squad | Scout Gamer" };
  return {
    title: `${team.nameEn} World Cup Squad 2026 | Scout Gamer`,
    description: `${team.nameEn} 2026 World Cup squad — by position scout view.`,
  };
}

export default async function CountrySquadPage({ params }: Props) {
  const { country } = await params;
  if (!getWcTeam(country)) notFound();
  return <HubSquadPage locale="en" countrySlug={country} />;
}
