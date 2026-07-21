import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

/**
 * Server-side Supabase client using the Service Role key.
 * Used exclusively in API routes — never import this on the client.
 *
 * Returns null when SUPABASE_URL / SUPABASE_SERVICE_KEY are not set.
 * The upload route handles this case via `if (supabaseAdmin)`.
 *
 * ⚠️  Do not add a module-level throw here — next build runs with
 *     NODE_ENV=production but no runtime env vars, so a throw at import
 *     time will always crash the Docker build.
 */
export const supabaseAdmin =
  supabaseUrl && supabaseServiceKey
    ? createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      })
    : null;

export const STORAGE_BUCKET = process.env.SUPABASE_BUCKET ?? "blog-media";
