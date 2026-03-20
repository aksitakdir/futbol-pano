import Link from "next/link";

type Props = {
  maxWidth?: string;
};

/** Tüm sayfalarda tutarlı alt bilgi + Oyna & Paylaş linki */
export default function SiteFooter({ maxWidth = "max-w-6xl" }: Props) {
  return (
    <footer className="border-t border-slate-800/80 bg-slate-950/90">
      <div
        className={`mx-auto flex ${maxWidth} flex-col items-center justify-between gap-3 px-4 py-5 text-xs text-slate-400 sm:flex-row`}
      >
        <span className="font-medium text-slate-300">Scout Intelligence</span>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/arena"
            className="font-medium text-slate-400 transition hover:text-emerald-300"
          >
            Oyna & Paylaş
          </Link>
          <span className="hidden h-4 w-px bg-slate-700 sm:inline" aria-hidden />
          <span className="h-6 w-6 rounded-full border border-slate-700/80 bg-slate-900/80" />
          <span className="h-6 w-6 rounded-full border border-slate-700/80 bg-slate-900/80" />
          <span className="h-6 w-6 rounded-full border border-slate-700/80 bg-slate-900/80" />
        </div>
        <span className="text-[11px] text-slate-500">© 2026 Scout Intelligence</span>
      </div>
    </footer>
  );
}
