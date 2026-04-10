"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import {
  IconHome,
  IconList,
  IconRadar,
  IconSoccerBall,
  IconTaktik,
} from "./icons";

type NavItem = {
  href: string;
  label: string;
  icon: React.ReactNode;
  key: string;
};

const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "Ana Sayfa", icon: <IconHome />, key: "home" },
  { href: "/listeler", label: "Listeler", icon: <IconList />, key: "listeler" },
  { href: "/radar", label: "Radar", icon: <IconRadar />, key: "radar" },
  { href: "/taktik-lab", label: "Taktik Lab", icon: <IconTaktik />, key: "taktik-lab" },
  { href: "/arena", label: "Oyna", icon: <IconSoccerBall />, key: "arena" },
];

type Props = {
  activeNav?: string;
  maxWidth?: string;
};

function ScoutGamerLogo() {
  return (
    <svg width="34" height="34" viewBox="0 0 34 34" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="34" height="34" rx="9" fill="#060f1e" />
      <rect width="34" height="34" rx="9" fill="#00d4aa" fillOpacity="0.08" />
      <path d="M17 4.5L28 10.5V23.5L17 29.5L6 23.5V10.5Z" stroke="#00d4aa" strokeWidth="1.2" fill="none" strokeOpacity="0.5" />
      <path d="M17 9L24.5 13.5V22.5L17 27L9.5 22.5V13.5Z" fill="#00d4aa" fillOpacity="0.06" />
      <text x="17" y="21" textAnchor="middle" fill="#00d4aa" fontSize="10.5" fontWeight="800" fontFamily="'Trebuchet MS', sans-serif" letterSpacing="0.8">SG</text>
    </svg>
  );
}

export default function SiteHeader({ activeNav, maxWidth = "max-w-6xl" }: Props) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const mq = window.matchMedia("(min-width: 768px)");
    const closeIfDesktop = () => { if (mq.matches) setOpen(false); };
    mq.addEventListener("change", closeIfDesktop);
    closeIfDesktop();
    return () => mq.removeEventListener("change", closeIfDesktop);
  }, [open]);

  const desktopItems = NAV_ITEMS.filter((n) => n.key !== "home");

  const mobileMenuOverlay =
    open && mounted ? (
      <div
        className="mobile-nav-fullscreen fixed top-0 left-0 z-[9999] flex h-[100vh] w-[100vw] flex-col bg-[#060f1e] md:hidden"
        role="dialog"
        aria-modal="true"
        aria-label="Mobil menü"
      >
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -left-20 top-20 h-64 w-64 rounded-full bg-emerald-500/10 blur-[80px]" />
          <div className="absolute -right-10 bottom-20 h-48 w-48 rounded-full bg-cyan-500/10 blur-[60px]" />
        </div>

        <button
          type="button"
          onClick={() => setOpen(false)}
          className="absolute right-4 top-4 z-[10000] flex h-11 w-11 items-center justify-center rounded-lg border border-slate-700/60 bg-slate-900/90 text-slate-300 transition hover:border-emerald-500/60 hover:text-emerald-300"
          aria-label="Menüyü kapat"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {/* Logo */}
        <div className="relative flex items-center gap-3 px-8 pt-8 pb-6 border-b border-slate-800/60">
          <ScoutGamerLogo />
          <div>
            <span className="block bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-base font-black tracking-[0.15em] text-transparent">
              SCOUT GAMER
            </span>
            <span className="text-[10px] text-slate-500 tracking-[0.18em] uppercase">Futbol × Oyun Kültürü</span>
          </div>
        </div>

        <nav className="relative flex flex-1 flex-col gap-1 px-5 pt-4">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.key}
              href={item.href}
              onClick={() => setOpen(false)}
              className={[
                "flex items-center gap-4 rounded-xl px-4 py-3.5 text-[15px] font-semibold transition border",
                activeNav === item.key
                  ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/20"
                  : "text-slate-300 hover:bg-slate-800/50 hover:text-white border-transparent",
              ].join(" ")}
            >
              <span className="[&_svg]:h-5 [&_svg]:w-5 opacity-60">{item.icon}</span>
              {item.label}
              {activeNav === item.key && (
                <span className="ml-auto h-1.5 w-1.5 rounded-full bg-emerald-400" />
              )}
            </Link>
          ))}
        </nav>

        <div className="relative px-5 pb-8 pt-4">
          <div className="rounded-xl border border-slate-800/60 bg-slate-900/40 px-4 py-3">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-400/60">Scout Gamer Beta</p>
            <p className="mt-0.5 text-[11px] text-slate-500">Futbol keşif & oyun kültürü platformu</p>
          </div>
        </div>
      </div>
    ) : null;

  return (
    <header className="sticky top-0 z-50 border-b border-slate-800/60 bg-slate-950/90 backdrop-blur-md">
      <div className={`mx-auto flex ${maxWidth} items-center justify-between px-4 py-3`}>

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5">
          <ScoutGamerLogo />
          <div className="flex flex-col leading-none">
            <span className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-sky-400 bg-clip-text text-sm font-black tracking-[0.16em] text-transparent">
              SCOUT GAMER
            </span>
            <span className="mt-0.5 text-[9px] uppercase tracking-[0.2em] text-slate-600">
              Futbol × Oyun Kültürü
            </span>
          </div>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 md:flex">
          {desktopItems.map((item) => (
            <Link
              key={item.key}
              href={item.href}
              className={[
                "flex items-center gap-1.5 rounded-lg px-3 py-2 text-[11px] font-semibold tracking-wide transition-all border",
                activeNav === item.key
                  ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/20"
                  : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200 border-transparent",
              ].join(" ")}
            >
              <span className="[&_svg]:h-3.5 [&_svg]:w-3.5 opacity-60">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Hamburger */}
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-700/80 bg-slate-900/70 text-slate-300 transition hover:border-emerald-500/60 hover:text-emerald-300 md:hidden"
          aria-label="Menüyü aç"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
      </div>

      {mobileMenuOverlay ? createPortal(mobileMenuOverlay, document.body) : null}
    </header>
  );
}
