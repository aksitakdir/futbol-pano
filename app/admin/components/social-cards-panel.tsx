"use client";

import { useMemo, useState } from "react";
import { extract, buildCards, gapsOf } from "@/lib/social-extract.mjs";
import { buildPlatformPack, platformToText, packToMarkdown, articleUrl, STAGES } from "@/lib/social-copy.mjs";

type Props = {
  title: string;
  category: string;
  coverImage: string;
  slug: string;
  /** Public path for the article, used as the share link. */
  publicUrl: string;
  /** Live block editor contents — the source for every card and every line below. */
  sections?: unknown[];
  /** "published" | "pending" | … — an unpublished link 404s, and the panel says so. */
  status?: string;
  /** When the article went live; old pieces get a re-verify warning (§6.6). */
  publishedAt?: string;
  /** The article's featured player — a hashtag subject when there is no vs block. */
  playerName?: string;
};

type PlatformPost = { label: string; text: string; limit: number; count: number; over: boolean; note: string };
type Platform = {
  key: string;
  name: string;
  role: string;
  inPlan: boolean;
  card: { variant: string; format: string } | null;
  posts: PlatformPost[];
  replies?: string[];
};

type Format = { key: string; label: string; w: number; h: number };

const FORMATS: Format[] = [
  { key: "x", label: "X / Twitter (16:9)", w: 1200, h: 675 },
  { key: "square", label: "Instagram post (4:5)", w: 1080, h: 1350 },
  { key: "story", label: "Instagram story (9:16)", w: 1080, h: 1920 },
];

/**
 * Second-generation cards (app/api/social-card/cards-v2.tsx): headline, one
 * player card per Scout Gamer Read, stats, contrast, verdict and the full list.
 * Each carries the article's cover art, uncropped, when there is one. Style A,
 * the classic cover card, stays available at the end of the list.
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

export default function SocialCardsPanel({ title, category, coverImage, slug, publicUrl, sections, status, publishedAt, playerName }: Props) {
  const [open, setOpen] = useState(false);
  const [activeFormat, setActiveFormat] = useState<Format>(FORMATS[0]);
  const [activeCard, setActiveCard] = useState(0);
  const [copied, setCopied] = useState<string | null>(null);
  const [activePlatform, setActivePlatform] = useState("x");
  const [stage, setStage] = useState(1);

  // The canonical host: the bare domain answers with a 308 to www.
  const shareLink = articleUrl({ category, slug: slug.trim() }) || `https://www.scoutgamer.com${publicUrl}`;

  // Everything the panel offers is derived from the blocks in the editor. No
  // network call, no API spend, and it works before the article is ever saved.
  const derived = useMemo(() => {
    const row = { title, category, slug: slug.trim(), cover_image: coverImage, status: status ?? "", player_name: playerName ?? "" };
    const material = extract(sections ?? []);
    const pack = buildPlatformPack(row, material, {
      stage,
      publishedAt: status === "published" ? publishedAt : undefined,
      today: new Date().toISOString(),
    }) as { stage: number; url: string; platforms: Platform[]; lint: string[] };
    return {
      material,
      row,
      pack,
      markdown: packToMarkdown(row, pack) as string,
      cards: buildCards(row, material, "") as { variant: string; label: string; url: string }[],
      // The pack's lint covers the status warning, so the old gap line for it would repeat.
      gaps: (gapsOf({ ...row, status: "" }, material) as string[]),
    };
  }, [title, category, slug, coverImage, sections, status, publishedAt, playerName, stage]);

  const platform = derived.pack.platforms.find((p) => p.key === activePlatform) ?? derived.pack.platforms[0];

  const cardOptions: CardOption[] = useMemo(() => {
    const styleA: CardOption = {
      key: "cover",
      label: "Cover (classic)",
      hint: "the house card — title over the cover image",
      url: buildStyleAUrl({ title, category, coverImage, slug, publicUrl }, "x"),
      needsCover: true,
    };
    const named = derived.cards.map((c, i) => ({
      key: `${c.variant}-${i}`,
      label:
        c.variant === "player"
          ? c.label.replace(/^player — /, "")
          : c.variant === "stat"
            ? `Stat ${c.label.replace(/^stat — /, "")}`
            : c.variant.charAt(0).toUpperCase() + c.variant.slice(1),
      hint: c.label.replace(/^[a-z]+ — /, ""),
      url: c.url,
      needsCover: false,
    }));
    return [...named, { ...styleA, label: "Cover (classic)" }];
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

  /** Jump the preview to the card and size a platform is meant to carry. */
  function showCardFor(p: Platform) {
    if (!p.card) return;
    const i = cardOptions.findIndex((c) => c.key.startsWith(`${p.card!.variant}-`));
    if (i >= 0) setActiveCard(i);
    const f = FORMATS.find((x) => x.key === p.card!.format);
    if (f) setActiveFormat(f);
  }

  function downloadPack() {
    const blob = new Blob([derived.markdown], { type: "text/markdown" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${slug || "scoutgamer"}-social-copy.md`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(a.href);
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

      {/* Platform copy — one tab per platform, every post ready to paste */}
      <div className="space-y-3 rounded-lg border border-emerald-600/30 bg-emerald-500/5 p-3">
        <div className="flex flex-wrap items-center gap-2">
          <h4 className="text-xs font-bold text-emerald-200">Post copy, by platform</h4>
          <select
            value={stage}
            onChange={(e) => setStage(Number(e.target.value))}
            className="ml-auto rounded border border-slate-700/80 bg-slate-800/70 px-2 py-1 text-[11px] text-slate-200"
            title="The call to action follows the stage (docs/SOCIAL-STRATEGY.md §10.3)"
          >
            {Object.entries(STAGES as Record<string, string>).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => copy(derived.markdown, "all")}
            className="rounded bg-slate-700/60 px-2 py-1 text-[10px] font-semibold text-slate-200 transition hover:bg-slate-600"
          >
            {copied === "all" ? "Copied!" : "Copy every platform"}
          </button>
          <button
            type="button"
            onClick={downloadPack}
            className="rounded bg-slate-700/60 px-2 py-1 text-[10px] font-semibold text-slate-200 transition hover:bg-slate-600"
          >
            ⬇ .md
          </button>
        </div>

        {derived.pack.lint.length > 0 ? (
          <div className="space-y-1 rounded-lg border border-amber-600/30 bg-amber-500/5 px-3 py-2">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-amber-300">Check before posting</p>
            {derived.pack.lint.map((l, i) => (
              <p key={i} className="text-[11px] text-amber-200/80">
                · {l}
              </p>
            ))}
          </div>
        ) : null}

        <div className="flex flex-wrap gap-1.5">
          {derived.pack.platforms.map((p) => (
            <button
              key={p.key}
              type="button"
              onClick={() => setActivePlatform(p.key)}
              title={p.role}
              className={[
                "rounded-lg border px-2.5 py-1 text-[11px] font-semibold transition",
                p.key === platform.key
                  ? "border-emerald-500/60 bg-emerald-500/15 text-emerald-200"
                  : p.inPlan
                    ? "border-slate-700/80 text-slate-300 hover:text-slate-100"
                    : "border-dashed border-slate-700/80 text-slate-500 hover:text-slate-300",
              ].join(" ")}
            >
              {p.name}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <p className="text-[11px] text-slate-400">
            {platform.role}
            {platform.inPlan ? "" : " · outside the current plan, ready for when it opens"}
          </p>
          <div className="ml-auto flex gap-2">
            {platform.card ? (
              <button
                type="button"
                onClick={() => showCardFor(platform)}
                className="rounded bg-slate-700/60 px-2 py-1 text-[10px] font-semibold text-slate-200 transition hover:bg-slate-600"
              >
                Show its card ({platform.card.variant}, {platform.card.format})
              </button>
            ) : null}
            <button
              type="button"
              onClick={() => copy(platformToText(platform), `all-${platform.key}`)}
              className="rounded bg-emerald-600/70 px-2 py-1 text-[10px] font-semibold text-white transition hover:bg-emerald-500"
            >
              {copied === `all-${platform.key}` ? "Copied!" : `Copy all ${platform.name}`}
            </button>
          </div>
        </div>

        <div className="space-y-3">
          {platform.posts.map((ps, i) => {
            const key = `${platform.key}-${i}`;
            return (
              <div key={key} className="space-y-1">
                <div className="flex items-center gap-2">
                  <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">{ps.label}</label>
                  {ps.limit ? (
                    <span className={`text-[10px] ${ps.over ? "font-bold text-rose-400" : "text-slate-500"}`}>
                      {ps.count} / {ps.limit}
                    </span>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => copy(ps.text, key)}
                    className="ml-auto text-[10px] font-semibold text-cyan-400 hover:text-cyan-200"
                  >
                    {copied === key ? "Copied!" : "Copy"}
                  </button>
                </div>
                <textarea
                  readOnly
                  value={ps.text}
                  rows={Math.min(14, Math.max(2, ps.text.split("\n").length + 1))}
                  className="w-full resize-y rounded-lg border border-slate-700/80 bg-slate-800/70 px-3 py-2 text-[13px] leading-snug text-slate-100 outline-none focus:border-cyan-500/60"
                />
                {ps.note ? <p className="text-[10px] text-slate-500">{ps.note}</p> : null}
              </div>
            );
          })}

          {platform.replies && platform.replies.length > 0 ? (
            <div className="space-y-1.5">
              <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                Reply lines — for other people&apos;s threads, no links (§7.4)
              </label>
              {platform.replies.map((r, i) => (
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
              ))}
            </div>
          ) : null}
        </div>
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
