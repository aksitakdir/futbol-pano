import "server-only";
import { cookies, headers } from "next/headers";

const ADMIN_USER = "scout";
const SESSION_COOKIE = "sg_admin";

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

/**
 * Verifies that the current request is from an authenticated admin.
 *
 * Mirrors the guard in `proxy.ts`: accepts either the `sg_admin` session
 * cookie or HTTP Basic Auth (user `scout`). Returns false (never throws) so
 * route handlers can decide the response.
 *
 * Use this in every `/api/admin/*` route handler — the proxy only guards
 * `/admin` pages, not these API routes.
 */
export async function isAdminRequest(): Promise<boolean> {
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) return false;

  const cookieStore = await cookies();
  const session = cookieStore.get(SESSION_COOKIE);
  if (session?.value && timingSafeEqual(session.value, adminPassword)) {
    return true;
  }

  const headerStore = await headers();
  const authHeader = headerStore.get("authorization") ?? "";
  if (authHeader.startsWith("Basic ")) {
    try {
      const decoded = Buffer.from(authHeader.slice(6), "base64").toString("utf8");
      const [user, ...passParts] = decoded.split(":");
      const pass = passParts.join(":");
      if (
        timingSafeEqual(user ?? "", ADMIN_USER) &&
        timingSafeEqual(pass ?? "", adminPassword)
      ) {
        return true;
      }
    } catch {
      // invalid base64 — fall through
    }
  }

  return false;
}
