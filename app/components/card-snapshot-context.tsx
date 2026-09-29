"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { ArticleCardSnapshot } from "@/lib/card-snapshot";

const CardSnapshotContext = createContext<ArticleCardSnapshot | null>(null);

/** Provides an article's frozen player cards to every card rendered inside it. */
export function CardSnapshotProvider({
  snapshot,
  children,
}: {
  snapshot: ArticleCardSnapshot | null;
  children: ReactNode;
}) {
  return <CardSnapshotContext.Provider value={snapshot}>{children}</CardSnapshotContext.Provider>;
}

export function useCardSnapshot(): ArticleCardSnapshot | null {
  return useContext(CardSnapshotContext);
}
