import Link from "next/link";
import type { SpotlightCard } from "@/lib/home-spotlights";

/**
 * The homepage "In focus" block. Which cards appear, and what they link to, is
 * decided server-side in lib/home-spotlights.ts: only contexts that are live
 * right now, so a finished tournament or a closed window drops off by itself.
 */
export default function HomeHubPromo({ spotlights }: { spotlights: SpotlightCard[] }) {
  if (spotlights.length === 0) return null;
  return (
    <section style={{ borderTop: "1px solid var(--sg-border)", background: "var(--sg-surface-low)" }}>
      <div className="sg-editorial-shell" style={{ paddingTop: 72, paddingBottom: 72 }}>
        <div className="eyebrow" style={{ marginBottom: 28 }}>IN FOCUS</div>
        <div className={`grid grid-cols-1 gap-8 ${spotlights.length > 1 ? "lg:grid-cols-2" : ""}`} style={{ alignItems: "stretch" }}>
          {spotlights.map((s) => (
            <HubCard
              key={s.id}
              accent={s.accent}
              title={s.title}
              description={s.description}
              hubHref={s.cta.href}
              cta={s.cta.label}
              articles={s.articles}
              extraLinks={s.links}
              stats={s.stats}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function HubCard({ accent, title, description, hubHref, cta, articles, extraLinks, stats }: {
  accent: string; title: string; description: string;
  hubHref: string; cta: string; articles: { title: string; href: string }[];
  extraLinks?: { href: string; label: string }[];
  stats?: { value: string; label: string }[];
}) {
  return (
    <div style={{
      border: "1px solid var(--sg-border)", borderRadius: 20,
      padding: "clamp(24px, 3vw, 36px)", background: "var(--sg-surface)",
      position: "relative", overflow: "hidden",
      display: "flex", flexDirection: "column",
    }}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: accent }} />

      <h2 className="display" style={{ fontSize: "clamp(22px, 2.5vw, 30px)", fontWeight: 700, letterSpacing: "-0.03em", margin: "0 0 12px" }}>{title}</h2>
      <p style={{ fontSize: 14, lineHeight: 1.55, color: "var(--sg-text-secondary)", margin: "0 0 20px" }}>{description}</p>

      {stats?.length ? (
        <div style={{ display: "flex", gap: 20, marginBottom: 20, paddingBottom: 16, borderBottom: "1px solid var(--sg-border)" }}>
          {stats.map((s) => (
            <div key={s.label}>
              <div className="display" style={{ fontSize: 22, fontWeight: 800, color: accent, lineHeight: 1 }}>{s.value}</div>
              <div className="mono" style={{ fontSize: 9, letterSpacing: "0.12em", color: "var(--sg-text-muted)", marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>
      ) : null}

      {articles.length > 0 ? (
        <ul style={{ listStyle: "none", margin: "0 0 20px", padding: 0 }}>
          {articles.slice(0, 3).map((a, i) => (
            <li key={a.href} style={{ marginBottom: 10 }}>
              <Link href={a.href} style={{ fontSize: 14, color: "var(--sg-text-primary)", textDecoration: "none" }} className="u-link">
                {i === 0 && <span className="mono" style={{ fontSize: 9, letterSpacing: "0.12em", color: accent, marginRight: 8 }}>Latest</span>}
                {a.title}
              </Link>
            </li>
          ))}
        </ul>
      ) : null}

      <div style={{ marginTop: "auto" }}>
        {extraLinks?.length ? (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginBottom: 16 }}>
            {extraLinks.map((el) => (
              <Link
                key={el.href}
                href={el.href}
                className="mono u-link"
                style={{ fontSize: 11, letterSpacing: "0.1em", color: accent, padding: "4px 0" }}
              >
                {el.label} →
              </Link>
            ))}
          </div>
        ) : null}
        <Link href={hubHref} className="btn btn-solid" style={{ background: accent, borderColor: accent }}>{cta} →</Link>
      </div>
    </div>
  );
}
