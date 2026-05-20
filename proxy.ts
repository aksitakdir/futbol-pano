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

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Set x-pathname header for all requests (used by existing logic)
  const response = NextResponse.next();
  response.headers.set("x-pathname", pathname);

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
          authedResponse.headers.set("x-pathname", pathname);
          authedResponse.cookies.set(SESSION_COOKIE, adminPassword, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: SESSION_MAX_AGE,
            path: "/admin",
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
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
