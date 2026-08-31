// Shared helper: every edge function must call this first.
// It verifies the caller's Supabase JWT and returns an admin client
// (service role) plus the authenticated user. No function trusts a
// user_id/white_id/etc. passed in the request body — the identity
// always comes from the verified token.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

export function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

export async function requireUser(req: Request) {
  const authHeader = req.headers.get("Authorization") ?? "";
  const token = authHeader.replace(/^Bearer\s+/i, "");
  if (!token) {
    return { error: json({ error: "Missing Authorization header" }, 401) };
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

  // Verify the JWT belongs to a real, current user.
  const authClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
  const { data, error } = await authClient.auth.getUser(token);
  if (error || !data?.user) {
    return { error: json({ error: "Invalid or expired session" }, 401) };
  }

  // Admin client for the actual DB work, now that identity is confirmed.
  const admin = createClient(supabaseUrl, serviceKey);
  return { user: data.user, admin };
}
