import { notFound } from "next/navigation";
import HubSquadPage from "../../../components/hub-squad-page";
import { getWcTeam } from "@/lib/wc-2026-teams";

type Props = { params: Promise<{ country: string }> };

export async function generateMetadata({ params }: Props) {
  const { country } = await params;
  const team = getWcTeam(country);
  if (!team) return { title: "Kadro | Scout Gamer" };
  return {
    title: `${team.nameTr} Dünya Kupası Kadrosu 2026 | Scout Gamer`,
    description: `${team.nameTr} 2026 Dünya Kupası kadrosu — mevkiye göre scout görünümü.`,
  };
}

export default async function CountrySquadPage({ params }: Props) {
  const { country } = await params;
  if (!getWcTeam(country)) notFound();
  return <HubSquadPage locale="tr" countrySlug={country} />;
}
