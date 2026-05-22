"use client";

import {
  COVER_STORY_SCOPE_LABELS,
  coverScopesForCategory,
  type CoverStoryScope,
} from "@/lib/cover-story";

type Props = {
  category: string;
  selectedScopes: CoverStoryScope[];
  onChange: (scopes: CoverStoryScope[]) => void;
  disabled?: boolean;
};

export default function CoverStoryField({ category, selectedScopes, onChange, disabled }: Props) {
  const scopes = coverScopesForCategory(category);

  function toggle(scope: CoverStoryScope) {
    if (disabled) return;
    if (selectedScopes.includes(scope)) {
      onChange(selectedScopes.filter((s) => s !== scope));
    } else {
      onChange([...selectedScopes, scope]);
    }
  }

  return (
    <section className="rounded-xl border border-slate-800/60 bg-slate-900/25 p-4">
      <h2 className="mb-1 text-sm font-semibold text-slate-200">Cover Story</h2>
      <p className="mb-4 text-[11px] leading-relaxed text-slate-500">
        Pin this article to featured slots. It always uses this article&apos;s live title, summary and cover image —
        change the cover here and the cover story updates on save.
      </p>
      <div className="flex flex-col gap-2">
        {scopes.map((scope) => {
          const checked = selectedScopes.includes(scope);
          return (
            <label
              key={scope}
              className={[
                "flex cursor-pointer items-start gap-3 rounded-lg border px-3 py-2.5 transition",
                checked
                  ? "border-emerald-500/50 bg-emerald-500/10"
                  : "border-slate-700/80 bg-slate-900/60 hover:border-slate-600",
                disabled ? "cursor-not-allowed opacity-60" : "",
              ].join(" ")}
            >
              <input
                type="checkbox"
                checked={checked}
                disabled={disabled}
                onChange={() => toggle(scope)}
                className="mt-0.5 accent-emerald-500"
              />
              <span>
                <span className="block text-xs font-medium text-slate-200">
                  {COVER_STORY_SCOPE_LABELS[scope]}
                </span>
              </span>
            </label>
          );
        })}
      </div>
      {disabled ? (
        <p className="mt-3 text-[11px] text-amber-300/90">Save the article first, then pin as cover story.</p>
      ) : null}
    </section>
  );
}
