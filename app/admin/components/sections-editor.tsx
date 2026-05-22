"use client";

import React, { useState } from "react";
import type { SectionBlock } from "@/lib/section-blocks";

export type { SectionBlock } from "@/lib/section-blocks";

type Props = {
  value: SectionBlock[];
  onChange: (blocks: SectionBlock[]) => void;
};

const BLOCK_TYPES: { type: SectionBlock["type"]; label: string; icon: string; desc: string; color: string }[] = [
  { type: "intro", label: "Lead Paragraph", icon: "¶", desc: "Large opening text with drop cap", color: "emerald" },
  { type: "plain", label: "Plain Text", icon: "T", desc: "Paragraphs — no HTML required", color: "lime" },
  { type: "header", label: "Header", icon: "H", desc: "Section heading only (H2/H3, appears in TOC)", color: "violet" },
  { type: "section", label: "Section", icon: "§", desc: "Heading + body content", color: "sky" },
  { type: "pullquote", label: "Pull Quote", icon: "❝", desc: "Italic highlight quote", color: "amber" },
  { type: "callout", label: "Callout", icon: "◈", desc: "Tactical note / info box", color: "rose" },
];

const COLOR_MAP: Record<string, string> = {
  emerald: "border-emerald-500/30 bg-emerald-500/5 text-emerald-300",
  lime: "border-lime-500/30 bg-lime-500/5 text-lime-300",
  violet: "border-violet-500/30 bg-violet-500/5 text-violet-300",
  sky: "border-sky-500/30 bg-sky-500/5 text-sky-300",
  amber: "border-amber-500/30 bg-amber-500/5 text-amber-300",
  rose: "border-rose-500/30 bg-rose-500/5 text-rose-300",
};

function blockMeta(type: SectionBlock["type"]) {
  return BLOCK_TYPES.find((b) => b.type === type)!;
}

function defaultBlock(type: SectionBlock["type"]): SectionBlock {
  switch (type) {
    case "intro":
      return { type, html: "" };
    case "plain":
      return { type, text: "" };
    case "header":
      return { type, heading: "", level: 2 };
    case "section":
      return { type, heading: "", html: "" };
    case "pullquote":
      return { type, text: "" };
    case "callout":
      return { type, html: "" };
  }
}

function BlockEditor({
  block,
  index,
  total,
  onChange,
  onDelete,
  onMoveUp,
  onMoveDown,
}: {
  block: SectionBlock;
  index: number;
  total: number;
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
          {block.type === "header" && block.heading && (
            <p className="text-[11px] text-slate-300 truncate mt-0.5">{block.heading}</p>
          )}
          {block.type === "pullquote" && block.text && (
            <p className="text-[11px] text-slate-400 italic truncate mt-0.5">
              ❝ {block.text.slice(0, 60)}
              {block.text.length > 60 ? "…" : ""}
            </p>
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

      {open && (
        <div className="border-t border-slate-800/60 px-4 py-3 space-y-3">
          {(block.type === "section" || block.type === "header") && (
            <div>
              <label className="mb-1 block text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                Heading {block.type === "header" ? "" : "(H2)"}
              </label>
              <input
                type="text"
                value={block.heading}
                onChange={(e) => onChange({ ...block, heading: e.target.value })}
                placeholder="Section title..."
                className="w-full rounded-lg border border-slate-700/80 bg-slate-800/70 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 outline-none focus:border-sky-500/60"
              />
            </div>
          )}

          {block.type === "header" && (
            <div>
              <label className="mb-1 block text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Level</label>
              <div className="flex gap-2">
                {([2, 3] as const).map((level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => onChange({ ...block, level })}
                    className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${
                      (block.level ?? 2) === level
                        ? "border-violet-500/60 bg-violet-500/15 text-violet-200"
                        : "border-slate-700/80 text-slate-500 hover:text-slate-300"
                    }`}
                  >
                    H{level}
                  </button>
                ))}
              </div>
            </div>
          )}

          {block.type === "plain" && (
            <div>
              <label className="mb-1 block text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Text</label>
              <textarea
                value={block.text}
                onChange={(e) => onChange({ ...block, text: e.target.value })}
                placeholder="Write paragraphs here. Separate paragraphs with a blank line."
                rows={6}
                className="w-full rounded-lg border border-slate-700/80 bg-slate-800/70 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 outline-none resize-y focus:border-lime-500/60"
              />
              <p className="mt-1 text-[10px] text-slate-500">Blank line = new paragraph. No HTML needed.</p>
            </div>
          )}

          {(block.type === "intro" || block.type === "section" || block.type === "callout") && (
            <div>
              <label className="mb-1 block text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                {block.type === "intro" ? "Lead text" : block.type === "callout" ? "Callout body" : "Section body"}
              </label>
              <HtmlTextArea
                value={block.html}
                onChange={(html) => onChange({ ...block, html })}
                placeholder={
                  block.type === "intro"
                    ? "Opening paragraph (shown large with drop cap)..."
                    : block.type === "callout"
                    ? "Tactical note, stat highlight, or key info..."
                    : "Section body — multiple paragraphs OK."
                }
              />
            </div>
          )}

          {block.type === "pullquote" && (
            <div>
              <label className="mb-1 block text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Quote</label>
              <textarea
                value={block.text}
                onChange={(e) => onChange({ ...block, text: e.target.value })}
                placeholder="One strong sentence — shown as italic pull quote..."
                rows={3}
                className="w-full rounded-lg border border-amber-700/40 bg-slate-800/70 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 outline-none resize-y focus:border-amber-500/60"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function HtmlTextArea({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  const [mode, setMode] = useState<"plain" | "html">("plain");
  const ref = React.useRef<HTMLTextAreaElement>(null);

  function wrapSelection(open: string, close: string) {
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

  function htmlToPlain(html: string): string {
    return html
      .replace(/<\/p>\s*<p[^>]*>/gi, "\n\n")
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
            Plain text
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
              { label: "HL", open: "<mark>", close: "</mark>" },
            ].map((btn) => (
              <button key={btn.label} type="button"
                onClick={() => wrapSelection(btn.open, btn.close)}
                className="px-2 py-0.5 text-[10px] font-bold rounded border border-slate-700 text-slate-400 hover:text-slate-100 hover:border-slate-500 transition">
                {btn.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {mode === "plain" ? (
        <textarea
          value={htmlToPlain(value)}
          onChange={(e) => {
            const html = e.target.value
              .split(/\n\n+/)
              .filter(Boolean)
              .map((p) => `<p>${p.trim().replace(/\n/g, " ")}</p>`)
              .join("\n");
            onChange(html);
          }}
          placeholder={placeholder}
          rows={6}
          className="w-full rounded-lg border border-slate-700/80 bg-slate-800/70 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 outline-none resize-y focus:border-slate-600"
        />
      ) : (
        <textarea
          ref={ref}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="<p>Paragraph...</p>"
          rows={8}
          className="w-full rounded-lg border border-slate-700/80 bg-slate-800/70 px-3 py-2 font-mono text-xs text-slate-100 placeholder-slate-500 outline-none resize-y focus:border-slate-600"
        />
      )}
    </div>
  );
}

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
      <div className="flex flex-wrap gap-2 mb-1">
        {BLOCK_TYPES.map((bt) => (
          <div key={bt.type} className={`flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 ${COLOR_MAP[bt.color]?.split(" ")[0]} ${COLOR_MAP[bt.color]?.split(" ")[1]}`}>
            <span className={`text-sm ${COLOR_MAP[bt.color]?.split(" ")[2]}`}>{bt.icon}</span>
            <span className={`text-[10px] font-semibold ${COLOR_MAP[bt.color]?.split(" ")[2]}`}>{bt.label}</span>
          </div>
        ))}
      </div>

      {value.length === 0 && (
        <div className="rounded-xl border border-dashed border-slate-700 py-10 text-center">
          <p className="text-sm text-slate-500">No blocks yet — use Add Block below</p>
          <p className="text-[11px] text-slate-600 mt-1">Start with Lead Paragraph or Plain Text</p>
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

      <div className="relative">
        <button
          type="button"
          onClick={() => setAddOpen((v) => !v)}
          className="w-full rounded-xl border border-dashed border-slate-700 py-2.5 text-xs font-semibold text-slate-500 hover:border-emerald-500/40 hover:text-emerald-400 transition"
        >
          + Add Block
        </button>

        {addOpen && (
          <div className="absolute bottom-full left-0 right-0 z-20 mb-1 max-h-72 overflow-y-auto rounded-xl border border-slate-700 bg-slate-900 shadow-2xl">
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
          {value.length} block{value.length === 1 ? "" : "s"} · saved as sections_json on submit
        </p>
      )}
    </div>
  );
}
