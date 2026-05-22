import type { Metadata } from "next";
import { articleMetadata } from "@/lib/article-metadata";
import HubArticleDetailClient from "@/app/components/hub-article-detail-client";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return articleMetadata(slug, `/transfers/${slug}`, "en");
}

export default async function TransferHubArticlePage({ params }: Props) {
  const { slug } = await params;
  return <HubArticleDetailClient slug={slug} hubId="transfer" />;
}
