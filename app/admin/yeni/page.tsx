"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import RichTextEditor from "@/app/components/rich-text-editor";
import AdminLayout from "../components/admin-layout";
import SectionsEditor, { type SectionBlock } from "../components/sections-editor";
import ArticleDestinationField from "@/app/components/article-destination-field";
import { type ContentCategory, isContentCategory } from "@/lib/category-config";
import { hasBlockContent } from "@/lib/section-blocks";
import CoverStoryField from "@/app/components/cover-story-field";
import {
  coverScopesForCategory,
  type CoverStoryScope,
} from "@/lib/cover-story";
import { saveCoverStoryPinsViaApi } from "@/lib/cover-story-admin";

function isContentEmpty(html: string): boolean {
  if (!html?.trim()) return true;
  return html.replace(/<[^>]+>/g, "").trim() === "";
}

const PLACEHOLDER_HTML = "<p></p>";

const HERO_VARIANTS = [
  { value: "player-cards", label: "🃏 Player Card", desc: "Radar/Lists" },
  { value: "cover-image", label: "🖼 Cover Image", desc: "Full-width hero" },
  { value: "pitch-diagram", label: "⬡ Pitch Diagram", desc: "Tactics Lab" },
  { value: "stat-focus", label: "📊 Stat Focus", desc: "Radar" },
  { value: "text-only", label: "✍ Text Only", desc: "Minimal" },
];

const ACCENT_COLORS = [
  { value: "emerald", label: "Green", color: "oklch(0.71 0.19 155)" },
  { value: "cyan", label: "Cyan", color: "oklch(0.75 0.14 199)" },
  { value: "sky", label: "Blue", color: "oklch(0.72 0.14 233)" },
  { value: "rose", label: "Red", color: "oklch(0.66 0.21 13)" },
  { value: "amber", label: "Gold", color: "oklch(0.78 0.17 67)" },
  { value: "lime", label: "Lime", color: "oklch(0.80 0.19 126)" },
];

type FcPlayer = {
  name: string; overall: number; position: string; club: string;
  league?: string; nationality?: string; age?: number;
  pace: number; shooting: number; passing: number;
  dribbling: number; defending: number; physical: number; photo_url?: string;
};

function StatInput({ label, value, onChange }: { label: string; value: number | ""; onChange: (v: number | "") => void }) {
  return (
    <div>
      <label className="mb-1 block text-[11px] font-semibold text-slate-400">{label}</label>
      <input type="number" min="1" max="99" value={value}
        onChange={(e) => onChange(e.target.value ? Number(e.target.value) : "")}
        className="w-full rounded-lg border border-slate-700 bg-slate-800/60 px-3 py-2 text-sm text-slate-100 focus:border-emerald-500 focus:outline-none"
        placeholder="1-99" />
    </div>
  );
}

function NewArticleForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [category, setCategory] = useState<ContentCategory>("radar");
  const [content, setContent] = useState("");
  const [youtubeId, setYoutubeId] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [imageUploading, setImageUploading] = useState(false);
  const [youtubeQuery1, setYoutubeQuery1] = useState("");
  const [youtubeQuery2, setYoutubeQuery2] = useState("");
  const [newsQuery, setNewsQuery] = useState("");
  const [playerName, setPlayerName] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [statPace, setStatPace] = useState<number | "">("");
  const [statShooting, setStatShooting] = useState<number | "">("");
  const [statPassing, setStatPassing] = useState<number | "">("");
  const [statDribbling, setStatDribbling] = useState<number | "">("");
  const [statDefending, setStatDefending] = useState<number | "">("");
  const [statPhysical, setStatPhysical] = useState<number | "">("");
  const [statOverall, setStatOverall] = useState<number | "">("");

  const [playerSearch, setPlayerSearch] = useState("");
  const [playerResults, setPlayerResults] = useState<FcPlayer[]>([]);
  const [playerSearching, setPlayerSearching] = useState(false);
  const [playerMatched, setPlayerMatched] = useState<FcPlayer | null>(null);
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [playersList, setPlayersList] = useState<Array<{ name: string; overall: number; position: string; club: string; photo_url?: string; scout_note: string }>>([]);
  const [playersListSearch, setPlayersListSearch] = useState("");
  const [playersListResults, setPlayersListResults] = useState<FcPlayer[]>([]);
  const [playersListSearching, setPlayersListSearching] = useState(false);
  const playersListTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [heroVariant, setHeroVariant] = useState("text-only");
  const [accentColor, setAccentColor] = useState("emerald");
  const [sectionsBlocks, setSectionsBlocks] = useState<SectionBlock[]>([]);
  const [contentMode, setContentMode] = useState<"rich" | "blocks">("rich");
  const [coverStoryScopes, setCoverStoryScopes] = useState<CoverStoryScope[]>([]);

  useEffect(() => {
    const allowed = coverScopesForCategory(category);
    setCoverStoryScopes((prev) => prev.filter((scope) => allowed.includes(scope)));
  }, [category]);

  useEffect(() => {
    const c = searchParams.get("category");
    const m = searchParams.get("mode");
    if (isContentCategory(c)) setCategory(c);
    if (m === "blocks") setContentMode("blocks");
  }, [searchParams]);

  useEffect(() => {
    if (!playerSearch.trim() || playerSearch.length < 2) { setPlayerResults([]); return; }
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(async () => {
      setPlayerSearching(true);
      const { data } = await supabase.from("fc_players")
        .select("name,overall,position,club,league,nationality,age,pace,shooting,passing,dribbling,defending,physical")
        .ilike("name", `%${playerSearch.trim()}%`).order("overall", { ascending: false }).limit(8);
      setPlayerResults((data as FcPlayer[]) ?? []);
      setPlayerSearching(false);
    }, 350);
  }, [playerSearch]);

  useEffect(() => {
    if (!playersListSearch.trim() || playersListSearch.length < 2) { setPlayersListResults([]); return; }
    if (playersListTimeout.current) clearTimeout(playersListTimeout.current);
    playersListTimeout.current = setTimeout(async () => {
      setPlayersListSearching(true);
      const { data } = await supabase.from("fc_players")
        .select("name,overall,position,club,pace,shooting,passing,dribbling,defending,physical,photo_url")
        .ilike("name", `%${playersListSearch.trim()}%`).order("overall", { ascending: false }).limit(8);
      setPlayersListResults((data as FcPlayer[]) ?? []);
      setPlayersListSearching(false);
    }, 350);
  }, [playersListSearch]);

  function applyPlayer(p: FcPlayer) {
    setPlayerMatched(p); setPlayerName(p.name); setPlayerSearch(p.name);
    setStatPace(p.pace || ""); setStatShooting(p.shooting || ""); setStatPassing(p.passing || "");
    setStatDribbling(p.dribbling || ""); setStatDefending(p.defending || ""); setStatPhysical(p.physical || "");
    setStatOverall(p.overall || ""); setPlayerResults([]);
  }

  function clearPlayer() {
    setPlayerMatched(null); setPlayerSearch(""); setPlayerName("");
    setStatPace(""); setStatShooting(""); setStatPassing("");
    setStatDribbling(""); setStatDefending(""); setStatPhysical(""); setStatOverall("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!title.trim() || !slug.trim()) {
      setError("Title and slug are required");
      return;
    }
    if (contentMode === "blocks") {
      if (!hasBlockContent(sectionsBlocks)) {
        setError("Add at least one block with content in Block Editor");
        return;
      }
    } else if (isContentEmpty(content)) {
      setError("Title, slug and content are required");
      return;
    }
    setSaving(true);
    const usingBlocks = contentMode === "blocks";
    const bodyHtml = usingBlocks ? PLACEHOLDER_HTML : content.trim();
    const saveCategory = category;
    const { data: inserted, error: insertError } = await supabase.from("contents").insert({
      title: title.trim(),
      title_en: title.trim(),
      slug: slug.trim(),
      category: saveCategory,
      content: bodyHtml,
      content_en: bodyHtml,
      youtube_id: youtubeId.trim(),
      cover_image: coverImage.trim(),
      youtube_query_1: youtubeQuery1.trim(),
      youtube_query_2: youtubeQuery2.trim(),
      news_query: newsQuery.trim(),
      player_name: playerName.trim() || null,
      stat_pace: statPace || null,
      stat_shooting: statShooting || null,
      stat_passing: statPassing || null,
      stat_dribbling: statDribbling || null,
      stat_defending: statDefending || null,
      stat_physical: statPhysical || null,
      stat_overall: statOverall || null,
      players_json: playersList.length > 0 ? JSON.stringify(playersList) : null,
      hero_variant: heroVariant,
      accent: accentColor,
      sections_json: usingBlocks && sectionsBlocks.length > 0 ? sectionsBlocks : null,
      hub_tags: [],
      status: "pending",
    }).select("id").single();
    if (insertError || !inserted?.id) {
      setError("Save failed: " + (insertError?.message ?? "No id returned"));
      setSaving(false);
      return;
    }

    if (coverStoryScopes.length > 0) {
      const pinResult = await saveCoverStoryPinsViaApi(inserted.id, saveCategory, coverStoryScopes);
      if (!pinResult.ok) {
        setError(`Article saved but cover story failed: ${pinResult.error}`);
        setSaving(false);
        return;
      }
    }
    router.push(category === "radar" ? "/admin/radar" : "/admin/icerikler");
  }

  const backHref = category === "radar" ? "/admin/radar" : "/admin/icerikler";
  const statsFilled = [statPace, statShooting, statPassing, statDribbling, statDefending, statPhysical].filter(v => v !== "").length;

  return (
    <AdminLayout>
      <div className="mx-auto max-w-3xl">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">New Article</h1>
            <p className="text-xs text-slate-400">Saved articles are set to &quot;pending&quot; status</p>
          </div>
          <Link href={backHref} className="rounded-lg border border-slate-700/60 px-3 py-1.5 text-xs font-medium text-slate-400 transition hover:border-slate-600 hover:text-slate-200">
            ← Back
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Title */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-300">Title</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)}
              placeholder="E.g: Top 10 Young Wingers"
              className="w-full rounded-lg border border-slate-700/80 bg-slate-900/70 px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 outline-none transition focus:border-emerald-500/60" />
          </div>

          {/* Slug */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-300">Slug</label>
            <input type="text" value={slug} onChange={(e) => setSlug(e.target.value)}
              placeholder="e.g: top-10-young-wingers"
              className="w-full rounded-lg border border-slate-700/80 bg-slate-900/70 px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 outline-none transition focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/40" />
          </div>

          <ArticleDestinationField
            category={category}
            onCategoryChange={setCategory}
            slugPreview={slug}
          />

          {/* Hero Style + Accent Color */}
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-300">Hero Style</label>
              <div className="flex flex-col gap-1.5">
                {HERO_VARIANTS.map((v) => (
                  <button key={v.value} type="button" onClick={() => setHeroVariant(v.value)}
                    className={["flex items-center gap-2 rounded-lg border px-3 py-2 text-xs transition text-left",
                      heroVariant === v.value ? "border-emerald-500/60 bg-emerald-500/10 text-emerald-200" : "border-slate-700/80 bg-slate-900/60 text-slate-400 hover:text-slate-200"].join(" ")}>
                    <span className="font-medium">{v.label}</span>
                    {v.value === "cover-image" && coverImage ? (
                      <Image src={coverImage} alt="" width={48} height={32} unoptimized className="ml-auto h-8 w-12 rounded object-cover border border-slate-600/80" />
                    ) : (
                      <span className="ml-auto text-[10px] opacity-50">{v.desc}</span>
                    )}
                  </button>
                ))}
              </div>
              {heroVariant === "cover-image" && !coverImage.trim() ? (
                <p className="mt-2 text-[11px] text-amber-300/90">Upload or paste a cover image below — it becomes the full-width article hero.</p>
              ) : null}
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-300">Accent Color</label>
              <div className="flex flex-col gap-1.5">
                {ACCENT_COLORS.map((a) => (
                  <button key={a.value} type="button" onClick={() => setAccentColor(a.value)}
                    className={["flex items-center gap-2.5 rounded-lg border px-3 py-2 text-xs transition",
                      accentColor === a.value ? "border-slate-500 bg-slate-800 text-slate-100" : "border-slate-700/80 bg-slate-900/60 text-slate-400 hover:text-slate-200"].join(" ")}>
                    <span className="h-3 w-3 rounded-full flex-shrink-0" style={{ background: a.color }} />
                    <span>{a.label}</span>
                    {accentColor === a.value && <span className="ml-auto text-emerald-400">✓</span>}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* YouTube + Cover Image */}
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-300">YouTube Video ID</label>
              <input type="text" value={youtubeId} onChange={(e) => setYoutubeId(e.target.value)}
                placeholder="e.g: dQw4w9WgXcQ"
                className="w-full rounded-lg border border-slate-700/80 bg-slate-900/70 px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 outline-none transition focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/40" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-300">Cover Image</label>
              <p className="mb-2 text-[11px] text-slate-500">Used for Hero Style → Cover Image and homepage slider thumbnails.</p>
              <div className="space-y-2">
                <input type="text" value={coverImage} onChange={(e) => setCoverImage(e.target.value)}
                  placeholder="Paste URL or upload below"
                  className="w-full rounded-lg border border-slate-700/80 bg-slate-900/70 px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 outline-none transition focus:border-emerald-500/60" />
                <div className="flex items-center gap-2">
                  <label className="cursor-pointer rounded-lg border border-slate-700/60 bg-slate-800/60 px-3 py-2 text-xs font-semibold text-slate-300 transition hover:border-emerald-500/40 hover:text-emerald-300">
                    {imageUploading ? "Uploading..." : "📁 Upload Image"}
                    <input type="file" accept="image/*" className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        setImageUploading(true);
                        try {
                          const ext = file.name.split(".").pop();
                          const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
                          const { data, error } = await supabase.storage.from("content-images").upload(fileName, file, { upsert: true });
                          if (error) throw error;
                          const { data: urlData } = supabase.storage.from("content-images").getPublicUrl(data.path);
                          setCoverImage(urlData.publicUrl);
                          setHeroVariant("cover-image");
                        } catch (err) { console.error("Image upload error:", err); }
                        setImageUploading(false);
                      }} />
                  </label>
                  {coverImage && <Image src={coverImage} alt="" width={64} height={40} unoptimized className="h-10 w-16 rounded object-cover border border-slate-700/60" />}
                </div>
              </div>
            </div>
          </div>

          <CoverStoryField
            category={category}
            selectedScopes={coverStoryScopes}
            onChange={setCoverStoryScopes}
          />

          {/* YouTube queries */}
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-300">YouTube Search 1</label>
              <input type="text" value={youtubeQuery1} onChange={(e) => setYoutubeQuery1(e.target.value)}
                placeholder="e.g: Arda Güler highlights 2025"
                className="w-full rounded-lg border border-slate-700/80 bg-slate-900/70 px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 outline-none transition focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/40" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-300">YouTube Search 2</label>
              <input type="text" value={youtubeQuery2} onChange={(e) => setYoutubeQuery2(e.target.value)}
                placeholder="optional"
                className="w-full rounded-lg border border-slate-700/80 bg-slate-900/70 px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 outline-none transition focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/40" />
            </div>
          </div>

          {/* News keyword */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-300">News Search Keyword</label>
            <input type="text" value={newsQuery} onChange={(e) => setNewsQuery(e.target.value)}
              placeholder="e.g: Arda Güler (auto-extracted from title if empty)"
              className="w-full rounded-lg border border-slate-700/80 bg-slate-900/70 px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 outline-none transition focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/40" />
          </div>

          {/* Players List */}
          <div className="rounded-xl border border-slate-700/60 bg-slate-900/40 p-5">
              <div className="mb-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-300/80">Player List</p>
                <p className="mt-0.5 text-[11px] text-slate-500">Add multiple players for list content</p>
              </div>
              <div className="relative mb-4">
                <input type="text" value={playersListSearch} onChange={(e) => setPlayersListSearch(e.target.value)}
                  placeholder="Type player name, select and add to list..."
                  className="w-full rounded-lg border border-slate-700/80 bg-slate-900/70 px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 outline-none transition focus:border-sky-500/60" />
                {playersListSearching && <div className="absolute right-3 top-3 h-4 w-4 animate-spin rounded-full border-2 border-sky-400 border-t-transparent" />}
                {playersListResults.length > 0 && (
                  <div className="absolute z-20 mt-1 w-full overflow-hidden rounded-xl border border-slate-700 bg-slate-900 shadow-xl">
                    {playersListResults.map((p) => (
                      <button key={p.name + p.club} type="button"
                        onClick={() => {
                          if (!playersList.find((pl) => pl.name === p.name)) {
                            setPlayersList((prev) => [...prev, { name: p.name, overall: p.overall, position: p.position, club: p.club, photo_url: p.photo_url, scout_note: "" }]);
                          }
                          setPlayersListSearch(""); setPlayersListResults([]);
                        }}
                        className="flex w-full items-center justify-between px-4 py-2.5 text-left text-sm transition hover:bg-slate-800/80">
                        <div>
                          <span className="font-semibold text-slate-100">{p.name}</span>
                          <span className="ml-2 text-[11px] text-slate-400">{p.club} · {p.position}</span>
                        </div>
                        <span className="text-sm font-bold text-emerald-400">{p.overall}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {playersList.length > 0 && (
                <div className="space-y-2">
                  {playersList.map((p, i) => (
                    <div key={`${p.name}-${i}`} className="flex items-center gap-3 rounded-lg border border-slate-700/60 bg-slate-800/40 px-3 py-2">
                      <span className="w-6 text-center text-sm font-bold text-emerald-400">{p.overall}</span>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-slate-100">{p.name}</p>
                        <p className="text-[10px] text-slate-400">{p.club} · {p.position}</p>
                      </div>
                      <input type="text" value={p.scout_note}
                        onChange={(e) => setPlayersList((prev) => prev.map((pl, j) => (j === i ? { ...pl, scout_note: e.target.value } : pl)))}
                        placeholder="Scout note..."
                        className="flex-1 rounded-md border border-slate-700/60 bg-slate-900/60 px-2 py-1 text-[11px] text-slate-100 placeholder-slate-500 outline-none focus:border-sky-500/40" />
                      <button type="button" onClick={() => setPlayersList((prev) => prev.filter((_, j) => j !== i))} className="text-[11px] text-rose-400 hover:text-rose-300">✕</button>
                    </div>
                  ))}
                  <p className="text-[11px] text-slate-500">{playersList.length} players added</p>
                </div>
              )}
            </div>

          {/* Player Card */}
          <div className="rounded-xl border border-slate-700/60 bg-slate-900/40 p-5">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-300/80">Player Card</p>
                <p className="mt-0.5 text-[11px] text-slate-500">Auto-filled from EA FC 26 database — override if needed</p>
              </div>
              {playerMatched && <button type="button" onClick={clearPlayer} className="text-[11px] text-rose-400 hover:text-rose-300">Clear</button>}
            </div>
            <div className="relative mb-4">
              <label className="mb-1.5 block text-xs font-semibold text-slate-300">Focus Player</label>
              <input type="text" value={playerSearch}
                onChange={(e) => { setPlayerSearch(e.target.value); setPlayerMatched(null); }}
                placeholder="Type player name — auto-matches from EA FC 26"
                className="w-full rounded-lg border border-slate-700/80 bg-slate-900/70 px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 outline-none transition focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/40" />
              {playerSearching && <div className="absolute right-3 top-9 h-4 w-4 animate-spin rounded-full border-2 border-emerald-400 border-t-transparent" />}
              {playerResults.length > 0 && (
                <div className="absolute z-20 mt-1 w-full rounded-xl border border-slate-700 bg-slate-900 shadow-xl overflow-hidden">
                  {playerResults.map((p) => (
                    <button key={p.name + p.club} type="button" onClick={() => applyPlayer(p)}
                      className="flex w-full items-center justify-between px-4 py-2.5 text-left text-sm hover:bg-slate-800/80 transition">
                      <div>
                        <span className="font-semibold text-slate-100">{p.name}</span>
                        <span className="ml-2 text-[11px] text-slate-400">{p.club} · {p.position}</span>
                      </div>
                      <span className="text-sm font-bold text-emerald-400">{p.overall}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            {playerMatched && (
              <div className="mb-4 flex items-center gap-3 rounded-lg border border-emerald-500/20 bg-emerald-500/5 px-4 py-2.5">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-emerald-300">{playerMatched.name}</p>
                  <p className="text-[11px] text-slate-400">{playerMatched.club} · {playerMatched.league ?? "—"} · {playerMatched.age != null ? `${playerMatched.age} yrs` : "—"}</p>
                </div>
                <span className="text-2xl font-black text-emerald-400">{playerMatched.overall}</span>
              </div>
            )}
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
              <StatInput label="PAC" value={statPace} onChange={setStatPace} />
              <StatInput label="SHO" value={statShooting} onChange={setStatShooting} />
              <StatInput label="PAS" value={statPassing} onChange={setStatPassing} />
              <StatInput label="DRI" value={statDribbling} onChange={setStatDribbling} />
              <StatInput label="DEF" value={statDefending} onChange={setStatDefending} />
              <StatInput label="PHY" value={statPhysical} onChange={setStatPhysical} />
            </div>
            <div className="mt-3 flex items-center gap-3">
              <div className="flex-1">
                <label className="mb-1 block text-[11px] font-semibold text-slate-400">Overall</label>
                <input type="number" min="1" max="99" value={statOverall}
                  onChange={(e) => setStatOverall(e.target.value ? Number(e.target.value) : "")}
                  className="w-24 rounded-lg border border-emerald-700/50 bg-slate-800/60 px-3 py-2 text-sm font-bold text-emerald-300 focus:border-emerald-500 focus:outline-none"
                  placeholder="OVR" />
              </div>
              {statsFilled > 0 && <p className="text-[11px] text-emerald-400/70 mt-4">{statsFilled}/6 stats filled</p>}
            </div>
          </div>

          {/* Content — Rich Text or Block Editor */}
          <div className="rounded-xl border border-slate-700/60 bg-slate-900/40 p-5">
            <div className="mb-4 flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300">Content</label>
              <div className="flex overflow-hidden rounded-lg border border-slate-700/60">
                <button
                  type="button"
                  onClick={() => setContentMode("rich")}
                  className={`px-3 py-1.5 text-[11px] font-semibold transition ${
                    contentMode === "rich"
                      ? "bg-slate-700 text-slate-100"
                      : "bg-transparent text-slate-500 hover:text-slate-300"
                  }`}
                >
                  ✏️ Rich Text
                </button>
                <button
                  type="button"
                  onClick={() => setContentMode("blocks")}
                  className={`border-l border-slate-700/60 px-3 py-1.5 text-[11px] font-semibold transition ${
                    contentMode === "blocks"
                      ? "bg-emerald-500/20 text-emerald-300"
                      : "bg-transparent text-slate-500 hover:text-slate-300"
                  }`}
                >
                  🧱 Block Editor
                </button>
              </div>
            </div>

            {contentMode === "rich" ? (
              <div>
                <RichTextEditor value={content} onChange={setContent} placeholder="Write content in English..." />
                <p className="mt-2 text-[10px] text-slate-600">
                  Raw HTML editor. Switch to <strong className="text-slate-500">Block Editor</strong> for structured
                  articles (IN THIS PIECE, section headings, pull-quotes).
                </p>
                <p className="mt-1.5 text-[10px] leading-relaxed text-sky-500/90">
                  Embed player card in body:{" "}
                  <code className="rounded bg-slate-800 px-1 py-0.5 text-[9px] text-sky-300">{`<!-- scout-player:Player Full Name -->`}</code>
                </p>
              </div>
            ) : (
              <div>
                <p className="mb-4 text-[11px] text-slate-500">
                  Each block renders as a separate section. Saved as{" "}
                  <code className="text-sky-400">sections_json</code> — the V2 article layout with table of contents.
                  Embed cards in HTML blocks with{" "}
                  <code className="text-sky-400/90">{`<!-- scout-player:Name -->`}</code>.
                </p>
                <SectionsEditor value={sectionsBlocks} onChange={setSectionsBlocks} />
              </div>
            )}
          </div>

          {error && <p className="text-xs text-rose-400">{error}</p>}

          <button type="submit" disabled={saving}
            className="rounded-lg bg-emerald-500 px-6 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:opacity-50">
            {saving ? "Saving..." : "Save as Draft"}
          </button>
        </form>
      </div>
    </AdminLayout>
  );
}

export default function NewArticlePage() {
  return (
    <Suspense fallback={<AdminLayout><div className="flex justify-center py-20 text-sm text-slate-400">Loading…</div></AdminLayout>}>
      <NewArticleForm />
    </Suspense>
  );
}
