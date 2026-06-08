"use client";

import React, { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import type { SectionBlock } from "@/lib/section-blocks";
import { parseMarkupToBlocks } from "@/lib/parse-blocks";

type FcPlayerResult = {
  name: string;
  overall: number;
  position: string;
  club: string;
};

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
  { type: "image", label: "Image", icon: "🖼", desc: "Inline image with optional caption", color: "teal" },
  { type: "list", label: "List", icon: "☰", desc: "Ordered or unordered list", color: "indigo" },
  { type: "pullquote", label: "Pull Quote", icon: "❝", desc: "Italic highlight quote", color: "amber" },
  { type: "callout", label: "Callout", icon: "◈", desc: "Tactical note / info box", color: "rose" },
  { type: "youtube", label: "YouTube", icon: "▶", desc: "Embed a video inline in the article", color: "red" },
  { type: "player", label: "Player Card", icon: "🃏", desc: "Rich player profile panel with stats", color: "cyan" },
  { type: "vs", label: "Versus", icon: "⚔", desc: "Two-column comparison (A vs B)", color: "amber" },
  { type: "faq", label: "FAQ", icon: "❓", desc: "Q&A list with SEO rich-result schema", color: "violet" },
  { type: "stat-highlight", label: "Stat Cards", icon: "📊", desc: "Prominent stat cards with big numbers", color: "cyan" },
  { type: "divider", label: "Divider", icon: "—", desc: "Decorative section divider line", color: "slate" },
];

const COLOR_MAP: Record<string, string> = {
  emerald: "border-emerald-500/30 bg-emerald-500/5 text-emerald-300",
  lime: "border-lime-500/30 bg-lime-500/5 text-lime-300",
  violet: "border-violet-500/30 bg-violet-500/5 text-violet-300",
  sky: "border-sky-500/30 bg-sky-500/5 text-sky-300",
  amber: "border-amber-500/30 bg-amber-500/5 text-amber-300",
  rose: "border-rose-500/30 bg-rose-500/5 text-rose-300",
  red: "border-red-500/30 bg-red-500/5 text-red-300",
  cyan: "border-cyan-500/30 bg-cyan-500/5 text-cyan-300",
  teal: "border-teal-500/30 bg-teal-500/5 text-teal-300",
  indigo: "border-indigo-500/30 bg-indigo-500/5 text-indigo-300",
  slate: "border-slate-500/30 bg-slate-500/5 text-slate-300",
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
    case "youtube":
      return { type, url: "" };
    case "player":
      return { type, name: "" };
    case "image":
      return { type, src: "", alt: "", caption: "" };
    case "list":
      return { type, style: "ul", items: [""] };
    case "vs":
      return { type, left: { title: "", items: [""] }, right: { title: "", items: [""] } };
    case "faq":
      return { type, heading: "", items: [{ q: "", a: "" }] };
    case "stat-highlight":
      return { type, stats: [{ value: "", label: "", note: "" }] };
    case "divider":
      return { type, style: "default" };
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
          {block.type === "image" && block.src && (
            <p className="text-[11px] text-slate-400 truncate mt-0.5">{block.alt || block.src}</p>
          )}
          {block.type === "list" && block.items.length > 0 && (
            <p className="text-[11px] text-slate-400 truncate mt-0.5">
              {block.style === "ol" ? "1." : "•"} {block.items[0]?.slice(0, 50)}
              {block.items.length > 1 ? ` (+${block.items.length - 1} more)` : ""}
            </p>
          )}
          {block.type === "vs" && (block.left.title || block.right.title) && (
            <p className="text-[11px] text-slate-400 truncate mt-0.5">
              {block.left.title || "—"} <span className="text-slate-600">vs</span> {block.right.title || "—"}
            </p>
          )}
          {block.type === "faq" && (
            <p className="text-[11px] text-slate-400 truncate mt-0.5">
              {block.items.filter((it) => it.q.trim()).length} question(s)
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

          {block.type === "youtube" && (
            <div>
              <label className="mb-1 block text-[10px] font-semibold text-slate-400 uppercase tracking-wider">YouTube URL or video ID</label>
              <input
                type="text"
                value={block.url}
                onChange={(e) => onChange({ ...block, url: e.target.value })}
                placeholder="https://youtu.be/… or dQw4w9WgXcQ"
                className="w-full rounded-lg border border-slate-700/80 bg-slate-800/70 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 outline-none focus:border-red-500/60"
              />
              <p className="mt-1 text-[10px] text-slate-500">Embeds here in the article body — separate from the hero YouTube field above.</p>
            </div>
          )}

          {block.type === "player" && (
            <PlayerBlockSearch
              name={block.name}
              onChange={(name) => onChange({ ...block, name })}
            />
          )}

          {block.type === "image" && (
            <ImageBlockEditor
              block={block}
              onChange={(b) => onChange(b)}
            />
          )}

          {block.type === "list" && (
            <ListBlockEditor
              block={block}
              onChange={(b) => onChange(b)}
            />
          )}

          {block.type === "vs" && (
            <VsBlockEditor block={block} onChange={(b) => onChange(b)} />
          )}

          {block.type === "faq" && (
            <FaqBlockEditor block={block} onChange={(b) => onChange(b)} />
          )}

          {block.type === "stat-highlight" && (
            <StatHighlightEditor block={block} onChange={(b) => onChange(b)} />
          )}

          {block.type === "divider" && (
            <div>
              <label className="mb-1 block text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Divider Style</label>
              <div className="flex gap-2">
                {(["default", "dots", "gradient"] as const).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => onChange({ ...block, style: s })}
                    className={[
                      "rounded-lg border px-3 py-1.5 text-[11px] font-semibold transition capitalize",
                      block.style === s
                        ? "border-slate-400/60 bg-slate-500/15 text-slate-200"
                        : "border-slate-700/60 text-slate-500 hover:text-slate-300",
                    ].join(" ")}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function VsBlockEditor({
  block,
  onChange,
}: {
  block: Extract<SectionBlock, { type: "vs" }>;
  onChange: (b: Extract<SectionBlock, { type: "vs" }>) => void;
}) {
  function updateSide(side: "left" | "right", patch: Partial<{ title: string; items: string[] }>) {
    onChange({ ...block, [side]: { ...block[side], ...patch } });
  }
  function updateItem(side: "left" | "right", index: number, value: string) {
    const next = [...block[side].items];
    next[index] = value;
    updateSide(side, { items: next });
  }
  function addItem(side: "left" | "right") {
    updateSide(side, { items: [...block[side].items, ""] });
  }
  function removeItem(side: "left" | "right", index: number) {
    if (block[side].items.length <= 1) return;
    updateSide(side, { items: block[side].items.filter((_, i) => i !== index) });
  }

  const sideEditor = (side: "left" | "right", label: string) => (
    <div className="flex-1 rounded-lg border border-slate-700/60 bg-slate-900/40 p-3">
      <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-amber-300/80">{label}</label>
      <input
        type="text"
        value={block[side].title}
        onChange={(e) => updateSide(side, { title: e.target.value })}
        placeholder="Title (e.g. Messi)"
        className="mb-2 w-full rounded-lg border border-slate-700/80 bg-slate-800/70 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 outline-none focus:border-amber-500/60"
      />
      <div className="space-y-1.5">
        {block[side].items.map((item, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="w-3 shrink-0 text-center text-[10px] text-slate-600">•</span>
            <input
              type="text"
              value={item}
              onChange={(e) => updateItem(side, i, e.target.value)}
              placeholder={`Point ${i + 1}…`}
              className="flex-1 rounded-lg border border-slate-700/80 bg-slate-800/70 px-3 py-1.5 text-sm text-slate-100 placeholder-slate-500 outline-none focus:border-amber-500/60"
            />
            <button
              type="button"
              onClick={() => removeItem(side, i)}
              disabled={block[side].items.length <= 1}
              className="px-1 text-xs text-rose-500 transition hover:text-rose-300 disabled:opacity-20"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={() => addItem(side)}
        className="mt-2 text-[10px] font-semibold text-amber-400 transition hover:text-amber-200"
      >
        + Add point
      </button>
    </div>
  );

  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      {sideEditor("left", "Left side")}
      {sideEditor("right", "Right side")}
    </div>
  );
}

function StatHighlightEditor({
  block,
  onChange,
}: {
  block: Extract<SectionBlock, { type: "stat-highlight" }>;
  onChange: (b: Extract<SectionBlock, { type: "stat-highlight" }>) => void;
}) {
  function updateStat(index: number, patch: Partial<{ value: string; label: string; note: string }>) {
    const next = [...block.stats];
    next[index] = { ...next[index], ...patch };
    onChange({ ...block, stats: next });
  }
  function addStat() {
    onChange({ ...block, stats: [...block.stats, { value: "", label: "" }] });
  }
  function removeStat(index: number) {
    if (block.stats.length <= 1) return;
    onChange({ ...block, stats: block.stats.filter((_, i) => i !== index) });
  }

  return (
    <div className="space-y-3">
      <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Stat Cards</label>
      {block.stats.map((stat, i) => (
        <div key={i} className="flex items-start gap-2 rounded-lg border border-cyan-700/30 bg-slate-900/40 p-3">
          <div className="flex-1 space-y-2">
            <div className="flex gap-2">
              <input
                type="text"
                value={stat.value}
                onChange={(e) => updateStat(i, { value: e.target.value })}
                placeholder="94.2%"
                className="w-24 rounded-lg border border-slate-700/80 bg-slate-800/70 px-3 py-1.5 text-center text-lg font-black text-cyan-200 placeholder-slate-600 outline-none focus:border-cyan-500/60"
              />
              <input
                type="text"
                value={stat.label}
                onChange={(e) => updateStat(i, { label: e.target.value })}
                placeholder="Pass Completion"
                className="flex-1 rounded-lg border border-slate-700/80 bg-slate-800/70 px-3 py-1.5 text-sm text-slate-100 placeholder-slate-500 outline-none focus:border-cyan-500/60"
              />
            </div>
            <input
              type="text"
              value={stat.note ?? ""}
              onChange={(e) => updateStat(i, { note: e.target.value })}
              placeholder="Context note (optional) — e.g. 'Highest in Europe'"
              className="w-full rounded-lg border border-slate-700/80 bg-slate-800/70 px-3 py-1.5 text-xs text-slate-300 placeholder-slate-600 outline-none focus:border-cyan-500/60"
            />
          </div>
          <button
            type="button"
            onClick={() => removeStat(i)}
            disabled={block.stats.length <= 1}
            className="mt-1.5 px-1 text-xs text-rose-500 transition hover:text-rose-300 disabled:opacity-20"
          >
            ✕
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={addStat}
        className="text-[11px] font-semibold text-cyan-400 transition hover:text-cyan-200"
      >
        + Add stat card
      </button>
    </div>
  );
}

function FaqBlockEditor({
  block,
  onChange,
}: {
  block: Extract<SectionBlock, { type: "faq" }>;
  onChange: (b: Extract<SectionBlock, { type: "faq" }>) => void;
}) {
  function updateItem(index: number, patch: Partial<{ q: string; a: string }>) {
    const next = block.items.map((it, i) => (i === index ? { ...it, ...patch } : it));
    onChange({ ...block, items: next });
  }
  function addItem() {
    onChange({ ...block, items: [...block.items, { q: "", a: "" }] });
  }
  function removeItem(index: number) {
    if (block.items.length <= 1) return;
    onChange({ ...block, items: block.items.filter((_, i) => i !== index) });
  }

  return (
    <div className="space-y-3">
      <div>
        <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-slate-400">Heading (optional, appears in TOC)</label>
        <input
          type="text"
          value={block.heading ?? ""}
          onChange={(e) => onChange({ ...block, heading: e.target.value })}
          placeholder="Frequently Asked Questions"
          className="w-full rounded-lg border border-slate-700/80 bg-slate-800/70 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 outline-none focus:border-violet-500/60"
        />
      </div>
      {block.items.map((item, i) => (
        <div key={i} className="rounded-lg border border-slate-700/60 bg-slate-900/40 p-3">
          <div className="mb-1.5 flex items-center justify-between">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-violet-300/80">Q{i + 1}</span>
            <button
              type="button"
              onClick={() => removeItem(i)}
              disabled={block.items.length <= 1}
              className="text-xs text-rose-500 transition hover:text-rose-300 disabled:opacity-20"
            >
              ✕ Remove
            </button>
          </div>
          <input
            type="text"
            value={item.q}
            onChange={(e) => updateItem(i, { q: e.target.value })}
            placeholder="Question…"
            className="mb-2 w-full rounded-lg border border-slate-700/80 bg-slate-800/70 px-3 py-2 text-sm font-medium text-slate-100 placeholder-slate-500 outline-none focus:border-violet-500/60"
          />
          <textarea
            value={item.a}
            onChange={(e) => updateItem(i, { a: e.target.value })}
            placeholder="Answer…"
            rows={3}
            className="w-full resize-y rounded-lg border border-slate-700/80 bg-slate-800/70 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 outline-none focus:border-violet-500/60"
          />
        </div>
      ))}
      <button
        type="button"
        onClick={addItem}
        className="text-[11px] font-semibold text-violet-400 transition hover:text-violet-200"
      >
        + Add question
      </button>
    </div>
  );
}

function PlayerBlockSearch({ name, onChange }: { name: string; onChange: (name: string) => void }) {
  const [query, setQuery] = useState(name);
  const [results, setResults] = useState<FcPlayerResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [matched, setMatched] = useState<FcPlayerResult | null>(null);
  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => { setQuery(name); }, [name]);

  useEffect(() => {
    if (!query.trim() || query.length < 2 || matched) {
      setResults([]);
      return;
    }
    if (timeout.current) clearTimeout(timeout.current);
    timeout.current = setTimeout(async () => {
      setSearching(true);
      const { data } = await supabase
        .from("fc_players")
        .select("name,overall,position,club")
        .ilike("name", `%${query.trim()}%`)
        .order("overall", { ascending: false })
        .limit(8);
      setResults((data as FcPlayerResult[]) ?? []);
      setSearching(false);
    }, 300);
  }, [query, matched]);

  function select(p: FcPlayerResult) {
    setMatched(p);
    setQuery(p.name);
    onChange(p.name);
    setResults([]);
  }

  return (
    <div>
      <label className="mb-1 block text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Player name</label>
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setMatched(null); onChange(e.target.value); }}
          placeholder="Type to search EA FC 26 database..."
          className="w-full rounded-lg border border-slate-700/80 bg-slate-800/70 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 outline-none focus:border-cyan-500/60"
        />
        {searching && (
          <div className="absolute right-3 top-2.5 h-4 w-4 animate-spin rounded-full border-2 border-cyan-400 border-t-transparent" />
        )}
        {results.length > 0 && (
          <div className="absolute z-30 mt-1 w-full rounded-xl border border-slate-700 bg-slate-900 shadow-xl overflow-hidden">
            {results.map((p) => (
              <button
                key={p.name + p.club}
                type="button"
                onClick={() => select(p)}
                className="flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-slate-800/80 transition"
              >
                <div>
                  <span className="font-semibold text-slate-100">{p.name}</span>
                  <span className="ml-2 text-[10px] text-slate-400">{p.club} · {p.position}</span>
                </div>
                <span className="text-sm font-bold text-cyan-400">{p.overall}</span>
              </button>
            ))}
          </div>
        )}
      </div>
      {matched && (
        <div className="mt-2 flex items-center gap-2 rounded-lg border border-cyan-500/20 bg-cyan-500/5 px-3 py-1.5">
          <span className="text-sm font-bold text-cyan-300">{matched.name}</span>
          <span className="text-[10px] text-slate-400">{matched.club} · {matched.position}</span>
          <span className="ml-auto text-lg font-black text-cyan-400">{matched.overall}</span>
        </div>
      )}
      {!matched && <p className="mt-1 text-[10px] text-slate-500">Type at least 2 characters to search — card renders inline at this position.</p>}
    </div>
  );
}

function ImageBlockEditor({
  block,
  onChange,
}: {
  block: Extract<SectionBlock, { type: "image" }>;
  onChange: (b: Extract<SectionBlock, { type: "image" }>) => void;
}) {
  return (
    <div className="space-y-3">
      <div>
        <label className="mb-1 block text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
          Image URL <span className="text-rose-400">*</span>
        </label>
        <input
          type="text"
          value={block.src}
          onChange={(e) => onChange({ ...block, src: e.target.value })}
          placeholder="https://images.unsplash.com/… or /images/…"
          className="w-full rounded-lg border border-slate-700/80 bg-slate-800/70 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 outline-none focus:border-teal-500/60"
        />
      </div>
      <div>
        <label className="mb-1 block text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
          Alt text <span className="text-rose-400">*</span>
        </label>
        <input
          type="text"
          value={block.alt}
          onChange={(e) => onChange({ ...block, alt: e.target.value })}
          placeholder="Describe the image for accessibility & SEO"
          className="w-full rounded-lg border border-slate-700/80 bg-slate-800/70 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 outline-none focus:border-teal-500/60"
        />
      </div>
      <div>
        <label className="mb-1 block text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
          Caption <span className="text-slate-600">(optional)</span>
        </label>
        <input
          type="text"
          value={block.caption ?? ""}
          onChange={(e) => onChange({ ...block, caption: e.target.value })}
          placeholder="Photo credit or context"
          className="w-full rounded-lg border border-slate-700/80 bg-slate-800/70 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 outline-none focus:border-teal-500/60"
        />
      </div>
      {block.src && (
        <div className="rounded-lg border border-slate-700/60 overflow-hidden mt-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={block.src}
            alt={block.alt || "preview"}
            className="w-full max-h-48 object-cover"
            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
          />
        </div>
      )}
    </div>
  );
}

function ListBlockEditor({
  block,
  onChange,
}: {
  block: Extract<SectionBlock, { type: "list" }>;
  onChange: (b: Extract<SectionBlock, { type: "list" }>) => void;
}) {
  function updateItem(index: number, value: string) {
    const next = [...block.items];
    next[index] = value;
    onChange({ ...block, items: next });
  }

  function addItem() {
    onChange({ ...block, items: [...block.items, ""] });
  }

  function removeItem(index: number) {
    if (block.items.length <= 1) return;
    onChange({ ...block, items: block.items.filter((_, i) => i !== index) });
  }

  return (
    <div className="space-y-3">
      <div>
        <label className="mb-1 block text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Style</label>
        <div className="flex gap-2">
          {(["ul", "ol"] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => onChange({ ...block, style: s })}
              className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${
                block.style === s
                  ? "border-indigo-500/60 bg-indigo-500/15 text-indigo-200"
                  : "border-slate-700/80 text-slate-500 hover:text-slate-300"
              }`}
            >
              {s === "ul" ? "• Bullet" : "1. Numbered"}
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="mb-1 block text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Items</label>
        <div className="space-y-2">
          {block.items.map((item, i) => (
            <div key={i} className="flex gap-2 items-center">
              <span className="text-[10px] text-slate-600 w-5 text-right shrink-0">
                {block.style === "ol" ? `${i + 1}.` : "•"}
              </span>
              <input
                type="text"
                value={item}
                onChange={(e) => updateItem(i, e.target.value)}
                placeholder={`Item ${i + 1}…`}
                className="flex-1 rounded-lg border border-slate-700/80 bg-slate-800/70 px-3 py-1.5 text-sm text-slate-100 placeholder-slate-500 outline-none focus:border-indigo-500/60"
              />
              <button
                type="button"
                onClick={() => removeItem(i)}
                disabled={block.items.length <= 1}
                className="text-rose-500 hover:text-rose-300 disabled:opacity-20 text-xs px-1 transition"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={addItem}
          className="mt-2 text-[10px] font-semibold text-indigo-400 hover:text-indigo-200 transition"
        >
          + Add item
        </button>
      </div>
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
  const [importOpen, setImportOpen] = useState(false);
  const [importText, setImportText] = useState("");
  const [importMsg, setImportMsg] = useState("");

  function addBlock(type: SectionBlock["type"]) {
    onChange([...value, defaultBlock(type)]);
    setAddOpen(false);
  }

  /**
   * Parse the pasted markup into blocks and append them. Player blocks carry
   * the typed name; the per-block player search resolves it (semi-automatic).
   */
  function handleImport() {
    const parsed = parseMarkupToBlocks(importText);
    if (parsed.length === 0) {
      setImportMsg("No recognizable content found.");
      return;
    }
    onChange([...value, ...parsed]);
    setImportText("");
    setImportOpen(false);
    setImportMsg("");
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
        <button
          type="button"
          onClick={() => setImportOpen((v) => !v)}
          className="ml-auto inline-flex items-center gap-1.5 rounded-full border border-emerald-600/50 bg-emerald-500/10 px-3 py-0.5 text-[10px] font-semibold text-emerald-300 transition hover:bg-emerald-500/20"
        >
          ⇊ Import from text
        </button>
      </div>

      {importOpen && (
        <div className="space-y-2 rounded-xl border border-emerald-600/30 bg-emerald-500/5 p-3">
          <p className="text-[11px] leading-relaxed text-slate-400">
            Paste marked-up text; a blank line separates blocks.{" "}
            <code className="text-slate-300"># H2</code> ·{" "}
            <code className="text-slate-300">## H3</code> ·{" "}
            <code className="text-slate-300">&gt; quote</code> ·{" "}
            <code className="text-slate-300">- list item</code> ·{" "}
            <code className="text-slate-300">![alt](url)</code> ·{" "}
            <code className="text-slate-300">@video: url</code> ·{" "}
            <code className="text-slate-300">@player: Name</code> ·{" "}
            <code className="text-slate-300">@lead:</code> ·{" "}
            <code className="text-slate-300">@callout:</code> ·{" "}
            <code className="text-slate-300">@section: Heading</code> + body lines · plain text = paragraph.
            <br />
            Inline (in paragraphs/lead/callout/section):{" "}
            <code className="text-slate-300">**bold**</code>{" "}
            <code className="text-slate-300">*italic*</code>{" "}
            <code className="text-slate-300">[text](url)</code>
          </p>
          <textarea
            value={importText}
            onChange={(e) => setImportText(e.target.value)}
            rows={10}
            placeholder={"# Section title\n\nA paragraph of text.\n\n> A pull quote\n\n- first point\n- second point\n\n![alt](https://example.com/img.jpg)\n\n@player: L. Yamal\n\n@video: https://youtu.be/xxxxxxxxxxx"}
            className="w-full rounded-lg border border-slate-700/80 bg-slate-900/70 px-3 py-2 font-mono text-xs text-slate-100 placeholder-slate-600 outline-none resize-y focus:border-emerald-500/60"
          />
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleImport}
              disabled={!importText.trim()}
              className="rounded-lg bg-emerald-500 px-4 py-1.5 text-xs font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Parse &amp; append
            </button>
            {importMsg && <span className="text-[11px] text-amber-300">{importMsg}</span>}
            <span className="text-[11px] text-slate-500">Blocks are appended below; edit them as usual.</span>
          </div>
        </div>
      )}

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
