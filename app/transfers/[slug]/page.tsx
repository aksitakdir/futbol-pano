import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { articleMetadata } from "@/lib/article-metadata";
import { categoryArticlePath } from "@/lib/category-config";
import { articleJsonLd } from "@/lib/article-jsonld";
import HubArticleDetailClient from "@/app/components/hub-article-detail-client";

type Props = { params: Promise<{ slug: string }> };

// Daily, not hourly: article text only changes when we edit it, and the admin
// save path already calls revalidatePath, so edits still publish immediately.
// At 3600 these ~119 pages were regenerating 24x a day for no content change.
export const revalidate = 86400;

export async function generateStaticParams() {
  const supabase = createClient();
  const { data } = await supabase
    .from("contents")
    .select("slug")
    .eq("status", "published")
    .eq("category", "transfer");
  return (data ?? []).map((r) => ({ slug: r.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return articleMetadata(slug, `/transfers/${slug}`);
}

export default async function TransferHubArticlePage({ params }: Props) {
  const { slug } = await params;
  const supabase = createClient();
  const { data, error } = await supabase
    .from("contents")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (error || !data) notFound();

  if (data.category !== "transfer") {
    redirect(categoryArticlePath(data.category, data.slug));
  }

  const jsonLd = articleJsonLd(data, `/transfers/${slug}`);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <HubArticleDetailClient slug={slug} hubId="transfer" article={data} />
    </>
  );
}
