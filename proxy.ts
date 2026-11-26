import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const ADMIN_USER = "scout";
const SESSION_COOKIE = "sg_admin";
const SESSION_MAX_AGE = 60 * 60 * 8; // 8 hours

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

/**
 * World Cup 2026 addresses retired on 2026-11-26 (docs/WC-SECTION-TRIAGE-2026-11-26.md).
 *
 * The pages that still have a live equivalent are redirected by next.config.ts, and
 * those redirects run before this function, so a redirected address never gets here.
 * Everything else below answers 410 Gone: the tournament-bound articles, the schedule
 * and squad pages, the two WC arena games (and their OG images), two WC pieces filed
 * under /lists (#83, #102), #54's old /lists alias, and the legacy Turkish and /en
 * aliases that used to lead into the section. Keep these lists and `config.matcher` in step: the matcher decides which
 * requests reach this function at all.
 */
const GONE_PREFIXES = [
  "/world-cup-2026/",
  "/dunya-kupasi-2026/",
  "/en/world-cup-2026/",
  "/kadrolar/",
  "/arena/world-cup-2026-knockout-bracket/",
  "/arena/world-cup-2026-favorites/",
];

const GONE_PATHS = new Set([
  "/kadrolar",
  "/arena/world-cup-2026-knockout-bracket",
  "/arena/world-cup-2026-favorites",
  "/lists/world-cup-breakout-stars-elite-transfer-targets",
  "/lists/top-20-all-time-world-cup-goal-scorers-ranking",
  "/lists/world-cup-2026-scouting-4-debutants-analysis",
]);

function isGone(pathname: string): boolean {
  const p = pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname;
  return GONE_PATHS.has(p) || GONE_PREFIXES.some((prefix) => p.startsWith(prefix));
}

/** A plain page, so a reader who follows an old link is not left at a bare error. */
const GONE_HTML = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>Page removed | Scout Gamer</title>
<style>
  body { margin: 0; min-height: 100vh; display: flex; align-items: center; justify-content: center; background: #060f1e; color: #dae5fd; font-family: system-ui, -apple-system, "Segoe UI", sans-serif; }
  main { max-width: 520px; padding: 32px 16px; }
  h1 { font-size: 28px; margin: 0 0 12px; }
  p { color: #8fb0c8; line-height: 1.6; margin: 0 0 20px; }
  a { color: #00d4aa; margin-right: 20px; }
</style>
</head>
<body>
<main>
<h1>Page removed</h1>
<p>Our World Cup 2026 section has closed, and this page was part of it.</p>
<a href="/">Scout Gamer home</a><a href="/lists">Scouting lists</a>
</main>
</body>
</html>
`;

/**
 * Two jobs, each scoped by the matcher below: answer 410 for the retired World Cup
 * 2026 addresses, and guard /admin.
 *
 * This used to also set an `x-pathname` header on every response "for existing
 * logic" — logic that no longer exists; nothing in the codebase read the header.
 * To set it, the matcher ran this function on every page and every API request,
 * so almost all of ~139k monthly function invocations opened middleware, wrote a
 * header nobody read, and fell through. The matcher now lists only the paths where
 * this function does real work.
 *
 * Note that /api/admin/* is NOT covered here and never was — those handlers call
 * isAdminRequest() from lib/admin-auth.ts themselves. Keep doing that.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const response = NextResponse.next();

  // Retired World Cup 2026 addresses (GET and HEAD alike; HEAD drops the body).
  if (isGone(pathname)) {
    return new NextResponse(GONE_HTML, {
      status: 410,
      headers: {
        "content-type": "text/html; charset=utf-8",
        "x-robots-tag": "noindex",
        "cache-control": "public, max-age=3600",
      },
    });
  }

  // Admin auth guard
  if (pathname.startsWith("/admin")) {
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminPassword) {
      return new NextResponse("Admin access not configured.", { status: 503 });
    }

    // Allow if valid session cookie exists
    const sessionCookie = request.cookies.get(SESSION_COOKIE);
    if (sessionCookie?.value === adminPassword) {
      return response;
    }

    // Check HTTP Basic Auth header
    const authHeader = request.headers.get("authorization") ?? "";
    if (authHeader.startsWith("Basic ")) {
      try {
        const decoded = atob(authHeader.slice(6));
        const [user, ...passParts] = decoded.split(":");
        const pass = passParts.join(":");
        if (
          timingSafeEqual(user ?? "", ADMIN_USER) &&
          timingSafeEqual(pass ?? "", adminPassword)
        ) {
          const authedResponse = NextResponse.next();
          authedResponse.cookies.set(SESSION_COOKIE, adminPassword, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: SESSION_MAX_AGE,
            path: "/",
          });
          return authedResponse;
        }
      } catch {
        // Invalid base64 — fall through to 401
      }
    }

    return new NextResponse("Unauthorized", {
      status: 401,
      headers: {
        "WWW-Authenticate": 'Basic realm="Scout Gamer Admin", charset="UTF-8"',
      },
    });
  }

  return response;
}

export const config = {
  // Only the paths this function acts on. Everything else — every live article,
  // category page, image and API route — skips it entirely. Constant strings only:
  // Next reads the matcher at build time. `:path+` needs at least one segment, so
  // the bare /world-cup-2026 hub is left to its next.config.ts redirect.
  matcher: [
    "/admin",
    "/admin/:path*",
    "/world-cup-2026/:path+",
    "/dunya-kupasi-2026/:path+",
    "/en/world-cup-2026/:path+",
    "/kadrolar",
    "/kadrolar/:path*",
    "/arena/world-cup-2026-knockout-bracket",
    "/arena/world-cup-2026-knockout-bracket/:path*",
    "/arena/world-cup-2026-favorites",
    "/arena/world-cup-2026-favorites/:path*",
    "/lists/world-cup-breakout-stars-elite-transfer-targets",
    "/lists/top-20-all-time-world-cup-goal-scorers-ranking",
    "/lists/world-cup-2026-scouting-4-debutants-analysis",
  ],
};
