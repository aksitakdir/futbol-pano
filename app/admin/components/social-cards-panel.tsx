"use client";

import { useState } from "react";

type Props = {
  title: string;
  category: string;
  coverImage: string;
  slug: string;
  /** Public path for the article, used as the share link. */
  publicUrl: string;
};

type Format = { key: string; label: string; w: number; h: number };

const FORMATS: Format[] = [
  { key: "x", label: "X / Twitter (16:9)", w: 1200, h: 675 },
  { key: "square", label: "Instagram post (4:5)", w: 1080, h: 1350 },
  { key: "story", label: "Instagram story (9:16)", w: 1080, h: 1920 },
];

function buildCardUrl(f: Format, p: Props): string {
  const params = new URLSearchParams({
    cover: p.coverImage,
    title: p.title,
    category: p.category,
    format: f.key,
  });
  return `/api/social-card?${params.toString()}`;
}

export default function SocialCardsPanel({ title, category, coverImage, slug, publicUrl }: Props) {
  const [open, setOpen] = useState(false);
  const [activeFormat, setActiveFormat] = useState<Format>(FORMATS[0]);
  const [tweet, setTweet] = useState("");
  const [instagram, setInstagram] = useState("");
  const [textLoading, setTextLoading] = useState(false);
  const [textError, setTextError] = useState("");
  const [copied, setCopied] = useState<string | null>(null);

  const shareLink = `https://scoutgamer.com${publicUrl}`;

  async function copy(text: string, key: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      setTimeout(() => setCopied((c) => (c === key ? null : c)), 1500);
    } catch {
      /* ignore */
    }
  }

  async function downloadCard(f: Format) {
    const res = await fetch(buildCardUrl(f, { title, category, coverImage, slug, publicUrl }));
    const blob = await res.blob();
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${slug || "scoutgamer"}-${f.key}.png`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(a.href);
  }

  async function generateText() {
    setTextLoading(true);
    setTextError("");
    try {
      const res = await fetch("/api/admin/social-text", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, category, slug }),
      });
      const data = (await res.json()) as { tweet?: string; instagram?: string; error?: string };
      if (data.error) {
        setTextError(data.error);
      } else {
        setTweet(data.tweet ?? "");
        setInstagram(data.instagram ?? "");
      }
    } catch {
      setTextError("Connection error");
    }
    setTextLoading(false);
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        disabled={!coverImage || !title}
        title={!coverImage ? "Add a cover image first" : ""}
        className="inline-flex items-center gap-2 rounded-lg border border-cyan-600/50 bg-cyan-500/10 px-4 py-2 text-xs font-semibold text-cyan-300 transition hover:bg-cyan-500/20 disabled:cursor-not-allowed disabled:opacity-40"
      >
        📣 Social Cards
      </button>
    );
  }

  const previewUrl = buildCardUrl(activeFormat, { title, category, coverImage, slug, publicUrl });

  return (
    <div className="space-y-5 rounded-xl border border-cyan-600/30 bg-cyan-500/5 p-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-cyan-200">📣 Social Cards</h3>
          <p className="text-[11px] text-slate-400">Generate share images + copy. Download/copy and post manually.</p>
        </div>
        <button type="button" onClick={() => setOpen(false)} className="text-xs text-slate-500 transition hover:text-slate-300">
          ✕ Close
        </button>
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
          style={{ aspectRatio: `${activeFormat.w} / ${activeFormat.h}`, maxWidth: activeFormat.h > activeFormat.w ? 360 : "100%", margin: "0 auto" }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={previewUrl} alt="Social card preview" className="h-full w-full object-cover" />
        </div>
        <div className="flex justify-center">
          <button
            type="button"
            onClick={() => downloadCard(activeFormat)}
            className="rounded-lg bg-cyan-500 px-4 py-1.5 text-xs font-semibold text-slate-950 transition hover:bg-cyan-400"
          >
            ⬇ Download {activeFormat.label}
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

      {/* Text generation */}
      <div className="space-y-3">
        <button
          type="button"
          onClick={generateText}
          disabled={textLoading}
          className="rounded-lg border border-emerald-600/50 bg-emerald-500/10 px-4 py-2 text-xs font-semibold text-emerald-300 transition hover:bg-emerald-500/20 disabled:opacity-50"
        >
          {textLoading ? "Generating…" : "✨ Generate post text (AI)"}
        </button>
        {textError ? <p className="text-[11px] text-rose-400">{textError}</p> : null}

        {tweet ? (
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">X / Twitter</label>
              <button type="button" onClick={() => copy(tweet, "tweet")} className="text-[10px] font-semibold text-cyan-400 hover:text-cyan-200">
                {copied === "tweet" ? "Copied!" : "Copy"}
              </button>
            </div>
            <textarea
              value={tweet}
              onChange={(e) => setTweet(e.target.value)}
              rows={3}
              className="w-full resize-y rounded-lg border border-slate-700/80 bg-slate-800/70 px-3 py-2 text-sm text-slate-100 outline-none focus:border-cyan-500/60"
            />
            <p className="text-right text-[10px] text-slate-500">{tweet.length} / 280</p>
          </div>
        ) : null}

        {instagram ? (
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Instagram</label>
              <button type="button" onClick={() => copy(instagram, "ig")} className="text-[10px] font-semibold text-cyan-400 hover:text-cyan-200">
                {copied === "ig" ? "Copied!" : "Copy"}
              </button>
            </div>
            <textarea
              value={instagram}
              onChange={(e) => setInstagram(e.target.value)}
              rows={6}
              className="w-full resize-y rounded-lg border border-slate-700/80 bg-slate-800/70 px-3 py-2 text-sm text-slate-100 outline-none focus:border-cyan-500/60"
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}
