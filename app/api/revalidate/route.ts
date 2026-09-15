import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { isAdminRequest } from "@/lib/admin-auth";

/**
 * Drops the ISR cache for one or more paths.
 *
 * Article pages are prerendered with `revalidate = 86400`, and Vercel's ISR cache
 * survives a deploy — that is what froze a 404 in place for eighteen days. The admin
 * panel handles this already: `updateContent` calls `revalidatePath` in the same
 * server action that writes the row. `scripts/scout-publish.mjs` does not, because it
 * writes straight to Supabase from a terminal, so an article corrected by script kept
 * serving the old HTML for up to a day with nothing to say why. This is the hook the
 * script was missing.
 *
 * Authenticated exactly like /api/preview — the `sg_admin` cookie or Basic Auth — so
 * it needs no secret of its own. The proxy only guards /admin pages, never /api.
 */
export async function POST(request: NextRequest) {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let paths: unknown;
  try {
    ({ paths } = await request.json());
  } catch {
    return NextResponse.json({ error: "Body must be JSON" }, { status: 400 });
  }

  // Same-origin paths only, and a hard cap: this is a cache-busting tool, not a way
  // to ask the server to regenerate the whole site in one request.
  const list = (Array.isArray(paths) ? paths : [paths])
    .filter((p): p is string => typeof p === "string")
    .map((p) => p.trim())
    .filter((p) => p.startsWith("/") && !p.startsWith("//"))
    .slice(0, 20);

  if (list.length === 0) {
    return NextResponse.json({ error: "No valid paths" }, { status: 400 });
  }

  for (const p of list) revalidatePath(p);
  return NextResponse.json({ ok: true, revalidated: list });
}
