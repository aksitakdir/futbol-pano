import Link from "next/link";
import PageShell from "./page-shell";

type Props = {
  eyebrow: string;
  title: React.ReactNode;
  description: string;
  accent?: string;
  backHref?: string;
  backLabel?: string;
};

/** Same 2-column header grid as Radar / Listeler index pages */
export default function CategoryPageHeader({
  eyebrow,
  title,
  description,
  accent = "var(--accent)",
  backHref,
  backLabel,
}: Props) {
  return (
    <PageShell className="sg-page-shell--hero">
      {backHref && backLabel ? (
        <Link
          href={backHref}
          className="mono"
          style={{
            display: "inline-block",
            fontSize: 11,
            letterSpacing: "0.14em",
            color: "var(--sg-text-muted)",
            marginBottom: 24,
            textDecoration: "none",
          }}
        >
          {backLabel}
        </Link>
      ) : null}
      <div className="sg-page-header-grid cat-header-grid">
        <div>
          <div className="eyebrow" style={{ color: accent }}>
            {eyebrow}
          </div>
          <h1
            className="display"
            style={{
              fontSize: "clamp(40px, 7vw, 84px)",
              fontWeight: 700,
              letterSpacing: "-0.04em",
              lineHeight: 0.9,
              margin: "8px 0 0",
            }}
          >
            {title}
          </h1>
        </div>
        <p className="sg-page-header-grid__desc cat-header-right">{description}</p>
      </div>
    </PageShell>
  );
}
