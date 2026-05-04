import type { Metadata } from "next";
import { articleMetadata } from "@/lib/article-metadata";
import RadarDetailClient from "./client";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return articleMetadata(slug, `/radar/${slug}`, "tr");
}

export default async function RadarDetailPage({ params }: Props) {
  const { slug } = await params;
  return <RadarDetailClient slug={slug} />;
}
