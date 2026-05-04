import type { Metadata } from "next";
import { articleMetadata } from "@/lib/article-metadata";
import EnRadarDetailClient from "./client";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return articleMetadata(slug, `/en/radar/${slug}`, "en");
}

export default async function EnRadarDetailPage({ params }: Props) {
  const { slug } = await params;
  return <EnRadarDetailClient slug={slug} />;
}
