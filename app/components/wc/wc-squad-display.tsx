"use client";

import { useMemo, useState } from "react";
import PlayerCard from "@/app/components/player-card";
import { POSITION_BUCKET_ORDER, positionBucketLabel } from "@/lib/position-buckets";
import { overallTone, overallToneCssVar } from "@/lib/overall-tone";
import type { WcSquadListPlayer } from "@/lib/wc-squad-loader";

type Props = {
  players: WcSquadListPlayer[];
  teamName: string;
  teamPrimary: string;
};

function chipLabel(p: WcSquadListPlayer): string {
  if (p.overall != null) return String(p.overall);
  return "—";
}

export default function WcSquadDisplay({ players, teamPrimary }: Props) {
  const [expandedKey, setExpandedKey] = useState<string | null>(null);

  const grouped = useMemo(() => {
    const m = new Map<string, WcSquadListPlayer[]>();
    for (const b of POSITION_BUCKET_ORDER) {
      const list = players.filter((p) => p.bucket === b);
      if (list.length) m.set(b, list);
    }
    return m;
  }, [players]);

  const copy = {
    empty: "SQUAD DATA COMING SOON.",
    noCard: "No FC card — name and club below.",
    hasCard: "Scout card",
  };

  if (players.length === 0) {
    return (
      <p className="mono wc-squad-empty">{copy.empty}</p>
    );
  }

  return (
    <div className="wc-squad-sections">
      {POSITION_BUCKET_ORDER.map((bucket) => {
        const list = grouped.get(bucket);
        if (!list?.length) return null;
        return (
          <section
            key={bucket}
            className="wc-squad-section"
            style={{ "--wc-section-accent": teamPrimary } as React.CSSProperties}
          >
            <header className="wc-squad-section__head">
              <span className="wc-squad-section__bar" aria-hidden />
              <h2 className="display wc-squad-section__title">{positionBucketLabel(bucket)}</h2>
              <span className="mono wc-squad-section__count">{list.length}</span>
            </header>

            <ul className="wc-squad-roster" role="list">
              {list.map((player) => {
                const key = player.id ?? player.name;
                const isOpen = expandedKey === key;
                const tone = overallTone(player.overall);
                const toneColor = overallToneCssVar(tone);
                const canOpenCard = player.hasFcCard && !!player.fcCard;

                return (
                  <li key={key} className="wc-squad-roster__item">
                    <article
                      className={`wc-squad-player-card wc-squad-player-card--${tone}${tone === "unknown" ? " wc-squad-player-card--unknown" : ""}${isOpen ? " wc-squad-player-card--open" : ""}`}
                      style={{ "--wc-player-accent": toneColor } as React.CSSProperties}
                    >
                      <button
                        type="button"
                        className="wc-squad-player-card__trigger"
                        onClick={() => setExpandedKey(isOpen ? null : key)}
                        aria-expanded={isOpen}
                      >
                        <span className="wc-squad-player-card__ovr mono" aria-label="Overall">
                          {chipLabel(player)}
                        </span>

                        <span className="wc-squad-player-card__main">
                          <span className="wc-squad-player-card__name display">{player.name}</span>
                          <span className="wc-squad-player-card__meta">
                            <span className="wc-squad-player-card__pos mono">{player.position}</span>
                            {player.club ? (
                              <span className="wc-squad-player-card__club">{player.club}</span>
                            ) : null}
                          </span>
                        </span>

                        {canOpenCard ? (
                          <span className="wc-squad-player-card__action mono">
                            {isOpen ? "Close" : copy.hasCard}
                          </span>
                        ) : null}
                      </button>

                      {isOpen ? (
                        <div className="wc-squad-player-card__panel">
                          {canOpenCard && player.fcCard ? (
                            <div className="wc-squad-player-card__card-wrap">
                              <PlayerCard
                                player={player.fcCard}
                                compact
                                animated={false}
                                showScoutNote={false}
                                tmLink={`https://www.transfermarkt.com/schnellsuche/ergebnis/schnellsuche?query=${encodeURIComponent(player.name)}`}
                                gLink={`https://www.google.com/search?q=${encodeURIComponent(player.name + " footballer")}`}
                              />
                            </div>
                          ) : (
                            <p className="mono wc-squad-player-card__fallback">{copy.noCard}</p>
                          )}
                        </div>
                      ) : null}
                    </article>
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
