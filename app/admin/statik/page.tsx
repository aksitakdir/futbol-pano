"use client";

import { useEffect, useState } from "react";
import AdminLayout from "../components/admin-layout";
import { supabase } from "@/lib/supabase";

type StaticItem = {
  id: string;
  type: "archetype" | "list-card";
  name: string;
  description: string;
  slug: string;
  position_tag: string;
  sort_order: number;
  isNew?: boolean;
};

const POSITION_OPTIONS = ["Orta Saha", "Defans", "Hücum"];

const SEED_ARCHETYPES: Omit<StaticItem, "id">[] = [
  { type: "archetype", name: "Box-to-Box Engine", description: "Savunmadan hücuma köprü kuran modern orta saha motoru", slug: "box-to-box-engine", position_tag: "Orta Saha", sort_order: 0 },
  { type: "archetype", name: "Ball-Playing CB", description: "Oyun kurucu gibi davranan modern stoper", slug: "ball-playing-cb", position_tag: "Defans", sort_order: 1 },
  { type: "archetype", name: "Inverted Winger", description: "İçe kesip gol tehlikesi yaratan kanat oyuncusu", slug: "inverted-winger", position_tag: "Hücum", sort_order: 2 },
  { type: "archetype", name: "Inverted Full-back", description: "Orta sahaya kayarak üstünlük sağlayan modern bek", slug: "inverted-full-back", position_tag: "Defans", sort_order: 3 },
  { type: "archetype", name: "False 9", description: "Düşerek alan açan ve oyun kuran modern forvet", slug: "false-9", position_tag: "Hücum", sort_order: 4 },
  { type: "archetype", name: "High Press Striker", description: "Savunmayı tepeden başlatan pressing forveti", slug: "high-press-striker", position_tag: "Hücum", sort_order: 5 },
];

export default function StatikPage() {
  const [items, setItems] = useState<StaticItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [activeTab, setActiveTab] = useState<"archetype" | "list-card">("archetype");

  useEffect(() => {
    fetchItems();
  }, []);

  async function fetchItems() {
    setLoading(true);
    const { data, error } = await supabase
      .from("static_contents")
      .select("*")
      .order("sort_order", { ascending: true });

    if (error) {
      console.error("Fetch error:", error);
      setItems([]);
    } else {
      setItems((data ?? []) as StaticItem[]);
    }
    setLoading(false);
  }

  async function seedArchetypes() {
    setSaving(true);
    const inserts = SEED_ARCHETYPES.map((a) => ({
      type: a.type,
      name: a.name,
      description: a.description,
      slug: a.slug,
      position_tag: a.position_tag,
      sort_order: a.sort_order,
    }));
    const { error } = await supabase.from("static_contents").insert(inserts);
    if (error) {
      console.error("Seed error:", error);
      setMessage("Seed başarısız: " + error.message);
    } else {
      setMessage("Varsayılan arketipler eklendi.");
      fetchItems();
    }
    setSaving(false);
    setTimeout(() => setMessage(""), 3000);
  }

  function updateItem(id: string, field: keyof StaticItem, value: string | number) {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, [field]: value } : item)));
  }

  function addItem(type: "archetype" | "list-card") {
    const tempId = `new-${Date.now()}`;
    setItems((prev) => [
      ...prev,
      {
        id: tempId,
        type,
        name: "",
        description: "",
        slug: "",
        position_tag: type === "archetype" ? "Hücum" : "",
        sort_order: prev.filter((i) => i.type === type).length,
        isNew: true,
      },
    ]);
  }

  function removeItem(id: string) {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }

  async function handleSave() {
    setSaving(true);
    setMessage("");

    const currentItems = items.filter((i) => i.type === activeTab);
    let hasError = false;

    for (const item of currentItems) {
      const payload = {
        type: item.type,
        name: item.name,
        description: item.description,
        slug: item.slug,
        position_tag: item.position_tag,
        sort_order: item.sort_order,
      };

      if (item.isNew || item.id.startsWith("new-")) {
        const { error } = await supabase.from("static_contents").insert(payload);
        if (error) { console.error(error); hasError = true; }
      } else {
        const { error } = await supabase.from("static_contents").update(payload).eq("id", item.id);
        if (error) { console.error(error); hasError = true; }
      }
    }

    if (hasError) {
      setMessage("Bazı kayıtlar güncellenemedi.");
    } else {
      setMessage("Değişiklikler kaydedildi.");
      fetchItems();
    }
    setSaving(false);
    setTimeout(() => setMessage(""), 3000);
  }

  async function deleteItem(id: string) {
    if (id.startsWith("new-")) {
      removeItem(id);
      return;
    }
    if (!confirm("Bu öğeyi silmek istediğinize emin misiniz?")) return;
    const { error } = await supabase.from("static_contents").delete().eq("id", id);
    if (error) {
      console.error(error);
      setMessage("Silme işlemi başarısız.");
    } else {
      setItems((prev) => prev.filter((i) => i.id !== id));
      setMessage("Öğe silindi.");
    }
    setTimeout(() => setMessage(""), 3000);
  }

  const filteredItems = items.filter((i) => i.type === activeTab);
  const archetypeCount = items.filter((i) => i.type === "archetype").length;
  const listCardCount = items.filter((i) => i.type === "list-card").length;

  return (
    <AdminLayout>
      <div className="mx-auto max-w-4xl">
        <div className="mb-6">
          <h1 className="text-xl font-bold">Statik İçerikler</h1>
          <p className="text-xs text-slate-400">Taktik Lab arketipleri ve liste kartlarını yönet</p>
        </div>

        {/* Tabs */}
        <div className="mb-5 flex gap-1 rounded-xl border border-slate-800/60 bg-slate-900/40 p-1">
          <button
            onClick={() => setActiveTab("archetype")}
            className={[
              "flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2.5 text-xs font-semibold transition",
              activeTab === "archetype" ? "bg-emerald-500/15 text-emerald-300" : "text-slate-400 hover:text-slate-200",
            ].join(" ")}
          >
            Taktik Lab Arketipleri
            <span className={`inline-flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-[10px] font-bold ${activeTab === "archetype" ? "bg-emerald-500/25 text-emerald-200" : "bg-slate-800 text-slate-400"}`}>
              {archetypeCount}
            </span>
          </button>
          <button
            onClick={() => setActiveTab("list-card")}
            className={[
              "flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2.5 text-xs font-semibold transition",
              activeTab === "list-card" ? "bg-emerald-500/15 text-emerald-300" : "text-slate-400 hover:text-slate-200",
            ].join(" ")}
          >
            Liste Kartları
            <span className={`inline-flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-[10px] font-bold ${activeTab === "list-card" ? "bg-emerald-500/25 text-emerald-200" : "bg-slate-800 text-slate-400"}`}>
              {listCardCount}
            </span>
          </button>
        </div>

        {loading ? (
          <div className="flex items-center gap-2 py-20 text-sm text-slate-400 justify-center">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-emerald-400 border-t-transparent" />
            Yükleniyor...
          </div>
        ) : (
          <>
            {filteredItems.length === 0 && activeTab === "archetype" && (
              <div className="rounded-xl border border-dashed border-slate-700/60 bg-slate-900/20 p-8 text-center">
                <p className="mb-3 text-sm text-slate-400">Henüz arketip eklenmemiş</p>
                <button
                  onClick={seedArchetypes}
                  disabled={saving}
                  className="rounded-lg bg-emerald-500/15 px-4 py-2 text-xs font-semibold text-emerald-300 transition hover:bg-emerald-500/25 disabled:opacity-50"
                >
                  Varsayılan Arketipleri Ekle
                </button>
              </div>
            )}

            {filteredItems.length === 0 && activeTab === "list-card" && (
              <div className="rounded-xl border border-dashed border-slate-700/60 bg-slate-900/20 p-8 text-center">
                <p className="text-sm text-slate-400">Henüz liste kartı eklenmemiş</p>
              </div>
            )}

            {filteredItems.length > 0 && (
              <div className="space-y-3">
                {filteredItems.map((item, idx) => (
                  <div
                    key={item.id}
                    className="rounded-xl border border-slate-800/60 bg-slate-900/30 p-4"
                  >
                    <div className="mb-3 flex items-center justify-between">
                      <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-600">
                        #{idx + 1}
                      </span>
                      <button
                        onClick={() => deleteItem(item.id)}
                        className="text-[11px] text-rose-400/70 transition hover:text-rose-400"
                      >
                        Sil
                      </button>
                    </div>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <div>
                        <label className="mb-1 block text-[11px] font-medium text-slate-400">İsim</label>
                        <input
                          type="text"
                          value={item.name}
                          onChange={(e) => updateItem(item.id, "name", e.target.value)}
                          className="w-full rounded-lg border border-slate-700/80 bg-slate-800/70 px-3 py-2 text-sm text-slate-100 outline-none transition focus:border-emerald-500/60"
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-[11px] font-medium text-slate-400">Slug</label>
                        <input
                          type="text"
                          value={item.slug}
                          onChange={(e) => updateItem(item.id, "slug", e.target.value)}
                          className="w-full rounded-lg border border-slate-700/80 bg-slate-800/70 px-3 py-2 text-sm text-slate-100 outline-none transition focus:border-emerald-500/60"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="mb-1 block text-[11px] font-medium text-slate-400">Açıklama</label>
                        <input
                          type="text"
                          value={item.description}
                          onChange={(e) => updateItem(item.id, "description", e.target.value)}
                          className="w-full rounded-lg border border-slate-700/80 bg-slate-800/70 px-3 py-2 text-sm text-slate-100 outline-none transition focus:border-emerald-500/60"
                        />
                      </div>
                      {activeTab === "archetype" && (
                        <div>
                          <label className="mb-1 block text-[11px] font-medium text-slate-400">Pozisyon Etiketi</label>
                          <select
                            value={item.position_tag}
                            onChange={(e) => updateItem(item.id, "position_tag", e.target.value)}
                            className="w-full rounded-lg border border-slate-700/80 bg-slate-800/70 px-3 py-2 text-sm text-slate-100 outline-none transition focus:border-emerald-500/60"
                          >
                            {POSITION_OPTIONS.map((p) => (
                              <option key={p} value={p}>{p}</option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Actions */}
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <button
                onClick={() => addItem(activeTab)}
                className="rounded-lg border border-dashed border-slate-700/60 px-4 py-2 text-xs font-medium text-slate-400 transition hover:border-slate-600 hover:text-slate-200"
              >
                + Yeni {activeTab === "archetype" ? "Arketip" : "Liste Kartı"} Ekle
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="rounded-lg bg-emerald-500 px-6 py-2 text-xs font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:opacity-60"
              >
                {saving ? "Kaydediliyor..." : "Değişiklikleri Kaydet"}
              </button>
              {message && (
                <span className={`text-xs ${message.includes("başarı") || message.includes("kaydedildi") || message.includes("eklendi") || message.includes("silindi") ? "text-emerald-400" : "text-rose-400"}`}>
                  {message}
                </span>
              )}
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
}
