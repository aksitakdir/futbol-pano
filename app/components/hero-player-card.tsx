"use client";

import { useEffect, useState } from "react";
import { resolvePlayer } from "@/lib/player-resolver";
import { frozenRow } from "@/lib/card-snapshot";
import PlayerCard, { type PlayerCardData } from "./player-card";
import { useCardSnapshot } from "./card-snapshot-context";

/**
 * Self-contained hero player card — resolves player data using the
 * multi-tier fallback chain (fc_players → player_cache → BSD → API-Football)
 * and renders a compact PlayerCard. Used in the hero area when
 * heroVariant === "player-cards" across all article categories.
 */
export default function HeroPlayerCard({ playerName }: { playerName: string }) {
  const [card, setCard] = useState<PlayerCardData | null>(null);
  const snapshot = useCardSnapshot();

  useEffect(() => {
    if (!playerName?.trim()) return;
    let cancelled = false;

    (async () => {
      // A frozen card is what this article showed when it was frozen
      // (lib/card-snapshot.ts); null means it had no fc_players card then.
      const frozen = frozenRow(snapshot, playerName);
      if (frozen) {
        if (!cancelled) setCard(frozenToCard(frozen));
        return;
      }
      const skipFc = frozen === null;
      // Client-side: checks fc_players + player_cache (tiers 1-2)
      let result = await resolvePlayer(playerName.trim(), false, skipFc);
      // If not in local tables, call server-side resolve (BSD + API-Football)
      if (!result) {
        try {
          const res = await fetch(`/api/players/resolve?name=${encodeURIComponent(playerName.trim())}${skipFc ? "&skipFc=1" : ""}`);
          if (res.ok) result = await res.json();
        } catch { /* ignore */ }
      }
      if (!cancelled && result) setCard(result);
    })();

    return () => { cancelled = true; };
  }, [playerName, snapshot]);

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

function frozenToCard(row: NonNullable<ReturnType<typeof frozenRow>>): PlayerCardData {
  return {
    name: row.name,
    club: row.club ?? "",
    league: row.league ?? "",
    position: row.position ?? "",
    age: row.age ?? "",
    overall: row.overall,
    pace: row.pace ?? 0,
    shooting: row.shooting ?? 0,
    passing: row.passing ?? 0,
    dribbling: row.dribbling ?? 0,
    defending: row.defending ?? 0,
    physical: row.physical ?? 0,
    photo_url: row.photo_url ?? undefined,
  };
}
