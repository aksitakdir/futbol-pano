"use client";

import { useMemo, useState } from "react";
import {
  extract,
  buildCards,
  buildReplyLines,
  buildTweet,
  buildInstagram,
  gapsOf,
  X_LIMIT,
} from "@/lib/social-extract.mjs";

type Props = {
  title: string;
  category: string;
  coverImage: string;
  slug: string;
  /** Public path for the article, used as the share link. */
  publicUrl: string;
  /** Live block editor contents — the source for every card and every line below. */
  sections?: unknown[];
};

type Format = { key: string; label: string; w: number; h: number };

const FORMATS: Format[] = [
  { key: "x", label: "X / Twitter (16:9)", w: 1200, h: 675 },
  { key: "square", label: "Instagram post (4:5)", w: 1080, h: 1350 },
  { key: "story", label: "Instagram story (9:16)", w: 1080, h: 1920 },
];

/**
 * Style A remains the house card and the default. The four below carry the
 * material from inside the article — a number, a contrast, the closing verdict,
 * the list of names — instead of the headline, and none of them needs a cover
 * image. Style A is untouched; these sit beside it.
 */
type CardOption = { key: string; label: string; hint: string; url: string; needsCover: boolean };

function buildStyleAUrl(p: Props, format: string): string {
  return `/api/social-card?${new URLSearchParams({
    cover: p.coverImage,
    title: p.title,
    category: p.category,
    format,
  }).toString()}`;
}

/** Swap the format on an already-built variant URL. */
function withFormat(url: string, format: string): string {
  const [path, query] = url.split("?");
  const params = new URLSearchParams(query);
  params.set("format", format);
  return `${path}?${params.toString()}`;
}

export default function SocialCardsPanel({ title, category, coverImage, slug, publicUrl, sections }: Props) {
  const [open, setOpen] = useState(false);
  const [activeFormat, setActiveFormat] = useState<Format>(FORMATS[0]);
  const [activeCard, setActiveCard] = useState(0);
  const [copied, setCopied] = useState<string | null>(null);
  const [showCopy, setShowCopy] = useState(false);

  const shareLink = `https://scoutgamer.com${publicUrl}`;

  // Everything the panel offers is derived from the blocks in the editor. No
  // network call, no API spend, and it works before the article is ever saved.
  const derived = useMemo(() => {
    const row = { title, category, slug, cover_image: coverImage, status: "" };
    const material = extract(sections ?? []);
    return {
      material,
      cards: buildCards(row, material, "") as { variant: string; label: string; url: string }[],
      replies: buildReplyLines(material) as string[],
      tweet: buildTweet(row, material, shareLink) as string,
      instagram: buildInstagram(row, material) as string,
      gaps: gapsOf(row, material) as string[],
    };
  }, [title, category, slug, coverImage, sections, shareLink]);

  const cardOptions: CardOption[] = useMemo(() => {
    const styleA: CardOption = {
      key: "cover",
      label: "Cover (Style A)",
      hint: "the house card — title over the cover image",
      url: buildStyleAUrl({ title, category, coverImage, slug, publicUrl }, "x"),
      needsCover: true,
    };
    return [
      styleA,
      ...derived.cards.map((c) => ({
        key: c.variant,
        label: c.variant.charAt(0).toUpperCase() + c.variant.slice(1),
        hint: c.label.replace(/^[a-z]+ — /, ""),
        url: c.url,
        needsCover: false,
      })),
    ];
  }, [derived.cards, title, category, coverImage, slug, publicUrl]);

  const active = cardOptions[Math.min(activeCard, cardOptions.length - 1)];
  const previewUrl = withFormat(active.url, activeFormat.key);

  async function copy(text: string, key: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      setTimeout(() => setCopied((c) => (c === key ? null : c)), 1500);
    } catch {
      /* ignore */
    }
  }

  async function downloadCard() {
    const res = await fetch(previewUrl);
    const blob = await res.blob();
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${slug || "scoutgamer"}-${active.key}-${activeFormat.key}.png`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(a.href);
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        disabled={!title}
        className="inline-flex items-center gap-2 rounded-lg border border-cyan-600/50 bg-cyan-500/10 px-4 py-2 text-xs font-semibold text-cyan-300 transition hover:bg-cyan-500/20 disabled:cursor-not-allowed disabled:opacity-40"
      >
        📣 Social Cards
      </button>
    );
  }

  return (
    <div className="space-y-5 rounded-xl border border-cyan-600/30 bg-cyan-500/5 p-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-cyan-200">📣 Social Cards</h3>
          <p className="text-[11px] text-slate-400">
            Everything below is quoted from the blocks in this editor. Nothing is written for you.
          </p>
        </div>
        <button type="button" onClick={() => setOpen(false)} className="text-xs text-slate-500 transition hover:text-slate-300">
          ✕ Close
        </button>
      </div>

      {/* Variant tabs — Style A first, then the content-carrying cards */}
      <div className="space-y-1.5">
        <div className="flex flex-wrap gap-2">
          {cardOptions.map((c, i) => {
            const disabled = c.needsCover && !coverImage;
            return (
              <button
                key={`${c.key}-${i}`}
                type="button"
                onClick={() => setActiveCard(i)}
                disabled={disabled}
                title={disabled ? "Add a cover image first" : c.hint}
                className={[
                  "rounded-lg border px-3 py-1.5 text-[11px] font-semibold transition disabled:cursor-not-allowed disabled:opacity-35",
                  i === activeCard
                    ? "border-cyan-500/60 bg-cyan-500/15 text-cyan-200"
                    : "border-slate-700/80 text-slate-400 hover:text-slate-200",
                ].join(" ")}
              >
                {c.label}
              </button>
            );
          })}
        </div>
        <p className="text-[10px] text-slate-500">{active.hint}</p>
      </div>

      {/* Format tabs */}
      <div className="flex flex-wrap gap-2">
        {FORMATS.map((f) => (
          <button
            key={f.key}
            type="button"
            onClick={() => setActiveFormat(f)}
            className={[
              "rounded-lg border px-3 py-1.5 text-[11px] font-semibold transition",
              activeFormat.key === f.key
                ? "border-cyan-500/60 bg-cyan-500/15 text-cyan-200"
                : "border-slate-700/80 text-slate-400 hover:text-slate-200",
            ].join(" ")}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Preview */}
      <div className="space-y-2">
        <div
          className="overflow-hidden rounded-lg border border-slate-700/60 bg-slate-900/60"
          style={{
            aspectRatio: `${activeFormat.w} / ${activeFormat.h}`,
            maxWidth: activeFormat.h > activeFormat.w ? 360 : "100%",
            margin: "0 auto",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={previewUrl} alt="Social card preview" className="h-full w-full object-cover" />
        </div>
        <div className="flex justify-center">
          <button
            type="button"
            onClick={downloadCard}
            className="rounded-lg bg-cyan-500 px-4 py-1.5 text-xs font-semibold text-slate-950 transition hover:bg-cyan-400"
          >
            ⬇ Download {active.label} · {activeFormat.label}
          </button>
        </div>
      </div>

      {/* Copy: share link */}
      <div className="flex items-center gap-2 rounded-lg border border-slate-700/60 bg-slate-900/40 px-3 py-2">
        <span className="truncate text-[11px] text-slate-400">{shareLink}</span>
        <button
          type="button"
          onClick={() => copy(shareLink, "link")}
          className="ml-auto shrink-0 rounded bg-slate-700/60 px-2 py-1 text-[10px] font-semibold text-slate-200 transition hover:bg-slate-600"
        >
          {copied === "link" ? "Copied!" : "Copy link"}
        </button>
      </div>

      {/* Post copy — derived, not generated */}
      <div className="space-y-3">
        <button
          type="button"
          onClick={() => setShowCopy((v) => !v)}
          className="rounded-lg border border-emerald-600/50 bg-emerald-500/10 px-4 py-2 text-xs font-semibold text-emerald-300 transition hover:bg-emerald-500/20"
        >
          {showCopy ? "▾ Post copy" : "▸ Post copy"}
        </button>

        {showCopy ? (
          <div className="space-y-4">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  X / Twitter — the one post with the link
                </label>
                <button
                  type="button"
                  onClick={() => copy(derived.tweet, "tweet")}
                  className="text-[10px] font-semibold text-cyan-400 hover:text-cyan-200"
                >
                  {copied === "tweet" ? "Copied!" : "Copy"}
                </button>
              </div>
              <textarea
                readOnly
                value={derived.tweet}
                rows={4}
                className="w-full resize-y rounded-lg border border-slate-700/80 bg-slate-800/70 px-3 py-2 text-sm text-slate-100 outline-none focus:border-cyan-500/60"
              />
              <p className="text-right text-[10px] text-slate-500">
                {derived.tweet.length} / {X_LIMIT}
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                Reply lines — no links, by design
              </label>
              {derived.replies.length === 0 ? (
                <p className="text-[11px] text-slate-500">
                  Nothing short and self-contained in this piece. Write these by hand.
                </p>
              ) : (
                derived.replies.map((r, i) => (
                  <div key={i} className="flex items-start gap-2 rounded-lg border border-slate-700/60 bg-slate-900/40 px-3 py-2">
                    <span className="whitespace-pre-wrap text-[12px] leading-snug text-slate-200">{r}</span>
                    <button
                      type="button"
                      onClick={() => copy(r, `r${i}`)}
                      className="ml-auto shrink-0 rounded bg-slate-700/60 px-2 py-1 text-[10px] font-semibold text-slate-200 transition hover:bg-slate-600"
                    >
                      {copied === `r${i}` ? "✓" : "Copy"}
                    </button>
                  </div>
                ))
              )}
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Instagram</label>
                <button
                  type="button"
                  onClick={() => copy(derived.instagram, "ig")}
                  className="text-[10px] font-semibold text-cyan-400 hover:text-cyan-200"
                >
                  {copied === "ig" ? "Copied!" : "Copy"}
                </button>
              </div>
              <textarea
                readOnly
                value={derived.instagram}
                rows={7}
                className="w-full resize-y rounded-lg border border-slate-700/80 bg-slate-800/70 px-3 py-2 text-sm text-slate-100 outline-none focus:border-cyan-500/60"
              />
            </div>
          </div>
        ) : null}
      </div>

      {/* What the piece cannot supply, named rather than filled in */}
      {derived.gaps.length > 0 ? (
        <div className="space-y-1 rounded-lg border border-amber-600/30 bg-amber-500/5 px-3 py-2">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-amber-300">Gaps</p>
          {derived.gaps.map((g, i) => (
            <p key={i} className="text-[11px] text-amber-200/80">
              · {g}
            </p>
          ))}
        </div>
      ) : null}
    </div>
  );
}
