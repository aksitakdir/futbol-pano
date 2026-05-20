"use client";

import { useCallback, useEffect, useState } from "react";
import AdminLayout from "../components/admin-layout";
import { supabase } from "@/lib/supabase";
import { HUBS, type HubId } from "@/lib/hub-config";
import type { HubPillarCopy } from "@/lib/hub-types";

type ScenarioRow = {
  id: string;
  sort_rank: number;
  player_name: string;
  from_club: string;
  to_club: string;
  likelihood: number;
  note_tr: string;
  note_en: string;
  is_published: boolean;
  isNew?: boolean;
};

type CompletedRow = {
  id: string;
  player_name: string;
  from_club: string;
  to_club: string;
  fee_tr: string;
  fee_en: string;
  transfer_date: string;
  sort_order: number;
  is_published: boolean;
  isNew?: boolean;
};

type Tab = "copy" | "scenarios" | "completed" | "sync";

const labelCls = "mb-1 block text-[11px] font-medium text-slate-400";
const inputCls =
  "w-full rounded-lg border border-slate-700/80 bg-slate-800/70 px-3 py-2 text-sm text-slate-100 placeholder-slate-600 outline-none transition focus:border-emerald-500/60";

function settingsKey(hubId: HubId, locale: "tr" | "en") {
  return `hub_copy_${hubId}_${locale}`;
}

export default function AdminHubPage() {
  const [tab, setTab] = useState<Tab>("scenarios");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const [scenarios, setScenarios] = useState<ScenarioRow[]>([]);
  const [completed, setCompleted] = useState<CompletedRow[]>([]);

  const [copyHub, setCopyHub] = useState<HubId>("transfer");
  const [copyLocale, setCopyLocale] = useState<"tr" | "en">("tr");
  const [copy, setCopy] = useState<HubPillarCopy>({});

  const fetchAll = useCallback(async () => {
    setLoading(true);
    const [{ data: sc }, { data: co }] = await Promise.all([
      supabase.from("hub_transfer_scenarios").select("*").order("likelihood", { ascending: false }),
      supabase.from("hub_completed_transfers").select("*").order("sort_order", { ascending: false }),
    ]);
    setScenarios((sc ?? []) as ScenarioRow[]);
    setCompleted((co ?? []) as CompletedRow[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  useEffect(() => {
    const defaults = HUBS[copyHub][copyLocale];
    (async () => {
      const { data } = await supabase.from("site_settings").select("value").eq("key", settingsKey(copyHub, copyLocale)).maybeSingle();
      const v = (data?.value ?? {}) as HubPillarCopy;
      setCopy({
        navLabel: v.navLabel ?? defaults.navLabel,
        pillarEyebrow: v.pillarEyebrow ?? defaults.pillarEyebrow,
        pillarTitle: v.pillarTitle ?? defaults.pillarTitle,
        pillarDescription: v.pillarDescription ?? defaults.pillarDescription,
      });
    })();
  }, [copyHub, copyLocale]);

  async function saveScenarios() {
    setSaving(true);
    setMessage("");
    for (const row of scenarios) {
      const payload = {
        sort_rank: row.sort_rank,
        player_name: row.player_name,
        from_club: row.from_club,
        to_club: row.to_club,
        likelihood: row.likelihood,
        note_tr: row.note_tr,
        note_en: row.note_en,
        is_published: row.is_published,
        source: "manual",
        updated_at: new Date().toISOString(),
      };
      if (row.isNew || row.id.startsWith("new-")) {
        await supabase.from("hub_transfer_scenarios").insert(payload);
      } else {
        await supabase.from("hub_transfer_scenarios").update(payload).eq("id", row.id);
      }
    }
    setMessage("Senaryolar kaydedildi.");
    await fetchAll();
    setSaving(false);
    setTimeout(() => setMessage(""), 3000);
  }

  async function saveCompleted() {
    setSaving(true);
    setMessage("");
    for (const row of completed) {
      const payload = {
        player_name: row.player_name,
        from_club: row.from_club,
        to_club: row.to_club,
        fee_tr: row.fee_tr,
        fee_en: row.fee_en,
        transfer_date: row.transfer_date,
        sort_order: row.sort_order,
        is_published: row.is_published,
        source: "manual",
        updated_at: new Date().toISOString(),
      };
      if (row.isNew || row.id.startsWith("new-")) {
        await supabase.from("hub_completed_transfers").insert(payload);
      } else {
        await supabase.from("hub_completed_transfers").update(payload).eq("id", row.id);
      }
    }
    setMessage("Gerçekleşen transferler kaydedildi.");
    await fetchAll();
    setSaving(false);
    setTimeout(() => setMessage(""), 3000);
  }

  async function saveCopy() {
    setSaving(true);
    const { error } = await supabase.from("site_settings").upsert(
      { key: settingsKey(copyHub, copyLocale), value: copy, updated_at: new Date().toISOString() },
      { onConflict: "key" },
    );
    setMessage(error ? `Hata: ${error.message}` : "Sayfa metinleri kaydedildi.");
    setSaving(false);
    setTimeout(() => setMessage(""), 3000);
  }

  async function runPublicSync() {
    setSaving(true);
    try {
      await fetch("/api/transfer-hub?sync=1");
      await fetch("/api/wc-live-scores");
      setMessage("Herkese açık API üzerinden yenilendi.");
      await fetchAll();
    } catch {
      setMessage("API yenileme hatası.");
    }
    setSaving(false);
    setTimeout(() => setMessage(""), 3000);
  }

  async function deleteScenario(id: string) {
    if (!confirm("Silinsin mi?")) return;
    await supabase.from("hub_transfer_scenarios").delete().eq("id", id);
    fetchAll();
  }

  async function deleteCompleted(id: string) {
    if (!confirm("Silinsin mi?")) return;
    await supabase.from("hub_completed_transfers").delete().eq("id", id);
    fetchAll();
  }

  const TABS: { id: Tab; label: string }[] = [
    { id: "scenarios", label: "Transfer ihtimalleri" },
    { id: "completed", label: "Gerçekleşen" },
    { id: "copy", label: "Sayfa metinleri" },
    { id: "sync", label: "API & Senkron" },
  ];

  return (
    <AdminLayout>
      <div className="mx-auto max-w-4xl">
        <div className="mb-6">
          <h1 className="text-xl font-bold">Hub Yönetimi (V2)</h1>
          <p className="text-xs text-slate-400">DK 2026 & Transfer merkezi — veri, metinler, API senkronu</p>
        </div>

        {message ? (
          <p className="mb-4 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-300">
            {message}
          </p>
        ) : null}

        <div className="mb-4 flex flex-wrap gap-2">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                tab === t.id ? "bg-emerald-500/20 text-emerald-300" : "bg-slate-800 text-slate-400 hover:text-slate-200"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {loading && tab !== "sync" ? (
          <p className="py-12 text-center text-sm text-slate-400">Yükleniyor…</p>
        ) : null}

        {tab === "scenarios" && !loading ? (
          <section className="space-y-4">
            <button
              type="button"
              className="text-xs text-emerald-400"
              onClick={() =>
                setScenarios((p) => [
                  {
                    id: `new-${Date.now()}`,
                    sort_rank: 0,
                    player_name: "",
                    from_club: "",
                    to_club: "",
                    likelihood: 50,
                    note_tr: "",
                    note_en: "",
                    is_published: true,
                    isNew: true,
                  },
                  ...p,
                ])
              }
            >
              + Senaryo ekle
            </button>
            {scenarios.map((row) => (
              <div key={row.id} className="rounded-xl border border-slate-800/60 bg-slate-900/30 p-4 space-y-2">
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  <input className={inputCls} placeholder="Oyuncu" value={row.player_name} onChange={(e) => setScenarios((p) => p.map((r) => (r.id === row.id ? { ...r, player_name: e.target.value } : r)))} />
                  <input className={inputCls} placeholder="Çıkış" value={row.from_club} onChange={(e) => setScenarios((p) => p.map((r) => (r.id === row.id ? { ...r, from_club: e.target.value } : r)))} />
                  <input className={inputCls} placeholder="Hedef" value={row.to_club} onChange={(e) => setScenarios((p) => p.map((r) => (r.id === row.id ? { ...r, to_club: e.target.value } : r)))} />
                  <input type="number" className={inputCls} placeholder="%" value={row.likelihood} onChange={(e) => setScenarios((p) => p.map((r) => (r.id === row.id ? { ...r, likelihood: Number(e.target.value) } : r)))} />
                </div>
                <textarea className={inputCls} rows={2} placeholder="Not TR" value={row.note_tr} onChange={(e) => setScenarios((p) => p.map((r) => (r.id === row.id ? { ...r, note_tr: e.target.value } : r)))} />
                <textarea className={inputCls} rows={2} placeholder="Note EN" value={row.note_en} onChange={(e) => setScenarios((p) => p.map((r) => (r.id === row.id ? { ...r, note_en: e.target.value } : r)))} />
                <div className="flex gap-3">
                  <label className="flex items-center gap-2 text-xs text-slate-400">
                    <input type="checkbox" checked={row.is_published} onChange={(e) => setScenarios((p) => p.map((r) => (r.id === row.id ? { ...r, is_published: e.target.checked } : r)))} />
                    Yayında
                  </label>
                  {!row.isNew && !row.id.startsWith("new-") ? (
                    <button type="button" className="text-xs text-rose-400" onClick={() => deleteScenario(row.id)}>
                      Sil
                    </button>
                  ) : null}
                </div>
              </div>
            ))}
            <button type="button" disabled={saving} onClick={saveScenarios} className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50">
              Kaydet
            </button>
          </section>
        ) : null}

        {tab === "completed" && !loading ? (
          <section className="space-y-4">
            <button
              type="button"
              className="text-xs text-emerald-400"
              onClick={() =>
                setCompleted((p) => [
                  {
                    id: `new-${Date.now()}`,
                    player_name: "",
                    from_club: "",
                    to_club: "",
                    fee_tr: "",
                    fee_en: "",
                    transfer_date: new Date().toISOString().slice(0, 7),
                    sort_order: p.length,
                    is_published: true,
                    isNew: true,
                  },
                  ...p,
                ])
              }
            >
              + Transfer ekle
            </button>
            {completed.map((row) => (
              <div key={row.id} className="rounded-xl border border-slate-800/60 bg-slate-900/30 p-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
                <input className={inputCls} placeholder="Oyuncu" value={row.player_name} onChange={(e) => setCompleted((p) => p.map((r) => (r.id === row.id ? { ...r, player_name: e.target.value } : r)))} />
                <input className={inputCls} placeholder="Çıkış" value={row.from_club} onChange={(e) => setCompleted((p) => p.map((r) => (r.id === row.id ? { ...r, from_club: e.target.value } : r)))} />
                <input className={inputCls} placeholder="Varış" value={row.to_club} onChange={(e) => setCompleted((p) => p.map((r) => (r.id === row.id ? { ...r, to_club: e.target.value } : r)))} />
                <input className={inputCls} placeholder="Ücret TR" value={row.fee_tr} onChange={(e) => setCompleted((p) => p.map((r) => (r.id === row.id ? { ...r, fee_tr: e.target.value } : r)))} />
                <input className={inputCls} placeholder="Fee EN" value={row.fee_en} onChange={(e) => setCompleted((p) => p.map((r) => (r.id === row.id ? { ...r, fee_en: e.target.value } : r)))} />
                <input className={inputCls} placeholder="Tarih YYYY-MM" value={row.transfer_date} onChange={(e) => setCompleted((p) => p.map((r) => (r.id === row.id ? { ...r, transfer_date: e.target.value } : r)))} />
                <div className="col-span-full flex gap-3">
                  <label className="flex items-center gap-2 text-xs text-slate-400">
                    <input type="checkbox" checked={row.is_published} onChange={(e) => setCompleted((p) => p.map((r) => (r.id === row.id ? { ...r, is_published: e.target.checked } : r)))} />
                    Yayında
                  </label>
                  {!row.isNew && !row.id.startsWith("new-") ? (
                    <button type="button" className="text-xs text-rose-400" onClick={() => deleteCompleted(row.id)}>
                      Sil
                    </button>
                  ) : null}
                </div>
              </div>
            ))}
            <button type="button" disabled={saving} onClick={saveCompleted} className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50">
              Kaydet
            </button>
          </section>
        ) : null}

        {tab === "copy" ? (
          <section className="space-y-4 rounded-xl border border-slate-800/60 bg-slate-900/30 p-5">
            <div className="flex flex-wrap gap-3">
              <select className={inputCls} value={copyHub} onChange={(e) => setCopyHub(e.target.value as HubId)}>
                <option value="transfer">Transfer</option>
                <option value="wc-2026">DK 2026</option>
              </select>
              <select className={inputCls} value={copyLocale} onChange={(e) => setCopyLocale(e.target.value as "tr" | "en")}>
                <option value="tr">Türkçe</option>
                <option value="en">English</option>
              </select>
            </div>
            {(["navLabel", "pillarEyebrow", "pillarTitle", "pillarDescription"] as const).map((field) => (
              <div key={field}>
                <label className={labelCls}>{field}</label>
                {field === "pillarDescription" ? (
                  <textarea className={inputCls} rows={3} value={copy[field] ?? ""} onChange={(e) => setCopy((c) => ({ ...c, [field]: e.target.value }))} />
                ) : (
                  <input className={inputCls} value={copy[field] ?? ""} onChange={(e) => setCopy((c) => ({ ...c, [field]: e.target.value }))} />
                )}
              </div>
            ))}
            <button type="button" disabled={saving} onClick={saveCopy} className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50">
              Metinleri kaydet
            </button>
          </section>
        ) : null}

        {tab === "sync" ? (
          <section className="space-y-4 rounded-xl border border-slate-800/60 bg-slate-900/30 p-5 text-sm text-slate-300">
            <p>
              <strong className="text-slate-100">FOOTBALL_DATA_API_KEY</strong> — hazırlık / uluslararası maçlar ve takvim
              <br />
              <strong className="text-slate-100">API_FOOTBALL_KEY</strong> — gerçekleşen transferler (api-sports.io ücretsiz plan)
            </p>
            <button type="button" disabled={saving} onClick={runPublicSync} className="rounded-lg bg-emerald-600 px-4 py-2 text-sm text-white disabled:opacity-50">
              API&apos;den yenile
            </button>
            <p className="text-xs text-slate-500">Otomatik senkron: GET /api/cron/hub-sync (CRON_SECRET ile)</p>
          </section>
        ) : null}
      </div>
    </AdminLayout>
  );
}
