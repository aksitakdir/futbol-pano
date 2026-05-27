import type { Metadata } from "next";
import type { ReactNode } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const { data } = await supabase.from("contents").select("title,content,cover_image").eq("slug", slug).eq("status", "published").single();
  if (!data) return { title: "Radar | Scout Gamer" };
  const description = data.content?.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 160) ?? "";
  return {
    title: `${data.title} | Scout Gamer`,
    description,
    alternates: {
      canonical: `https://www.scoutgamer.com/radar/${slug}`,
    },
    openGraph: {
      title: `${data.title} | Scout Gamer`,
      description,
      url: `https://www.scoutgamer.com/radar/${slug}`,
      images: data.cover_image ? [{ url: data.cover_image }] : [{ url: "https://www.scoutgamer.com/og-image.png" }],
    },
    twitter: { card: "summary_large_image", title: `${data.title} | Scout Gamer`, description },
  };
}

export default function Layout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
