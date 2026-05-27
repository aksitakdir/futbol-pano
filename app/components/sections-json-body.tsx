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
          const Tag = sec.style === "ol" ? "ol" : "ul";
          return (
            <Tag key={i} style={{ margin: "20px 0", paddingLeft: 24, lineHeight: 1.7 }}>
              {sec.items
                .filter((item) => item.trim())
                .map((item, j) => (
                  <li key={j}>{item}</li>
                ))}
            </Tag>
          );
        }
        return null;
      })}
    </>
  );
}
