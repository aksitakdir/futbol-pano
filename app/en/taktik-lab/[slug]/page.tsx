import type { Metadata } from "next";
import { articleMetadata } from "@/lib/article-metadata";
import EnTaktikLabDetailClient from "./client";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return articleMetadata(slug, `/en/taktik-lab/${slug}`, "en");
}

export default async function EnTaktikLabDetailPage({ params }: Props) {
  const { slug } = await params;
  return <EnTaktikLabDetailClient slug={slug} />;
}
