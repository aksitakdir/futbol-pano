"use client";

import ArticleHtmlWithPlayerEmbeds from "./article-html-with-player-embeds";
import { headingToId, plainTextToHtml, type SectionBlock } from "@/lib/section-blocks";

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
        return null;
      })}
    </>
  );
}
