"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import PlayerCard, { type PlayerCardData } from "./player-card";

async function fetchPlayerStats(name: string): Promise<Partial<PlayerCardData> | null> {
  const { data: exact } = await supabase
    .from("fc_players")
    .select("overall,pace,shooting,passing,dribbling,defending,physical,position,club,league,age,photo_url")
    .ilike("name", name)
    .limit(1)
    .maybeSingle();
  if (exact?.overall) return exact;
  const two = name.split(" ").slice(0, 2).join(" ");
  const { data: fuzzy } = await supabase
    .from("fc_players")
    .select("overall,pace,shooting,passing,dribbling,defending,physical,position,club,league,age,photo_url")
    .ilike("name", `%${two}%`)
    .order("overall", { ascending: false })
    .limit(1)
    .maybeSingle();
  return fuzzy?.overall ? fuzzy : null;
}

/** Metin içinde <!-- scout-player:... --> ile işaretlenen yere render edilir */
export default function ArticlePlayerEmbed({
  playerName,
  locale = "tr",
}: {
  playerName: string;
  locale?: "tr" | "en";
}) {
  const [card, setCard] = useState<PlayerCardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const stats = await fetchPlayerStats(playerName.trim());
      if (cancelled) return;
      if (stats?.overall) {
        setCard({
          name: playerName.trim(),
          club: (stats as { club?: string }).club ?? "",
          league: (stats as { league?: string }).league ?? "",
          position: (stats as { position?: string }).position ?? "",
          age: (stats as { age?: number }).age ?? "",
          overall: stats.overall!,
          pace: stats.pace ?? 0,
          shooting: stats.shooting ?? 0,
          passing: stats.passing ?? 0,
          dribbling: stats.dribbling ?? 0,
          defending: stats.defending ?? 0,
          physical: stats.physical ?? 0,
          photo_url: (stats as { photo_url?: string }).photo_url,
        });
      } else {
        setCard(null);
      }
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [playerName]);

  const tmBase =
    locale === "en"
      ? "https://www.transfermarkt.com/schnellsuche/ergebnis/schnellsuche?query="
      : "https://www.transfermarkt.com.tr/schnellsuche/ergebnis/schnellsuche?query=";
  const gq = locale === "en" ? " footballer" : " futbolcu";

  return (
    <div
      className="article-player-embed my-10 flex justify-center"
      style={{ clear: "both" }}
      data-scout-embed={playerName.trim()}
    >
      {loading ? (
        <div
          style={{
            width: "100%",
            maxWidth: 280,
            minHeight: 200,
            borderRadius: 8,
            border: "1px solid var(--sg-border)",
            background: "var(--sg-surface-low)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span
            className="h-6 w-6 animate-spin rounded-full border-2 border-t-transparent"
            style={{ borderColor: "var(--accent)", borderTopColor: "transparent" }}
          />
        </div>
      ) : card ? (
        <div style={{ width: "100%", maxWidth: 280 }}>
          <PlayerCard
            player={card}
            compact
            animated={false}
            showScoutNote={false}
            tmLink={`${tmBase}${encodeURIComponent(card.name)}`}
            gLink={`https://www.google.com/search?q=${encodeURIComponent(card.name + gq)}`}
          />
        </div>
      ) : (
        <div
          style={{
            width: "100%",
            maxWidth: 420,
            padding: "16px 20px",
            borderRadius: 8,
            border: "1px dashed var(--sg-border)",
            background: "var(--sg-surface-low)",
            fontSize: 14,
            color: "var(--sg-text-muted)",
            textAlign: "center",
          }}
        >
          EA FC veritabanında bulunamadı: <strong style={{ color: "var(--sg-text-primary)" }}>{playerName.trim()}</strong>
        </div>
      )}
    </div>
  );
}
