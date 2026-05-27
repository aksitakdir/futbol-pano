"use client";

import { useEffect, useState } from "react";
import type { LiveScoreMatch } from "@/app/api/wc-live-scores/route";

export default function WcLiveScoresBar() {
  const [matches, setMatches] = useState<LiveScoreMatch[]>([]);

  useEffect(() => {
    fetch("/api/wc-live-scores")
      .then((r) => r.json())
      .then((d) => setMatches(d.matches ?? []))
      .catch(() => setMatches([]));
  }, []);

  if (matches.length === 0) return null;

  const label = "LIVE SCORES";

  return (
    <div className="wc-live-scores" role="region" aria-label={label}>
      <div className="wc-live-scores__label mono">
        <span className="wc-live-scores__dot" aria-hidden />
        {label}
      </div>
      <div className="wc-live-scores__track">
        <div className="wc-live-scores__marquee">
          {[...matches, ...matches].map((m, i) => (
            <div key={`${m.id}-${i}`} className="wc-live-scores__match">
              <span className="wc-live-scores__comp mono">
                {m.competitionEn}
              </span>
              <span className="wc-live-scores__teams">
                <span className="mono">{m.homeCode}</span> {m.home}
                <span className="wc-live-scores__vs">vs</span>
                <span className="mono">{m.awayCode}</span> {m.away}
              </span>
              <span className={`wc-live-scores__score wc-live-scores__score--${m.status}`}>
                {m.score}
              </span>
              <span className="mono wc-live-scores__min">{m.minute}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
