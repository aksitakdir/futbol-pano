import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { articleMetadata } from "@/lib/article-metadata";
import { categoryArticlePath } from "@/lib/category-config";
import HubArticleDetailClient from "@/app/components/hub-article-detail-client";

type Props = { params: Promise<{ slug: string }> };

export const revalidate = 3600;

export async function generateStaticParams() {
  const supabase = createClient();
  const { data } = await supabase
    .from("contents")
    .select("slug")
    .eq("status", "published")
    .eq("category", "wc-2026");
  return (data ?? []).map((r) => ({ slug: r.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return articleMetadata(slug, `/world-cup-2026/${slug}`);
}

export default async function WcHubArticlePage({ params }: Props) {
  const { slug } = await params;
  const supabase = createClient();
  const { data, error } = await supabase
    .from("contents")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  if (error || !data) notFound();

  if (data.category !== "wc-2026") {
    redirect(categoryArticlePath(data.category, data.slug));
  }

  return <HubArticleDetailClient slug={slug} hubId="wc-2026" article={data} />;
}
