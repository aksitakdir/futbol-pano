import type { Metadata } from "next";
import { articleMetadata } from "@/lib/article-metadata";
import ListDetailClient from "./client";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return articleMetadata(slug, `/listeler/${slug}`, "tr");
}

export default async function ListDetailPage({ params }: Props) {
  const { slug } = await params;
  return <ListDetailClient slug={slug} />;
}
