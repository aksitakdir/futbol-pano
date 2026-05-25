import WcSchedulePage from "../../../components/wc-schedule-page";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  teamSlugToCode,
  getTeamName,
  getGroupForTeam,
  getMatchesForTeam,
  getAllTeamSlugs,
} from "@/lib/wc-2026-schedule";

type Props = { params: Promise<{ team: string }> };

export async function generateStaticParams() {
  return getAllTeamSlugs().map((slug) => ({ team: slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { team: slug } = await params;
  const code = teamSlugToCode(slug);
  if (!code) return {};
  const name = getTeamName(code);
  const group = getGroupForTeam(code);
  const matches = getMatchesForTeam(code);
  const groupLabel = group ? `Group ${group}` : "";

  return {
    title: `${name} World Cup 2026 Schedule — Fixtures, Dates & Kick-off Times`,
    description: `${name} FIFA World Cup 2026 match schedule — ${matches.length} group stage fixtures in ${groupLabel}. Dates, venues, and kick-off times for all ${name} matches.`,
    alternates: {
      canonical: `https://www.scoutgamer.com/world-cup-2026/schedule/${slug}`,
    },
    openGraph: {
      title: `${name} — World Cup 2026 Schedule & Fixtures`,
      description: `Complete ${name} match schedule for FIFA World Cup 2026. ${groupLabel} fixtures with dates and venues.`,
      url: `https://www.scoutgamer.com/world-cup-2026/schedule/${slug}`,
    },
    keywords: [
      `${name.toLowerCase()} world cup 2026`,
      `${name.toLowerCase()} world cup 2026 schedule`,
      `${name.toLowerCase()} world cup fixtures`,
      `${name.toLowerCase()} world cup 2026 group`,
      `world cup 2026 ${groupLabel.toLowerCase()}`,
      `${name.toLowerCase()} matches world cup`,
    ],
  };
}

export default async function TeamSchedulePage({ params }: Props) {
  const { team: slug } = await params;
  const code = teamSlugToCode(slug);
  if (!code) notFound();

  return <WcSchedulePage teamFilter={code} />;
}
