import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function requireUser(req: Request) {
  const authHeader = req.headers.get("Authorization") ?? "";
  const token = authHeader.replace(/^Bearer\s+/i, "");
  if (!token) return { error: json({ error: "Missing Authorization header" }, 401) };

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

  const authClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
  const { data, error } = await authClient.auth.getUser(token);
  if (error || !data?.user) return { error: json({ error: "Invalid or expired session" }, 401) };

  return { user: data.user, admin: createClient(supabaseUrl, serviceKey) };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const auth = await requireUser(req);
  if ("error" in auth) return auth.error;
  const { user, admin } = auth;

  const { mode, theme, cursor } = await req.json().catch(() => ({}));

  if (mode === "browse") {
    let query = admin.from("puzzles").select("*").order("created_at", { ascending: false }).limit(20);
    if (theme) query = query.contains("themes", [theme]);
    if (cursor) query = query.lt("created_at", cursor);
    const { data, error } = await query;
    if (error) return json({ error: error.message }, 400);
    return json({ puzzles: data });
  }

  const { data: profile } = await admin.from("profiles").select("ratings").eq("id", user.id).single();
  const targetRating = profile?.ratings?.puzzle ?? 1000;

  const { data: solved } = await admin.from("puzzle_solves").select("puzzle_id").eq("user_id", user.id);
  const solvedIds = (solved || []).map((s) => s.puzzle_id);

  let query = admin
    .from("puzzles")
    .select("*")
    .gte("rating", targetRating - 150)
    .lte("rating", targetRating + 150)
    .order("created_at", { ascending: false })
    .limit(30);
  if (solvedIds.length) query = query.not("id", "in", `(${solvedIds.join(",")})`);

  const { data: candidates, error } = await query;
  if (error) return json({ error: error.message }, 400);

  if (candidates && candidates.length > 0) {
    const puzzle = candidates[Math.floor(Math.random() * candidates.length)];
    return json({ puzzle, source: "bank" });
  }

  return json({ puzzle: null, generate: true, target_rating: targetRating });
});
