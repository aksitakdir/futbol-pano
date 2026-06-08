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
        if (sec.type === "section") {
          const id = headingToId(sec.heading);
          return (
            <div key={i}>
              {sec.heading ? <h2 id={id}>{sec.heading}</h2> : null}
              <ArticleHtmlWithPlayerEmbeds html={sec.html} locale={locale} />
            </div>
          );
        }
        if (sec.type === "pullquote") {
          return <blockquote key={i}>{sec.text}</blockquote>;
        }
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
        if (sec.type === "list") {
          if (sec.style === "ol") {
            return (
              <ol key={i} style={{ margin: "20px 0", paddingLeft: 24, lineHeight: 1.7 }}>
                {sec.items
                  .filter((item) => item.trim())
                  .map((item, j) => (
                    <li key={j}>{item}</li>
                  ))}
              </ol>
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
                        background: `var(--accent-${accent}, var(--sg-primary))`,
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
        if (sec.type === "vs") {
          const col = (side: typeof sec.left, accentColor: string) => (
            <div
              style={{
                flex: 1,
                minWidth: 0,
                background: "var(--sg-surface)",
                border: "1px solid var(--sg-border)",
                borderTop: `3px solid ${accentColor}`,
                borderRadius: 12,
                padding: "20px 18px",
              }}
            >
              <p style={{ margin: "0 0 12px", fontWeight: 700, fontSize: 17, color: "var(--sg-text-primary)" }}>
                {side.title}
              </p>
              <ul style={{ margin: 0, paddingLeft: 18, lineHeight: 1.7, color: "var(--sg-text-secondary)" }}>
                {side.items.filter((it) => it.trim()).map((it, j) => (
                  <li key={j}>{it}</li>
                ))}
              </ul>
            </div>
          );
          return (
            <div key={i} style={{ margin: "28px 0" }}>
              <div style={{ display: "flex", gap: 14, alignItems: "stretch", flexWrap: "wrap" }}>
                {col(sec.left, "var(--sg-primary)")}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    fontWeight: 800,
                    fontSize: 14,
                    letterSpacing: "0.08em",
                    color: "var(--sg-text-muted)",
                  }}
                >
                  VS
                </div>
                {col(sec.right, "var(--sg-secondary)")}
              </div>
            </div>
          );
        }
        if (sec.type === "stat-highlight") {
          return (
            <div
              key={i}
              style={{
                display: "flex",
                gap: 16,
                flexWrap: "wrap",
                margin: "32px 0",
                justifyContent: "center",
              }}
            >
              {sec.stats.map((s, j) => (
                <div
                  key={j}
                  style={{
                    flex: "1 1 140px",
                    maxWidth: 220,
                    textAlign: "center",
                    background: "var(--sg-surface)",
                    border: "1px solid var(--sg-border)",
                    borderRadius: 14,
                    padding: "24px 18px",
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  {/* Accent glow at top */}
                  <div
                    style={{
                      position: "absolute",
                      top: 0,
                      left: "20%",
                      right: "20%",
                      height: 3,
                      borderRadius: "0 0 4px 4px",
                      background: `var(--accent-${accent}, var(--sg-primary))`,
                      opacity: 0.7,
                    }}
                  />
                  <p
                    style={{
                      margin: 0,
                      fontSize: 32,
                      fontWeight: 900,
                      lineHeight: 1.1,
                      letterSpacing: "-0.02em",
                      color: `var(--accent-${accent}, var(--sg-primary))`,
                      fontFamily: "var(--font-headline)",
                    }}
                  >
                    {s.value}
                  </p>
                  <p
                    style={{
                      margin: "8px 0 0",
                      fontSize: 13,
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                      color: "var(--sg-text-primary)",
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
                      }}
                    >
                      {s.note}
                    </p>
                  ) : null}
                </div>
              ))}
            </div>
          );
        }
        if (sec.type === "divider") {
          const dividerStyle = sec.style ?? "default";
          if (dividerStyle === "dots") {
            return (
              <div
                key={i}
                style={{
                  display: "flex",
                  justifyContent: "center",
                  gap: 8,
                  margin: "36px 0",
                }}
              >
                {[0, 1, 2].map((d) => (
                  <div
                    key={d}
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      background: `var(--accent-${accent}, var(--sg-text-muted))`,
                      opacity: 0.5,
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
                  margin: "36px auto",
                  height: 2,
                  maxWidth: 200,
                  borderRadius: 2,
                  background: `linear-gradient(90deg, transparent, var(--accent-${accent}, var(--sg-text-muted)), transparent)`,
                  opacity: 0.4,
                }}
              />
            );
          }
          // default divider
          return (
            <hr
              key={i}
              style={{
                margin: "36px 0",
                border: "none",
                height: 1,
                background: "var(--sg-border)",
                opacity: 0.6,
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
