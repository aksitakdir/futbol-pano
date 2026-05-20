"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { arenaPath, CARD_COLOR_MAP, type ArenaGame } from "@/lib/arena-brackets";
import { TRANSFER_TEAM_ARENA_SLUGS } from "@/lib/hub-arena-featured";
import PageShell from "@/app/components/page-shell";

type Props = { locale: "tr" | "en" };

type Card = {
  teamSlug: string;
  title: string;
  teaser: string;
  href: string;
  accent: string;
};

export default function HubTransferTeamArenas({ locale }: Props) {
  const [cards, setCards] = useState<Card[]>([]);

  useEffect(() => {
    supabase
      .from("arena_games")
      .select("*")
      .eq("status", "published")
      .contains("hub_tags", ["transfer"])
      .then(({ data }) => {
        const games = (data ?? []) as ArenaGame[];
        const built: Card[] = TRANSFER_TEAM_ARENA_SLUGS.map((t) => {
          const match =
            games.find((g) => g.team_slug === t.teamSlug) ??
            games.find((g) => g.slug.includes(t.teamSlug.replace(/-/g, "")));
          const title = match
            ? locale === "en"
              ? match.hero_title_en || match.title_en
              : match.hero_title_tr
            : locale === "tr"
              ? t.fallbackTitleTr
              : t.fallbackTitleEn;
          const teaser = match
            ? locale === "en"
              ? match.hero_teaser_en || match.hero_teaser_tr
              : match.hero_teaser_tr
            : locale === "tr"
              ? "Arena'da aday seç, scout topluluğuyla paylaş."
              : "Pick signings in Arena and share.";
          const slug = match?.slug ?? `transfer-${t.teamSlug}`;
          const accent = match ? CARD_COLOR_MAP[match.card_color] ?? "var(--transfer-cyan)" : "var(--transfer-cyan)";
          return {
            teamSlug: t.teamSlug,
            title,
            teaser,
            href: `${arenaPath(slug)}${locale === "en" ? "?lang=en" : ""}`,
            accent,
          };
        });
        setCards(built);
      });
  }, [locale]);

  const copy =
    locale === "tr"
      ? {
          eyebrow: "KULÜP ARENA",
          title: "Kimi transfer etmeli?",
          sub: "En popüler kulüpler için Arena oyunları — adayını seç.",
          cta: "OYNA →",
        }
      : {
          eyebrow: "CLUB ARENA",
          title: "Who should they sign?",
          sub: "Arena games for top clubs — pick your targets.",
          cta: "PLAY →",
        };

  return (
    <PageShell as="section" className="sg-page-shell--section hub-transfer-team-arenas">
      <div className="eyebrow transfer-eyebrow">{copy.eyebrow}</div>
      <h2 className="display hub-transfer-team-arenas__title">{copy.title}</h2>
      <p className="hub-transfer-team-arenas__sub">{copy.sub}</p>

      <ul className="hub-transfer-team-arenas__grid">
        {cards.map((c) => (
          <li key={c.teamSlug}>
            <Link
              href={c.href}
              className="hub-transfer-team-arena-card lift"
              style={{ ["--hub-team-accent" as string]: c.accent }}
            >
              <span className="hub-transfer-team-arena-card__bar" style={{ background: c.accent }} />
              <h3 className="display hub-transfer-team-arena-card__title">{c.title}</h3>
              <p className="hub-transfer-team-arena-card__teaser">{c.teaser}</p>
              <span className="mono hub-transfer-team-arena-card__cta">{copy.cta}</span>
            </Link>
          </li>
        ))}
      </ul>
    </PageShell>
  );
}
