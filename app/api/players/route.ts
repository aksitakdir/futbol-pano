import { NextResponse } from "next/server";

export const revalidate = 3600;

const API_BASE_URL = "https://v3.football.api-sports.io";

export async function GET() {
  const apiKey = process.env.FOOTBALL_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "FOOTBALL_API_KEY environment variable is not set" },
      { status: 500 }
    );
  }

  try {
    const url = new URL(`${API_BASE_URL}/players/topscorers`);
    url.searchParams.set("league", "39"); // Premier League
    url.searchParams.set("season", "2024");

    const res = await fetch(url.toString(), {
      headers: {
        "x-apisports-key": apiKey,
      },
      next: { revalidate: 3600 },
    });

    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json(
        {
          error: "Failed to fetch players from API-Football",
          status: res.status,
          details: text,
        },
        { status: 502 }
      );
    }

    const data = await res.json();

    const rawPlayers = Array.isArray(data?.response) ? data.response : [];

    const mappedPlayers = rawPlayers.slice(0, 10).map((item: any) => {
        const player = item.player ?? {};
        const statistics = Array.isArray(item.statistics)
          ? item.statistics[0] ?? {}
          : {};

        const team = statistics.team ?? {};
        const games = statistics.games ?? {};
        const goals = statistics.goals ?? {};
        const league = statistics.league ?? {};

      return {
        id: player.id,
        name: player.name,
        age: player.age,
        nationality: player.nationality,
        photo: player.photo,
        position: games.position,
        team: team.name,
        league: league.name,
        appearances: games.appearences,
        minutes: games.minutes,
        goals: goals.total,
      };
    });

    return NextResponse.json(
      {
        count: mappedPlayers.length,
        league: 39,
        season: 2024,
        players: mappedPlayers,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching players from API-Football:", error);
    return NextResponse.json(
      {
        error: "Unexpected error while fetching players from API-Football",
      },
      { status: 500 }
    );
  }
}

