import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  // Non-fatal in dev — upload route falls back to base64
  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "Missing SUPABASE_URL or SUPABASE_SERVICE_KEY environment variables."
    );
  }
}

/**
 * Server-side Supabase client using the Service Role key.
 * Used exclusively in API routes — never import this on the client.
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
