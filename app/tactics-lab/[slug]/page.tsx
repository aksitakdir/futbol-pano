import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { articleMetadata } from "@/lib/article-metadata";
import { categoryArticlePath } from "@/lib/category-config";
import TaktikLabDetailClient from "./client";

type Props = { params: Promise<{ slug: string }> };

export const revalidate = 3600;

export async function generateStaticParams() {
  const supabase = createClient();
  const { data } = await supabase
    .from("contents")
    .select("slug")
    .eq("status", "published")
    .eq("category", "tactics-lab");
  return (data ?? []).map((r) => ({ slug: r.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return articleMetadata(slug, `/tactics-lab/${slug}`);
}

export default async function TaktikLabDetailPage({ params }: Props) {
  const { slug } = await params;
  const supabase = createClient();
  const { data, error } = await supabase
    .from("contents")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  if (error || !data) notFound();

  if (data.category !== "tactics-lab") {
    redirect(categoryArticlePath(data.category, data.slug));
  }

  return <TaktikLabDetailClient slug={slug} article={data} />;
}
