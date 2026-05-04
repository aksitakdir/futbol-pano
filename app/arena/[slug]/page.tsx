"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import SiteHeader from "../../components/site-header";
import SiteFooter from "../../components/site-footer";
import Breadcrumb from "../../components/breadcrumb";
import ArenaDuel from "../../components/arena-duel";
import { supabase } from "@/lib/supabase";
import type { ArenaGame } from "@/lib/arena-brackets";

export default function ArenaBracketPage() {
  const params = useParams<{ slug: string }>();
  const searchParams = useSearchParams();
  const slug = params?.slug ?? "";
  const lang = (searchParams.get("lang") || "tr") as "tr" | "en";
  const isEn = lang === "en";

  const [game, setGame] = useState<ArenaGame | null>(null);
  const [loading, setLoading] = useState(true);
  const [duelKey, setDuelKey] = useState(0);

  useEffect(() => {
    if (!slug) return;
    supabase
      .from("arena_games")
      .select("*")
      .eq("slug", slug)
      .maybeSingle()
      .then(({ data }) => {
        setGame(data as ArenaGame | null);
        setLoading(false);
      });
  }, [slug]);

  const remount = useCallback(() => setDuelKey((k) => k + 1), []);

  if (loading) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center" style={{ background: "var(--sg-bg)" }}>
        <span className="h-6 w-6 animate-spin rounded-full border-2 border-t-transparent" style={{ borderColor: "var(--sg-primary)", borderTopColor: "transparent" }} />
      </main>
    );
  }

  if (!game) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center px-4" style={{ background: "var(--sg-bg)", color: "var(--sg-text-primary)" }}>
        <h1 className="text-2xl font-bold">404</h1>
        <p className="mt-2 text-sm" style={{ color: "var(--sg-text-muted)" }}>
          {isEn ? "This arena game was not found." : "Bu arena oyunu bulunamadı."}
        </p>
        <Link
          href="/arena"
          className="mt-6 px-5 py-2 text-sm font-semibold transition hover:opacity-80"
          style={{ border: "1px solid rgba(26,58,92,0.6)", color: "var(--sg-primary)" }}
        >
          {isEn ? "← All arenas" : "← Tüm arenalar"}
        </Link>
      </main>
    );
  }

  const title = isEn ? game.title_en : game.title_tr;

  return (
    <main className="flex min-h-screen flex-col" style={{ background: "var(--sg-bg)", color: "var(--sg-text-primary)" }}>
      <SiteHeader activeNav="arena" maxWidth="max-w-7xl" forceEn={isEn} />

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
          style={{ border: "1px solid rgba(26,58,92,0.6)", background: "var(--sg-surface)", color: "var(--sg-text-secondary)" }}
        >
          ← {isEn ? "All Arenas" : "Tüm Arenalar"}
        </Link>
        <button
          type="button"
          onClick={remount}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold transition hover:opacity-80"
          style={{ border: "1px solid rgba(26,58,92,0.6)", background: "var(--sg-surface)", color: "var(--sg-text-secondary)" }}
        >
          🔀 {isEn ? "New Matchups" : "Yeni Eşleşme"}
        </button>
      </div>

      {/* Title */}
      <div className="mx-auto w-full max-w-2xl px-4 pb-6 text-center">
        <h1
          className="text-2xl font-black tracking-tight md:text-3xl"
          style={{ fontFamily: "var(--font-headline)", color: "var(--sg-text-primary)" }}
        >
          {title}
        </h1>
        <p className="mt-2 text-sm" style={{ color: "var(--sg-text-secondary)" }}>
          {isEn ? game.description_en : game.description_tr}
        </p>
      </div>

      {/* Duel */}
      {game.participants?.length > 0 && (
        <ArenaDuel
          key={duelKey}
          participants={game.participants}
          gameType={game.game_type}
          title={title}
          lang={lang}
        />
      )}

      <div className="mt-auto">
        <SiteFooter maxWidth="max-w-7xl" />
      </div>
    </main>
  );
}
