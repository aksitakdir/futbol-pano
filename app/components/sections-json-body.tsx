"use client";

import ArticleHtmlWithPlayerEmbeds from "./article-html-with-player-embeds";
import ArticlePlayerEmbed from "./article-player-embed";
import { headingToId, plainTextToHtml, type SectionBlock } from "@/lib/section-blocks";
import { normalizeYoutubeId } from "@/lib/youtube-id";

type Props = {
  sections: SectionBlock[];
  accent: string;
  locale?: "en" | "tr";
  addDropCap?: (html: string, accent: string) => string;
};

export default function SectionsJsonBody({
  sections,
  accent,
  locale = "en",
  addDropCap = (html) => html,
}: Props) {
  // Pre-compute section indices for numbered rendering (01, 02, 03)
  const sectionIndices = new Map<number, number>();
  let sectionCount = 0;
  sections.forEach((sec, i) => {
    if (sec.type === "section") {
      sectionCount++;
      sectionIndices.set(i, sectionCount);
    }
  });

  return (
    <>
      {sections.map((sec, i) => {
        if (sec.type === "intro") {
          return (
            <ArticleHtmlWithPlayerEmbeds
              key={i}
              html={addDropCap(sec.html, accent)}
              locale={locale}
            />
          );
        }
        if (sec.type === "plain") {
          const html = plainTextToHtml(sec.text);
          if (!html) return null;
          return <ArticleHtmlWithPlayerEmbeds key={i} html={html} locale={locale} />;
        }
        if (sec.type === "header") {
          const id = headingToId(sec.heading);
          const Tag = sec.level === 3 ? "h3" : "h2";
          return (
            <Tag key={i} id={id}>
              {sec.heading}
            </Tag>
          );
        }

        /* ── Section block: numbered editorial sections (01, 02, 03) ── */
        if (sec.type === "section") {
          const id = headingToId(sec.heading);
          const idx = sectionIndices.get(i) ?? 1;
          const num = String(idx).padStart(2, "0");
          return (
            <div key={i} style={{ margin: "40px 0" }}>
              {/* Amber top divider line */}
              <div
                style={{
                  height: 1,
                  background: "linear-gradient(90deg, var(--amber), var(--amber) 60%, transparent)",
                  opacity: 0.35,
                  marginBottom: 32,
                }}
              />
              <div style={{ display: "flex", gap: 20, alignItems: "flex-start" }}>
                {/* Coral number */}
                <span
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: 36,
                    fontWeight: 700,
                    lineHeight: 1,
                    color: "var(--rose)",
                    letterSpacing: "-0.02em",
                    flexShrink: 0,
                    marginTop: 2,
                  }}
                >
                  {num}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  {sec.heading ? (
                    <h3
                      id={id}
                      style={{
                        fontFamily: "var(--font-display)",
                        fontSize: 22,
                        fontWeight: 700,
                        color: "var(--sg-text-primary)",
                        margin: "0 0 12px",
                        lineHeight: 1.2,
                        letterSpacing: "-0.01em",
                        border: "none",
                        padding: 0,
                      }}
                    >
                      {sec.heading}
                    </h3>
                  ) : null}
                  {sec.html ? (
                    <div style={{ color: "var(--sg-text-secondary)", lineHeight: 1.7, fontSize: 17 }}>
                      <ArticleHtmlWithPlayerEmbeds html={sec.html} locale={locale} />
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          );
        }

        /* ── Pullquote: centered cyan italic with amber dividers ── */
        if (sec.type === "pullquote") {
          return <blockquote key={i}>{"“"}{sec.text}{"”"}</blockquote>;
        }

        /* ── Callout: coral-accent info box ── */
        if (sec.type === "callout") {
          return (
            <div key={i} className="callout">
              <ArticleHtmlWithPlayerEmbeds html={sec.html} locale={locale} />
            </div>
          );
        }

        if (sec.type === "youtube") {
          const videoId = normalizeYoutubeId(sec.url);
          if (!videoId) return null;
          return (
            <div
              key={i}
              style={{
                position: "relative",
                aspectRatio: "16 / 9",
                margin: "32px 0",
                borderRadius: 8,
                overflow: "hidden",
                border: "1px solid var(--sg-border)",
              }}
            >
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${videoId}`}
                title="YouTube video"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
                style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: "none" }}
              />
            </div>
          );
        }

        if (sec.type === "player") {
          return <ArticlePlayerEmbed key={i} playerName={sec.name} locale={locale} />;
        }

        if (sec.type === "image") {
          return (
            <figure key={i} className="article-image-block">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={sec.src} alt={sec.alt || ""} loading="lazy" />
              {sec.caption ? <figcaption>{sec.caption}</figcaption> : null}
            </figure>
          );
        }

        /* ── Lists ── */
        if (sec.type === "list") {
          /* Ordered list: coral numbered items matching editorial style */
          if (sec.style === "ol") {
            return (
              <div key={i} style={{ margin: "24px 0", display: "flex", flexDirection: "column", gap: 14 }}>
                {sec.items
                  .filter((item) => item.trim())
                  .map((item, j) => (
                    <div
                      key={j}
                      style={{ display: "flex", gap: 14, alignItems: "flex-start" }}
                    >
                      <span
                        style={{
                          fontFamily: "var(--font-display)",
                          fontSize: 20,
                          fontWeight: 700,
                          color: "var(--rose)",
                          lineHeight: 1.65,
                          flexShrink: 0,
                          minWidth: 28,
                        }}
                      >
                        {String(j + 1).padStart(2, "0")}
                      </span>
                      <span style={{ lineHeight: 1.65, color: "var(--sg-text-secondary)" }}>{item}</span>
                    </div>
                  ))}
              </div>
            );
          }
          // Styled unordered list with accent-colored bullets
          return (
            <ul
              key={i}
              style={{
                margin: "24px 0",
                paddingLeft: 0,
                listStyle: "none",
                display: "flex",
                flexDirection: "column",
                gap: 10,
              }}
            >
              {sec.items
                .filter((item) => item.trim())
                .map((item, j) => (
                  <li
                    key={j}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 12,
                      lineHeight: 1.65,
                    }}
                  >
                    <span
                      style={{
                        display: "inline-block",
                        width: 7,
                        height: 7,
                        borderRadius: "50%",
                        background: "var(--rose)",
                        marginTop: 8,
                        flexShrink: 0,
                        opacity: 0.85,
                      }}
                    />
                    <span>{item}</span>
                  </li>
                ))}
            </ul>
          );
        }

        /* ── VS block: two-column comparison ── */
        if (sec.type === "vs") {
          const col = (side: typeof sec.left, accentColor: string) => (
            <div
              style={{
                flex: 1,
                minWidth: 0,
                background: "var(--sg-surface)",
                border: "1px solid color-mix(in oklch, var(--rose) 30%, transparent)",
                borderTop: `3px solid ${accentColor}`,
                borderRadius: 12,
                padding: "22px 20px",
              }}
            >
              <p style={{
                margin: "0 0 14px",
                fontWeight: 700,
                fontSize: 18,
                color: "var(--sg-text-primary)",
                fontFamily: "var(--font-display)",
              }}>
                {side.title}
              </p>
              <ul style={{ margin: 0, padding: 0, listStyle: "none", lineHeight: 1.7, color: "var(--sg-text-secondary)" }}>
                {side.items.filter((it) => it.trim()).map((it, j) => (
                  <li key={j} style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 6 }}>
                    <span style={{
                      width: 5, height: 5, borderRadius: "50%",
                      background: accentColor, marginTop: 9, flexShrink: 0,
                    }} />
                    <span>{it}</span>
                  </li>
                ))}
              </ul>
            </div>
          );
          return (
            <div key={i} style={{ margin: "36px 0" }}>
              <div style={{ display: "flex", gap: 16, alignItems: "stretch", flexWrap: "wrap" }}>
                {col(sec.left, "var(--rose)")}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    fontWeight: 800,
                    fontSize: 13,
                    letterSpacing: "0.12em",
                    color: "var(--sg-text-muted)",
                    fontFamily: "var(--font-mono-stack)",
                  }}
                >
                  VS
                </div>
                {col(sec.right, "var(--amber)")}
              </div>
            </div>
          );
        }

        /* ── Stat highlight: coral bordered container with title + big numbers ── */
        if (sec.type === "stat-highlight") {
          return (
            <div
              key={i}
              style={{
                margin: "36px 0",
                border: "1px solid color-mix(in oklch, var(--rose) 50%, transparent)",
                borderRadius: 14,
                padding: "28px 32px",
                background: "var(--sg-surface)",
              }}
            >
              {/* Title */}
              {sec.title ? (
                <p
                  style={{
                    margin: "0 0 20px",
                    fontFamily: "var(--font-mono-stack)",
                    fontSize: 12,
                    fontWeight: 600,
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                    color: "var(--rose)",
                  }}
                >
                  {sec.title}
                </p>
              ) : null}
              {/* Stats row */}
              <div
                style={{
                  display: "flex",
                  gap: 24,
                  flexWrap: "wrap",
                  justifyContent: sec.stats.length <= 3 ? "space-around" : "center",
                }}
              >
                {sec.stats.map((s, j) => (
                  <div
                    key={j}
                    style={{
                      flex: "1 1 120px",
                      maxWidth: 240,
                      textAlign: sec.stats.length <= 3 ? "left" : "center",
                    }}
                  >
                    <p
                      style={{
                        margin: 0,
                        fontSize: "clamp(40px, 5vw, 60px)",
                        fontWeight: 900,
                        lineHeight: 1,
                        letterSpacing: "-0.03em",
                        color: "var(--sg-text-primary)",
                        fontFamily: "var(--font-display)",
                      }}
                    >
                      {s.value}
                    </p>
                    <p
                      style={{
                        margin: "10px 0 0",
                        fontSize: 11,
                        fontWeight: 600,
                        textTransform: "uppercase",
                        letterSpacing: "0.1em",
                        color: "var(--sg-text-muted)",
                        fontFamily: "var(--font-mono-stack)",
                      }}
                    >
                      {s.label}
                    </p>
                    {s.note ? (
                      <p
                        style={{
                          margin: "6px 0 0",
                          fontSize: 12,
                          lineHeight: 1.5,
                          color: "var(--sg-text-muted)",
                          opacity: 0.7,
                        }}
                      >
                        {s.note}
                      </p>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>
          );
        }

        /* ── Divider: amber/gold gradient line ── */
        if (sec.type === "divider") {
          const dividerStyle = sec.style ?? "default";
          if (dividerStyle === "dots") {
            return (
              <div
                key={i}
                style={{
                  display: "flex",
                  justifyContent: "center",
                  gap: 10,
                  margin: "40px 0",
                }}
              >
                {[0, 1, 2].map((d) => (
                  <div
                    key={d}
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      background: "var(--amber)",
                      opacity: 0.6,
                    }}
                  />
                ))}
              </div>
            );
          }
          if (dividerStyle === "gradient") {
            return (
              <div
                key={i}
                style={{
                  margin: "40px 0",
                  height: 2,
                  borderRadius: 2,
                  background: "linear-gradient(90deg, transparent 2%, var(--amber) 20%, var(--amber) 80%, transparent 98%)",
                  opacity: 0.6,
                }}
              />
            );
          }
          // default divider — amber line
          return (
            <div
              key={i}
              style={{
                margin: "40px 0",
                height: 1,
                background: "linear-gradient(90deg, var(--amber), var(--amber) 60%, transparent)",
                opacity: 0.4,
              }}
            />
          );
        }

        if (sec.type === "faq") {
          const valid = sec.items.filter((it) => it.q.trim() && it.a.trim());
          if (valid.length === 0) return null;
          const faqId = sec.heading ? headingToId(sec.heading) : undefined;
          const schema = {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: valid.map((it) => ({
              "@type": "Question",
              name: it.q.trim(),
              acceptedAnswer: { "@type": "Answer", text: it.a.trim() },
            })),
          };
          return (
            <div key={i} style={{ margin: "32px 0" }}>
              {sec.heading?.trim() ? <h2 id={faqId}>{sec.heading}</h2> : null}
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {valid.map((it, j) => (
                  <details
                    key={j}
                    style={{
                      background: "var(--sg-surface)",
                      border: "1px solid var(--sg-border)",
                      borderRadius: 10,
                      padding: "14px 16px",
                    }}
                  >
                    <summary style={{ cursor: "pointer", fontWeight: 600, color: "var(--sg-text-primary)" }}>
                      {it.q}
                    </summary>
                    <p style={{ margin: "10px 0 0", lineHeight: 1.65, color: "var(--sg-text-secondary)" }}>
                      {it.a}
                    </p>
                  </details>
                ))}
              </div>
              {/* FAQ structured data for rich results */}
              <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
            </div>
          );
        }
        return null;
      })}
    </>
  );
}
