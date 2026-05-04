"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import SiteHeader from "../../components/site-header";
import SiteFooter from "../../components/site-footer";
import Breadcrumb from "../../components/breadcrumb";
import ArenaDuel from "../../components/arena-duel";
import type { ArenaGame } from "@/lib/arena-brackets";

type Props = {
  game: ArenaGame;
  lang: "tr" | "en";
  canonicalUrl: string;
};

export default function ArenaSlugClient({ game, lang, canonicalUrl }: Props) {
  const isEn = lang === "en";
  const title = isEn ? game.title_en : game.title_tr;
  const description = isEn ? game.description_en : game.description_tr;

  const [duelKey, setDuelKey] = useState(0);
  const remount = useCallback(() => setDuelKey((k) => k + 1), []);

  return (
    <main
      className="flex min-h-screen flex-col"
      style={{ background: "var(--sg-bg)", color: "var(--sg-text-primary)" }}
    >
      <SiteHeader activeNav="arena" maxWidth="max-w-7xl" forceEn={isEn} />

      {/* Fixed header stuff — breadcrumb + controls + title */}
      <div className="mx-auto w-full max-w-7xl px-4 pt-[88px] pb-2">
        <Breadcrumb
          items={[
            { label: isEn ? "Arena" : "Oyna & Paylaş", href: isEn ? "/en/arena" : "/arena" },
            { label: title },
          ]}
        />
      </div>

      <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center gap-3 px-4 pb-4">
        <Link
          href={isEn ? "/en/arena" : "/arena"}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold transition hover:opacity-80"
          style={{
            border: "1px solid rgba(26,58,92,0.6)",
            background: "var(--sg-surface)",
            color: "var(--sg-text-secondary)",
          }}
        >
          ← {isEn ? "All Arenas" : "Tüm Arenalar"}
        </Link>
        <button
          type="button"
          onClick={remount}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold transition hover:opacity-80"
          style={{
            border: "1px solid rgba(26,58,92,0.6)",
            background: "var(--sg-surface)",
            color: "var(--sg-text-secondary)",
          }}
        >
          🔀 {isEn ? "New Matchups" : "Yeni Eşleşme"}
        </button>
      </div>

      <div className="mx-auto w-full max-w-2xl px-4 pb-6 text-center">
        <h1
          className="text-2xl font-black tracking-tight md:text-3xl"
          style={{ fontFamily: "var(--font-headline)", color: "var(--sg-text-primary)" }}
        >
          {title}
        </h1>
        <p className="mt-2 text-sm" style={{ color: "var(--sg-text-secondary)" }}>
          {description}
        </p>
      </div>

      {/* Duel — flex-1 so it fills the remaining space and pushes footer below the fold */}
      {game.participants?.length > 0 && (
        <div className="flex flex-1 flex-col">
          <ArenaDuel
            key={duelKey}
            participants={game.participants}
            gameType={game.game_type}
            title={title}
            lang={lang}
            canonicalUrl={canonicalUrl}
          />
        </div>
      )}

      <SiteFooter maxWidth="max-w-7xl" />
    </main>
  );
}
