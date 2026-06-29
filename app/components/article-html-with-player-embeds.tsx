"use client";

import ArticlePlayerEmbed from "./article-player-embed";
import { htmlContainsPlayerEmbed, splitHtmlWithPlayerEmbeds } from "@/lib/split-player-embeds";

type Props = {
  html: string;

};

/**
 * Splits and renders cards embedded as <!-- scout-player:Name --> within processedHtml or raw HTML.
 */
export default function ArticleHtmlWithPlayerEmbeds({ html }: Props) {
  if (!htmlContainsPlayerEmbed(html)) {
    return <div dangerouslySetInnerHTML={{ __html: html }} />;
  }
  const segments = splitHtmlWithPlayerEmbeds(html);
  return (
    <>
      {segments.map((seg, i) =>
        seg.kind === "html" ? (
          seg.html ? <div key={`h-${i}`} dangerouslySetInnerHTML={{ __html: seg.html }} /> : null
        ) : (
          <ArticlePlayerEmbed key={`p-${i}-${seg.name}`} playerName={seg.name} />
        ),
      )}
    </>
  );
}
