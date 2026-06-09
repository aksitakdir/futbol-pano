"use client";

import { useEffect, useState } from "react";
import { resolvePlayerClient } from "@/lib/player-resolver";
import PlayerCard, { type PlayerCardData } from "./player-card";

/**
 * Self-contained hero player card — resolves player data using the
 * multi-tier fallback chain (fc_players → player_cache → BSD → API-Football)
 * and renders a compact PlayerCard. Used in the hero area when
 * heroVariant === "player-cards" across all article categories.
 */
export default function HeroPlayerCard({ playerName }: { playerName: string }) {
  const [card, setCard] = useState<PlayerCardData | null>(null);

  useEffect(() => {
    if (!playerName?.trim()) return;
    let cancelled = false;

    (async () => {
      // Client-side: checks fc_players + player_cache (tiers 1-2)
      const result = await resolvePlayerClient(playerName.trim());
      if (!cancelled && result) setCard(result);
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
