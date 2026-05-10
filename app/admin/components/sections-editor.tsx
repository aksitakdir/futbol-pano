"use client";

import React, { useState } from "react";

/* ─── Types ──────────────────────────────────────────────────────── */
export type SectionBlock =
  | { type: "intro";     html: string }
  | { type: "section";   heading: string; html: string }
  | { type: "pullquote"; text: string }
  | { type: "callout";   html: string };

type Props = {
  value: SectionBlock[];
  onChange: (blocks: SectionBlock[]) => void;
};

/* ─── Block type meta ────────────────────────────────────────────── */
const BLOCK_TYPES: { type: SectionBlock["type"]; label: string; icon: string; desc: string; color: string }[] = [
  { type: "intro",     label: "Giriş Paragrafı", icon: "¶",  desc: "Büyük açılış metni (lead)", color: "emerald" },
  { type: "section",   label: "Bölüm",           icon: "§",  desc: "Başlık + içerik",           color: "sky" },
  { type: "pullquote", label: "Spot Alıntı",      icon: "❝",  desc: "İtalik alıntı kutusu",     color: "amber" },
  { type: "callout",   label: "Callout Kutusu",   icon: "◈",  desc: "Taktik not / bilgi kutusu", color: "rose" },
];

const COLOR_MAP: Record<string, string> = {
  emerald: "border-emerald-500/30 bg-emerald-500/5 text-emerald-300",
  sky:     "border-sky-500/30 bg-sky-500/5 text-sky-300",
  amber:   "border-amber-500/30 bg-amber-500/5 text-amber-300",
  rose:    "border-rose-500/30 bg-rose-500/5 text-rose-300",
};

function blockMeta(type: SectionBlock["type"]) {
  return BLOCK_TYPES.find((b) => b.type === type)!;
}

function defaultBlock(type: SectionBlock["type"]): SectionBlock {
  if (type === "intro")     return { type, html: "" };
  if (type === "section")   return { type, heading: "", html: "" };
  if (type === "pullquote") return { type, text: "" };
  return { type: "callout", html: "" };
}

/* ─── Single block editor ────────────────────────────────────────── */
function BlockEditor({
  block, index, total,
  onChange, onDelete, onMoveUp, onMoveDown,
}: {
  block: SectionBlock; index: number; total: number;
  onChange: (b: SectionBlock) => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}) {
  const [open, setOpen] = useState(true);
  const meta = blockMeta(block.type);
  const colorClass = COLOR_MAP[meta.color] ?? COLOR_MAP.sky;

  return (
    <div className={`rounded-xl border ${colorClass.split(" ")[0]} bg-slate-900/60 overflow-hidden`}>
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-2.5">
        <span className={`text-lg leading-none ${colorClass.split(" ")[2]}`}>{meta.icon}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className={`text-[10px] font-bold uppercase tracking-[0.16em] ${colorClass.split(" ")[2]}`}>
              {String(index + 1).padStart(2, "0")} · {meta.label}
            </span>
            <span className="text-[10px] text-slate-500">{meta.desc}</span>
          </div>
          {block.type === "section" && block.heading && (
            <p className="text-[11px] text-slate-300 truncate mt-0.5">{block.heading}</p>
          )}
          {block.type === "pullquote" && block.text && (
            <p className="text-[11px] text-slate-400 italic truncate mt-0.5">❝ {block.text.slice(0, 60)}{block.text.length > 60 ? "…" : ""}</p>
          )}
        </div>
        <div className="flex items-center gap-1 ml-auto">
          <button type="button" onClick={onMoveUp} disabled={index === 0}
            className="rounded px-1.5 py-1 text-slate-500 hover:text-slate-200 disabled:opacity-20 text-xs transition">↑</button>
          <button type="button" onClick={onMoveDown} disabled={index === total - 1}
            className="rounded px-1.5 py-1 text-slate-500 hover:text-slate-200 disabled:opacity-20 text-xs transition">↓</button>
          <button type="button" onClick={() => setOpen((v) => !v)}
            className="rounded px-2 py-1 text-slate-500 hover:text-slate-200 text-xs transition">
            {open ? "▲" : "▼"}
          </button>
          <button type="button" onClick={onDelete}
            className="rounded px-2 py-1 text-rose-500 hover:text-rose-300 text-xs transition">✕</button>
        </div>
      </div>

      {/* Body */}
      {open && (
        <div className="border-t border-slate-800/60 px-4 py-3 space-y-3">
          {block.type === "section" && (
            <div>
              <label className="mb-1 block text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Başlık (H2)</label>
              <input
                type="text"
                value={block.heading}
                onChange={(e) => onChange({ ...block, heading: e.target.value })}
                placeholder="Bölüm başlığı..."
                className="w-full rounded-lg border border-slate-700/80 bg-slate-800/70 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 outline-none focus:border-sky-500/60"
              />
            </div>
          )}

          {(block.type === "intro" || block.type === "section" || block.type === "callout") && (
            <div>
              <label className="mb-1 block text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                {block.type === "intro" ? "Giriş metni" : block.type === "callout" ? "Kutu içeriği" : "Bölüm metni"}
              </label>
              <HtmlTextArea
                value={block.html}
                onChange={(html) => onChange({ ...block, html })}
                placeholder={
                  block.type === "intro"
                    ? "Açılış paragrafı... (büyük giriş metni olarak görünür)"
                    : block.type === "callout"
                    ? "Taktik notu, önemli istatistik veya öne çıkan bilgi..."
                    : "Bölüm içeriği... Birden fazla paragraf yazabilirsin."
                }
              />
            </div>
          )}

          {block.type === "pullquote" && (
            <div>
              <label className="mb-1 block text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Alıntı metni</label>
              <textarea
                value={block.text}
                onChange={(e) => onChange({ ...block, text: e.target.value })}
                placeholder="Güçlü, tek cümlelik alıntı — italik kutu olarak görünür..."
                rows={3}
                className="w-full rounded-lg border border-amber-700/40 bg-slate-800/70 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 outline-none resize-y focus:border-amber-500/60"
              />
              <p className="mt-1 text-[10px] text-slate-500">Tek, etkileyici cümle kullan. Sol kenarda accent çizgisi ile görünür.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ─── Simple HTML textarea with format helpers ───────────────────── */
function HtmlTextArea({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  const [mode, setMode] = useState<"plain" | "html">("plain");

  function wrapSelection(ref: React.RefObject<HTMLTextAreaElement | null>, open: string, close: string) {
    const el = ref.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const selected = value.slice(start, end);
    const newVal = value.slice(0, start) + open + selected + close + value.slice(end);
    onChange(newVal);
    setTimeout(() => {
      el.focus();
      el.setSelectionRange(start + open.length, end + open.length);
    }, 0);
  }

  const ref = React.useRef<HTMLTextAreaElement>(null);

  // Convert plain text to paragraphed HTML
  function plainToHtml(plain: string): string {
    return plain.split(/\n\n+/).filter(Boolean)
      .map((para) => `<p>${para.trim().replace(/\n/g, " ")}</p>`)
      .join("\n");
  }

  // Strip HTML for plain text view
  function htmlToPlain(html: string): string {
    return html
      .replace(/<\/p>\s*<p[^>]*>/gi, "\n\n")
      .replace(/<\/li>\s*<li[^>]*>/gi, "\n")
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<[^>]+>/g, "")
      .trim();
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-1.5">
        <div className="flex gap-1">
          <button type="button" onClick={() => setMode("plain")}
            className={`px-2 py-0.5 text-[10px] font-semibold rounded ${mode === "plain" ? "bg-slate-700 text-slate-100" : "text-slate-500 hover:text-slate-300"}`}>
            Düz Metin
          </button>
          <button type="button" onClick={() => setMode("html")}
            className={`px-2 py-0.5 text-[10px] font-semibold rounded ${mode === "html" ? "bg-slate-700 text-slate-100" : "text-slate-500 hover:text-slate-300"}`}>
            HTML
          </button>
        </div>
        {mode === "html" && (
          <div className="flex gap-1 ml-auto">
            {[
              { label: "B", open: "<strong>", close: "</strong>" },
              { label: "I", open: "<em>", close: "</em>" },
              { label: "HL", open: "<mark>", close: "</mark>", title: "Highlight" },
              { label: "Li", open: "<ul>\n  <li>", close: "</li>\n</ul>", title: "Liste" },
            ].map((btn) => (
              <button key={btn.label} type="button" title={btn.title}
                onClick={() => wrapSelection(ref, btn.open, btn.close)}
                className="px-2 py-0.5 text-[10px] font-bold rounded border border-slate-700 text-slate-400 hover:text-slate-100 hover:border-slate-500 transition">
                {btn.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {mode === "plain" ? (
        <div>
          <textarea
            value={htmlToPlain(value)}
            onChange={(e) => {
              const plain = e.target.value;
              // Convert on the fly only if it looks like plain text
              const html = plain.split(/\n\n+/).filter(Boolean)
                .map((p) => `<p>${p.trim().replace(/\n/g, " ")}</p>`)
                .join("\n");
              onChange(html);
            }}
            placeholder={placeholder}
            rows={6}
            className="w-full rounded-lg border border-slate-700/80 bg-slate-800/70 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 outline-none resize-y focus:border-slate-600"
          />
          <p className="mt-1 text-[10px] text-slate-500">Boş satır bırakarak paragraf ayır. HTML formatı için ↗ HTML sekmesi.</p>
        </div>
      ) : (
        <textarea
          ref={ref}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="<p>Paragraf...</p>"
          rows={8}
          className="w-full rounded-lg border border-slate-700/80 bg-slate-800/70 px-3 py-2 font-mono text-xs text-slate-100 placeholder-slate-500 outline-none resize-y focus:border-slate-600"
        />
      )}
    </div>
  );
}

/* ─── Main SectionsEditor component ──────────────────────────────── */
export default function SectionsEditor({ value, onChange }: Props) {
  const [addOpen, setAddOpen] = useState(false);

  function addBlock(type: SectionBlock["type"]) {
    onChange([...value, defaultBlock(type)]);
    setAddOpen(false);
  }

  function updateBlock(index: number, block: SectionBlock) {
    const next = [...value];
    next[index] = block;
    onChange(next);
  }

  function deleteBlock(index: number) {
    onChange(value.filter((_, i) => i !== index));
  }

  function moveBlock(index: number, dir: -1 | 1) {
    const next = [...value];
    const target = index + dir;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  }

  return (
    <div className="space-y-3">
      {/* Block type legend */}
      <div className="flex flex-wrap gap-2 mb-1">
        {BLOCK_TYPES.map((bt) => (
          <div key={bt.type} className={`flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 ${COLOR_MAP[bt.color]?.split(" ")[0]} ${COLOR_MAP[bt.color]?.split(" ")[1]}`}>
            <span className={`text-sm ${COLOR_MAP[bt.color]?.split(" ")[2]}`}>{bt.icon}</span>
            <span className={`text-[10px] font-semibold ${COLOR_MAP[bt.color]?.split(" ")[2]}`}>{bt.label}</span>
          </div>
        ))}
      </div>

      {/* Blocks */}
      {value.length === 0 && (
        <div className="rounded-xl border border-dashed border-slate-700 py-10 text-center">
          <p className="text-sm text-slate-500">Henüz blok yok — aşağıdan ekle</p>
          <p className="text-[11px] text-slate-600 mt-1">Giriş paragrafı ile başla</p>
        </div>
      )}

      {value.map((block, i) => (
        <BlockEditor
          key={i}
          block={block}
          index={i}
          total={value.length}
          onChange={(b) => updateBlock(i, b)}
          onDelete={() => deleteBlock(i)}
          onMoveUp={() => moveBlock(i, -1)}
          onMoveDown={() => moveBlock(i, 1)}
        />
      ))}

      {/* Add block */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setAddOpen((v) => !v)}
          className="w-full rounded-xl border border-dashed border-slate-700 py-2.5 text-xs font-semibold text-slate-500 hover:border-emerald-500/40 hover:text-emerald-400 transition"
        >
          + Blok Ekle
        </button>

        {addOpen && (
          <div className="absolute left-0 right-0 z-20 mt-1 overflow-hidden rounded-xl border border-slate-700 bg-slate-900 shadow-2xl">
            {BLOCK_TYPES.map((bt) => (
              <button
                key={bt.type}
                type="button"
                onClick={() => addBlock(bt.type)}
                className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm transition hover:bg-slate-800/80"
              >
                <span className={`text-lg leading-none ${COLOR_MAP[bt.color]?.split(" ")[2]}`}>{bt.icon}</span>
                <div>
                  <div className="font-semibold text-slate-100">{bt.label}</div>
                  <div className="text-[11px] text-slate-500">{bt.desc}</div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {value.length > 0 && (
        <p className="text-[10px] text-slate-600 text-center">
          {value.length} blok · Kaydet butonuna basınca sections_json olarak yazılır
        </p>
      )}
    </div>
  );
}
