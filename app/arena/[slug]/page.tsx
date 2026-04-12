"use client";

import { useMemo, useState, useCallback } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import SiteHeader from "../../components/site-header";
import SiteFooter from "../../components/site-footer";
import Breadcrumb from "../../components/breadcrumb";
import { getArenaBracketBySlug } from "@/lib/arena-brackets";

export default function ArenaBracketPage() {
  const params = useParams<{ slug: string }>();
  const searchParams = useSearchParams();
  const slug = params?.slug ?? "";
  const bracket = getArenaBracketBySlug(slug);
  const lang = searchParams.get("lang") || "tr";

  const [iframeKey, setIframeKey] = useState(0);
  const remountIframe = useCallback(() => setIframeKey((k) => k + 1), []);

  const valid = bracket !== undefined;

  const title = bracket?.cardTitle ?? "Arena";

  const iframeSrc = useMemo(() => {
    if (!bracket) return "";
    return `/ucl-bracket.html?t=${bracket.queryT}&lang=${lang}`;
  }, [bracket, lang]);

  if (!valid) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-slate-950 px-4 text-slate-100">
        <h1 className="text-2xl font-bold">404</h1>
        <p className="mt-2 text-sm text-slate-400">Bu bracket bulunamadı.</p>
        <Link
          href="/arena"
          className="mt-6 rounded-full border border-slate-600 px-5 py-2 text-sm text-emerald-300 hover:border-emerald-500"
        >
          Oyna & Paylaş ana sayfası
        </Link>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100">
      <SiteHeader activeNav="arena" maxWidth="max-w-7xl" />

      <div className="mx-auto w-full max-w-7xl px-4 py-3">
        <Breadcrumb
          items={[
            { label: "Oyna & Paylaş", href: "/arena" },
            { label: title },
          ]}
        />
      </div>

      <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center gap-3 px-4 pb-3">
        <Link
          href="/arena"
          className="inline-flex items-center gap-2 rounded-full border border-slate-700/80 bg-slate-900/80 px-4 py-2 text-xs font-semibold text-slate-300 transition hover:border-emerald-500/50 hover:text-emerald-300"
        >
          ← Tüm bracket’lar
        </Link>
        <button
          type="button"
          onClick={remountIframe}
          className="inline-flex items-center gap-2 rounded-full border border-slate-700/80 bg-slate-900/80 px-4 py-2 text-xs font-semibold text-slate-300 transition hover:border-cyan-500/50 hover:text-cyan-300"
        >
          Yeni eşleşme
        </button>
      </div>

      <iframe
        key={`${bracket.slug}-${iframeKey}`}
        src={iframeSrc}
        className="w-full flex-1 border-none bg-transparent"
        style={{ minHeight: "calc(100vh - 160px)" }}
        title={title}
      />

      <SiteFooter maxWidth="max-w-7xl" />
    </main>
  );
}
