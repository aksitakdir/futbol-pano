import { createClient } from "@/lib/supabase";
import { articleExcerpt } from "@/lib/article-excerpt";
import { RETIRED_CATEGORY, RETIRED_IDS_FILTER } from "@/lib/retired-content.mjs";

const BASE = "https://www.scoutgamer.com";

const CAT_PATHS: Record<string, string> = {
  radar: "radar",
  lists: "lists",
  "tactics-lab": "tactics-lab",
  transfer: "transfers",
};

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET() {
  const supabase = createClient();

  const { data: articles } = await supabase
    .from("contents")
    .select("title,title_en,slug,category,content,content_en,created_at,cover_image")
    .eq("status", "published")
    // Retired World Cup rows answer 308/410 (lib/retired-content.mjs); filtered in the
    // query, not after it, so the feed still carries 30 items.
    .neq("category", RETIRED_CATEGORY)
    .not("id", "in", RETIRED_IDS_FILTER)
    .order("created_at", { ascending: false })
    .limit(30);

  const items = (articles ?? [])
    .map((a) => {
      const catPath = CAT_PATHS[a.category];
      if (!catPath) return null;
      const title = a.title_en || a.title;
      const body = a.content_en || a.content || "";
      const description = articleExcerpt(body, { max: 280 });
      const url = `${BASE}/${catPath}/${a.slug}`;
      const pubDate = new Date(a.created_at).toUTCString();
      const coverImage = a.cover_image?.trim();

      return `    <item>
      <title>${escapeXml(title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <description>${escapeXml(description)}</description>
      <pubDate>${pubDate}</pubDate>
      <category>${escapeXml(a.category)}</category>${
        coverImage
          ? `\n      <enclosure url="${escapeXml(coverImage)}" type="image/jpeg" length="0" />`
          : ""
      }
    </item>`;
    })
    .filter(Boolean);

  const lastBuildDate = articles?.length
    ? new Date(articles[0].created_at).toUTCString()
    : new Date().toUTCString();

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>ScoutGamer</title>
    <link>${BASE}</link>
    <description>Football scouting, tactics, transfers and young-talent lists</description>
    <language>en</language>
    <lastBuildDate>${lastBuildDate}</lastBuildDate>
    <atom:link href="${BASE}/feed" rel="self" type="application/rss+xml" />
${items.join("\n")}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=600",
    },
  });
}
