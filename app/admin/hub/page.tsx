"use client";

import { useCallback, useEffect, useState } from "react";
import AdminLayout from "../components/admin-layout";
import HubArticlesPanel from "../components/hub-articles-panel";
import { supabase } from "@/lib/supabase";
import { HUBS, type HubId } from "@/lib/hub-config";
import type { HubPillarCopy } from "@/lib/hub-types";
import { adminSyncTransferWire } from "./transfer-wire-actions";

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

type Tab = "articles" | "completed" | "copy" | "sync";

const labelCls = "mb-1 block text-[11px] font-medium text-slate-400";
const inputCls =
  "w-full rounded-lg border border-slate-700/80 bg-slate-800/70 px-3 py-2 text-sm text-slate-100 placeholder-slate-600 outline-none transition focus:border-emerald-500/60";

function settingsKey(hubId: HubId) {
  return `hub_copy_${hubId}_en`;
}

export default function AdminHubPage() {
  const [tab, setTab] = useState<Tab>("articles");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const [completed, setCompleted] = useState<CompletedRow[]>([]);
  const [wireUpdated, setWireUpdated] = useState<string | null>(null);
  const [wireCount, setWireCount] = useState<number | null>(null);

  const [copyHub, setCopyHub] = useState<HubId>("transfer");
  const [copy, setCopy] = useState<HubPillarCopy>({});

  const fetchCompleted = useCallback(async () => {
    setLoading(true);
    const { data: co } = await supabase
      .from("hub_completed_transfers")
      .select("*")
      .order("sort_order", { ascending: false });
    setCompleted((co ?? []) as CompletedRow[]);
    setLoading(false);
  }, []);

  const fetchWireStatus = useCallback(async () => {
    const { data } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", "transfer_wire_cache")
      .maybeSingle();
    const v = data?.value as { updatedAt?: string; headlines?: unknown[] } | null;
    setWireUpdated(v?.updatedAt ?? null);
    setWireCount(Array.isArray(v?.headlines) ? v.headlines.length : null);
  }, []);

  useEffect(() => {
    fetchCompleted();
    fetchWireStatus();
  }, [fetchCompleted, fetchWireStatus]);

  useEffect(() => {
    const defaults = HUBS[copyHub].en;
    (async () => {
      const { data } = await supabase
        .from("site_settings")
        .select("value")
        .eq("key", settingsKey(copyHub))
        .maybeSingle();
      const v = (data?.value ?? {}) as HubPillarCopy;
      setCopy({
        navLabel: v.navLabel ?? defaults.navLabel,
        pillarEyebrow: v.pillarEyebrow ?? defaults.pillarEyebrow,
        pillarTitle: v.pillarTitle ?? defaults.pillarTitle,
        pillarDescription: v.pillarDescription ?? defaults.pillarDescription,
      });
    })();
  }, [copyHub]);

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
    setMessage("Confirmed deals saved.");
    await fetchCompleted();
    setSaving(false);
    setTimeout(() => setMessage(""), 3000);
  }

  async function saveCopy() {
    setSaving(true);
    const { error } = await supabase.from("site_settings").upsert(
      { key: settingsKey(copyHub), value: copy, updated_at: new Date().toISOString() },
      { onConflict: "key" },
    );
    setMessage(error ? `Error: ${error.message}` : "Page copy saved.");
    setSaving(false);
    setTimeout(() => setMessage(""), 3000);
  }

  async function refreshTransferWire() {
    setSaving(true);
    setMessage("");
    try {
      const d = await adminSyncTransferWire();
      if (d.skipped) {
        setMessage(`Sync skipped (cooldown). Cache has ${d.count} headlines.`);
      } else if (d.ok && d.count > 0) {
        setMessage(`Transfer Wire synced — ${d.count} headlines.`);
      } else {
        setMessage(d.error ?? "Wire sync completed but no headlines returned.");
      }
      await fetchWireStatus();
    } catch {
      setMessage("Transfer Wire sync failed.");
    }
    setSaving(false);
    setTimeout(() => setMessage(""), 4000);
  }

  async function deleteCompleted(id: string) {
    if (!confirm("Delete this deal?")) return;
    await supabase.from("hub_completed_transfers").delete().eq("id", id);
    fetchCompleted();
  }

  const TABS: { id: Tab; label: string }[] = [
    { id: "articles", label: "Articles" },
    { id: "sync", label: "Transfer Wire" },
    { id: "completed", label: "Confirmed deals" },
    { id: "copy", label: "Page copy" },
  ];

  return (
    <AdminLayout>
      <div className="mx-auto max-w-4xl">
        <div className="mb-6">
          <h1 className="text-xl font-bold">Transfers Hub</h1>
          <p className="text-xs text-slate-400">
            Scout articles, Transfer Wire RSS, and confirmed deals for {HUBS.transfer.en.basePath}
          </p>
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

        {tab === "articles" ? <HubArticlesPanel hubId="transfer" /> : null}

        {loading && tab === "completed" ? (
          <p className="py-12 text-center text-sm text-slate-400">Loading…</p>
        ) : null}

        {tab === "completed" && !loading ? (
          <section className="space-y-4">
            <p className="text-xs text-slate-500">
              Shown under <strong className="text-slate-300">CONFIRMED DEALS</strong> on /transfers. Scout
              analysis articles are managed under the Articles tab.
            </p>
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
              + Add deal
            </button>
            {completed.map((row) => (
              <div key={row.id} className="rounded-xl border border-slate-800/60 bg-slate-900/30 p-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
                <input className={inputCls} placeholder="Player" value={row.player_name} onChange={(e) => setCompleted((p) => p.map((r) => (r.id === row.id ? { ...r, player_name: e.target.value } : r)))} />
                <input className={inputCls} placeholder="From" value={row.from_club} onChange={(e) => setCompleted((p) => p.map((r) => (r.id === row.id ? { ...r, from_club: e.target.value } : r)))} />
                <input className={inputCls} placeholder="To" value={row.to_club} onChange={(e) => setCompleted((p) => p.map((r) => (r.id === row.id ? { ...r, to_club: e.target.value } : r)))} />
                <input className={inputCls} placeholder="Fee" value={row.fee_en} onChange={(e) => setCompleted((p) => p.map((r) => (r.id === row.id ? { ...r, fee_en: e.target.value, fee_tr: e.target.value } : r)))} />
                <input className={inputCls} placeholder="Date YYYY-MM" value={row.transfer_date} onChange={(e) => setCompleted((p) => p.map((r) => (r.id === row.id ? { ...r, transfer_date: e.target.value } : r)))} />
                <div className="col-span-full flex gap-3">
                  <label className="flex items-center gap-2 text-xs text-slate-400">
                    <input type="checkbox" checked={row.is_published} onChange={(e) => setCompleted((p) => p.map((r) => (r.id === row.id ? { ...r, is_published: e.target.checked } : r)))} />
                    Published
                  </label>
                  {!row.isNew && !row.id.startsWith("new-") ? (
                    <button type="button" className="text-xs text-rose-400" onClick={() => deleteCompleted(row.id)}>
                      Delete
                    </button>
                  ) : null}
                </div>
              </div>
            ))}
            <button type="button" disabled={saving} onClick={saveCompleted} className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50">
              Save deals
            </button>
          </section>
        ) : null}

        {tab === "copy" ? (
          <section className="space-y-4 rounded-xl border border-slate-800/60 bg-slate-900/30 p-5">
            <div className="flex flex-wrap gap-3">
              <select className={inputCls} value={copyHub} onChange={(e) => setCopyHub(e.target.value as HubId)}>
                <option value="transfer">Transfers</option>
                <option value="wc-2026">WC 2026</option>
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
              Save copy
            </button>
          </section>
        ) : null}

        {tab === "sync" ? (
          <section className="space-y-4 rounded-xl border border-slate-800/60 bg-slate-900/30 p-5 text-sm text-slate-300">
            <p>
              <strong className="text-slate-100">Transfer Wire</strong> pulls headlines from BBC, Sky, Guardian, ESPN and Google News into Supabase cache. Auto-sync daily at 06:00 UTC (Vercel cron). Use the button below after deploy or when the feed looks empty.
            </p>
            <p className="text-xs text-slate-500">
              Last cache: {wireUpdated ? new Date(wireUpdated).toLocaleString("en-US") : "never"} ·{" "}
              {wireCount != null ? `${wireCount} headlines` : "—"}
            </p>
            <button type="button" disabled={saving} onClick={refreshTransferWire} className="rounded-lg bg-emerald-600 px-4 py-2 text-sm text-white disabled:opacity-50">
              Refresh Transfer Wire now
            </button>
            <p className="text-xs text-slate-500 border-t border-slate-800 pt-4 mt-4">
              Cron: <code className="text-slate-400">GET /api/cron/transfer-wire</code> daily 06:00 UTC (Vercel Hobby — see vercel.json).
            </p>
          </section>
        ) : null}
      </div>
    </AdminLayout>
  );
}
