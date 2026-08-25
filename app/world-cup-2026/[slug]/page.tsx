import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { draftMode } from "next/headers";
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
    .eq("category", "wc-2026");
  return (data ?? []).map((r) => ({ slug: r.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return articleMetadata(slug, `/world-cup-2026/${slug}`);
}

export default async function WcHubArticlePage({ params }: Props) {
  const { slug } = await params;
  const { isEnabled: isDraft } = await draftMode();
  const supabase = createClient();
  // The public only ever sees published articles. Draft mode — set by
  // /api/preview for an authenticated admin — lifts the filter so a pending
  // piece can be reviewed at its real URL before it goes live.
  let query = supabase.from("contents").select("*").eq("slug", slug);
  if (!isDraft) query = query.eq("status", "published");
  const { data, error } = await query.maybeSingle();

  if (error || !data) notFound();

  if (data.category !== "wc-2026") {
    redirect(categoryArticlePath(data.category, data.slug));
  }

  const jsonLd = articleJsonLd(data, `/world-cup-2026/${slug}`);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <HubArticleDetailClient slug={slug} hubId="wc-2026" article={data} />
    </>
  );
}
