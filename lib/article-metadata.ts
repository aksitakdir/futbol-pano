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
  lang: "tr" | "en" = "tr",
): Promise<Metadata> {
  try {
    const supabase = createClient();
    const { data } = await supabase
      .from("contents")
      .select("title,title_en,content,content_en,cover_image,created_at")
      .eq("slug", slug)
      .eq("status", "yayinda")
      .maybeSingle();

    if (!data) return { title: lang === "en" ? "Not Found" : "Bulunamadı" };

    const title = lang === "en" ? (data.title_en || data.title) : data.title;
    const raw = lang === "en" ? (data.content_en || data.content) : data.content;
    const description = plainText(raw).slice(0, 160);
    const url = `https://scoutgamer.com${urlPath}`;
    const ogImage = data.cover_image || "https://scoutgamer.com/og-image.png";

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
        locale: lang === "en" ? "en_US" : "tr_TR",
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
