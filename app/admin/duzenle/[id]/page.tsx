"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import RichTextEditor from "@/app/components/rich-text-editor";

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
  const [youtubeQuery1, setYoutubeQuery1] = useState("");
  const [youtubeQuery2, setYoutubeQuery2] = useState("");
  const [newsQuery, setNewsQuery] = useState("");

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
      setLoadingData(false);
    }

    fetchContent();
  }, [id]);

  async function handleSave(publish = false) {
    setError("");
    if (!title.trim() || !slug.trim() || isContentEmpty(content)) {
      setError("Tüm alanlar zorunludur");
      return;
    }

    setSaving(true);
    const updateData: Record<string, string> = {
      title: title.trim(),
      slug: slug.trim(),
      category,
      content: content.trim(),
      youtube_id: youtubeId.trim(),
      cover_image: coverImage.trim(),
      youtube_query_1: youtubeQuery1.trim(),
      youtube_query_2: youtubeQuery2.trim(),
      news_query: newsQuery.trim(),
    };
    if (publish) {
      updateData.status = "yayinda";
    }

    const { error: updateError } = await supabase
      .from("contents")
      .update(updateData)
      .eq("id", id);

    if (updateError) {
      console.error("Supabase update error:", updateError);
      setError("Güncelleme sırasında hata oluştu: " + updateError.message);
      setSaving(false);
      return;
    }

    router.push("/admin");
  }

  if (loadingData) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100">
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-emerald-400 border-t-transparent" />
          Yükleniyor...
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100">
      <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4">
          <Link href="/admin" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-emerald-400 to-cyan-500 shadow-[0_0_40px_rgba(16,185,129,0.7)]" />
            <span className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-sky-500 bg-clip-text text-sm font-semibold tracking-[0.22em] text-transparent">
              ADMIN PANEL
            </span>
          </Link>
          <Link
            href="/admin"
            className="rounded-lg border border-slate-700/80 bg-slate-900/70 px-4 py-2 text-xs font-medium text-slate-300 transition hover:border-emerald-500/60 hover:text-emerald-300"
          >
            ← Panele Dön
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-4 py-8">
        <h1 className="mb-1 text-xl font-extrabold tracking-tight">
          İçeriği Düzenle
        </h1>
        <p className="mb-8 text-xs text-slate-400">
          Değişiklikleri kaydet veya doğrudan yayınla
        </p>

        <div className="space-y-5">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-300">
              Başlık
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-lg border border-slate-700/80 bg-slate-900/70 px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 outline-none transition focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/40"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-300">
              Slug
            </label>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="w-full rounded-lg border border-slate-700/80 bg-slate-900/70 px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 outline-none transition focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/40"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-300">
              Kategori
            </label>
            <div className="flex gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.value}
                  type="button"
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

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-300">
                YouTube Video ID
              </label>
              <input
                type="text"
                value={youtubeId}
                onChange={(e) => setYoutubeId(e.target.value)}
                placeholder="örn: dQw4w9WgXcQ (URL'deki v= sonrası)"
                className="w-full rounded-lg border border-slate-700/80 bg-slate-900/70 px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 outline-none transition focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/40"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-300">
                Kapak Görseli URL
              </label>
              <input
                type="text"
                value={coverImage}
                onChange={(e) => setCoverImage(e.target.value)}
                placeholder="İsteğe bağlı, boş bırakılabilir"
                className="w-full rounded-lg border border-slate-700/80 bg-slate-900/70 px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 outline-none transition focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/40"
              />
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-300">
                YouTube Arama 1
              </label>
              <input
                type="text"
                value={youtubeQuery1}
                onChange={(e) => setYoutubeQuery1(e.target.value)}
                placeholder="örn: Arda Güler highlights 2025"
                className="w-full rounded-lg border border-slate-700/80 bg-slate-900/70 px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 outline-none transition focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/40"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-300">
                YouTube Arama 2
              </label>
              <input
                type="text"
                value={youtubeQuery2}
                onChange={(e) => setYoutubeQuery2(e.target.value)}
                placeholder="opsiyonel, ikinci oyuncu için"
                className="w-full rounded-lg border border-slate-700/80 bg-slate-900/70 px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 outline-none transition focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/40"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-300">
              Haber Arama Keyword
            </label>
            <input
              type="text"
              value={newsQuery}
              onChange={(e) => setNewsQuery(e.target.value)}
              placeholder="örn: Arda Güler (boş bırakılırsa başlıktan otomatik çıkarılır)"
              className="w-full rounded-lg border border-slate-700/80 bg-slate-900/70 px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 outline-none transition focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/40"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-300">
              İçerik
            </label>
            <RichTextEditor
              value={content}
              onChange={setContent}
              placeholder="İçerik yazın..."
            />
          </div>

          {error && <p className="text-xs text-rose-400">{error}</p>}

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => handleSave(false)}
              disabled={saving}
              className="rounded-lg bg-emerald-500 px-6 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:opacity-50"
            >
              {saving ? "Kaydediliyor..." : "Kaydet"}
            </button>
            <button
              onClick={() => handleSave(true)}
              disabled={saving}
              className="rounded-lg border border-emerald-500/60 bg-emerald-500/15 px-6 py-2.5 text-sm font-semibold text-emerald-300 transition hover:bg-emerald-500/25 disabled:opacity-50"
            >
              {saving ? "Kaydediliyor..." : "Kaydet ve Yayınla"}
            </button>
            <Link
              href="/admin"
              className="rounded-lg border border-slate-700/80 bg-slate-900/70 px-6 py-2.5 text-sm font-medium text-slate-400 transition hover:border-slate-600 hover:text-slate-200"
            >
              İptal
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
