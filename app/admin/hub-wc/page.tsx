"use client";

import { useEffect, useState } from "react";
import AdminLayout from "../components/admin-layout";
import HubArticlesPanel from "../components/hub-articles-panel";
import { supabase } from "@/lib/supabase";
import { HUBS } from "@/lib/hub-config";
import type { HubPillarCopy } from "@/lib/hub-types";

type Tab = "articles" | "copy";

const labelCls = "mb-1 block text-[11px] font-medium text-slate-400";
const inputCls =
  "w-full rounded-lg border border-slate-700/80 bg-slate-800/70 px-3 py-2 text-sm text-slate-100 placeholder-slate-600 outline-none transition focus:border-emerald-500/60";

export default function AdminWcHubPage() {
  const [tab, setTab] = useState<Tab>("articles");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [copy, setCopy] = useState<HubPillarCopy>({});

  const defaults = HUBS["wc-2026"].en;

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("site_settings")
        .select("value")
        .eq("key", "hub_copy_wc-2026_en")
        .maybeSingle();
      const v = (data?.value ?? {}) as HubPillarCopy;
      setCopy({
        navLabel: v.navLabel ?? defaults.navLabel,
        pillarEyebrow: v.pillarEyebrow ?? defaults.pillarEyebrow,
        pillarTitle: v.pillarTitle ?? defaults.pillarTitle,
        pillarDescription: v.pillarDescription ?? defaults.pillarDescription,
      });
    })();
  }, [defaults.navLabel, defaults.pillarDescription, defaults.pillarEyebrow, defaults.pillarTitle]);

  async function saveCopy() {
    setSaving(true);
    const { error } = await supabase.from("site_settings").upsert(
      { key: "hub_copy_wc-2026_en", value: copy, updated_at: new Date().toISOString() },
      { onConflict: "key" },
    );
    setMessage(error ? `Error: ${error.message}` : "Page copy saved.");
    setSaving(false);
    setTimeout(() => setMessage(""), 3000);
  }

  const TABS: { id: Tab; label: string }[] = [
    { id: "articles", label: "Articles" },
    { id: "copy", label: "Page copy" },
  ];

  return (
    <AdminLayout>
      <div className="mx-auto max-w-4xl">
        <div className="mb-6">
          <h1 className="text-xl font-bold">World Cup 2026 Hub</h1>
          <p className="text-xs text-slate-400">
            Scout articles for {defaults.basePath} · squads managed under WC Squads
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

        {tab === "articles" ? <HubArticlesPanel hubId="wc-2026" /> : null}

        {tab === "copy" ? (
          <section className="space-y-4 rounded-xl border border-slate-800/60 bg-slate-900/30 p-5">
            {(["navLabel", "pillarEyebrow", "pillarTitle", "pillarDescription"] as const).map((field) => (
              <div key={field}>
                <label className={labelCls}>{field}</label>
                {field === "pillarDescription" ? (
                  <textarea
                    className={inputCls}
                    rows={3}
                    value={copy[field] ?? ""}
                    onChange={(e) => setCopy((c) => ({ ...c, [field]: e.target.value }))}
                  />
                ) : (
                  <input
                    className={inputCls}
                    value={copy[field] ?? ""}
                    onChange={(e) => setCopy((c) => ({ ...c, [field]: e.target.value }))}
                  />
                )}
              </div>
            ))}
            <button
              type="button"
              disabled={saving}
              onClick={saveCopy}
              className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
            >
              Save copy
            </button>
          </section>
        ) : null}
      </div>
    </AdminLayout>
  );
}
