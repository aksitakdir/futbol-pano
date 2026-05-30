import "server-only";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

/**
 * Server-only Supabase client using the service-role key.
 *
 * This client BYPASSES Row Level Security. Never import it into client
 * components or expose it to the browser — the `server-only` import above
 * turns such a mistake into a build error.
 *
 * Use it for trusted server-side writes (admin API routes, cron jobs,
 * sync/seed scripts). For public reads/writes that should respect RLS,
 * use the anon client from `@/lib/supabase` instead.
 */
export function createAdminClient() {
  if (!serviceRoleKey) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY is not set. Add it to .env.local (and your Vercel env).",
    );
  }
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

/** Shared server-only admin client (service role; bypasses RLS). */
export const supabaseAdmin = createAdminClient();
