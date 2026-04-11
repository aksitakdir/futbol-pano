"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import RichTextEditor from "@/app/components/rich-text-editor";
import AdminLayout from "../../components/admin-layout";

function isContentEmpty(html: string): boolean {
  if (!html?.trim()) return true;
  const text = html.replace(/<[^>]+>/g, "").trim();
  return text === "";
}

const CATEGORIES = [
  { value: "listeler", label: "Listeler" },
  { value: "radar", label: "Radar" },
  { value: "taktik-lab", label: "Taktik Lab" },
];

function categoryPublicPath(cat: string): string {
  if (cat === "radar") return "/radar";
  if (cat === "taktik-lab") return "/taktik-lab";
  return "/listeler";
}

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

type FcPlayer = {
  name: string;
  overall: number;
  position: string;
  club: string;
  league: string;
  nationality: string;
  age: number;
  pace: number;
  shooting: number;
  passing: number;
  dribbling: number;
  defending: number;
  physical: number;
  photo_url?: string;
};

function StatInput({
  label, value, onChange,
}: {
  label: string;
  value: number | "";
  onChange: (v: number | "") => void;
}) {
  return (
    <div>
      <label className="mb-1 block text-[11px] font-semibold text-slate-400">{label}</label>
      <input
        type="number" min="1" max="99"
        value={value}
        onChange={(e) => onChange(e.target.value ? Number(e.target.value) : "")}
        className="w-full rounded-lg border border-slate-700 bg-slate-800/60 px-3 py-2 text-sm text-slate-100 focus:border-emerald-500 focus:outline-none"
        placeholder="1-99"
      />
    </div>
  );
}

export default function DuzenlePage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [category, setCategory] = useState("listeler");
  const [content, setContent] = useState("");
  const [youtubeId, setYoutubeId] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [imageUploading, setImageUploading] = useState(false);
  const [youtubeQuery1, setYoutubeQuery1] = useState("");
  const [youtubeQuery2, setYoutubeQuery2] = useState("");
  const [newsQuery, setNewsQuery] = useState("");
  const [playerName, setPlayerName] = useState("");

  // Stat alanları
  const [statPace, setStatPace] = useState<number | "">("");
  const [statShooting, setStatShooting] = useState<number | "">("");
  const [statPassing, setStatPassing] = useState<number | "">("");
  const [statDribbling, setStatDribbling] = useState<number | "">("");
  const [statDefending, setStatDefending] = useState<number | "">("");
  const [statPhysical, setStatPhysical] = useState<number | "">("");
  const [statOverall, setStatOverall] = useState<number | "">("");

  // Oyuncu arama
  const [playerSearch, setPlayerSearch] = useState("");
  const [playerResults, setPlayerResults] = useState<FcPlayer[]>([]);
  const [playerSearching, setPlayerSearching] = useState(false);
  const [playerMatched, setPlayerMatched] = useState<FcPlayer | null>(null);
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [playersList, setPlayersList] = useState<
    Array<{ name: string; overall: number; position: string; club: string; photo_url?: string; scout_note: string }>
  >([]);
  const [playersListSearch, setPlayersListSearch] = useState("");
  const [playersListResults, setPlayersListResults] = useState<FcPlayer[]>([]);
  const [playersListSearching, setPlayersListSearching] = useState(false);
  const playersListTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [loadingData, setLoadingData] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchContent() {
      const { data, error } = await supabase
        .from("contents")
        .select("*")
        .eq("id", id)
        .single();

      if (error || !data) {
        setError("İçerik bulunamadı");
        setLoadingData(false);
        return;
      }

      setTitle(data.title ?? "");
      setSlug(data.slug ?? "");
      setCategory(data.category ?? "listeler");
      setContent(data.content ?? "");
      setYoutubeId(data.youtube_id ?? "");
      setCoverImage(data.cover_image ?? "");
      setYoutubeQuery1(data.youtube_query_1 ?? "");
      setYoutubeQuery2(data.youtube_query_2 ?? "");
      setNewsQuery(data.news_query ?? "");
      setPlayerName(data.player_name ?? "");
      setPlayerSearch(data.player_name ?? "");

      // Mevcut stat değerlerini yükle
      setStatPace(data.stat_pace ?? "");
      setStatShooting(data.stat_shooting ?? "");
      setStatPassing(data.stat_passing ?? "");
      setStatDribbling(data.stat_dribbling ?? "");
      setStatDefending(data.stat_defending ?? "");
      setStatPhysical(data.stat_physical ?? "");
      setStatOverall(data.stat_overall ?? "");

      const rawPlayers = (data as { players_json?: string | null }).players_json;
      if (rawPlayers) {
        try {
          const parsed = JSON.parse(rawPlayers);
          if (Array.isArray(parsed)) setPlayersList(parsed);
          else setPlayersList([]);
        } catch {
          setPlayersList([]);
        }
      } else {
        setPlayersList([]);
      }

      setLoadingData(false);
    }
    fetchContent();
  }, [id]);

  // Oyuncu arama — debounced
  useEffect(() => {
    if (!playerSearch.trim() || playerSearch.length < 2) {
      setPlayerResults([]);
      return;
    }
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(async () => {
      setPlayerSearching(true);
      const { data } = await supabase
        .from("fc_players")
        .select("name,overall,position,club,league,nationality,age,pace,shooting,passing,dribbling,defending,physical,photo_url")
        .ilike("name", `%${playerSearch.trim()}%`)
        .order("overall", { ascending: false })
        .limit(8);
      setPlayerResults((data as FcPlayer[]) ?? []);
      setPlayerSearching(false);
    }, 350);
  }, [playerSearch]);

  useEffect(() => {
    if (!playersListSearch.trim() || playersListSearch.length < 2) {
      setPlayersListResults([]);
      return;
    }
    if (playersListTimeout.current) clearTimeout(playersListTimeout.current);
    playersListTimeout.current = setTimeout(async () => {
      setPlayersListSearching(true);
      const { data } = await supabase
        .from("fc_players")
        .select(
          "name,overall,position,club,league,nationality,age,pace,shooting,passing,dribbling,defending,physical,photo_url",
        )
        .ilike("name", `%${playersListSearch.trim()}%`)
        .order("overall", { ascending: false })
        .limit(8);
      setPlayersListResults((data as FcPlayer[]) ?? []);
      setPlayersListSearching(false);
    }, 350);
  }, [playersListSearch]);

  function applyPlayer(p: FcPlayer) {
    setPlayerMatched(p);
    setPlayerName(p.name);
    setPlayerSearch(p.name);
    setStatPace(p.pace || "");
    setStatShooting(p.shooting || "");
    setStatPassing(p.passing || "");
    setStatDribbling(p.dribbling || "");
    setStatDefending(p.defending || "");
    setStatPhysical(p.physical || "");
    setStatOverall(p.overall || "");
    setPlayerResults([]);
  }

  function clearPlayer() {
    setPlayerMatched(null);
    setPlayerSearch("");
    setPlayerName("");
    setStatPace(""); setStatShooting(""); setStatPassing("");
    setStatDribbling(""); setStatDefending(""); setStatPhysical("");
    setStatOverall("");
  }

  async function handleSave(publish = false) {
    setError("");
    const slugTrim = slug.trim();
    if (!title.trim() || !slugTrim || isContentEmpty(content)) {
      setError("Tüm alanlar zorunludur");
      return;
    }
    if (!SLUG_PATTERN.test(slugTrim)) {
      setError("Slug yalnızca küçük harf, rakam ve tire içerebilir.");
      return;
    }

    setSaving(true);
    const updateData: Record<string, unknown> = {
      title: title.trim(),
      slug: slugTrim,
      category,
      content: content.trim(),
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
    };

    if (publish) updateData.status = "yayinda";

    const { error: updateError } = await supabase
      .from("contents")
      .update(updateData)
      .eq("id", id);

    if (updateError) {
      setError("Güncelleme sırasında hata oluştu: " + updateError.message);
      setSaving(false);
      return;
    }

    router.push(category === "radar" ? "/admin/radar" : "/admin/icerikler");
  }

  const statsFilled = [statPace, statShooting, statPassing, statDribbling, statDefending, statPhysical].filter(v => v !== "").length;

  if (loadingData) {
    return (
      <AdminLayout>
        <div className="flex items-center gap-2 py-20 text-sm text-slate-400 justify-center">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-emerald-400 border-t-transparent" />
          Yükleniyor...
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="mx-auto max-w-3xl">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">İçeriği Düzenle</h1>
            <p className="text-xs text-slate-400">Değişiklikleri kaydet veya doğrudan yayınla</p>
          </div>
          <Link
            href={category === "radar" ? "/admin/radar" : "/admin/icerikler"}
            className="rounded-lg border border-slate-700/60 px-3 py-1.5 text-xs font-medium text-slate-400 transition hover:border-slate-600 hover:text-slate-200"
          >
            {category === "radar" ? "← Radar listesine" : "← İçeriklere dön"}
          </Link>
        </div>

        <div className="space-y-5">
          {/* Başlık */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-300">Başlık</label>
            <input
              type="text" value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-lg border border-slate-700/80 bg-slate-900/70 px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 outline-none transition focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/40"
            />
          </div>

          {/* Slug */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-300">Slug (URL)</label>
            <input
              type="text" value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="ornek-makale-url-yolu"
              autoComplete="off" spellCheck={false}
              className="w-full rounded-lg border border-slate-700/80 bg-slate-900/70 px-4 py-2.5 font-mono text-sm text-slate-100 placeholder-slate-500 outline-none transition focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/40"
            />
            <p className="mt-1.5 text-[11px] leading-relaxed text-slate-500">
              Yayında sayfa adresi:{" "}
              <span className="font-mono text-slate-400">
                {categoryPublicPath(category)}/{slug.trim() || "…"}
              </span>
            </p>
          </div>

          {/* Kategori */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-300">Kategori</label>
            <div className="flex gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.value} type="button"
                  onClick={() => setCategory(cat.value)}
                  className={[
                    "rounded-lg border px-4 py-2 text-xs font-semibold transition",
                    category === cat.value
                      ? "border-emerald-500/60 bg-emerald-500/15 text-emerald-300"
                      : "border-slate-700/80 bg-slate-900/70 text-slate-400 hover:border-slate-600 hover:text-slate-200",
                  ].join(" ")}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* YouTube + Kapak */}
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-300">YouTube Video ID</label>
              <input
                type="text" value={youtubeId}
                onChange={(e) => setYoutubeId(e.target.value)}
                placeholder="örn: dQw4w9WgXcQ"
                className="w-full rounded-lg border border-slate-700/80 bg-slate-900/70 px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 outline-none transition focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/40"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-300">Kapak Görseli</label>
              <div className="space-y-2">
                <input
                  type="text" value={coverImage}
                  onChange={(e) => setCoverImage(e.target.value)}
                  placeholder="URL yapıştır ya da aşağıdan yükle"
                  className="w-full rounded-lg border border-slate-700/80 bg-slate-900/70 px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 outline-none transition focus:border-emerald-500/60"
                />
                <div className="flex items-center gap-2">
                  <label className="cursor-pointer rounded-lg border border-slate-700/60 bg-slate-800/60 px-3 py-2 text-xs font-semibold text-slate-300 transition hover:border-emerald-500/40 hover:text-emerald-300">
                    {imageUploading ? "Yükleniyor..." : "📁 Görsel Yükle"}
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
                        } catch (err) {
                          console.error("Görsel yükleme hatası:", err);
                        }
                        setImageUploading(false);
                      }}
                    />
                  </label>
                  {coverImage && (
                    <img src={coverImage} alt="" className="h-10 w-16 rounded object-cover border border-slate-700/60" />
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* YouTube sorguları */}
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-300">YouTube Arama 1</label>
              <input
                type="text" value={youtubeQuery1}
                onChange={(e) => setYoutubeQuery1(e.target.value)}
                placeholder="örn: Arda Güler highlights 2025"
                className="w-full rounded-lg border border-slate-700/80 bg-slate-900/70 px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 outline-none transition focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/40"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-300">YouTube Arama 2</label>
              <input
                type="text" value={youtubeQuery2}
                onChange={(e) => setYoutubeQuery2(e.target.value)}
                placeholder="opsiyonel"
                className="w-full rounded-lg border border-slate-700/80 bg-slate-900/70 px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 outline-none transition focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/40"
              />
            </div>
          </div>

          {/* Haber keyword */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-300">Haber Arama Keyword</label>
            <input
              type="text" value={newsQuery}
              onChange={(e) => setNewsQuery(e.target.value)}
              placeholder="örn: Arda Güler"
              className="w-full rounded-lg border border-slate-700/80 bg-slate-900/70 px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 outline-none transition focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/40"
            />
          </div>

          {category === "listeler" && (
            <div className="rounded-xl border border-slate-700/60 bg-slate-900/40 p-5">
              <div className="mb-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-300/80">Oyuncu Listesi</p>
                <p className="mt-0.5 text-[11px] text-slate-500">Liste içeriği için birden fazla oyuncu ekle</p>
              </div>
              <div className="relative mb-4">
                <input
                  type="text"
                  value={playersListSearch}
                  onChange={(e) => setPlayersListSearch(e.target.value)}
                  placeholder="Oyuncu adı yaz, seç ve listeye ekle..."
                  className="w-full rounded-lg border border-slate-700/80 bg-slate-900/70 px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 outline-none transition focus:border-sky-500/60"
                />
                {playersListSearching && (
                  <div className="absolute right-3 top-3 h-4 w-4 animate-spin rounded-full border-2 border-sky-400 border-t-transparent" />
                )}
                {playersListResults.length > 0 && (
                  <div className="absolute z-20 mt-1 w-full overflow-hidden rounded-xl border border-slate-700 bg-slate-900 shadow-xl">
                    {playersListResults.map((p) => (
                      <button
                        key={p.name + p.club}
                        type="button"
                        onClick={() => {
                          if (!playersList.find((pl) => pl.name === p.name)) {
                            setPlayersList((prev) => [
                              ...prev,
                              {
                                name: p.name,
                                overall: p.overall,
                                position: p.position,
                                club: p.club,
                                photo_url: p.photo_url,
                                scout_note: "",
                              },
                            ]);
                          }
                          setPlayersListSearch("");
                          setPlayersListResults([]);
                        }}
                        className="flex w-full items-center justify-between px-4 py-2.5 text-left text-sm transition hover:bg-slate-800/80"
                      >
                        <div>
                          <span className="font-semibold text-slate-100">{p.name}</span>
                          <span className="ml-2 text-[11px] text-slate-400">
                            {p.club} · {p.position}
                          </span>
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
                        <p className="text-[10px] text-slate-400">
                          {p.club} · {p.position}
                        </p>
                      </div>
                      <input
                        type="text"
                        value={p.scout_note}
                        onChange={(e) =>
                          setPlayersList((prev) =>
                            prev.map((pl, j) => (j === i ? { ...pl, scout_note: e.target.value } : pl)),
                          )
                        }
                        placeholder="Scout notu..."
                        className="flex-1 rounded-md border border-slate-700/60 bg-slate-900/60 px-2 py-1 text-[11px] text-slate-100 placeholder-slate-500 outline-none focus:border-sky-500/40"
                      />
                      <button
                        type="button"
                        onClick={() => setPlayersList((prev) => prev.filter((_, j) => j !== i))}
                        className="text-[11px] text-rose-400 hover:text-rose-300"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                  <p className="text-[11px] text-slate-500">{playersList.length} oyuncu eklendi</p>
                </div>
              )}
            </div>
          )}

          {/* ─── Oyuncu Kartı Bölümü ─────────────────────────────────────────── */}
          <div className="rounded-xl border border-slate-700/60 bg-slate-900/40 p-5">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-300/80">
                  Oyuncu Kartı
                </p>
                <p className="mt-0.5 text-[11px] text-slate-500">
                  EA FC 26 veritabanından otomatik doldurulur — istersen düzenle
                </p>
              </div>
              {(playerMatched || statOverall) && (
                <button
                  type="button" onClick={clearPlayer}
                  className="text-[11px] text-rose-400 hover:text-rose-300"
                >
                  Temizle
                </button>
              )}
            </div>

            {/* Oyuncu arama */}
            <div className="relative mb-4">
              <label className="mb-1.5 block text-xs font-semibold text-slate-300">Odak Oyuncu</label>
              <input
                type="text"
                value={playerSearch}
                onChange={(e) => { setPlayerSearch(e.target.value); setPlayerMatched(null); setPlayerName(e.target.value); }}
                placeholder="Oyuncu adı yazın — EA FC 26'dan otomatik bulur"
                className="w-full rounded-lg border border-slate-700/80 bg-slate-900/70 px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 outline-none transition focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/40"
              />
              {playerSearching && (
                <div className="absolute right-3 top-9 h-4 w-4 animate-spin rounded-full border-2 border-emerald-400 border-t-transparent" />
              )}

              {playerResults.length > 0 && (
                <div className="absolute z-20 mt-1 w-full rounded-xl border border-slate-700 bg-slate-900 shadow-xl overflow-hidden">
                  {playerResults.map((p) => (
                    <button
                      key={p.name + p.club}
                      type="button"
                      onClick={() => applyPlayer(p)}
                      className="flex w-full items-center justify-between px-4 py-2.5 text-left text-sm hover:bg-slate-800/80 transition"
                    >
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

            {/* Eşleşen oyuncu özeti */}
            {playerMatched && (
              <div className="mb-4 flex items-center gap-3 rounded-lg border border-emerald-500/20 bg-emerald-500/5 px-4 py-2.5">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-emerald-300">{playerMatched.name}</p>
                  <p className="text-[11px] text-slate-400">{playerMatched.club} · {playerMatched.league} · {playerMatched.age} yaş</p>
                </div>
                <span className="text-2xl font-black text-emerald-400">{playerMatched.overall}</span>
              </div>
            )}

            {/* Stat grid */}
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
              <StatInput label="PAC — Hız" value={statPace} onChange={setStatPace} />
              <StatInput label="SHO — Şut" value={statShooting} onChange={setStatShooting} />
              <StatInput label="PAS — Pas" value={statPassing} onChange={setStatPassing} />
              <StatInput label="DRI — Dribling" value={statDribbling} onChange={setStatDribbling} />
              <StatInput label="DEF — Defans" value={statDefending} onChange={setStatDefending} />
              <StatInput label="PHY — Fizik" value={statPhysical} onChange={setStatPhysical} />
            </div>

            <div className="mt-3 flex items-center gap-3">
              <div className="flex-1">
                <label className="mb-1 block text-[11px] font-semibold text-slate-400">Overall</label>
                <input
                  type="number" min="1" max="99"
                  value={statOverall}
                  onChange={(e) => setStatOverall(e.target.value ? Number(e.target.value) : "")}
                  className="w-24 rounded-lg border border-emerald-700/50 bg-slate-800/60 px-3 py-2 text-sm font-bold text-emerald-300 focus:border-emerald-500 focus:outline-none"
                  placeholder="Overall"
                />
              </div>
              {statsFilled > 0 && (
                <p className="text-[11px] text-emerald-400/70 mt-4">{statsFilled}/6 stat dolduruldu</p>
              )}
            </div>
          </div>

          {/* İçerik editörü */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-300">İçerik</label>
            <RichTextEditor value={content} onChange={setContent} placeholder="İçerik yazın..." />
          </div>

          {error && <p className="text-xs text-rose-400">{error}</p>}

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => handleSave(false)} disabled={saving}
              className="rounded-lg bg-emerald-500 px-6 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:opacity-50"
            >
              {saving ? "Kaydediliyor..." : "Kaydet"}
            </button>
            <button
              onClick={() => handleSave(true)} disabled={saving}
              className="rounded-lg border border-emerald-500/60 bg-emerald-500/15 px-6 py-2.5 text-sm font-semibold text-emerald-300 transition hover:bg-emerald-500/25 disabled:opacity-50"
            >
              {saving ? "Kaydediliyor..." : "Kaydet ve Yayınla"}
            </button>
            <Link
              href={category === "radar" ? "/admin/radar" : "/admin/icerikler"}
              className="rounded-lg border border-slate-700/80 bg-slate-900/70 px-6 py-2.5 text-sm font-medium text-slate-400 transition hover:border-slate-600 hover:text-slate-200"
            >
              İptal
            </Link>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
