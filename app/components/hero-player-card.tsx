"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import PlayerCard, { type PlayerCardData } from "./player-card";

/**
 * Self-contained hero player card — fetches player data from Supabase
 * by name and renders a compact PlayerCard. Used in the hero area when
 * heroVariant === "player-cards" across all article categories.
 */
export default function HeroPlayerCard({ playerName }: { playerName: string }) {
  const [card, setCard] = useState<PlayerCardData | null>(null);

  useEffect(() => {
    if (!playerName?.trim()) return;
    let cancelled = false;

    (async () => {
      const name = playerName.trim();

      // Exact match first
      const { data: exact } = await supabase
        .from("fc_players")
        .select("name,overall,pace,shooting,passing,dribbling,defending,physical,position,club,league,age,photo_url")
        .ilike("name", name)
        .limit(1)
        .maybeSingle();

      if (cancelled) return;

      if (exact?.overall) {
        setCard({
          name: exact.name ?? name,
          club: exact.club ?? "",
          league: exact.league ?? "",
          position: exact.position ?? "",
          age: exact.age ?? "",
          overall: exact.overall,
          pace: exact.pace ?? 0,
          shooting: exact.shooting ?? 0,
          passing: exact.passing ?? 0,
          dribbling: exact.dribbling ?? 0,
          defending: exact.defending ?? 0,
          physical: exact.physical ?? 0,
          photo_url: exact.photo_url,
        });
        return;
      }

      // Fuzzy: first two words
      const two = name.split(" ").slice(0, 2).join(" ");
      const { data: fuzzy } = await supabase
        .from("fc_players")
        .select("name,overall,pace,shooting,passing,dribbling,defending,physical,position,club,league,age,photo_url")
        .ilike("name", `%${two}%`)
        .order("overall", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (cancelled) return;

      if (fuzzy?.overall) {
        setCard({
          name: fuzzy.name ?? name,
          club: fuzzy.club ?? "",
          league: fuzzy.league ?? "",
          position: fuzzy.position ?? "",
          age: fuzzy.age ?? "",
          overall: fuzzy.overall,
          pace: fuzzy.pace ?? 0,
          shooting: fuzzy.shooting ?? 0,
          passing: fuzzy.passing ?? 0,
          dribbling: fuzzy.dribbling ?? 0,
          defending: fuzzy.defending ?? 0,
          physical: fuzzy.physical ?? 0,
          photo_url: fuzzy.photo_url,
        });
      }
    })();

    return () => { cancelled = true; };
  }, [playerName]);

  if (!card) return null;

  return (
    <PlayerCard
      player={card}
      compact
      animated
      showScoutNote={false}
    />
  );
}
