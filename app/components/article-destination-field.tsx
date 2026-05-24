"use client";

import {
  type ContentCategory,
  CONTENT_CATEGORIES,
  categoryPublicPath,
} from "@/lib/category-config";

type Props = {
  category: ContentCategory;
  onCategoryChange: (category: ContentCategory) => void;
  slugPreview?: string;
};

const btnBase = "rounded-lg border px-4 py-2 text-xs font-semibold transition";
const btnActive = "border-emerald-500/60 bg-emerald-500/15 text-emerald-300";
const btnIdle =
  "border-slate-700/80 bg-slate-900/70 text-slate-400 hover:border-slate-600 hover:text-slate-200";

export default function ArticleDestinationField({
  category,
  onCategoryChange,
  slugPreview,
}: Props) {
  const previewSlug = slugPreview?.trim() || "your-slug";
  const publicUrl = `${categoryPublicPath(category)}/${previewSlug}`;
  const selected = CONTENT_CATEGORIES.find((d) => d.value === category);

  return (
    <div className="space-y-4 rounded-xl border border-slate-800/60 bg-slate-900/25 p-4">
      <div>
        <label className="mb-1.5 block text-xs font-semibold text-slate-300">Publish to</label>
        <div className="flex flex-wrap gap-2">
          {CONTENT_CATEGORIES.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => onCategoryChange(opt.value)}
              className={[btnBase, category === opt.value ? btnActive : btnIdle].join(" ")}
            >
              {opt.label}
            </button>
          ))}
        </div>
        <p className="mt-2 text-[11px] text-slate-500">{selected?.desc}</p>
      </div>

      <p className="rounded-lg border border-slate-800/80 bg-slate-950/40 px-3 py-2 text-[11px] leading-relaxed text-slate-400">
        <span className="font-medium text-slate-300">Will appear at:</span>{" "}
        <span className="font-mono text-slate-300">{publicUrl}</span>
      </p>
    </div>
  );
}
