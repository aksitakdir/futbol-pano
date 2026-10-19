import Link from "next/link";
import { ContentHighlightPills } from "./content-highlight-pills";
import type { HubCard } from "@/lib/hub-cards";

/**
 * The article card on the section hubs and /articles. Rendered on the server (no
 * hooks), so its link, title and pills are in the raw HTML. Replaces four
 * near-identical copies that lived inside the old client pages.
 */
export default function HubArticleCard({
  card,
  accent,
  label,
  variant = "hub",
}: {
  card: HubCard;
  accent: string;
  label: string;
  /** "browse" is the denser card on /articles. */
  variant?: "hub" | "browse";
}) {
  const browse = variant === "browse";
  return (
    <Link
      href={card.href}
      className="lift"
      style={{ background: "var(--sg-surface)", border: "1px solid var(--sg-border)", borderRadius: browse ? 8 : 12, overflow: "hidden", display: "flex", flexDirection: "column", textDecoration: "none" }}
    >
      <div style={{ position: "relative", height: browse ? 150 : 140, overflow: "hidden" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={card.image} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", filter: "brightness(0.65) saturate(0.85)" }} loading="lazy" />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, var(--sg-surface) 0%, transparent 60%)" }} />
      </div>
      <div style={{ padding: browse ? "14px 20px 20px" : "16px 20px 24px", flex: 1, display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: browse ? 10 : 14 }}>
          <span className="mono" style={{ fontSize: 9, letterSpacing: "0.2em", color: accent }}>{label}</span>
          <span className="mono" style={{ fontSize: 9, letterSpacing: "0.14em", color: "var(--sg-text-muted)", display: "flex", gap: 8, alignItems: "center" }}>
            {card.draft && !browse ? <span style={{ color: "var(--amber)", fontSize: 8 }}>DRAFT</span> : null}
            <span>{card.dateShort}</span>
          </span>
        </div>
        <h3 className="display" style={{ fontSize: browse ? 17 : 18, fontWeight: 600, lineHeight: 1.2, letterSpacing: "-0.02em", margin: 0, textWrap: "balance", color: "var(--sg-text-primary)", flex: 1 }}>
          {card.title}
        </h3>
        <div style={{ marginTop: "auto", paddingTop: browse ? 14 : 16, borderTop: "1px solid var(--sg-border)" }}>
          {card.pills.length > 0 ? <ContentHighlightPills tags={card.pills.slice(0, 4)} accent={accent} label="HIGHLIGHTS" /> : null}
          <span className="mono u-link" style={{ fontSize: browse ? 10 : 11, letterSpacing: "0.16em", color: accent, display: "block", marginTop: card.pills.length ? (browse ? 10 : 12) : 0 }}>READ →</span>
        </div>
      </div>
    </Link>
  );
}
