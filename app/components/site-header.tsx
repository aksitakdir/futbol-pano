"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import {
  IconHome,
  IconList,
  IconRadar,
  IconUsers,
  IconBracket,
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
  { href: "/oyuncular", label: "Oyuncular", icon: <IconUsers />, key: "oyuncular" },
  { href: "/taktik-lab", label: "Taktik Lab", icon: <IconTaktik />, key: "taktik-lab" },
  { href: "/turnuva", label: "Turnuva", icon: <IconBracket />, key: "turnuva" },
];

type Props = {
  activeNav?: string;
  maxWidth?: string;
};

export default function SiteHeader({ activeNav, maxWidth = "max-w-6xl" }: Props) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const mq = window.matchMedia("(min-width: 768px)");
    const closeIfDesktop = () => {
      if (mq.matches) setOpen(false);
    };
    mq.addEventListener("change", closeIfDesktop);
    closeIfDesktop();
    return () => mq.removeEventListener("change", closeIfDesktop);
  }, [open]);

  const desktopItems = NAV_ITEMS.filter((n) => n.key !== "home");

  const mobileMenuOverlay =
    open && mounted ? (
      <div
        className="mobile-nav-fullscreen fixed top-0 left-0 z-[9999] flex h-[100vh] w-[100vw] flex-col bg-[#060f1e] opacity-100 md:hidden"
        style={{ maxHeight: "100vh" }}
        role="dialog"
        aria-modal="true"
        aria-label="Mobil menü"
      >
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="absolute right-4 top-4 z-[10000] flex h-11 w-11 items-center justify-center rounded-lg border border-slate-600/80 bg-slate-900/90 text-slate-200 transition hover:border-emerald-500/60 hover:text-emerald-300"
          aria-label="Menüyü kapat"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        <nav className="flex flex-1 flex-col items-center justify-center gap-10 px-6 pt-14">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.key}
              href={item.href}
              onClick={() => setOpen(false)}
              className={`flex items-center gap-3 text-[18px] font-semibold leading-tight transition ${
                activeNav === item.key ? "text-emerald-300" : "text-slate-100 hover:text-emerald-300"
              }`}
            >
              <span className="opacity-80 [&_svg]:h-5 [&_svg]:w-5">{item.icon}</span>
              {item.label}
            </Link>
          ))}

          <div className="mt-6 flex items-center gap-1 rounded-full border border-slate-700/80 bg-slate-900/70 p-0.5 text-xs">
            <button type="button" className="rounded-full bg-emerald-500/20 px-4 py-1.5 font-semibold text-emerald-200 shadow-[0_0_18px_rgba(16,185,129,0.5)]">
              TR
            </button>
            <button type="button" className="rounded-full px-4 py-1.5 text-slate-300 hover:text-emerald-200">
              EN
            </button>
          </div>
        </nav>
      </div>
    ) : null;

  return (
    <header className="sticky top-0 z-50 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur">
      <div className={`mx-auto flex ${maxWidth} items-center justify-between px-4 py-4`}>
        <Link href="/" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-emerald-400 to-cyan-500 shadow-[0_0_40px_rgba(16,185,129,0.7)]" />
          <span className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-sky-500 bg-clip-text text-sm font-semibold tracking-[0.22em] text-transparent">
            SCOUT INTELLIGENCE
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-6 text-xs font-medium text-slate-300 md:flex">
          {desktopItems.map((item) => (
            <Link
              key={item.key}
              href={item.href}
              className={`flex items-center gap-1.5 transition-colors ${
                activeNav === item.key ? "text-emerald-300" : "hover:text-emerald-300"
              }`}
            >
              {item.icon} {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          {/* Lang toggle — hidden on mobile to save space */}
          <div className="hidden items-center gap-1 rounded-full border border-slate-700/80 bg-slate-900/70 p-0.5 text-xs sm:flex">
            <button className="rounded-full bg-emerald-500/20 px-3 py-1 font-semibold text-emerald-200 shadow-[0_0_18px_rgba(16,185,129,0.5)]">
              TR
            </button>
            <button className="rounded-full px-3 py-1 text-slate-300 hover:text-emerald-200">
              EN
            </button>
          </div>

          {/* Hamburger — mobile only */}
          <button
            onClick={() => setOpen(true)}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-700/80 bg-slate-900/70 text-slate-300 transition hover:border-emerald-500/60 hover:text-emerald-300 md:hidden"
            aria-label="Menüyü aç"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
        </div>
      </div>

      {mobileMenuOverlay ? createPortal(mobileMenuOverlay, document.body) : null}
    </header>
  );
}
