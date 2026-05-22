"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { HUBS, type HubId } from "@/lib/hub-config";
import { EDITORIAL_CATEGORIES, newArticlePath, type EditorialCategory } from "@/lib/article-destination";

type ArticleRow = {
  id: string;
  title: string;
  title_en?: string;
  slug: string;
  category: string;
  status: string;
  created_at: string;
};

const STATUS: Record<string, string> = {
  bekliyor: "Pending",
  yayinda: "Published",
  reddedildi: "Rejected",
};

const CAT_LABEL: Record<string, string> = {
  listeler: "Lists",
  radar: "Radar",
  "taktik-lab": "Tactics Lab",
};

export default function HubArticlesPanel({ hubId }: { hubId: HubId }) {
  const [rows, setRows] = useState<ArticleRow[]>([]);
  const [loading, setLoading] = useState(true);
  const hub = HUBS[hubId];

  const fetchRows = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("contents")
      .select("id,title,title_en,slug,category,status,created_at")
      .contains("hub_tags", [hub.tag])
      .order("created_at", { ascending: false })
      .limit(100);
    setRows((data as ArticleRow[]) ?? []);
    setLoading(false);
  }, [hub.tag]);

  useEffect(() => {
    fetchRows();
  }, [fetchRows]);

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <p className="max-w-xl text-xs text-slate-500">
          Scout articles tagged for <strong className="text-slate-300">{hub.en.pillarTitle}</strong> (
          <span className="font-mono text-emerald-400/90">{hub.tag}</span>). They also live at their
          normal category URL (e.g. <span className="font-mono text-slate-400">/radar/slug</span>).
        </p>
        <div className="flex flex-wrap gap-2">
          {EDITORIAL_CATEGORIES.map((cat) => (
            <Link
              key={cat.value}
              href={newArticlePath(hubId, cat.value as EditorialCategory, "blocks")}
              className="rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-semibold text-slate-950 transition hover:bg-emerald-400"
            >
              + {cat.label}
            </Link>
          ))}
        </div>
      </div>

      {loading ? (
        <p className="py-10 text-center text-sm text-slate-400">Loading articles…</p>
      ) : rows.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-700/80 bg-slate-900/20 px-4 py-10 text-center">
          <p className="text-sm text-slate-400">No hub articles yet.</p>
          <Link
            href={newArticlePath(hubId, "radar", "blocks")}
            className="mt-3 inline-block text-xs font-semibold text-emerald-400 hover:underline"
          >
            Add first article →
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-800/60">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-800/60 bg-slate-900/50 text-slate-500">
              <tr>
                <th className="px-4 py-2.5 font-medium">Title</th>
                <th className="px-4 py-2.5 font-medium">Format</th>
                <th className="px-4 py-2.5 font-medium">Status</th>
                <th className="px-4 py-2.5 font-medium">Date</th>
                <th className="px-4 py-2.5 font-medium" />
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-b border-slate-800/40 last:border-0">
                  <td className="px-4 py-3 text-slate-200">{row.title_en || row.title}</td>
                  <td className="px-4 py-3 text-slate-400">{CAT_LABEL[row.category] ?? row.category}</td>
                  <td className="px-4 py-3 text-slate-400">{STATUS[row.status] ?? row.status}</td>
                  <td className="px-4 py-3 text-slate-500">
                    {new Date(row.created_at).toLocaleDateString("en-US")}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/duzenle/${row.id}`}
                      className="font-medium text-emerald-400 hover:underline"
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
