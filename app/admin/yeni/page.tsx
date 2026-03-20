"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import RichTextEditor from "@/app/components/rich-text-editor";
import AdminLayout from "../components/admin-layout";

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

function YeniIcerikForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [category, setCategory] = useState("listeler");
  const [content, setContent] = useState("");
  const [youtubeId, setYoutubeId] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [youtubeQuery1, setYoutubeQuery1] = useState("");
  const [youtubeQuery2, setYoutubeQuery2] = useState("");
  const [newsQuery, setNewsQuery] = useState("");
  const [playerName, setPlayerName] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const c = searchParams.get("category");
    if (c === "radar" || c === "listeler" || c === "taktik-lab") {
      setCategory(c);
    }
  }, [searchParams]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!title.trim() || !slug.trim() || !content.trim()) {
      setError("Tüm alanlar zorunludur");
      return;
    }

    setSaving(true);
    const { error: insertError } = await supabase.from("contents").insert({
      title: title.trim(),
      slug: slug.trim(),
      category,
      content: content.trim(),
      youtube_id: youtubeId.trim(),
      cover_image: coverImage.trim(),
      youtube_query_1: youtubeQuery1.trim(),
      youtube_query_2: youtubeQuery2.trim(),
      news_query: newsQuery.trim(),
      player_name: playerName.trim() || null,
      status: "bekliyor",
    });

    if (insertError) {
      console.error("Supabase insert error:", insertError);
      setError("Kayıt sırasında hata oluştu: " + insertError.message);
      setSaving(false);
      return;
    }

    router.push(category === "radar" ? "/admin/radar" : "/admin/icerikler");
  }

  const backHref = category === "radar" ? "/admin/radar" : "/admin/icerikler";
  const backLabel = category === "radar" ? "← Radar listesine" : "← İçeriklere dön";

  return (
    <AdminLayout>
      <div className="mx-auto max-w-3xl">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">Yeni İçerik Ekle</h1>
            <p className="text-xs text-slate-400">
              İçerik kaydedildiğinde &quot;bekliyor&quot; durumunda admin paneline düşecektir
            </p>
          </div>
          <Link
            href={backHref}
            className="rounded-lg border border-slate-700/60 px-3 py-1.5 text-xs font-medium text-slate-400 transition hover:border-slate-600 hover:text-slate-200"
          >
            {backLabel}
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-300">
              Başlık
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Örn: En İyi 10 Genç Kanat"
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
              placeholder="Örn: en-iyi-10-genc-kanat"
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
              Odak oyuncu (arama linkleri)
            </label>
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="İsteğe bağlı; başlık altında Transfermarkt / Google linkleri"
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

          {error && (
            <p className="text-xs text-rose-400">{error}</p>
          )}

          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-emerald-500 px-6 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:opacity-50"
          >
            {saving ? "Kaydediliyor..." : "Kaydet ve Beklet"}
          </button>
        </form>
      </div>
    </AdminLayout>
  );
}

export default function YeniIcerikPage() {
  return (
    <Suspense
      fallback={
        <AdminLayout>
          <div className="flex justify-center py-20 text-sm text-slate-400">Yükleniyor…</div>
        </AdminLayout>
      }
    >
      <YeniIcerikForm />
    </Suspense>
  );
}
