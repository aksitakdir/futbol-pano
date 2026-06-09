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
      let result = await resolvePlayerClient(playerName.trim());
      // If not in local tables, call server-side resolve (BSD + API-Football)
      if (!result) {
        try {
          const res = await fetch(`/api/players/resolve?name=${encodeURIComponent(playerName.trim())}`);
          if (res.ok) result = await res.json();
        } catch { /* ignore */ }
      }
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
