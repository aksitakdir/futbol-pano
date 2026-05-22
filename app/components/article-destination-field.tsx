"use client";

import {
  CONTENT_DESTINATIONS,
  categoryPublicPath,
  destinationSummary,
  hubTagsFromDestination,
  isEditorialCategory,
  isHubCategory,
  publishScopeForCategory,
  type ContentCategory,
} from "@/lib/article-destination";
import { HUBS, type HubId } from "@/lib/hub-config";

type Props = {
  category: ContentCategory;
  crossPostHubs: HubId[];
  onCategoryChange: (category: ContentCategory) => void;
  onCrossPostHubsChange: (hubs: HubId[]) => void;
  slugPreview?: string;
};

const btnBase = "rounded-lg border px-4 py-2 text-xs font-semibold transition";
const btnActive = "border-emerald-500/60 bg-emerald-500/15 text-emerald-300";
const btnIdle =
  "border-slate-700/80 bg-slate-900/70 text-slate-400 hover:border-slate-600 hover:text-slate-200";

export default function ArticleDestinationField({
  category,
  crossPostHubs,
  onCategoryChange,
  onCrossPostHubsChange,
  slugPreview,
}: Props) {
  function handleCategoryChange(next: ContentCategory) {
    onCategoryChange(next);
    if (isHubCategory(next)) onCrossPostHubsChange([]);
  }

  function toggleCrossPost(hubId: HubId) {
    if (crossPostHubs.includes(hubId)) {
      onCrossPostHubsChange(crossPostHubs.filter((id) => id !== hubId));
    } else {
      onCrossPostHubsChange([...crossPostHubs, hubId]);
    }
  }

  const scope = publishScopeForCategory(category);
  const hubTags = hubTagsFromDestination(scope, crossPostHubs);
  const previewSlug = slugPreview?.trim() || "your-slug";
  const publicUrl = `${categoryPublicPath(category)}/${previewSlug}`;
  const selected = CONTENT_DESTINATIONS.find((d) => d.value === category);

  return (
    <div className="space-y-4 rounded-xl border border-slate-800/60 bg-slate-900/25 p-4">
      <div>
        <label className="mb-1.5 block text-xs font-semibold text-slate-300">Publish to</label>
        <div className="flex flex-wrap gap-2">
          {CONTENT_DESTINATIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => handleCategoryChange(opt.value)}
              className={[btnBase, category === opt.value ? btnActive : btnIdle].join(" ")}
            >
              {opt.label}
            </button>
          ))}
        </div>
        <p className="mt-2 text-[11px] text-slate-500">{selected?.desc}</p>
      </div>

      {isEditorialCategory(category) ? (
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-slate-300">
            Also feature on hub (optional)
          </label>
          <div className="flex flex-col gap-2 sm:flex-row">
            {(["wc-2026", "transfer"] as const).map((hubId) => {
              const checked = crossPostHubs.includes(hubId);
              return (
                <label
                  key={hubId}
                  className={[
                    "flex flex-1 cursor-pointer items-start gap-3 rounded-lg border px-3 py-2.5 transition",
                    checked
                      ? "border-emerald-500/50 bg-emerald-500/10"
                      : "border-slate-700/80 bg-slate-900/60 hover:border-slate-600",
                  ].join(" ")}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleCrossPost(hubId)}
                    className="mt-0.5 accent-emerald-500"
                  />
                  <span>
                    <span className="block text-xs font-medium text-slate-200">
                      {HUBS[hubId].en.pillarTitle}
                    </span>
                    <span className="block text-[10px] text-slate-500">{HUBS[hubId].en.basePath}</span>
                  </span>
                </label>
              );
            })}
          </div>
          <p className="mt-2 text-[11px] text-slate-500">
            Cross-post keeps the main URL ({publicUrl}) and also surfaces the article on the hub feed.
          </p>
        </div>
      ) : (
        <p className="rounded-lg border border-amber-500/25 bg-amber-500/10 px-3 py-2 text-[11px] text-amber-200/90">
          Hub-only article — not listed under Lists, Radar or Tactics Lab. When the hub closes, archive
          without touching main site sections.
        </p>
      )}

      <p className="rounded-lg border border-slate-800/80 bg-slate-950/40 px-3 py-2 text-[11px] leading-relaxed text-slate-400">
        <span className="font-medium text-slate-300">Will appear at:</span>{" "}
        <span className="font-mono text-slate-300">{publicUrl}</span>
        {hubTags.length > 0 ? (
          <>
            {" "}
            · hub tag{" "}
            <span className="font-mono text-emerald-400/90">{hubTags.join(", ")}</span>
          </>
        ) : null}
        <br />
        <span className="text-slate-500">{destinationSummary(scope, category)}</span>
      </p>
    </div>
  );
}
