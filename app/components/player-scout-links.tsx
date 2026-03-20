"use client";

/** Transfermarkt + Google arama; ~12px, muted, hover'da parlar */
export function PlayerScoutLinks({ playerName }: { playerName: string }) {
  const n = playerName?.trim();
  if (!n) return null;
  const tmUrl =
    "https://www.transfermarkt.com.tr/schnellsuche/ergebnis/schnellsuche?query=" +
    encodeURIComponent(n);
  const googleUrl =
    "https://www.google.com/search?q=" + encodeURIComponent(`${n} futbolcu`);

  const base =
    "inline-flex h-3 shrink-0 items-center justify-center rounded border border-slate-700/70 " +
    "bg-slate-900/90 font-bold leading-none text-slate-500 transition " +
    "hover:border-emerald-500/60 hover:text-emerald-300 hover:shadow-[0_0_10px_rgba(52,211,153,0.4)]";

  return (
    <span
      className="inline-flex items-center gap-1"
      role="group"
      aria-label="Oyuncuyu web'de ara"
    >
      <a
        href={tmUrl}
        target="_blank"
        rel="noopener noreferrer"
        title="Transfermarkt'ta ara"
        className={`${base} min-w-[22px] px-0.5 text-[7px] tracking-tight`}
      >
        TM
      </a>
      <a
        href={googleUrl}
        target="_blank"
        rel="noopener noreferrer"
        title="Google'da ara"
        className={`${base} w-3 text-[9px]`}
      >
        G
      </a>
    </span>
  );
}
