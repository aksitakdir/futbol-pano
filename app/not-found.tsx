import Link from "next/link";
import type { Metadata } from "next";
import SiteHeader from "./components/site-header";
import SiteFooter from "./components/site-footer";

export const metadata: Metadata = {
  title: "Page Not Found | Scout Gamer",
  description: "The page you are looking for does not exist or may have moved.",
  robots: { index: false, follow: false },
};

const QUICK_LINKS = [
  { href: "/radar", label: "Radar", color: "var(--sg-primary)", desc: "Weekly scout analyses" },
  { href: "/lists", label: "Lists", color: "var(--sg-secondary)", desc: "Curated scouting lists" },
  { href: "/tactics-lab", label: "Tactics Lab", color: "var(--sg-tertiary)", desc: "Tactical deep-dives" },
  { href: "/arena", label: "Arena", color: "var(--sg-amber)", desc: "Bracket games" },
];

export default function NotFound() {
  return (
    <main style={{ background: "var(--sg-bg)", color: "var(--sg-text-primary)", minHeight: "100vh" }}>
      <SiteHeader />

      <section className="relative flex min-h-[80vh] flex-col items-center justify-center px-8 text-center overflow-hidden">
        {/* Decorative background glow */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full opacity-[0.07]"
            style={{ background: "radial-gradient(circle, var(--sg-primary) 0%, transparent 70%)", filter: "blur(80px)" }}
          />
        </div>

        {/* 404 numeral */}
        <div className="relative mb-6 select-none">
          <span
            className="font-black leading-none tracking-tighter"
            style={{
              fontFamily: "var(--font-headline)",
              fontSize: "clamp(8rem, 20vw, 16rem)",
              background: "linear-gradient(135deg, var(--sg-primary) 0%, var(--sg-secondary) 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              opacity: 0.18,
            }}
          >
            404
          </span>
          <div className="absolute inset-0 flex items-center justify-center">
            <div
              className="h-16 w-16 flex items-center justify-center"
              style={{ background: "var(--sg-surface)", border: "1px solid rgba(70,241,197,0.2)" }}
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--sg-primary)" strokeWidth="1.5">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
                <path d="M11 8v3M11 14h.01" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
          </div>
        </div>

        <p
          className="mb-2 text-[10px] font-bold uppercase tracking-[0.3em]"
          style={{ color: "var(--sg-primary)", fontFamily: "var(--font-headline)" }}
        >
          Page Not Found
        </p>
        <h1
          className="mb-4 text-3xl md:text-4xl font-bold tracking-tighter"
          style={{ fontFamily: "var(--font-headline)" }}
        >
          This page is off the pitch.
        </h1>
        <p className="mb-10 max-w-md text-sm leading-relaxed" style={{ color: "var(--sg-text-secondary)" }}>
          The content you are looking for may have been removed, moved, or never existed.
          Pick a category below to keep exploring.
        </p>

        {/* Quick links */}
        <div className="mb-10 grid grid-cols-2 gap-3 sm:grid-cols-4 w-full max-w-xl">
          {QUICK_LINKS.map(({ href, label, color, desc }) => (
            <Link
              key={href}
              href={href}
              className="group flex flex-col p-4 transition hover:-translate-y-0.5"
              style={{ background: "var(--sg-surface)", borderTop: `2px solid ${color}` }}
            >
              <span
                className="text-[10px] font-bold uppercase tracking-[0.18em] mb-1"
                style={{ color, fontFamily: "var(--font-headline)" }}
              >
                {label}
              </span>
              <span className="text-[11px]" style={{ color: "var(--sg-text-muted)" }}>{desc}</span>
            </Link>
          ))}
        </div>

        {/* Homepage CTA */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-8 py-3.5 font-bold uppercase tracking-wider transition-all hover:brightness-110 active:scale-95"
          style={{
            background: "var(--sg-primary)",
            color: "#060f1e",
            fontFamily: "var(--font-headline)",
            fontSize: "12px",
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Back to Homepage
        </Link>
      </section>

      <SiteFooter maxWidth="max-w-7xl" />
    </main>
  );
}
