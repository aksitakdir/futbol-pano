"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { getCategoryImage } from "@/lib/category-images";

export type HomeRecentItem = {
  id: string;
  title: string;
  title_en?: string;
  slug: string;
  category: string;
  created_at: string;
  cover_image?: string;
};

const CAT_COLOR: Record<string, string> = {
  listeler: "var(--sg-secondary)",
  radar: "var(--sg-primary)",
  "taktik-lab": "var(--sg-tertiary)",
  arena: "var(--sg-amber)",
};

const CAT_LABEL_TR: Record<string, string> = { listeler: "Listeler", radar: "Radar", "taktik-lab": "Taktik Lab" };
const CAT_LABEL_EN: Record<string, string> = {
  listeler: "Scouting Lists",
  radar: "Radar",
  "taktik-lab": "Tactics Lab",
};

function itemHref(category: string, slug: string, locale: "tr" | "en"): string {
  const base = locale === "en" ? "/en" : "";
  if (category === "listeler") return `${base}/listeler/${slug}`;
  if (category === "radar") return `${base}/radar/${slug}`;
  if (category === "taktik-lab") return `${base}/taktik-lab/${slug}`;
  return locale === "en" ? `/en/listeler/${slug}` : `/listeler/${slug}`;
}

export default function HomeRecentCarousel({
  items,
  locale,
}: {
  items: HomeRecentItem[];
  locale: "tr" | "en";
}) {
  const [page, setPage] = useState(0);
  const [perView, setPerView] = useState(3);

  useEffect(() => {
    const mq = () => {
      const w = typeof window !== "undefined" ? window.innerWidth : 1200;
      if (w < 640) setPerView(1);
      else if (w < 1024) setPerView(2);
      else setPerView(3);
    };
    mq();
    window.addEventListener("resize", mq);
    return () => window.removeEventListener("resize", mq);
  }, []);

  const pageCount = Math.max(1, Math.ceil(items.length / perView));

  useEffect(() => {
    setPage((p) => Math.min(p, pageCount - 1));
  }, [pageCount, items.length]);

  const pages = useMemo(() => {
    const chunks: HomeRecentItem[][] = [];
    for (let i = 0; i < items.length; i += perView) {
      chunks.push(items.slice(i, i + perView));
    }
    return chunks.length ? chunks : [[]];
  }, [items, perView]);

  const safePage = Math.min(page, Math.max(0, pages.length - 1));

  const goPrev = useCallback(() => setPage((p) => Math.max(0, p - 1)), []);
  const goNext = useCallback(() => setPage((p) => Math.min(pageCount - 1, p + 1)), [pageCount]);

  const labels = locale === "en" ? CAT_LABEL_EN : CAT_LABEL_TR;
  const archiveHref = locale === "en" ? "/en/listeler" : "/listeler";

  if (!items.length) return null;

  return (
    <section style={{ maxWidth: 1440, margin: "0 auto", padding: "80px 32px 40px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 24 }}>
        <div>
          <div className="eyebrow" style={{ color: "var(--accent)" }}>
            {locale === "en" ? "DISCOVER" : "KEŞFET"}
          </div>
          <h2 className="display" style={{ fontSize: 36, fontWeight: 700, letterSpacing: "-0.03em", margin: "6px 0 0" }}>
            {locale === "en" ? "Latest Content" : "Son Eklenenler"}
          </h2>
        </div>
        <Link href={archiveHref} className="mono u-link" style={{ fontSize: 12, letterSpacing: "0.14em", color: "var(--sg-text-muted)" }}>
          {locale === "en" ? "ARCHIVE →" : "ARŞİV →"}
        </Link>
      </div>

      <div style={{ display: "flex", alignItems: "stretch", gap: 12 }}>
        <button
          type="button"
          aria-label={locale === "en" ? "Previous" : "Önceki"}
          onClick={goPrev}
          disabled={safePage <= 0}
          className="btn hidden shrink-0 sm:flex"
          style={{
            alignSelf: "center",
            padding: "10px 14px",
            borderRadius: 999,
            opacity: safePage <= 0 ? 0.35 : 1,
            cursor: safePage <= 0 ? "default" : "pointer",
          }}
        >
          ←
        </button>

        <div style={{ flex: 1, minWidth: 0, overflow: "hidden" }}>
          <div
            style={{
              display: "flex",
              transition: "transform 0.38s cubic-bezier(0.22, 1, 0.36, 1)",
              transform: `translateX(-${safePage * 100}%)`,
            }}
          >
            {pages.map((chunk, pi) => (
              <div
                key={pi}
                style={{
                  flex: "0 0 100%",
                  display: "grid",
                  gridTemplateColumns: `repeat(${Math.min(perView, chunk.length || 1)}, minmax(0, 1fr))`,
                  gap: 16,
                  paddingLeft: 2,
                  paddingRight: 2,
                }}
              >
                {chunk.map((item) => {
                  const accentColor = CAT_COLOR[item.category] ?? "var(--accent)";
                  const catLabel = labels[item.category] ?? item.category;
                  const title = locale === "en" ? item.title_en || item.title : item.title;
                  return (
                    <Link
                      key={item.id}
                      href={itemHref(item.category, item.slug, locale)}
                      className="lift"
                      style={{
                        background: "var(--sg-surface)",
                        border: "1px solid var(--sg-border)",
                        borderRadius: 4,
                        overflow: "hidden",
                        display: "flex",
                        flexDirection: "column",
                      }}
                    >
                      <div style={{ height: 2, background: accentColor }} />
                      <div className="relative overflow-hidden" style={{ height: 160, background: "var(--sg-surface-low)" }}>
                        <Image
                          src={item.cover_image || getCategoryImage(item.category, item.slug)}
                          alt=""
                          fill
                          className="object-cover"
                          style={{ filter: "brightness(0.58) saturate(0.82)" }}
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        />
                        <div
                          style={{
                            position: "absolute",
                            bottom: 12,
                            left: 16,
                            right: 16,
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          <span className="mono" style={{ fontSize: 10, letterSpacing: "0.18em", color: accentColor }}>
                            {catLabel}
                          </span>
                          <span className="mono" style={{ fontSize: 10, letterSpacing: "0.14em", color: "var(--ink-400)" }}>
                            {new Date(item.created_at).toLocaleDateString(locale === "en" ? "en-US" : "tr-TR", {
                              day: "numeric",
                              month: "short",
                            })}
                          </span>
                        </div>
                      </div>
                      <div style={{ padding: "16px 20px 20px", flex: 1, display: "flex", flexDirection: "column" }}>
                        <h3
                          className="display"
                          style={{
                            fontSize: 17,
                            fontWeight: 600,
                            letterSpacing: "-0.02em",
                            lineHeight: 1.2,
                            margin: 0,
                            textWrap: "balance",
                          }}
                        >
                          {title}
                        </h3>
                        <div className="mono" style={{ fontSize: 10, letterSpacing: "0.16em", color: "var(--ink-400)", marginTop: 12 }}>
                          {locale === "en" ? "READ →" : "OKU →"}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        <button
          type="button"
          aria-label={locale === "en" ? "Next" : "Sonraki"}
          onClick={goNext}
          disabled={safePage >= pageCount - 1}
          className="btn hidden shrink-0 sm:flex"
          style={{
            alignSelf: "center",
            padding: "10px 14px",
            borderRadius: 999,
            opacity: safePage >= pageCount - 1 ? 0.35 : 1,
            cursor: safePage >= pageCount - 1 ? "default" : "pointer",
          }}
        >
          →
        </button>
      </div>

      {/* Mobil oklar */}
      <div className="mt-4 flex justify-center gap-3 sm:hidden">
        <button type="button" onClick={goPrev} disabled={safePage <= 0} className="btn" style={{ padding: "8px 18px", borderRadius: 999 }}>
          ←
        </button>
        <button
          type="button"
          onClick={goNext}
          disabled={safePage >= pageCount - 1}
          className="btn"
          style={{ padding: "8px 18px", borderRadius: 999 }}
        >
          →
        </button>
      </div>

      {/* Sayfa göstergesi — hero slider ile aynı ince çubuk dili */}
      <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
        {pages.map((_, i) => (
          <button
            key={i}
            type="button"
            aria-label={`${locale === "en" ? "Page" : "Sayfa"} ${i + 1}`}
            aria-current={i === safePage ? "true" : undefined}
            onClick={() => setPage(i)}
            style={{
              width: i === safePage ? 32 : 12,
              height: 3,
              borderRadius: 2,
              border: "none",
              padding: 0,
              background: i === safePage ? "var(--accent)" : "rgba(255,255,255,0.3)",
              transition: "all 0.3s",
              cursor: "pointer",
            }}
          />
        ))}
      </div>

    </section>
  );
}
