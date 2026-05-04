"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import AdminLayout from "../components/admin-layout";
import {
  CARD_COLOR_OPTIONS,
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
  participantsText: string; // raw textarea — one entry per line
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
  participantsText: "",
};

function gameToForm(g: ArenaGame): FormState {
  const text = g.participants
    .map((p) =>
      g.game_type === "fixed_8" ? `${p.name} | ${p.vs ?? ""}` : `${p.name}${p.subtitle ? ` | ${p.subtitle}` : ""}`,
    )
    .join("\n");
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
    participantsText: text,
  };
}

function formToParticipants(form: FormState): ArenaParticipant[] {
  return form.participantsText
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const parts = line.split("|").map((p) => p.trim());
      if (form.game_type === "fixed_8") {
        return { name: parts[0] ?? "", vs: parts[1] ?? "" };
      }
      return { name: parts[0] ?? "", subtitle: parts[1] };
    });
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

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title_tr || !form.slug) {
      showToast("Slug ve TR başlık zorunlu", false);
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
      participants: formToParticipants(form),
    };

    let error;
    if (editingId) {
      ({ error } = await supabase.from("arena_games").update(payload).eq("id", editingId));
    } else {
      ({ error } = await supabase.from("arena_games").insert(payload));
    }

    setSaving(false);
    if (error) {
      showToast(`Hata: ${error.message}`, false);
    } else {
      showToast(editingId ? "Güncellendi!" : "Eklendi!");
      closeForm();
      loadGames();
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Bu arena oyununu silmek istediğinizden emin misiniz?")) return;
    setDeleting(id);
    const { error } = await supabase.from("arena_games").delete().eq("id", id);
    setDeleting(null);
    if (error) {
      showToast(`Silinemedi: ${error.message}`, false);
    } else {
      showToast("Silindi.");
      loadGames();
    }
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
            <h1 className="text-xl font-bold">Arena Oyunları</h1>
            <p className="text-xs text-slate-400">Supabase arena_games tablosunu yönet</p>
          </div>
          <button
            onClick={openNew}
            className="rounded-lg bg-emerald-500 px-4 py-2 text-xs font-semibold text-slate-950 transition hover:bg-emerald-400"
          >
            + Yeni Oyun
          </button>
        </div>

        {/* Game list */}
        {loading ? (
          <div className="flex items-center justify-center gap-2 py-20 text-sm text-slate-400">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-emerald-400 border-t-transparent" />
            Yükleniyor...
          </div>
        ) : (
          <div className="rounded-xl border border-slate-800/60 bg-slate-900/30">
            {games.length === 0 ? (
              <div className="px-5 py-12 text-center text-sm text-slate-500">
                Henüz oyun eklenmemiş.{" "}
                <button onClick={openNew} className="text-emerald-400 underline">
                  İlk oyunu ekle
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
                      <span className="text-sm font-semibold text-slate-100 truncate">{g.title_tr}</span>
                      <span className="text-[10px] text-slate-500 font-mono">/{g.slug}</span>
                    </div>
                    <div className="mt-0.5 flex items-center gap-2 text-[11px] text-slate-500 flex-wrap">
                      <span>{g.game_type}</span>
                      <span>·</span>
                      <span>{g.participants?.length ?? 0} katılımcı</span>
                      <span>·</span>
                      <span>{new Date(g.created_at).toLocaleDateString("tr-TR", { day: "numeric", month: "short", year: "numeric" })}</span>
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
                      {g.status === "published" ? "Yayında" : "Taslak"}
                    </span>
                    <Link
                      href={`/arena/${g.slug}`}
                      target="_blank"
                      className="rounded-lg border border-slate-700/50 px-2 py-1 text-[11px] text-slate-400 transition hover:text-slate-200"
                    >
                      Görüntüle
                    </Link>
                    <button
                      onClick={() => openEdit(g)}
                      className="rounded-lg border border-slate-700/50 px-2 py-1 text-[11px] text-slate-400 transition hover:text-emerald-300"
                    >
                      Düzenle
                    </button>
                    <button
                      onClick={() => handleDelete(g.id)}
                      disabled={deleting === g.id}
                      className="rounded-lg border border-rose-900/50 px-2 py-1 text-[11px] text-rose-400 transition hover:border-rose-500/50 disabled:opacity-50"
                    >
                      {deleting === g.id ? "..." : "Sil"}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Form overlay */}
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-950/90 px-4 py-8 backdrop-blur-sm">
            <form
              onSubmit={handleSave}
              className="w-full max-w-2xl rounded-2xl border border-slate-800/60 bg-slate-900 p-6 shadow-2xl"
            >
              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-base font-bold">{editingId ? "Oyunu Düzenle" : "Yeni Arena Oyunu"}</h2>
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
                      placeholder="gelecek-yildizlar"
                      required
                    />
                    {form.title_tr && !form.slug && (
                      <button
                        type="button"
                        className="mt-1 text-[10px] text-emerald-400 hover:underline"
                        onClick={() => handleField("slug", toSlug(form.title_tr))}
                      >
                        Otomatik oluştur
                      </button>
                    )}
                  </div>
                  <div>
                    <label className={labelCls}>Durum</label>
                    <select
                      className={inputCls}
                      value={form.status}
                      onChange={(e) => handleField("status", e.target.value as ArenaGameStatus)}
                    >
                      <option value="draft">Taslak</option>
                      <option value="published">Yayında</option>
                    </select>
                  </div>
                </div>

                {/* Titles */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Başlık (TR) *</label>
                    <input
                      className={inputCls}
                      value={form.title_tr}
                      onChange={(e) => {
                        handleField("title_tr", e.target.value);
                        if (!form.slug) handleField("slug", toSlug(e.target.value));
                      }}
                      placeholder="Gelecek Yıldızlar"
                      required
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Başlık (EN)</label>
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
                    <label className={labelCls}>Açıklama (TR)</label>
                    <textarea
                      className={inputCls}
                      rows={2}
                      value={form.description_tr}
                      onChange={(e) => handleField("description_tr", e.target.value)}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Açıklama (EN)</label>
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
                    <label className={labelCls}>Hero Başlık (TR)</label>
                    <input
                      className={inputCls}
                      value={form.hero_title_tr}
                      onChange={(e) => handleField("hero_title_tr", e.target.value)}
                      placeholder="Gelecek Yıldızlar Turnuvası"
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Hero Başlık (EN)</label>
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
                      placeholder="16 isim, tek şampiyon. Sen seç."
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Hero Teaser (EN)</label>
                    <input
                      className={inputCls}
                      value={form.hero_teaser_en}
                      onChange={(e) => handleField("hero_teaser_en", e.target.value)}
                      placeholder="16 names, one champion. You decide."
                    />
                  </div>
                </div>

                {/* Game type + card color */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Oyun Tipi</label>
                    <select
                      className={inputCls}
                      value={form.game_type}
                      onChange={(e) => handleField("game_type", e.target.value as ArenaGameType)}
                    >
                      <option value="random_16">random_16 (16 oyuncu, karışık)</option>
                      <option value="fixed_8">fixed_8 (8 sabit eşleşme)</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>Kart Rengi</label>
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
                    Katılımcılar
                    {form.game_type === "fixed_8"
                      ? " — her satır: Takım A | Takım B  (8 satır)"
                      : " — her satır: İsim | Kulüp  (16 satır)"}
                  </label>
                  <textarea
                    className={`${inputCls} font-mono text-xs`}
                    rows={10}
                    value={form.participantsText}
                    onChange={(e) => handleField("participantsText", e.target.value)}
                    placeholder={
                      form.game_type === "fixed_8"
                        ? "Manchester City | Real Madrid\nArsenal | Barcelona\n..."
                        : "L. Yamal | Barcelona\nArda Güler | Real Madrid\n..."
                    }
                  />
                  <p className="mt-1 text-[10px] text-slate-500">
                    {formToParticipants(form).length} katılımcı girişi
                  </p>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={closeForm}
                  className="rounded-lg border border-slate-700/60 px-4 py-2 text-xs text-slate-400 transition hover:text-slate-200"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-emerald-500 px-5 py-2 text-xs font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:opacity-60"
                >
                  {saving ? "Kaydediliyor..." : editingId ? "Güncelle" : "Kaydet"}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
