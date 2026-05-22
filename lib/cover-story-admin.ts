import type { CoverStoryScope } from "@/lib/cover-story";

const ADMIN_PASSWORD = "scout2026";

export async function fetchCoverStoryPinsFromApi(): Promise<Record<string, string>> {
  const res = await fetch("/api/cover-stories", { cache: "no-store" });
  if (!res.ok) return {};
  const data = (await res.json()) as { pins?: Record<string, string> };
  return data.pins ?? {};
}

export async function saveCoverStoryPinsViaApi(
  contentId: string,
  category: string,
  scopes: CoverStoryScope[],
): Promise<{ ok: boolean; error?: string }> {
  const res = await fetch("/api/cover-stories", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
    body: JSON.stringify({
      adminPassword: ADMIN_PASSWORD,
      contentId,
      category,
      scopes,
    }),
  });
  const data = (await res.json()) as { error?: string };
  if (!res.ok) return { ok: false, error: data.error ?? "Cover story save failed" };
  return { ok: true };
}
