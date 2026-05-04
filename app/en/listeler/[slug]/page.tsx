import type { Metadata } from "next";
import { articleMetadata } from "@/lib/article-metadata";
import EnListelerDetailClient from "./client";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return articleMetadata(slug, `/en/listeler/${slug}`, "en");
}

export default async function EnListelerDetailPage({ params }: Props) {
  const { slug } = await params;
  return <EnListelerDetailClient slug={slug} />;
}
