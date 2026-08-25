import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { draftMode } from "next/headers";
import { createClient } from "@/lib/supabase";
import { articleMetadata } from "@/lib/article-metadata";
import { categoryArticlePath } from "@/lib/category-config";
import { articleJsonLd } from "@/lib/article-jsonld";
import ListDetailClient from "./client";

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
    .eq("category", "lists");
  return (data ?? []).map((r) => ({ slug: r.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return articleMetadata(slug, `/lists/${slug}`);
}

export default async function ListDetailPage({ params }: Props) {
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

  if (data.category !== "lists") {
    redirect(categoryArticlePath(data.category, data.slug));
  }

  const jsonLd = articleJsonLd(data, `/lists/${slug}`);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ListDetailClient slug={slug} article={data} />
    </>
  );
}
