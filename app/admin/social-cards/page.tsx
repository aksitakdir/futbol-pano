"use client";

import { useState } from "react";
import Image from "next/image";
import AdminLayout from "../components/admin-layout";
import { supabase } from "@/lib/supabase";
import { WC_TEAMS } from "@/lib/wc-2026-teams";

/* ── Types ── */

type Format = { key: string; label: string; w: number; h: number };

const FORMATS: Format[] = [
  { key: "x", label: "X / Twitter (16:9)", w: 1200, h: 675 },
  { key: "square", label: "Instagram post (4:5)", w: 1080, h: 1350 },
  { key: "story", label: "Instagram story (9:16)", w: 1080, h: 1920 },
];

/* ── Preset pages ── */

type Preset = { label: string; title: string; category: string; publicUrl: string; slug: string };

const WC_PRESETS: Preset[] = [
  {
    label: "📅 WC 2026 Schedule & Fixtures",
    title: "World Cup 2026 Schedule — All 104 Matches",
    category: "wc-2026",
    publicUrl: "/world-cup-2026/schedule",
    slug: "wc-2026-schedule",
  },
  {
    label: "🌍 WC 2026 Hub",
    title: "FIFA World Cup 2026 — Complete Guide",
    category: "wc-2026",
    publicUrl: "/world-cup-2026",
    slug: "wc-2026-hub",
  },
  ...WC_TEAMS.map((t) => ({
    label: `🏳️ ${t.nameEn}`,
    title: `${t.nameEn} National Football Team — World Cup 2026 Squad`,
    category: "wc-2026",
    publicUrl: `/world-cup-2026/squads/${t.slug}`,
    slug: `wc-2026-${t.slug}`,
  })),
];

/* ── Helpers ── */

function buildCardUrl(format: string, title: string, category: string, cover: string): string {
  const params = new URLSearchParams({ cover, title, category, format });
  return `/api/social-card?${params.toString()}`;
}

/* ── Component ── */

export default function SocialCardsStudioPage() {
  const [selectedPreset, setSelectedPreset] = useState<Preset | null>(null);
  const [presetSearch, setPresetSearch] = useState("");
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("wc-2026");
  const [coverImage, setCoverImage] = useState("");
  const [publicUrl, setPublicUrl] = useState("");
  const [slug, setSlug] = useState("");
  const [activeFormat, setActiveFormat] = useState<Format>(FORMATS[0]);
  const [imageUploading, setImageUploading] = useState(false);

  const [tweet, setTweet] = useState("");
  const [instagram, setInstagram] = useState("");
  const [textLoading, setTextLoading] = useState(false);
  const [textError, setTextError] = useState("");
  const [copied, setCopied] = useState<string | null>(null);

  const shareLink = publicUrl ? `https://scoutgamer.com${publicUrl}` : "";

  function selectPreset(p: Preset) {
    setSelectedPreset(p);
    setTitle(p.title);
    setCategory(p.category);
    setPublicUrl(p.publicUrl);
    setSlug(p.slug);
    // Keep existing cover image if already set
  }

  const filteredPresets = presetSearch.trim()
    ? WC_PRESETS.filter((p) => p.label.toLowerCase().includes(presetSearch.toLowerCase()))
    : WC_PRESETS;

  async function copy(text: string, key: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      setTimeout(() => setCopied((c) => (c === key ? null : c)), 1500);
    } catch { /* ignore */ }
  }

  async function downloadCard(f: Format) {
    const res = await fetch(buildCardUrl(f.key, title, category, coverImage));
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

  async function handleImageUpload(file: File) {
    setImageUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const fileName = `social/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { data, error } = await supabase.storage.from("content-images").upload(fileName, file, { upsert: true });
      if (error) throw error;
      const { data: urlData } = supabase.storage.from("content-images").getPublicUrl(data.path);
      setCoverImage(urlData.publicUrl);
    } catch (err) {
      console.error("Image upload error:", err);
    }
    setImageUploading(false);
  }

  const canGenerate = title.trim() && coverImage;
  const previewUrl = canGenerate ? buildCardUrl(activeFormat.key, title, category, coverImage) : "";

  return (
    <AdminLayout>
      <div className="mx-auto max-w-4xl">
        <div className="mb-6">
          <h1 className="text-xl font-bold">Social Card Studio</h1>
          <p className="text-xs text-slate-400">
            Generate social media cards for any page — squad pages, schedule, hub, or custom content.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
          {/* Left column — inputs */}
          <div className="space-y-5">
            {/* Page selector */}
            <div className="rounded-xl border border-slate-700/60 bg-slate-900/40 p-4">
              <h2 className="mb-3 text-xs font-bold uppercase tracking-wider text-emerald-400/90">Select Page</h2>
              <input
                type="text"
                value={presetSearch}
                onChange={(e) => setPresetSearch(e.target.value)}
                placeholder="Search teams, pages..."
                className="mb-3 w-full rounded-lg border border-slate-700/80 bg-slate-900/80 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 outline-none focus:border-emerald-500/50"
              />
              <div className="max-h-48 space-y-1 overflow-y-auto">
                {filteredPresets.map((p) => (
                  <button
                    key={p.slug}
                    type="button"
                    onClick={() => selectPreset(p)}
                    className={[
                      "flex w-full items-center rounded-lg border px-3 py-2 text-left text-xs transition",
                      selectedPreset?.slug === p.slug
                        ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-200"
                        : "border-slate-700/40 text-slate-300 hover:border-slate-600 hover:text-slate-100",
                    ].join(" ")}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Title & Category */}
            <div className="rounded-xl border border-slate-700/60 bg-slate-900/40 p-4 space-y-3">
              <h2 className="text-xs font-bold uppercase tracking-wider text-sky-400/90">Card Details</h2>
              <div>
                <label className="mb-1 block text-[11px] font-semibold text-slate-400">Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Card title..."
                  className="w-full rounded-lg border border-slate-700/80 bg-slate-900/80 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 outline-none focus:border-sky-500/50"
                />
              </div>
              <div>
                <label className="mb-1 block text-[11px] font-semibold text-slate-400">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full rounded-lg border border-slate-700/80 bg-slate-900/80 px-3 py-2 text-sm text-slate-100 outline-none focus:border-sky-500/50"
                >
                  <option value="wc-2026">World Cup 2026</option>
                  <option value="radar">Radar</option>
                  <option value="lists">Lists</option>
                  <option value="tactics-lab">Tactics Lab</option>
                  <option value="transfer">Transfers</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-[11px] font-semibold text-slate-400">Public URL (for share link)</label>
                <input
                  type="text"
                  value={publicUrl}
                  onChange={(e) => setPublicUrl(e.target.value)}
                  placeholder="/world-cup-2026/squads/brazil"
                  className="w-full rounded-lg border border-slate-700/80 bg-slate-900/80 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 outline-none focus:border-sky-500/50"
                />
              </div>
            </div>

            {/* Cover Image */}
            <div className="rounded-xl border border-slate-700/60 bg-slate-900/40 p-4 space-y-3">
              <h2 className="text-xs font-bold uppercase tracking-wider text-amber-400/90">Cover Image</h2>
              <input
                type="text"
                value={coverImage}
                onChange={(e) => setCoverImage(e.target.value)}
                placeholder="Paste image URL..."
                className="w-full rounded-lg border border-slate-700/80 bg-slate-900/80 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 outline-none focus:border-amber-500/50"
              />
              <div className="flex items-center gap-3">
                <label className="cursor-pointer rounded-lg border border-slate-700/60 bg-slate-800/60 px-3 py-2 text-xs font-semibold text-slate-300 transition hover:border-amber-500/40 hover:text-amber-300">
                  {imageUploading ? "Uploading..." : "📁 Upload Image"}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) void handleImageUpload(file);
                    }}
                  />
                </label>
                {coverImage && (
                  <Image
                    src={coverImage}
                    alt=""
                    width={80}
                    height={50}
                    unoptimized
                    className="h-12 w-20 rounded object-cover border border-slate-700/60"
                  />
                )}
              </div>
            </div>
          </div>

          {/* Right column — preview & output */}
          <div className="space-y-5">
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
                {canGenerate ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={previewUrl} alt="Social card preview" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center text-xs text-slate-600">
                    Select a page and add a cover image to preview
                  </div>
                )}
              </div>
              {canGenerate && (
                <div className="flex justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => downloadCard(activeFormat)}
                    className="rounded-lg bg-cyan-500 px-4 py-1.5 text-xs font-semibold text-slate-950 transition hover:bg-cyan-400"
                  >
                    ⬇ Download {activeFormat.label}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      FORMATS.forEach((f) => void downloadCard(f));
                    }}
                    className="rounded-lg border border-cyan-500/40 bg-cyan-500/10 px-4 py-1.5 text-xs font-semibold text-cyan-300 transition hover:bg-cyan-500/20"
                  >
                    ⬇ Download All
                  </button>
                </div>
              )}
            </div>

            {/* Share link */}
            {shareLink && (
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
            )}

            {/* AI Text Generation */}
            {canGenerate && (
              <div className="space-y-3 rounded-xl border border-slate-700/60 bg-slate-900/40 p-4">
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
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
