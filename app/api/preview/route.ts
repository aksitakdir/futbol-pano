import { NextRequest, NextResponse } from "next/server";
import { draftMode } from "next/headers";
import { isAdminRequest } from "@/lib/admin-auth";

/**
 * Enables Next's draft mode for an authenticated admin, then redirects to the
 * article. Article pages serve only `status = "published"` rows to the public;
 * with draft mode on they also serve pending ones, so the editor can review a
 * piece at its real URL before publishing it.
 *
 * Draft mode is a cookie, not a query string. That matters for two reasons:
 * a bare `?preview=1` on a public URL is guessable by anyone, and reading
 * `searchParams` in a page would opt all ~119 article pages into dynamic
 * rendering — undoing the ISR work that cut our Vercel writes. Only requests
 * carrying this cookie render dynamically.
 *
 * `/api/preview?disable=1` turns it back off.
 */
export async function GET(request: NextRequest) {
  const path = request.nextUrl.searchParams.get("path") ?? "/";
  // Same-origin paths only — never redirect to "//evil.com" or an absolute URL.
  const safePath = path.startsWith("/") && !path.startsWith("//") ? path : "/";

  const draft = await draftMode();

  if (request.nextUrl.searchParams.get("disable") === "1") {
    draft.disable();
    return NextResponse.redirect(new URL(safePath, request.url));
  }

  if (!(await isAdminRequest())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  draft.enable();
  return NextResponse.redirect(new URL(safePath, request.url));
}
