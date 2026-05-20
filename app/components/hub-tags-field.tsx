"use client";

import { HUBS, type HubId } from "@/lib/hub-config";

const HUB_OPTIONS: { id: HubId; label: string; desc: string }[] = [
  { id: "wc-2026", label: "Dünya Kupası 2026", desc: "DK hub ve alt sayfalarında listelenir" },
  { id: "transfer", label: "Transfer Merkezi", desc: "Transfer hub ve alt sayfalarında listelenir" },
];

type Props = {
  value: string[];
  onChange: (tags: string[]) => void;
};

export default function HubTagsField({ value, onChange }: Props) {
  function toggle(hubId: HubId) {
    const tag = HUBS[hubId].tag;
    if (value.includes(tag)) {
      onChange(value.filter((t) => t !== tag));
    } else {
      onChange([...value, tag]);
    }
  }

  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold text-slate-300">Kampanya hub&apos;ları</label>
      <div className="flex flex-col gap-2">
        {HUB_OPTIONS.map((opt) => {
          const checked = value.includes(HUBS[opt.id].tag);
          return (
            <label
              key={opt.id}
              className={[
                "flex cursor-pointer items-start gap-3 rounded-lg border px-3 py-2.5 transition",
                checked
                  ? "border-emerald-500/50 bg-emerald-500/10"
                  : "border-slate-700/80 bg-slate-900/60 hover:border-slate-600",
              ].join(" ")}
            >
              <input
                type="checkbox"
                checked={checked}
                onChange={() => toggle(opt.id)}
                className="mt-0.5 accent-emerald-500"
              />
              <span>
                <span className="block text-xs font-medium text-slate-200">{opt.label}</span>
                <span className="block text-[10px] text-slate-500">{opt.desc}</span>
              </span>
            </label>
          );
        })}
      </div>
    </div>
  );
}
