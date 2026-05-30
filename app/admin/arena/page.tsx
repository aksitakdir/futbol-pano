"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { saveArenaGame, deleteArenaGame } from "./actions";
import AdminLayout from "../components/admin-layout";
import {
  CARD_COLOR_OPTIONS,
  bracketParticipantCount,
  type ArenaGame,
  type ArenaGameStatus,
  type ArenaGameType,
  type ArenaCardColor,
  type ArenaParticipant,
} from "@/lib/arena-brackets";

// ─── Helper ───────────────────────────────────────────────────────────────────

function toSlug(s: string): string {
  return s
    .toLowerCase()
    .replace(/ğ/g, "g").replace(/ü/g, "u").replace(/ş/g, "s")
    .replace(/ı/g, "i").replace(/ö/g, "o").replace(/ç/g, "c")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

// ─── Empty form state ─────────────────────────────────────────────────────────

type ParticipantRow = { name: string; detail: string };

function emptyParticipantRows(gameType: ArenaGameType): ParticipantRow[] {
  const n = bracketParticipantCount(gameType);
  return Array.from({ length: n }, () => ({ name: "", detail: "" }));
}

type FormState = {
  slug: string;
  status: ArenaGameStatus;
  title_tr: string;
  title_en: string;
  description_tr: string;
  description_en: string;
  hero_title_tr: string;
  hero_title_en: string;
  hero_teaser_tr: string;
  hero_teaser_en: string;
  card_color: ArenaCardColor;
  game_type: ArenaGameType;
  participantRows: ParticipantRow[];
  hub_tags: string[];
  team_slug: string;
};

const EMPTY_FORM: FormState = {
  slug: "",
  status: "draft",
  title_tr: "",
  title_en: "",
  description_tr: "",
  description_en: "",
  hero_title_tr: "",
  hero_title_en: "",
  hero_teaser_tr: "",
  hero_teaser_en: "",
  card_color: "primary",
  game_type: "random_16",
  participantRows: emptyParticipantRows("random_16"),
  hub_tags: [],
  team_slug: "",
};

/** Resize participant rows when game type changes, preserving existing data. */
function resizeParticipantRows(rows: ParticipantRow[], gameType: ArenaGameType): ParticipantRow[] {
  const n = bracketParticipantCount(gameType);
  const next = rows.slice(0, n).map((r) => ({ ...r }));
  while (next.length < n) next.push({ name: "", detail: "" });
  return next;
}

function gameToForm(g: ArenaGame): FormState {
  const n = bracketParticipantCount(g.game_type);
  const participantRows: ParticipantRow[] = [];
  for (let i = 0; i < n; i++) {
    const p = g.participants[i];
    if (!p) participantRows.push({ name: "", detail: "" });
    else if (g.game_type === "fixed_8") participantRows.push({ name: p.name ?? "", detail: p.vs ?? "" });
    else participantRows.push({ name: p.name ?? "", detail: p.subtitle ?? "" });
  }
  return {
    slug: g.slug,
    status: g.status,
    title_tr: g.title_tr,
    title_en: g.title_en,
    description_tr: g.description_tr,
    description_en: g.description_en,
    hero_title_tr: g.hero_title_tr,
    hero_title_en: g.hero_title_en,
    hero_teaser_tr: g.hero_teaser_tr,
    hero_teaser_en: g.hero_teaser_en,
    card_color: g.card_color,
    game_type: g.game_type,
    participantRows,
    hub_tags: Array.isArray(g.hub_tags) ? g.hub_tags : [],
    team_slug: g.team_slug ?? "",
  };
}

function rowsToParticipants(rows: ParticipantRow[], gameType: ArenaGameType): ArenaParticipant[] {
  const out: ArenaParticipant[] = [];
  for (const r of rows) {
    const name = r.name.trim();
    const detail = r.detail.trim();
    if (!name) continue;
    if (gameType === "fixed_8") out.push({ name, vs: detail });
    else out.push({ name, ...(detail ? { subtitle: detail } : {}) });
  }
  return out;
}

function countFilledParticipants(rows: ParticipantRow[]): number {
  return rows.filter((r) => r.name.trim()).length;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function AdminArenaPage() {
  const [games, setGames] = useState<ArenaGame[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null); // null = new
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);

  const showToast = (msg: string, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3000);
  };

  const loadGames = useCallback(async () => {
    const { data } = await supabase
      .from("arena_games")
      .select("*")
      .order("created_at", { ascending: true });
    setGames((data as ArenaGame[]) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { loadGames(); }, [loadGames]);

  function openNew() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setShowForm(true);
  }

  function openEdit(g: ArenaGame) {
    setEditingId(g.id);
    setForm(gameToForm(g));
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
  }

  function handleField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function handleParticipantRow(index: number, field: keyof ParticipantRow, value: string) {
    setForm((f) => ({
      ...f,
      participantRows: f.participantRows.map((row, i) => (i === index ? { ...row, [field]: value } : row)),
    }));
  }

  function handleGameTypeChange(gt: ArenaGameType) {
    setForm((f) => ({
      ...f,
      game_type: gt,
      participantRows: resizeParticipantRows(f.participantRows, gt),
    }));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title_tr || !form.slug) {
      showToast("Slug and title are required", false);
      return;
    }
    setSaving(true);

    const payload = {
      slug: form.slug,
      status: form.status,
      title_tr: form.title_tr,
      title_en: form.title_en,
      description_tr: form.description_tr,
      description_en: form.description_en,
      hero_title_tr: form.hero_title_tr,
      hero_title_en: form.hero_title_en,
      hero_teaser_tr: form.hero_teaser_tr,
      hero_teaser_en: form.hero_teaser_en,
      card_color: form.card_color,
      game_type: form.game_type,
      participants: rowsToParticipants(form.participantRows, form.game_type),
      hub_tags: form.hub_tags.length > 0 ? form.hub_tags : [],
      team_slug: form.team_slug.trim() || null,
    };

    const result = await saveArenaGame(payload, editingId ?? undefined);

    setSaving(false);
    if (!result.ok) {
      showToast(`Error: ${result.error}`, false);
    } else {
      showToast(editingId ? "Updated!" : "Added!");
      closeForm();
      loadGames();
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this arena game?")) return;
    setDeleting(id);
    const result = await deleteArenaGame(id);
    setDeleting(null);
    if (!result.ok) {
      showToast(`Could not delete: ${result.error}`, false);
    } else {
      showToast("Deleted.");
      loadGames();
    }
  }

  // ── Data verification ──────────────────────────────────────────────────────
  const [verifying, setVerifying] = useState(false);
  type VerifyResult = { name: string; matched: boolean; dbClub?: string };
  const [verifyResults, setVerifyResults] = useState<VerifyResult[] | null>(null);

  async function handleVerifyParticipants() {
    const names = form.participantRows
      .map((r) => r.name.trim())
      .filter(Boolean);
    if (names.length === 0) return;
    setVerifying(true);
    setVerifyResults(null);

    const { data: players } = await supabase
      .from("fc_players")
      .select("name,club")
      .in("name", names);
    const dbMap = new Map((players ?? []).map((p) => [p.name, p.club]));

    const results: VerifyResult[] = names.map((n) => ({
      name: n,
      matched: dbMap.has(n),
      dbClub: dbMap.get(n),
    }));
    setVerifyResults(results);
    setVerifying(false);
  }

  const inputCls =
    "w-full rounded-lg border border-slate-700/60 bg-slate-800/60 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 outline-none transition focus:border-emerald-500/60";
  const labelCls = "mb-1 block text-[11px] font-semibold uppercase tracking-wider text-slate-400";

  return (
    <AdminLayout>
      {/* Toast */}
      {toast && (
        <div
          className={`fixed right-4 top-4 z-50 rounded-lg px-4 py-3 text-sm font-semibold shadow-lg transition ${
            toast.ok ? "bg-emerald-600 text-white" : "bg-rose-600 text-white"
          }`}
        >
          {toast.msg}
        </div>
      )}

      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">Arena Games</h1>
            <p className="text-xs text-slate-400">Manage arena_games in Supabase</p>
          </div>
          <button
            onClick={openNew}
            className="rounded-lg bg-emerald-500 px-4 py-2 text-xs font-semibold text-slate-950 transition hover:bg-emerald-400"
          >
            + New Game
          </button>
        </div>

        {/* Game list */}
        {loading ? (
          <div className="flex items-center justify-center gap-2 py-20 text-sm text-slate-400">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-emerald-400 border-t-transparent" />
            Loading...
          </div>
        ) : (
          <div className="rounded-xl border border-slate-800/60 bg-slate-900/30">
            {games.length === 0 ? (
              <div className="px-5 py-12 text-center text-sm text-slate-500">
                No games yet.{" "}
                <button onClick={openNew} className="text-emerald-400 underline">
                  Add first game
                </button>
              </div>
            ) : (
              games.map((g) => (
                <div
                  key={g.id}
                  className="flex items-center gap-3 border-b border-slate-800/40 px-5 py-4 last:border-b-0"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold text-slate-100 truncate">{g.title_en || g.title_tr}</span>
                      <span className="text-[10px] text-slate-500 font-mono">/{g.slug}</span>
                    </div>
                    <div className="mt-0.5 flex items-center gap-2 text-[11px] text-slate-500 flex-wrap">
                      <span>{g.game_type}</span>
                      <span>·</span>
                      <span>{g.participants?.length ?? 0} participants</span>
                      <span>·</span>
                      <span>{new Date(g.created_at).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })}</span>
                      {(() => {
                        const days = Math.floor((Date.now() - new Date(g.created_at).getTime()) / 86400000);
                        if (days > 90) return <span className="rounded border border-rose-500/40 bg-rose-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-rose-400">Stale ({days}d)</span>;
                        if (days > 30) return <span className="rounded border border-amber-500/40 bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-amber-400">Review ({days}d)</span>;
                        return null;
                      })()}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${
                        g.status === "published"
                          ? "border-emerald-500/40 bg-emerald-500/15 text-emerald-300"
                          : "border-slate-600/40 bg-slate-700/20 text-slate-400"
                      }`}
                    >
                      {g.status === "published" ? "Published" : "Draft"}
                    </span>
                    <Link
                      href={`/arena/${g.slug}`}
                      target="_blank"
                      className="rounded-lg border border-slate-700/50 px-2 py-1 text-[11px] text-slate-400 transition hover:text-slate-200"
                    >
                      View
                    </Link>
                    <button
                      onClick={() => openEdit(g)}
                      className="rounded-lg border border-slate-700/50 px-2 py-1 text-[11px] text-slate-400 transition hover:text-emerald-300"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(g.id)}
                      disabled={deleting === g.id}
                      className="rounded-lg border border-rose-900/50 px-2 py-1 text-[11px] text-rose-400 transition hover:border-rose-500/50 disabled:opacity-50"
                    >
                      {deleting === g.id ? "..." : "Delete"}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Form overlay */}
        {/* Form overlay — full-screen on mobile, offset for sidebar on desktop */}
        {showForm && (
          <div className="fixed inset-0 z-40 flex items-start justify-center overflow-y-auto bg-slate-950/85 px-4 py-8 backdrop-blur-sm lg:inset-y-0 lg:left-56 lg:right-0 lg:top-0 lg:px-6">
            <form
              onSubmit={handleSave}
              className="mb-8 w-full max-w-3xl rounded-2xl border border-slate-800/60 bg-slate-900 p-6 shadow-2xl"
            >
              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-base font-bold">{editingId ? "Edit Game" : "New Arena Game"}</h2>
                <button type="button" onClick={closeForm} className="text-slate-500 hover:text-slate-300">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>

              <div className="grid gap-4">
                {/* Row: slug + status */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Slug *</label>
                    <input
                      className={inputCls}
                      value={form.slug}
                      onChange={(e) => handleField("slug", e.target.value)}
                      placeholder="future-stars"
                      required
                    />
                    {form.title_tr && !form.slug && (
                      <button
                        type="button"
                        className="mt-1 text-[10px] text-emerald-400 hover:underline"
                        onClick={() => handleField("slug", toSlug(form.title_tr))}
                      >
                        Auto-generate
                      </button>
                    )}
                  </div>
                  <div>
                    <label className={labelCls}>Status</label>
                    <select
                      className={inputCls}
                      value={form.status}
                      onChange={(e) => handleField("status", e.target.value as ArenaGameStatus)}
                    >
                      <option value="draft">Draft</option>
                      <option value="published">Published</option>
                    </select>
                  </div>
                </div>

                {/* Titles */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Title (TR) *</label>
                    <input
                      className={inputCls}
                      value={form.title_tr}
                      onChange={(e) => {
                        handleField("title_tr", e.target.value);
                        if (!form.slug) handleField("slug", toSlug(e.target.value));
                      }}
                      placeholder="Future Stars"
                      required
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Title (EN)</label>
                    <input
                      className={inputCls}
                      value={form.title_en}
                      onChange={(e) => handleField("title_en", e.target.value)}
                      placeholder="Future Stars"
                    />
                  </div>
                </div>

                {/* Descriptions */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Description (TR)</label>
                    <textarea
                      className={inputCls}
                      rows={2}
                      value={form.description_tr}
                      onChange={(e) => handleField("description_tr", e.target.value)}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Description (EN)</label>
                    <textarea
                      className={inputCls}
                      rows={2}
                      value={form.description_en}
                      onChange={(e) => handleField("description_en", e.target.value)}
                    />
                  </div>
                </div>

                {/* Hero titles */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Hero Title (TR)</label>
                    <input
                      className={inputCls}
                      value={form.hero_title_tr}
                      onChange={(e) => handleField("hero_title_tr", e.target.value)}
                      placeholder="Future Stars Tournament"
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Hero Title (EN)</label>
                    <input
                      className={inputCls}
                      value={form.hero_title_en}
                      onChange={(e) => handleField("hero_title_en", e.target.value)}
                      placeholder="Future Stars Tournament"
                    />
                  </div>
                </div>

                {/* Hero teasers */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Hero Teaser (TR)</label>
                    <input
                      className={inputCls}
                      value={form.hero_teaser_tr}
                      onChange={(e) => handleField("hero_teaser_tr", e.target.value)}
                      placeholder="One champion. You decide."
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Hero Teaser (EN)</label>
                    <input
                      className={inputCls}
                      value={form.hero_teaser_en}
                      onChange={(e) => handleField("hero_teaser_en", e.target.value)}
                      placeholder="One champion. You decide."
                    />
                  </div>
                </div>

                <div>
                  <label className={labelCls}>Campaign Hub</label>
                  <div className="mt-2 flex flex-wrap gap-4">
                    {(["wc-2026", "transfer"] as const).map((tag) => (
                      <label key={tag} className="flex items-center gap-2 text-xs text-slate-300">
                        <input
                          type="checkbox"
                          checked={form.hub_tags.includes(tag)}
                          onChange={() => {
                            setForm((f) => ({
                              ...f,
                              hub_tags: f.hub_tags.includes(tag)
                                ? f.hub_tags.filter((t) => t !== tag)
                                : [...f.hub_tags, tag],
                            }));
                          }}
                        />
                        {tag}
                      </label>
                    ))}
                  </div>
                  <div className="mt-3">
                    <label className={labelCls}>Team slug (transfer poll)</label>
                    <input
                      className={inputCls}
                      value={form.team_slug}
                      onChange={(e) => handleField("team_slug", e.target.value)}
                      placeholder="e.g. manchester-city"
                    />
                  </div>
                </div>

                {/* Game type + card color */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Game Type</label>
                    <select
                      className={inputCls}
                      value={form.game_type}
                      onChange={(e) => handleGameTypeChange(e.target.value as ArenaGameType)}
                    >
                      <option value="random_4">random_4 (4 candidates)</option>
                      <option value="random_8">random_8 (8 candidates)</option>
                      <option value="random_16">random_16 (16 candidates)</option>
                      <option value="random_32">random_32 (32 candidates)</option>
                      <option value="random_64">random_64 (64 candidates)</option>
                      <option value="random_128">random_128 (128 candidates)</option>
                      <option value="fixed_8">fixed_8 (8 fixed matchups)</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>Card Color</label>
                    <select
                      className={inputCls}
                      value={form.card_color}
                      onChange={(e) => handleField("card_color", e.target.value as ArenaCardColor)}
                    >
                      {CARD_COLOR_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Participants */}
                <div>
                  <label className={labelCls}>
                    Participants ({bracketParticipantCount(form.game_type)} rows)
                  </label>
                  <p className="mb-2 text-[10px] text-slate-500">
                    {form.game_type === "fixed_8"
                      ? "Enter two teams per row (A | B). Empty rows are ignored on save."
                      : "Enter player name and club / subtitle per row. Empty rows are ignored."}
                  </p>
                  <div className="rounded-lg border border-slate-800/60 bg-slate-950/40 p-3">
                    <div className="mb-2 hidden grid-cols-[2rem_minmax(0,1fr)_minmax(0,1fr)] gap-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500 sm:grid">
                      <span className="text-center">#</span>
                      <span>{form.game_type === "fixed_8" ? "Team A" : "Name"}</span>
                      <span>{form.game_type === "fixed_8" ? "Team B" : "Club / subtitle"}</span>
                    </div>
                    <div className="max-h-[min(560px,60vh)] space-y-2 overflow-y-auto overscroll-contain pr-1">
                      {form.participantRows.map((row, i) => (
                        <div
                          key={`${form.game_type}-${i}`}
                          className="grid grid-cols-1 gap-2 rounded-lg border border-slate-800/40 bg-slate-900/50 p-2 sm:grid-cols-[2rem_minmax(0,1fr)_minmax(0,1fr)] sm:items-center sm:border-0 sm:bg-transparent sm:p-0"
                        >
                          <span className="hidden text-center text-[11px] text-slate-600 sm:inline">{i + 1}</span>
                          <div className="sm:contents">
                            <input
                              type="text"
                              className={inputCls}
                              value={row.name}
                              onChange={(e) => handleParticipantRow(i, "name", e.target.value)}
                              placeholder={form.game_type === "fixed_8" ? `Team A (${i + 1})` : `Player (${i + 1})`}
                              aria-label={form.game_type === "fixed_8" ? `Team A ${i + 1}` : `Name ${i + 1}`}
                            />
                            <input
                              type="text"
                              className={inputCls}
                              value={row.detail}
                              onChange={(e) => handleParticipantRow(i, "detail", e.target.value)}
                              placeholder={form.game_type === "fixed_8" ? "Team B" : "Club"}
                              aria-label={form.game_type === "fixed_8" ? `Team B ${i + 1}` : `Club ${i + 1}`}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="mt-2 flex items-center gap-3">
                    <p className="text-[10px] text-slate-500">
                      <strong className="font-semibold text-slate-400">{countFilledParticipants(form.participantRows)}</strong>{" "}
                      participants · {bracketParticipantCount(form.game_type)} total slots
                    </p>
                    {form.game_type !== "fixed_8" && (
                      <button
                        type="button"
                        onClick={handleVerifyParticipants}
                        disabled={verifying}
                        className="rounded border border-sky-500/40 bg-sky-500/10 px-2 py-0.5 text-[10px] font-semibold text-sky-300 transition hover:bg-sky-500/20 disabled:opacity-50"
                      >
                        {verifying ? "Checking..." : "Verify against DB"}
                      </button>
                    )}
                  </div>

                  {verifyResults && (
                    <div className="mt-3 rounded-lg border border-slate-800/60 bg-slate-950/40 p-3">
                      <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                        Verification Results — {verifyResults.filter((r) => r.matched).length}/{verifyResults.length} matched
                      </p>
                      <div className="max-h-48 space-y-1 overflow-y-auto text-[11px]">
                        {verifyResults.map((r, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <span className={r.matched ? "text-emerald-400" : "text-rose-400"}>
                              {r.matched ? "✓" : "✗"}
                            </span>
                            <span className={r.matched ? "text-slate-300" : "text-rose-300 font-semibold"}>
                              {r.name}
                            </span>
                            {r.matched && r.dbClub && (
                              <span className="text-slate-500">({r.dbClub})</span>
                            )}
                            {!r.matched && (
                              <span className="text-rose-500">— not found in fc_players</span>
                            )}
                          </div>
                        ))}
                      </div>
                      {verifyResults.some((r) => !r.matched) && (
                        <p className="mt-2 text-[10px] text-amber-400">
                          Unmatched names won&apos;t show player cards. Verify spelling or add them to the database first.
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={closeForm}
                  className="rounded-lg border border-slate-700/60 px-4 py-2 text-xs text-slate-400 transition hover:text-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-emerald-500 px-5 py-2 text-xs font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:opacity-60"
                >
                  {saving ? "Saving..." : editingId ? "Update" : "Save"}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
