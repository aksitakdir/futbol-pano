import Link from "next/link";
import type { RelatedLinks } from "@/lib/related-articles";

/**
 * The "More in <section>" band at the end of an article. Hook-free and fed by props
 * chosen on the server (lib/related-articles.ts), so it renders into the article's
 * HTML even inside the client article layouts. data-related lets scripts/seo-check.mjs
 * find it.
 */
export default function MoreInSection({ related, accent }: { related: RelatedLinks; accent: string }) {
  if (related.items.length === 0) return null;
  return (
    <nav aria-label={`More in ${related.label}`} data-related="section" style={{ borderTop: "1px solid var(--sg-border)", background: "var(--sg-surface-low, var(--sg-bg))" }}>
      <div className="sg-site-container" style={{ paddingTop: 48, paddingBottom: 56 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 16, marginBottom: 24 }}>
          <h2 className="mono" style={{ fontSize: 10, letterSpacing: "0.2em", color: accent, margin: 0, fontWeight: 400, textTransform: "uppercase" }}>
            More in {related.label}
          </h2>
          <Link href={related.hubHref} className="mono u-link" style={{ fontSize: 10, letterSpacing: "0.16em", color: "var(--sg-text-muted)", textTransform: "uppercase" }}>
            All {related.label} →
          </Link>
        </div>
        <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 280px), 1fr))", gap: 16 }}>
          {related.items.map((item) => (
            <li key={item.id} style={{ minWidth: 0 }}>
              <Link
                href={item.href}
                className="lift"
                style={{ background: "var(--sg-surface)", border: "1px solid var(--sg-border)", borderRadius: 6, padding: 20, textDecoration: "none", display: "block", height: "100%" }}
              >
                <div className="mono" style={{ fontSize: 9, color: "var(--sg-text-muted)", letterSpacing: "0.1em", marginBottom: 10 }}>{item.dateShort}</div>
                <div className="display" style={{ fontSize: 16, fontWeight: 600, color: "var(--sg-text-primary)", lineHeight: 1.3, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                  {item.title}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
