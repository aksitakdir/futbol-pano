"use client";

type StatColor = "emerald" | "sky" | "amber" | "rose" | "slate";

const SHELL: Record<StatColor, string> = {
  emerald: "text-emerald-400 border-emerald-500/20 bg-emerald-500/5",
  sky: "text-sky-400 border-sky-500/20 bg-sky-500/5",
  amber: "text-amber-400 border-amber-500/20 bg-amber-500/5",
  rose: "text-rose-400 border-rose-500/20 bg-rose-500/5",
  slate: "text-slate-300 border-slate-500/25 bg-slate-600/10",
};

const VALUE: Record<StatColor, string> = {
  emerald: "text-emerald-400",
  sky: "text-sky-400",
  amber: "text-amber-400",
  rose: "text-rose-400",
  slate: "text-slate-200",
};

export function AdminStatCard({
  label,
  value,
  sub,
  color = "emerald",
}: {
  label: string;
  value: string | number;
  sub?: string;
  color?: StatColor;
}) {
  const shell = SHELL[color] ?? SHELL.emerald;
  const valCls = VALUE[color] ?? VALUE.emerald;
  return (
    <div className={`rounded-xl border p-5 ${shell}`}>
      <div className="mb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">{label}</div>
      <div className={`text-3xl font-black ${valCls}`}>{value}</div>
      {sub ? <div className="mt-1 text-[11px] text-slate-500">{sub}</div> : null}
    </div>
  );
}
