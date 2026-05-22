"use client";

import { useState } from "react";
import Link from "next/link";

type Props = { maxWidth?: string; };
type PolicyKey = "privacy" | "terms" | "contact";

const POLICIES: Record<PolicyKey, { title: string; content: string }> = {
  privacy: {
    title: "Privacy Policy",
    content: `At Scout Gamer we care about your privacy.

Data we collect
When you visit, technical data such as browser type, IP address and session duration may be logged. This is used only to improve site performance.

Cookies
We may use cookies to improve your experience. You can disable them in your browser.

Third-party services
We may use Google Analytics and similar tools, which have their own policies.

Contact
Privacy questions: hello@scoutgamer.com

Last updated: April 2026`,
  },
  terms: {
    title: "Terms of Use",
    content: `By using Scout Gamer you agree to the following.

Content
All content belongs to Scout Gamer. No commercial use without permission. Attribution is allowed for quotes.

User responsibility
Use the site only for lawful purposes. No harmful, misleading or illegal content.

Disclaimer
We cannot guarantee accuracy at all times. Player data comes from the EA FC database and may not reflect real-world performance.

Changes
These terms may change without notice.

Last updated: April 2026`,
  },
  contact: {
    title: "Contact",
    content: `Reach the Scout Gamer team via:

Email
hello@scoutgamer.com

Social
Twitter/X: @ScoutGamer
Instagram: @scoutgamer

Partnerships
For content or partnerships: hello@scoutgamer.com

We usually reply within 1–2 business days.`,
  },
};

const NAV_LINKS = [
  { href: "/world-cup-2026", label: "WC 2026" },
  { href: "/transfers",      label: "TRANSFERS" },
  { href: "/radar",          label: "RADAR" },
  { href: "/lists",           label: "LISTS" },
  { href: "/tactics-lab",    label: "TACTICS LAB" },
  { href: "/arena",          label: "ARENA" },
];

export default function SiteFooter(_props?: Props) {
  const [open, setOpen] = useState<PolicyKey | null>(null);
  const policy = open ? POLICIES[open] : null;
  const policyKeys: PolicyKey[] = ["privacy", "terms", "contact"];

  return (
    <>
      <footer style={{ background: "var(--sg-surface-low)", borderTop: "1px solid var(--sg-border)", marginTop: 80 }}>
        <div className="sg-site-container py-16">
          <div className="grid grid-cols-1 gap-12 md:grid-cols-[2fr_1fr_1fr_1fr]">

            <div>
              <div className="display grad-text" style={{ fontSize: 28, fontWeight: 700, letterSpacing: "-0.03em", lineHeight: 1 }}>Scout Gamer</div>
              <div className="mono" style={{ fontSize: 10, letterSpacing: "0.18em", color: "var(--sg-text-muted)", marginTop: 6 }}>FOOTBALL × GAME CULTURE</div>
              <p style={{ fontSize: 14, color: "var(--sg-text-muted)", maxWidth: 320, marginTop: 16, lineHeight: 1.6, fontFamily: "var(--font-body)" }}>
                Consumable quality with understandable sophistication. Where football scouting meets gaming culture.
              </p>
              <div className="mt-6 flex gap-2">
                <a href="https://x.com/ScoutGamer" target="_blank" rel="noopener noreferrer"
                  className="flex h-8 w-8 items-center justify-center transition hover:opacity-70"
                  style={{ border: "1px solid var(--sg-border)", borderRadius: 999, color: "var(--sg-text-muted)" }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </a>
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer"
                  className="flex h-8 w-8 items-center justify-center transition hover:opacity-70"
                  style={{ border: "1px solid var(--sg-border)", borderRadius: 999, color: "var(--sg-text-muted)" }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <rect x="2" y="2" width="20" height="20" rx="5" />
                    <circle cx="12" cy="12" r="4" />
                    <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" />
                  </svg>
                </a>
              </div>
            </div>

            <div>
              <div className="eyebrow mb-4">SECTIONS</div>
              <div className="flex flex-col gap-2.5">
                {NAV_LINKS.map(l => (
                  <Link key={l.href} href={l.href}
                    className="mono u-link transition hover:opacity-80"
                    style={{ fontSize: 11, letterSpacing: "0.12em", color: "var(--sg-text-secondary)" }}>
                    {l.label}
                  </Link>
                ))}
              </div>
            </div>

            <div>
              <div className="eyebrow mb-4">PLATFORM</div>
              <div className="flex flex-col gap-2.5">
                {policyKeys.map(key => (
                  <button key={key} onClick={() => setOpen(key)}
                    className="mono u-link text-left transition hover:opacity-80"
                    style={{ fontSize: 11, letterSpacing: "0.12em", color: "var(--sg-text-secondary)", background: "none", border: "none", padding: 0 }}>
                    {POLICIES[key].title.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="eyebrow mb-4">FOLLOW</div>
              <div className="flex flex-col gap-2.5">
                {[
                  { href: "https://x.com/ScoutGamer", label: "X / TWITTER" },
                  { href: "https://instagram.com", label: "INSTAGRAM" },
                ].map(l => (
                  <a key={l.href} href={l.href} target="_blank" rel="noopener noreferrer"
                    className="mono u-link transition hover:opacity-80"
                    style={{ fontSize: 11, letterSpacing: "0.12em", color: "var(--sg-text-secondary)" }}>
                    {l.label}
                  </a>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-14 pt-6 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center"
            style={{ borderTop: "1px solid var(--sg-border)" }}>
            <span className="mono" style={{ fontSize: 10, letterSpacing: "0.12em", color: "var(--sg-text-muted)" }}>
              © 2026 SCOUTGAMER.COM · ALL RIGHTS RESERVED
            </span>
          </div>
        </div>
      </footer>

      {open && policy && (
        <>
          <div className="fixed inset-0 z-[998]"
            style={{ background: "oklch(0.13 0.012 240 / 0.7)", backdropFilter: "blur(4px)" }}
            onClick={() => setOpen(null)} />
          <div className="fixed right-0 top-0 bottom-0 z-[999] w-full max-w-md flex flex-col overflow-hidden"
            style={{ background: "var(--sg-surface-low)", borderLeft: "1px solid var(--sg-border)" }}>
            <div className="flex items-center justify-between px-6 py-5" style={{ borderBottom: "1px solid var(--sg-border)" }}>
              <div>
                <div className="h-[2px] w-8 mb-2" style={{ background: "var(--accent)" }} />
                <h2 className="display" style={{ fontSize: 16, fontWeight: 700 }}>{policy.title}</h2>
              </div>
              <button onClick={() => setOpen(null)}
                className="flex h-8 w-8 items-center justify-center transition hover:opacity-70"
                style={{ border: "1px solid var(--sg-border)", borderRadius: 999, color: "var(--sg-text-muted)", background: "transparent" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-6">
              <div className="text-sm leading-relaxed whitespace-pre-line" style={{ color: "var(--sg-text-secondary)", fontFamily: "var(--font-body)" }}>
                {policy.content}
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
