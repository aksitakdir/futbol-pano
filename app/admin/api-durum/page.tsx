"use client";

import { useState, useCallback } from "react";
import AdminLayout from "../components/admin-layout";
import { supabase } from "@/lib/supabase";

type ApiStatus = {
  name: string;
  status: "checking" | "active" | "error" | "idle";
  message: string;
  details?: string;
  lastChecked?: string;
};

const INITIAL: ApiStatus[] = [
  { name: "API-Football", status: "idle", message: "Henüz kontrol edilmedi" },
  { name: "YouTube API", status: "idle", message: "Henüz kontrol edilmedi" },
  { name: "Supabase", status: "idle", message: "Henüz kontrol edilmedi" },
  { name: "Google News RSS", status: "idle", message: "Henüz kontrol edilmedi" },
];

const STATUS_STYLE: Record<string, { dot: string; text: string; label: string }> = {
  active: { dot: "bg-emerald-400", text: "text-emerald-300", label: "Aktif" },
  error: { dot: "bg-rose-400", text: "text-rose-300", label: "Hata" },
  checking: { dot: "bg-amber-400 animate-pulse", text: "text-amber-300", label: "Kontrol ediliyor..." },
  idle: { dot: "bg-slate-500", text: "text-slate-400", label: "Bekleniyor" },
};

export default function ApiDurumPage() {
  const [apis, setApis] = useState<ApiStatus[]>(INITIAL);

  const updateApi = useCallback((name: string, update: Partial<ApiStatus>) => {
    setApis((prev) => prev.map((a) => (a.name === name ? { ...a, ...update } : a)));
  }, []);

  async function checkFootball() {
    updateApi("API-Football", { status: "checking", message: "Kontrol ediliyor..." });
    try {
      const res = await fetch("/api/players");
      const data = await res.json();
      if (res.ok && data.players) {
        updateApi("API-Football", {
          status: "active",
          message: `${data.count} oyuncu başarıyla çekildi`,
          details: `Lig: ${data.league} · Sezon: ${data.season} · Günlük limit: 100 istek`,
          lastChecked: new Date().toLocaleTimeString("tr-TR"),
        });
      } else {
        updateApi("API-Football", {
          status: "error",
          message: data.error || "Bağlantı hatası",
          details: data.details,
          lastChecked: new Date().toLocaleTimeString("tr-TR"),
        });
      }
    } catch {
      updateApi("API-Football", {
        status: "error",
        message: "Ağ hatası — sunucuya ulaşılamadı",
        lastChecked: new Date().toLocaleTimeString("tr-TR"),
      });
    }
  }

  async function checkYouTube() {
    updateApi("YouTube API", { status: "checking", message: "Kontrol ediliyor..." });
    try {
      const res = await fetch("/api/youtube?query=football+highlights");
      const data = await res.json();
      if (res.ok && Array.isArray(data) && data.length > 0) {
        updateApi("YouTube API", {
          status: "active",
          message: `Test sorgusu başarılı — ${data.length} video döndü`,
          details: "Günlük kota: 10.000 birim",
          lastChecked: new Date().toLocaleTimeString("tr-TR"),
        });
      } else {
        updateApi("YouTube API", {
          status: "error",
          message: data.error || "Video bulunamadı veya hata oluştu",
          details: data.details,
          lastChecked: new Date().toLocaleTimeString("tr-TR"),
        });
      }
    } catch {
      updateApi("YouTube API", {
        status: "error",
        message: "Ağ hatası",
        lastChecked: new Date().toLocaleTimeString("tr-TR"),
      });
    }
  }

  async function checkSupabase() {
    updateApi("Supabase", { status: "checking", message: "Kontrol ediliyor..." });
    try {
      const { count, error } = await supabase
        .from("contents")
        .select("*", { count: "exact", head: true });
      if (error) {
        updateApi("Supabase", {
          status: "error",
          message: error.message,
          lastChecked: new Date().toLocaleTimeString("tr-TR"),
        });
      } else {
        updateApi("Supabase", {
          status: "active",
          message: `Bağlantı başarılı — ${count ?? 0} kayıt mevcut`,
          details: "contents tablosu erişilebilir",
          lastChecked: new Date().toLocaleTimeString("tr-TR"),
        });
      }
    } catch {
      updateApi("Supabase", {
        status: "error",
        message: "Bağlantı kurulamadı",
        lastChecked: new Date().toLocaleTimeString("tr-TR"),
      });
    }
  }

  async function checkNews() {
    updateApi("Google News RSS", { status: "checking", message: "Kontrol ediliyor..." });
    try {
      const res = await fetch("/api/news?query=football");
      const data = await res.json();
      if (res.ok && Array.isArray(data) && data.length > 0) {
        updateApi("Google News RSS", {
          status: "active",
          message: `Test sorgusu başarılı — ${data.length} haber döndü`,
          details: "RSS feed erişilebilir",
          lastChecked: new Date().toLocaleTimeString("tr-TR"),
        });
      } else {
        updateApi("Google News RSS", {
          status: "error",
          message: data.error || "Haber bulunamadı",
          lastChecked: new Date().toLocaleTimeString("tr-TR"),
        });
      }
    } catch {
      updateApi("Google News RSS", {
        status: "error",
        message: "Ağ hatası",
        lastChecked: new Date().toLocaleTimeString("tr-TR"),
      });
    }
  }

  const checkers: Record<string, () => Promise<void>> = {
    "API-Football": checkFootball,
    "YouTube API": checkYouTube,
    Supabase: checkSupabase,
    "Google News RSS": checkNews,
  };

  async function checkAll() {
    await Promise.allSettled([checkFootball(), checkYouTube(), checkSupabase(), checkNews()]);
  }

  return (
    <AdminLayout>
      <div className="mx-auto max-w-3xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">API Durumu</h1>
            <p className="text-xs text-slate-400">Dış servislerin bağlantı durumlarını kontrol et</p>
          </div>
          <button
            onClick={checkAll}
            className="rounded-lg bg-emerald-500 px-4 py-2 text-xs font-semibold text-slate-950 transition hover:bg-emerald-400"
          >
            Tümünü Kontrol Et
          </button>
        </div>

        <div className="space-y-3">
          {apis.map((api) => {
            const s = STATUS_STYLE[api.status];
            return (
              <div
                key={api.name}
                className="rounded-xl border border-slate-800/60 bg-slate-900/30 p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2.5">
                      <span className={`h-2.5 w-2.5 rounded-full ${s.dot}`} />
                      <h3 className="text-sm font-semibold">{api.name}</h3>
                      <span className={`text-[11px] font-medium ${s.text}`}>{s.label}</span>
                    </div>
                    <p className="mt-1.5 text-xs text-slate-400">{api.message}</p>
                    {api.details && (
                      <p className="mt-1 text-[11px] text-slate-500">{api.details}</p>
                    )}
                    {api.lastChecked && (
                      <p className="mt-1 text-[10px] text-slate-600">
                        Son kontrol: {api.lastChecked}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => checkers[api.name]?.()}
                    disabled={api.status === "checking"}
                    className="shrink-0 rounded-lg border border-slate-700/60 px-3 py-1.5 text-[11px] font-medium text-slate-400 transition hover:border-slate-600 hover:text-slate-200 disabled:opacity-50"
                  >
                    {api.status === "checking" ? (
                      <span className="flex items-center gap-1.5">
                        <span className="h-3 w-3 animate-spin rounded-full border-2 border-amber-400 border-t-transparent" />
                        Kontrol
                      </span>
                    ) : (
                      "Manuel Yenile"
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 rounded-xl border border-slate-800/60 bg-slate-900/30 p-5">
          <h3 className="mb-3 text-sm font-semibold">API Limitleri Özeti</h3>
          <div className="space-y-2 text-xs text-slate-400">
            <div className="flex items-center justify-between">
              <span>API-Football</span>
              <span className="text-slate-500">100 istek/gün (ücretsiz plan)</span>
            </div>
            <div className="flex items-center justify-between">
              <span>YouTube Data API v3</span>
              <span className="text-slate-500">10.000 birim/gün</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Supabase</span>
              <span className="text-slate-500">Limitsiz (ücretsiz plan bant genişliği dahilinde)</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Google News RSS</span>
              <span className="text-slate-500">Limitsiz (publik RSS feed)</span>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
