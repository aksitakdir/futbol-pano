"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  WC_2026_TEAM_COUNT,
  wcConfederationLabel,
  wcTeamsByLetter,
  type WcConfederation,
} from "@/lib/wc-2026-teams";
import WcTeamFlag from "./wc-team-flag";

type Props = {
  squadsBasePath: string;
};

const ALL_CONF: WcConfederation[] = ["UEFA", "CONMEBOL", "CONCACAF", "CAF", "AFC", "OFC"];

const CONF_DOT: Record<WcConfederation, string> = {
  UEFA: "var(--sky)",
  CONMEBOL: "var(--emerald)",
  CONCACAF: "var(--cyan)",
  CAF: "var(--amber)",
  AFC: "var(--rose)",
  OFC: "var(--lime)",
};

export default function WcTeamGrid({ squadsBasePath }: Props) {
  const [filter, setFilter] = useState<WcConfederation | "ALL">("ALL");

  const letterGroups = useMemo(() => wcTeamsByLetter(filter), [filter]);

  const copy = {
    title: "48 FINALISTS",
    sub: `${WC_2026_TEAM_COUNT} nations — A–Z with flags, tap for squad`,
    all: "ALL",
    squad: "Squad",
  };

  return (
    <div className="wc-hub-block">
      <header className="wc-hub-block__head">
        <div className="eyebrow wc-eyebrow">{copy.title}</div>
        <p className="wc-hub-block__sub">{copy.sub}</p>

        <nav className="wc-conf-nav" aria-label="Confederation filter">
          <div className="wc-conf-nav__track">
            <button
              type="button"
              className={`wc-conf-nav__chip${filter === "ALL" ? " wc-conf-nav__chip--active" : ""}`}
              onClick={() => setFilter("ALL")}
            >
              {copy.all}
            </button>
            {ALL_CONF.map((c) => (
              <button
                key={c}
                type="button"
                className={`wc-conf-nav__chip${filter === c ? " wc-conf-nav__chip--active" : ""}`}
                onClick={() => setFilter(c)}
              >
                <span className="wc-conf-nav__dot" style={{ background: CONF_DOT[c] }} aria-hidden />
                {wcConfederationLabel(c)}
              </button>
            ))}
          </div>
        </nav>
      </header>

      <div className="wc-team-directory">
        {letterGroups.map(({ letter, teams }) => (
          <section key={letter} className="wc-team-letter-group" aria-labelledby={`wc-letter-${letter}`}>
            <div className="wc-team-letter-group__head" id={`wc-letter-${letter}`}>
              <span className="wc-team-letter-group__letter display">{letter}</span>
              <span className="wc-team-letter-group__rule" aria-hidden />
              <span className="mono wc-team-letter-group__count">{teams.length}</span>
            </div>

            <ul className="wc-team-card-list" role="list">
              {teams.map((t) => (
                <li key={t.slug} className="wc-team-card-list__item">
                  <Link
                    href={`${squadsBasePath}/${t.slug}`}
                    className="wc-team-card lift"
                    style={
                      {
                        "--wc-team-primary": t.primary,
                        "--wc-team-secondary": t.secondary,
                      } as React.CSSProperties
                    }
                  >
                    <span className="wc-team-card__accent" aria-hidden />
                    <span className="wc-team-card__flag">
                      <WcTeamFlag slug={t.slug} name={t.name} size="md" />
                    </span>
                    <span className="wc-team-card__body">
                      <span className="wc-team-card__name display">{t.name}</span>
                      <span className="wc-team-card__meta mono">
                        <span className="wc-team-card__code">{t.code}</span>
                        <span className="wc-team-card__sep" aria-hidden>
                          ·
                        </span>
                        <span className="wc-team-card__conf" style={{ color: CONF_DOT[t.conf] }}>
                          {wcConfederationLabel(t.conf)}
                        </span>
                      </span>
                    </span>
                    <span className="mono wc-team-card__cta">{copy.squad} →</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
