import { NextRequest, NextResponse } from "next/server";

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

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (!pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) {
    // No password set — block access entirely in production
    return new NextResponse("Admin access not configured.", { status: 503 });
  }

  // Allow if valid session cookie exists
  const sessionCookie = req.cookies.get(SESSION_COOKIE);
  if (sessionCookie?.value === adminPassword) {
    return NextResponse.next();
  }

  // Check HTTP Basic Auth header
  const authHeader = req.headers.get("authorization") ?? "";
  if (authHeader.startsWith("Basic ")) {
    try {
      const decoded = Buffer.from(authHeader.slice(6), "base64").toString("utf-8");
      const [user, ...passParts] = decoded.split(":");
      const pass = passParts.join(":");
      if (
        timingSafeEqual(user ?? "", ADMIN_USER) &&
        timingSafeEqual(pass ?? "", adminPassword)
      ) {
        const res = NextResponse.next();
        res.cookies.set(SESSION_COOKIE, adminPassword, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: SESSION_MAX_AGE,
          path: "/admin",
        });
        return res;
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

export const config = {
  matcher: "/admin/:path*",
};
