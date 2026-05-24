"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { arenaPath, CARD_COLOR_MAP, type ArenaGame } from "@/lib/arena-brackets";
import PageShell from "@/app/components/page-shell";
type Props = {
  hubId: string;
  locale?: string;
  teamSlug?: string;
};

export default function HubArenaStrip({ hubId, teamSlug }: Props) {
  const [games, setGames] = useState<ArenaGame[]>([]);
  const tag = hubId === "wc-2026" ? "wc-2026" : "transfer";

  useEffect(() => {
    supabase
      .from("arena_games")
      .select("*")
      .eq("status", "published")
      .contains("hub_tags", [tag])
      .order("created_at", { ascending: false })
      .limit(teamSlug ? 6 : 4)
      .then(({ data, error }) => {
        if (error || !data) { setGames([]); return; }
        let rows = data as ArenaGame[];
        if (teamSlug) rows = rows.filter((g) => !g.team_slug || g.team_slug === teamSlug);
        setGames(rows.slice(0, 3));
      });
  }, [tag, teamSlug]);

  if (games.length === 0) return null;

  const title = hubId === "wc-2026" ? "WC 2026 ARENA" : "TRANSFER ARENA";

  return (
    <section className={hubId === "wc-2026" ? "wc-arena-strip" : "transfer-arena-strip"}>
      <PageShell className="sg-page-shell--section" style={{ paddingTop: 0 }}>
        <div className="eyebrow" style={{ marginBottom: 20 }}>{title}</div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {games.map((g) => {
            const accent = CARD_COLOR_MAP[g.card_color] ?? "var(--accent)";
            const t = g.title_en || g.title_tr;
            const teaser = g.hero_teaser_en || g.hero_teaser_tr;
            const href = `${arenaPath(g.slug)}?lang=en`;
            return (
              <Link key={g.id} href={href} className="lift hub-arena-card"
                style={{ borderColor: `${accent}55`, ["--hub-arena-accent" as string]: accent }}>
                <span className="hub-arena-card__bar" style={{ background: accent }} />
                <span className="mono hub-arena-card__tag">ARENA</span>
                <h3 className="display hub-arena-card__title">{t}</h3>
                <p className="hub-arena-card__teaser">{teaser}</p>
                <span className="mono hub-arena-card__cta">PLAY →</span>
              </Link>
            );
          })}
        </div>
        <div style={{ marginTop: 20 }}>
          <Link href="/arena" className="btn">ALL ARENA →</Link>
        </div>
      </PageShell>
    </section>
  );
}
