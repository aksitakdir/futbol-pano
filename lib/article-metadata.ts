import type { Metadata } from "next";
import { createClient } from "./supabase";

function plainText(html: string): string {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/[#*_\n]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export async function articleMetadata(
  slug: string,
  urlPath: string,
): Promise<Metadata> {
  try {
    const supabase = createClient();
    const { data } = await supabase
      .from("contents")
      .select("title,title_en,content,content_en,cover_image,created_at")
      .eq("slug", slug)
      .eq("status", "published")
      .maybeSingle();

    if (!data) return { title: "Not Found" };

    const title = data.title_en || data.title;
    const raw = data.content_en || data.content;
    const description = plainText(raw).slice(0, 160);
    const url = `https://www.scoutgamer.com${urlPath}`;
    const ogImage = data.cover_image || "https://www.scoutgamer.com/og-image.png";

    return {
      title,
      description,
      alternates: { canonical: url },
      openGraph: {
        type: "article",
        title: `${title} | Scout Gamer`,
        description,
        url,
        siteName: "Scout Gamer",
        locale: "en_US",
        images: [{ url: ogImage, alt: title }],
        publishedTime: data.created_at,
      },
      twitter: {
        card: "summary_large_image",
        title: `${title} | Scout Gamer`,
        description,
        images: [ogImage],
      },
    };
  } catch {
    return { title: "Scout Gamer" };
  }
}
