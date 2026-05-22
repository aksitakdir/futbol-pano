import type { Metadata } from "next";
import { articleMetadata } from "@/lib/article-metadata";
import HubArticleDetailClient from "@/app/components/hub-article-detail-client";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return articleMetadata(slug, `/world-cup-2026/${slug}`, "en");
}

export default async function WcHubArticlePage({ params }: Props) {
  const { slug } = await params;
  return <HubArticleDetailClient slug={slug} hubId="wc-2026" />;
}
