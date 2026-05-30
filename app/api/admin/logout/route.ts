import { NextResponse } from "next/server";

const SESSION_COOKIE = "sg_admin";

/**
 * Clears the admin session cookie. The cookie is httpOnly (set by the
 * proxy), so it can only be removed server-side — JS cannot touch it.
 */
export async function POST() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(SESSION_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
    path: "/",
  });
  return response;
}
