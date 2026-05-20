"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { arenaPath, CARD_COLOR_MAP, type ArenaGame } from "@/lib/arena-brackets";
import { featuredArenaSlug } from "@/lib/hub-arena-featured";
import type { HubId, HubLocale } from "@/lib/hub-config";
import PageShell from "@/app/components/page-shell";

type Props = { hubId: HubId; locale: HubLocale };

export default function HubFeaturedArenaBanner({ hubId, locale }: Props) {
  const slug = featuredArenaSlug(hubId);
  const [game, setGame] = useState<ArenaGame | null>(null);

  useEffect(() => {
    if (!slug) return;
    supabase
      .from("arena_games")
      .select("*")
      .eq("slug", slug)
      .eq("status", "published")
      .maybeSingle()
      .then(({ data }) => setGame((data as ArenaGame) ?? null));
  }, [slug]);

  if (!slug) return null;

  const copy =
    locale === "tr"
      ? { eyebrow: "ARENA", cta: "OYNA →", fallbackTitle: "DK 2026 Şampiyonu Kim?", fallbackTeaser: "48 takım — bracket ile kupayı seç." }
      : { eyebrow: "ARENA", cta: "PLAY →", fallbackTitle: "Who Wins World Cup 2026?", fallbackTeaser: "48 nations — bracket your champion." };

  const title = game ? (locale === "en" ? game.hero_title_en || game.title_en : game.hero_title_tr) : copy.fallbackTitle;
  const teaser = game ? (locale === "en" ? game.hero_teaser_en || game.hero_teaser_tr : game.hero_teaser_tr) : copy.fallbackTeaser;
  const accent = game ? CARD_COLOR_MAP[game.card_color] ?? "var(--wc-gold)" : "var(--wc-gold)";
  const href = `${arenaPath(slug)}${locale === "en" ? "?lang=en" : ""}`;

  return (
    <PageShell as="section" className="hub-featured-arena-wrap">
      <Link
        href={href}
        className="hub-featured-arena lift"
        style={{ ["--hub-featured-accent" as string]: accent }}
      >
        <span className="hub-featured-arena__bar" style={{ background: accent }} />
        <span className="mono hub-featured-arena__tag">{copy.eyebrow}</span>
        <h2 className="display hub-featured-arena__title">{title}</h2>
        <p className="hub-featured-arena__teaser">{teaser}</p>
        <span className="btn btn-solid hub-featured-arena__btn">{copy.cta}</span>
      </Link>
    </PageShell>
  );
}
