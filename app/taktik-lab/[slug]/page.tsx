import type { Metadata } from "next";
import { articleMetadata } from "@/lib/article-metadata";
import TaktikLabDetailClient from "./client";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return articleMetadata(slug, `/taktik-lab/${slug}`, "tr");
}

export default async function TaktikLabDetailPage({ params }: Props) {
  const { slug } = await params;
  return <TaktikLabDetailClient slug={slug} />;
}
